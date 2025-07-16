// /src/controllers/resumeController.js

import { v4 as UUIDv4 } from 'uuid';
import {db, getAllResumeByUser} from "../data/fakeDb.js";
import {filePath} from "../utils/wrappers/filePath.js";
import PDFDocument from "pdfkit";
import fs from "fs";

export function getAll(req, res) {
    const userId = req.params.userId;
    const resumes = getAllResumeByUser(userId);
    if (resumes.length === 0) {
        return res.status(404).json({ error: "No resumes found" });
    } else {
        res.json(resumes);
    }
}

export function getOne(req, res) {
    res.json(req.foundResume);
}

export function createOne(req, res) {
    const userId = req.params.userId;
    const resumeData = req.body;
    const resumeId = UUIDv4();
    const resume = { resumeId, userId, ...resumeData };
    db.resumes[resumeId] = resume;
    res.status(201).json(resume);
}

export function updateOne(req, res) {
    const { resumeId: ignore1, userId: ignore2, ...allowedFields } = req.body;
    Object.assign(req.foundResume, allowedFields);
    db.resumes[req.foundResume.resumeId] = req.foundResume;
    res.json(req.foundResume);
}

export function deleteOne(req, res) {
    delete db.resumes[req.foundResume.resumeId];
    res.json({ success: true });
}

export function createPdf(req, res) {
    const resume = req.foundResume;
    const resumeFileName = `${UUIDv4()}.pdf`;
    const resumePath = filePath(`../../../cache/${resumeFileName}`);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(resumePath);
    doc.pipe(stream);

    // Name and headline
    doc.fontSize(18).text(resume.name, { bold: true });
    doc.fontSize(12).text(resume.headline);
    doc.moveDown();

    // Location and summary
    doc.fontSize(10).text(`Location: ${resume.location}`);
    doc.moveDown(0.5);
    doc.text(resume.summary, { width: 500 });
    doc.moveDown();

    // Skills section (разбито по категориям как в схеме)
    doc.fontSize(12).text('Skills', { underline: true });
    const skillSections = [
        "programming_languages", "architecture", "frameworks", "libraries",
        "cloud", "design_patterns", "development_tools", "CI/CD", "monitoring", "testing"
    ];
    for (const section of skillSections) {
        if (resume.skills[section]?.length) {
            doc.fontSize(10).text(
                section.replace(/_/g, ' ').replace('CI/CD', 'CI/CD').replace(/\b\w/g, l => l.toUpperCase()) +
                ": " + resume.skills[section].join(', ')
            );
        }
    }
    doc.moveDown();

    // Experience
    doc.fontSize(12).text('Work Experience', { underline: true });
    for (const job of resume.experience) {
        doc.fontSize(10).text(`${job.title}, ${job.company} (${job.date_start} – ${job.date_end})`);
        doc.text(`Location: ${job.location}`);
        if (job.achievements?.length) {
            doc.text('Achievements:');
            job.achievements.forEach(ach => {
                doc.list([ach]);
            });
        }
        doc.moveDown();
    }

    // Education
    doc.fontSize(12).text('Education', { underline: true });
    for (const edu of resume.education) {
        doc.fontSize(10).text(`${edu.degree} in ${edu.specialty}, ${edu.institution} (${edu.date_start} – ${edu.date_end})`);
    }
    doc.moveDown();

    // Languages
    doc.fontSize(12).text('Languages', { underline: true });
    for (const lang of resume.languages) {
        doc.fontSize(10).text(`${lang.language}: ${lang.level}`);
    }
    doc.moveDown();

    // Soft skills
    if (resume.soft_skills?.length) {
        doc.fontSize(12).text('Soft Skills', { underline: true });
        doc.fontSize(10).text(resume.soft_skills.join(', '));
        doc.moveDown();
    }

    // Contacts
    doc.fontSize(12).text('Contacts', { underline: true });
    if (resume.contacts.email) doc.fontSize(10).text(`Email: ${resume.contacts.email}`);
    if (resume.contacts.linkedin) doc.text(`LinkedIn: ${resume.contacts.linkedin}`);
    doc.moveDown();

    doc.end();

    stream.on('finish', () => {
        res.json({ success: true, filePath: resumePath });
    });

    stream.on('error', (err) => {
        res.status(500).json({ success: false, error: err.message });
    });
}