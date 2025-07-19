// /src/tools/pdfCreator.js

import PDFDocument from "pdfkit";
import fs from "fs";
import { v4 as UUIDv4 } from "uuid";
import {filePath} from "../utils/wrappers/filePath.js";

export function generateResumePdf(resume, cacheDir = "../../../cache") {
    const resumeFileName = `${UUIDv4()}.pdf`;
    const resumePath = filePath(`${cacheDir}/${resumeFileName}`);
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

    // Skills section
    doc.fontSize(12).text('Skills', { underline: true });
    const skillSections = [
        "programming_languages", "architecture", "frameworks", "libraries",
        "cloud", "design_patterns", "development_tools", "ci_cd", "monitoring", "testing"
    ];
    for (const section of skillSections) {
        if (resume.skills && resume.skills[section]?.length) {
            doc.fontSize(10).text(
                section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) +
                ": " + resume.skills[section].join(', ')
            );
        }
    }
    doc.moveDown();

    // Experience
    doc.fontSize(12).text('Work Experience', { underline: true });
    for (const job of resume.experience || []) {
        doc.fontSize(10).text(`${job.title}, ${job.company} (${job.date_start} – ${job.date_end})`);
        doc.text(`Location: ${job.location}`);

        // Projects
        if (Array.isArray(job.projects) && job.projects.length > 0) {
            doc.moveDown(0.25);
            doc.fontSize(10).text('Projects:', { underline: true });
            for (const project of job.projects) {
                doc.fontSize(10).text(`• ${project.title}`);
                if (project.description) {
                    doc.fontSize(9).text(project.description, { indent: 16 });
                }
                if (Array.isArray(project.technologies) && project.technologies.length > 0) {
                    doc.fontSize(9).text(
                        'Technologies: ' + project.technologies.join(', '),
                        { indent: 16 }
                    );
                }
                doc.moveDown(0.15);
            }
        }

        // Achievements
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
    for (const edu of resume.education || []) {
        doc.fontSize(10).text(`${edu.degree} in ${edu.specialty}, ${edu.institution} (${edu.date_start} – ${edu.date_end})`);
    }
    doc.moveDown();

    // Languages
    doc.fontSize(12).text('Languages', { underline: true });
    for (const lang of resume.languages || []) {
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
    if (resume.contacts) {
        doc.fontSize(12).text('Contacts', { underline: true });
        resume.contacts.forEach(contact => {
            if (contact.email) {
                doc.fontSize(10).text(`Email: ${contact.email}`);
            }
            if (contact.linkedin) {
                doc.text(`LinkedIn: ${contact.linkedin}`);
            }
        })
    }
    doc.moveDown();

    doc.end();

    return { stream, resumePath };
}