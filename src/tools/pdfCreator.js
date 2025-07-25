// /src/tools/pdfCreator.js

import PDFDocument from "pdfkit";
import fs from "fs";
import { v4 as UUIDv4 } from "uuid";
import { filePath } from "../utils/wrappers/filePath.js";
import path from "path";

export function generateResumePdf(resume, cacheDir = "../../../cache") {
    const resumeFileName = `${UUIDv4()}.pdf`;
    const resumePath = filePath(`${cacheDir}/${resumeFileName}`);
    const doc = new PDFDocument({ margin: 40 });

    doc.registerFont('roboto', path.resolve("./src/assets/fonts/roboto/Roboto-Regular.ttf"));
    doc.registerFont('roboto-bold', path.resolve("./src/assets/fonts/roboto/Roboto-Bold.ttf"));
    doc.registerFont('roboto-italic', path.resolve("./src/assets/fonts/roboto/Roboto-Italic.ttf"));
    doc.registerFont('roboto-bolditalic', path.resolve("./src/assets/fonts/roboto/Roboto-BoldItalic.ttf"));

    const stream = fs.createWriteStream(resumePath);
    doc.pipe(stream);

    doc.font('roboto'); // default

    // Name and headline
    if (resume.userName) {
        doc.fontSize(18).text(resume.userName.value, { bold: true });
    }
    if (resume.userHeadline) {
        doc.fontSize(12).text(resume.userHeadline.value);
    }
    if (resume.userName || resume.userHeadline) {
        doc.moveDown();
    }

    // Location and summary
    if (resume.userLocation) {
        doc.fontSize(10).text(`${resume.userLocation.printTitle || "Location"}: ${resume.userLocation.value}`);
        doc.moveDown(0.5);
    }
    if (resume.userSummary) {
        doc.text(resume.userSummary.value, { width: 500 });
        doc.moveDown();
    }

    // Skills
    if (resume.userSkills && Array.isArray(resume.userSkills.value) && resume.userSkills.value.length) {
        doc.fontSize(12).text(resume.userSkills.printTitle || "Skills", { underline: true });
        for (const section of resume.userSkills.value) {
            if (section.items && section.items.length) {
                doc.fontSize(10).text(
                    `${section.printTitle}: ${section.items.join(', ')}`
                );
            }
        }
        doc.moveDown();
    }

    // Experience
    if (resume.userExperience && Array.isArray(resume.userExperience.value) && resume.userExperience.value.length) {
        doc.fontSize(12).text(resume.userExperience.printTitle || "Work Experience", { underline: true });
        for (const job of resume.userExperience.value) {
            // Main row (position, company, dates)
            doc.fontSize(10).text(
                [job.printTitle, job.company].filter(Boolean).join(", ") +
                ((job.dateStart || job.dateEnd) ? ` (${job.dateStart || ""} – ${job.dateEnd || ""})` : "")
            );
            if (job.location) doc.text(`Location: ${job.location}`);

            // Projects
            if (Array.isArray(job.projects) && job.projects.length) {
                doc.moveDown(0.25);
                doc.fontSize(10).text('Projects:', { underline: true });
                for (const project of job.projects) {
                    if (project.printTitle) doc.fontSize(10).text(`• ${project.printTitle}`);
                    if (project.description) {
                        doc.fontSize(9).text(project.description, { indent: 16 });
                    }
                    if (Array.isArray(project.skillsOrTools) && project.skillsOrTools.length) {
                        // Build by types: technologies, tools, soft skills, methods
                        const byType = {};
                        for (const skill of project.skillsOrTools) {
                            if (!byType[skill.type]) byType[skill.type] = [];
                            byType[skill.type].push(skill.name);
                        }
                        for (const [type, names] of Object.entries(byType)) {
                            doc.fontSize(9).text(
                                `${type[0].toUpperCase() + type.slice(1).replace('_', ' ')}: ${names.join(', ')}`,
                                { indent: 16 }
                            );
                        }
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
    if (resume.userEducation && Array.isArray(resume.userEducation.value) && resume.userEducation.value.length) {
        doc.fontSize(12).text(resume.userEducation.printTitle || "Education", { underline: true });
        for (const edu of resume.userEducation.value) {
            const degreeLine = [edu.degree && `${edu.degree} in ${edu.specialty}`, edu.institution].filter(Boolean).join(", ");
            const dates = (edu.dateStart || edu.dateEnd) ? ` (${edu.dateStart || ""} – ${edu.dateEnd || ""})` : "";
            doc.fontSize(10).text(`${degreeLine}${dates}`);
        }
        doc.moveDown();
    }

    // Languages
    if (resume.userLanguages && Array.isArray(resume.userLanguages.value) && resume.userLanguages.value.length) {
        doc.fontSize(12).text(resume.userLanguages.printTitle || "Languages", { underline: true });
        for (const lang of resume.userLanguages.value) {
            if (lang.language || lang.level) {
                doc.fontSize(10).text(
                    [lang.language, lang.level].filter(Boolean).join(": ")
                );
            }
        }
        doc.moveDown();
    }

    // Soft skills
    if (resume.userSoftSkills && Array.isArray(resume.userSoftSkills.value) && resume.userSoftSkills.value.length) {
        doc.fontSize(12).text(resume.userSoftSkills.printTitle || "Soft Skills", { underline: true });
        doc.fontSize(10).text(resume.userSoftSkills.value.join(', '));
        doc.moveDown();
    }

    // Contacts
    if (resume.userContacts && Array.isArray(resume.userContacts.value) && resume.userContacts.value.length) {
        doc.fontSize(12).text(resume.userContacts.printTitle || "Contacts", { underline: true });
        for (const contact of resume.userContacts.value) {
            if (contact.value) {
                doc.fontSize(10).text(`${contact.printTitle}: ${contact.value}`);
            }
        }
        doc.moveDown();
    }

    doc.moveDown();
    doc.end();

    return { stream, resumePath };
}