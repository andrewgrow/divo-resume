// /src/controllers/resumeController.js

import {
    getAllResume,
    createOne as createResume,
    getOne as getOneResume,
    deleteOne as deleteResume,
    setAllResumeAsNonMain
} from "../database/services/resumeService.js";
import {updateOne as updateResume} from "../database/services/resumeService.js";
import {generateResumePdf} from "../tools/pdfCreator.js";
import {filePath} from "../utils/wrappers/filePath.js";
import {readFile} from "fs/promises";
import {responsesAPI} from "../tools/openAi.js";
import {clearAiAnswer} from "../utils/clearing/clearAiAnswer.js";
import path from "path";
import fs from "fs";
import mapResumeSchemaToResumeModel from "../utils/mappers/mapResumeSchemaToResumeModel.js";

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
        // reset isMainResume other resumes
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
    const userId = req.params.userId;
    const resume = { userId: userId, pdfFilePath: req.file.path };
    if (req.body.isMainResume === "true") {
        await setAllResumeAsNonMain(userId)
        resume.isMainResume = true
    } else {
        resume.isMainResume = false
    }
    try {
        const createdResume = await createResume(resume);
        res.status(201).json(createdResume);
    } catch (err) {
        console.log(`Error during create resume from PDF: ${err.message}`);
        return res.status(400).json({ error: err });
    }
}

export async function parseResumeFromPdf(req, res) {
    const userId = req.params.userId;
    const resumeAsModel = req.foundResume;
    if (!userId || !resumeAsModel) {
        return res.status(400).json({ error: "UserId or Resume not found" });
    }

    const resumeFilePath = resumeAsModel.pdfFilePath // e.g. "/cache/be14e044fc09.pdf";
    if (!resumeFilePath) {
        return res.status(400).json({ message: `PDF File for the Resume ${resumeAsModel._id} does not exist` });
    }

    const fileName = path.basename(resumeFilePath);

    // PDF
    const pdfAsBase64 = fs.readFileSync(resumeFilePath, "base64");

    // Schema for the Response
    const rawSchema = await readFile(
        filePath('../schemas/universal_resume.schema.json'),
        'utf-8'
    );
    const jsonSchema = JSON.parse(rawSchema);
    const schemaName = jsonSchema.title;

    // AI credentials
    const token = req.foundAiToken;
    const model = "gpt-4.1";

    // Create Request
    const taskText = `
    Parse included resume.  Do not guess or invent any data. Use only the resume has.

Identify all skills, competencies, tools, certifications, and relevant personal qualities listed in the source resume.

Group these items into logical categories most relevant to the target profession. If categories already exist in the resume (e.g., “Programming Languages”, “Soft Skills”, “Certifications”), preserve and use them. Categories should reflect both hard skills (technical, professional, tool-related) and soft skills (communication, leadership, adaptability, etc.). Each category must have a clear and concise name (“printTitle”), for example:
 - Examples for an IT professional: Programming Languages, Frameworks, Cloud, Testing, Development Tools, Soft Skills, etc.
 - Examples for a Project Manager: Project Management Methodologies, Tools, Team Leadership, Reporting, Certifications, Soft Skills, etc.
 - Examples for a Truck Driver: Driving Licenses, Vehicle Operation, Route Planning, Regulations, Maintenance, Cargo Handling, Languages, Soft Skills, etc.
 - Examples for a Medical Representative: Therapeutic Areas, Product Knowledge, Sales Techniques, Regulatory & Compliance, CRM Tools, Soft Skills, Languages, etc.
 - The same approach applies to other professions.

Under each category, create an array of skills/items directly related to it. Avoid generic or unclear categories such as “Other”, “Various”, or “Etc.”. Each skill must fit precisely within its group.

Reflect domain-specific vocabulary and key terms commonly used in job descriptions for this role (this will help with ATS and HR screening).

The general purpose is to parse the data from the resume as precisely as possible and structure it accordingly.

Return filled answer according to defined JSON schema. Fill all related fields. Use English for answers preparing.
    `

    const input = [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    filename: fileName,
                    file_data: `data:application/pdf;base64,${pdfAsBase64}`,
                },
                {
                    type: "input_text",
                    text: taskText,
                },
            ],
        },
    ]

    try {
        const response = await responsesAPI(
            {model, input, token, jsonSchema, schemaName}
        )
        console.log(`[${req.requestId}] Response from OpenAi:\n${JSON.stringify(response)}`)
        const resumeAsSchema = clearAiAnswer(response.output_text)
        resumeAsSchema.openaiResponseId = response.id // add to the Result Object the OpenAi Request ID

        mapResumeSchemaToResumeModel(resumeAsModel, resumeAsSchema)

        await updateResume(resumeAsModel);

        res.json(resumeAsModel);
    }  catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
}