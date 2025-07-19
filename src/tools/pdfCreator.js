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
    if (resume.name) {
        doc.fontSize(18).text(resume.name, { bold: true });
    }
    if (resume.headline) {
        doc.fontSize(12).text(resume.headline);
    }
    if (resume.name || resume.headline) {
        doc.moveDown();
    }

    // Location and summary
    if (resume.location) {
        doc.fontSize(10).text(`Location: ${resume.location}`);
        doc.moveDown(0.5);
    }
    if (resume.summary) {
        doc.text(resume.summary, { width: 500 });
        doc.moveDown();
    }

    // Skills section
    if (resume.skills && Object.values(resume.skills).some(arr => Array.isArray(arr) && arr.length)) {
        doc.fontSize(12).text('Skills', { underline: true });
        const skillSections = [
            "programming_languages", "architecture", "frameworks", "libraries",
            "cloud", "design_patterns", "development_tools", "ci_cd", "monitoring", "testing"
        ];
        for (const section of skillSections) {
            if (resume.skills[section]?.length) {
                doc.fontSize(10).text(
                    section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) +
                    ": " + resume.skills[section].join(', ')
                );
            }
        }
        doc.moveDown();
    }

    // Experience
    if (Array.isArray(resume.experience) && resume.experience.length) {
        doc.fontSize(12).text('Work Experience', { underline: true });
        for (const job of resume.experience) {
            doc.fontSize(10).text(
                [job.title, job.company].filter(Boolean).join(", ") +
                ((job.date_start || job.date_end) ? ` (${job.date_start || ""} – ${job.date_end || ""})` : "")
            );
            if (job.location) doc.text(`Location: ${job.location}`);
            // Projects
            if (Array.isArray(job.projects) && job.projects.length) {
                doc.moveDown(0.25);
                doc.fontSize(10).text('Projects:', { underline: true });
                for (const project of job.projects) {
                    if (project.title) doc.fontSize(10).text(`• ${project.title}`);
                    if (project.description) {
                        doc.fontSize(9).text(project.description, { indent: 16 });
                    }
                    if (Array.isArray(project.technologies) && project.technologies.length) {
                        doc.fontSize(9).text(
                            'Technologies: ' + project.technologies.join(', '),
                            { indent: 16 }
                        );
                    }
                    doc.moveDown(0.15);
                }
            }
            // Achievements
            if (Array.isArray(job.achievements) && job.achievements.length) {
                doc.text('Achievements:');
                job.achievements.forEach(ach => {
                    doc.list([ach]);
                });
            }
            doc.moveDown();
        }
    }

    // Education
    if (Array.isArray(resume.education) && resume.education.length) {
        doc.fontSize(12).text('Education', { underline: true });
        for (const edu of resume.education) {
            const degreeLine = [edu.degree && `${edu.degree} in ${edu.specialty}`, edu.institution].filter(Boolean).join(", ");
            const dates = (edu.date_start || edu.date_end) ? ` (${edu.date_start || ""} – ${edu.date_end || ""})` : "";
            doc.fontSize(10).text(`${degreeLine}${dates}`);
        }
        doc.moveDown();
    }

    // Languages
    if (Array.isArray(resume.languages) && resume.languages.length) {
        doc.fontSize(12).text('Languages', { underline: true });
        for (const lang of resume.languages) {
            if (lang.language || lang.level) {
                doc.fontSize(10).text(
                    [lang.language, lang.level].filter(Boolean).join(": ")
                );
            }
        }
        doc.moveDown();
    }

    // Soft skills
    if (Array.isArray(resume.soft_skills) && resume.soft_skills.length) {
        doc.fontSize(12).text('Soft Skills', { underline: true });
        doc.fontSize(10).text(resume.soft_skills.join(', '));
        doc.moveDown();
    }

    // Contacts
    if (resume.contacts && (resume.contacts.email || resume.contacts.linkedin)) {
        doc.fontSize(12).text('Contacts', { underline: true });
        if (resume.contacts.email) {
            doc.fontSize(10).text(`Email: ${resume.contacts.email}`);
        }
        if (resume.contacts.linkedin) {
            doc.text(`LinkedIn: ${resume.contacts.linkedin}`);
        }
        doc.moveDown();
    }
    doc.moveDown();

    doc.end();

    return { stream, resumePath };
}