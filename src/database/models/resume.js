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
    userContacts: { type: UserContactsSchema, required: false }
}, { timestamps: true });

export default mongoose.model('Resume', ResumeSchema);