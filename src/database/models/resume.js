// /src/database/models/resume.js

import mongoose from 'mongoose';

const StringBlockSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: String, required: false }
}, { _id: false });

const SkillCategorySchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    items: { type: [String], required: false, default: null }
}, { _id: false });

const UserSkillsSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [SkillCategorySchema], required: false, default: null }
}, { _id: false });

const SkillOrToolSchema = new mongoose.Schema({
    type: { type: String, required: false },
    name: { type: String, required: false }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    description: { type: String, required: false },
    skillsOrTools: { type: [SkillOrToolSchema], required: false, default: null }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    company: { type: String, required: false },
    dateStart: { type: String, required: false },
    dateEnd: { type: String, required: false },
    location: { type: String, required: false },
    achievements: { type: [String], required: false, default: null },
    projects: { type: [ProjectSchema], required: false, default: null }
}, { _id: false });

const UserExperienceSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [ExperienceSchema], required: false, default: null }
}, { _id: false });

const EducationSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    institution: { type: String, required: false },
    degree: { type: String, required: false },
    specialty: { type: String, required: false },
    dateStart: { type: String, required: false },
    dateEnd: { type: String, required: false }
}, { _id: false });

const UserEducationSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [EducationSchema], required: false, default: null }
}, { _id: false });

const LanguageSchema = new mongoose.Schema({
    language: { type: String, required: false },
    level: { type: String, required: false }
}, { _id: false });

const UserLanguagesSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [LanguageSchema], required: false, default: null }
}, { _id: false });

// userSoftSkills: value — массив строк
const UserSoftSkillsSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [String], required: false, default: null }
}, { _id: false });

const ContactSchema = new mongoose.Schema({
    type: { type: String, required: false },
    printTitle: { type: String, required: false },
    value: { type: String, required: false }
}, { _id: false });

const UserContactsSchema = new mongoose.Schema({
    printTitle: { type: String, required: false },
    value: { type: [ContactSchema], required: false, default: null }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Job', required: false, default: null },
    isMainResume: { type: Boolean, required: true },
    pdfFilePath: { type: String, required: false, default: null },
    userName: { type: StringBlockSchema, required: false },
    userHeadline: { type: StringBlockSchema, required: false },
    userLocation: { type: StringBlockSchema, required: false },
    userSummary: { type: StringBlockSchema, required: false },
    userSkills: { type: UserSkillsSchema, required: false },
    userExperience: { type: UserExperienceSchema, required: false },
    userEducation: { type: UserEducationSchema, required: false },
    userLanguages: { type: UserLanguagesSchema, required: false },
    userSoftSkills: { type: UserSoftSkillsSchema, required: false },
    userContacts: { type: UserContactsSchema, required: false },
    openaiResponseId: { type: String, required: false, default: null },
}, { timestamps: true });

export const ResumeSchemaForSwagger = {
    type: "object",
    properties: {
        _id: { type: "string", example: "654fd1c9a72eaec8f5fdfc98" },
        userId: { type: "string", example: "653e5cdeaebad5d7f77a8143" },
        jobIds: {
            type: "array",
            items: { type: "string" },
            example: ["653e5cdeaebad5d7f77a8143", "653e5cdeaebad5d7f77a8144"]
        },
        isMainResume: { type: "boolean", example: true },
        pdfFilePath: { type: "string", example: "/pdfs/abcde.pdf" },
        userName: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Name" },
                value: { type: "string", example: "John Doe" }
            }
        },
        userHeadline: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Headline" },
                value: { type: "string", example: "Senior Backend Developer" }
            }
        },
        userLocation: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Location" },
                value: { type: "string", example: "Vienna, Austria" }
            }
        },
        userSummary: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Summary" },
                value: { type: "string", example: "Experienced developer with..." }
            }
        },
        userSkills: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Skills" },
                value: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            printTitle: { type: "string", example: "Programming" },
                            items: {
                                type: "array",
                                items: { type: "string" },
                                example: ["JavaScript", "Node.js", "MongoDB"]
                            }
                        }
                    }
                }
            }
        },
        userExperience: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Experience" },
                value: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            printTitle: { type: "string", example: "Backend Developer" },
                            company: { type: "string", example: "Acme Inc" },
                            dateStart: { type: "string", example: "2021-01" },
                            dateEnd: { type: "string", example: "2024-05" },
                            location: { type: "string", example: "Vienna" },
                            achievements: {
                                type: "array",
                                items: { type: "string" },
                                example: ["Led migration project"]
                            },
                            projects: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        printTitle: { type: "string", example: "Project X" },
                                        description: { type: "string", example: "Internal ERP system" },
                                        skillsOrTools: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    type: { type: "string", example: "tool" },
                                                    name: { type: "string", example: "Docker" }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        userEducation: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Education" },
                value: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            printTitle: { type: "string", example: "Master's Degree" },
                            institution: { type: "string", example: "TU Wien" },
                            degree: { type: "string", example: "MSc Computer Science" },
                            specialty: { type: "string", example: "Software Engineering" },
                            dateStart: { type: "string", example: "2015-09" },
                            dateEnd: { type: "string", example: "2017-07" }
                        }
                    }
                }
            }
        },
        userLanguages: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Languages" },
                value: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            language: { type: "string", example: "English" },
                            level: { type: "string", example: "C1" }
                        }
                    }
                }
            }
        },
        userSoftSkills: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Soft Skills" },
                value: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Teamwork", "Problem-solving"]
                }
            }
        },
        userContacts: {
            type: "object",
            properties: {
                printTitle: { type: "string", example: "Contacts" },
                value: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string", example: "email" },
                            printTitle: { type: "string", example: "Email" },
                            value: { type: "string", example: "john@example.com" }
                        }
                    }
                }
            }
        },
        openaiResponseId: { type: "string", example: "response-abcdef" },
        createdAt: { type: "string", format: "date-time", example: "2025-07-24T17:23:45.000Z" },
        updatedAt: { type: "string", format: "date-time", example: "2025-07-24T17:23:45.000Z" }
    },
    required: ["userId", "isMainResume"]
};

export default mongoose.model('Resume', ResumeSchema);