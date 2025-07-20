// /src/controllers/resumeController.js

import { v4 as UUIDv4 } from 'uuid';
import {filePath} from "../utils/wrappers/filePath.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import {
    getAllResume,
    createOne as createResume,
    getOne as getOneResume,
    deleteOne as deleteResume,
    setAllResumeAsNonMain
} from "../database/services/resumeService.js";
import {updateOne as updateResume} from "../database/services/resumeService.js";
import {generateResumePdf} from "../tools/pdfCreator.js";

export async function getAll(req, res) {
    const userId = req.params.userId;
    const resumes = await getAllResume(userId);
    if (!resumes.length || resumes.length === 0) {
        return res.status(404).json({ error: "No resumes found" });
    } else {
        res.json(resumes);
    }
}

export async function getOne(req, res) {
    // e.g. main resume was added during wrapper `withMainResume`
    const foundResumeUserId = req.foundResume?.userId?.toString()
    console.log({ foundResumeUserId: foundResumeUserId });
    console.log("req.params.userId:", req.params.userId);
    if (req.foundResume && foundResumeUserId === req.params.userId) {
        return res.json(req.foundResume);
    }

    const userId = req.params.userId;
    const resumeId = req.params.resumeId;
    try {
        const foundResume = await getOneResume(userId, resumeId);
        if (!foundResume) {
            return res.status(404).json({ error: "Resume not found" });
        }
        res.json(foundResume);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

export async function createOne(req, res) {
    const userId = req.params.userId;
    const resumeData = req.body;
    const resume = { userId, ...resumeData };

    // we cannot create another main resume, so we need to check it
    if (resume.isMainResume) {
        // Сбросить isMainResume у всех других резюме этого пользователя
        await setAllResumeAsNonMain(userId)
    }

    try {
        const createdResume = await createResume(resume);
        res.status(201).json(createdResume);
    } catch (err) {
        console.log(`Error during create resume: ${err.message}`);
        return res.status(400).json({ error: err });
    }
}

export async function createPdf(req, res) {
    try {
        // const resume = Object.assign({}, req.foundResume);
        const resume = req.foundResume;
        const { stream, resumePath } = generateResumePdf(resume);
        await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });
        try {
            resume.pdfFilePath = resumePath;
            const updatedResume = await updateResume(resume);
            res.status(201).json(updatedResume);
        } catch (err) {
            console.error("Error creating PDF (during update DB record):", err);
            res.status(500).json({ success: false, error: `"Error creating PDF: ${err.message}` });
        }
    } catch (err) {
        console.error("Error creating PDF:", err);
        res.status(500).json({ success: false, error: `"Error creating PDF: ${err.message}` });
    }
}

export async function deleteOne(req, res) {
    const userId = req.params.userId;
    const resumeId = req.params.resumeId;
    const result = await deleteResume(userId, resumeId)
    if (!result) {
        return res.status(404).json({ success: false, message: 'Resume ID not found' });
    }
    res.json({ result: "success" });
}

export async function updateOne(req, res) {
    const userId = req.params.userId;
    const resumeId = req.params.resumeId;

    const resumeData = { _id: resumeId, userId: userId, ...req.body };

    const dbResume = await getOneResume(userId, resumeId)
    if (!dbResume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    if (resumeData.isMainResume) {
        await setAllResumeAsNonMain(userId)
    }
    const updatedResume = await updateResume(resumeData)
    res.status(200).json(updatedResume);
}

export async function uploadPdf(req, res) {
    res.status(200).json({ isMainResume: req.body.isMainResume, filePath: req.file.path });
}