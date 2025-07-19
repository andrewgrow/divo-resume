// /src/database/models/resume.js

import mongoose from 'mongoose';

const SkillsSchema = new mongoose.Schema({
    programming_languages: {type: [String], required: false, default: []},
    architecture: {type: [String], required: false, default: []},
    frameworks: {type: [String], required: false, default: []},
    libraries: {type: [String], required: false, default: []},
    cloud: {type: [String], required: false, default: []},
    design_patterns: {type: [String], required: false, default: []},
    development_tools: {type: [String], required: false, default: []},
    ci_cd: {type: [String], required: false, default: []},
    monitoring: {type: [String], required: false, default: []},
    testing: {type: [String], required: false, default: []},
}, { _id: false })

const ProjectSchema = new mongoose.Schema({
    title: {type: String, required: false, default: ""},
    description: {type: String, required: false, default: ""},
    technologies: {type: [String], required: false, default: []},
}, {_id: false})

const ExperienceSchema = new mongoose.Schema({
    title: {type: String, required: false, default: ""},
    company: {type: String, required: false, default: ""},
    date_start: {type: String, required: false, default: ""},
    date_end: {type: String, required: false, default: ""},
    location: {type: String, required: false, default: ""},
    achievements:  {type: [String], required: false, default: []},
    projects: { type: [ProjectSchema], required: false, default: [] }
}, { _id: false })

const EducationSchema = new mongoose.Schema({
    institution: {type: String, required: false, default: ""},
    degree: {type: String, required: false, default: ""},
    specialty: {type: String, required: false, default: ""},
    date_start: {type: String, required: false, default: ""},
    date_end: {type: String, required: false, default: ""},
}, { _id: false })

const LanguageSchema = new mongoose.Schema({
    language: {type: String, required: false, default: ""},
    level: {type: String, required: false, default: ""},
}, { _id: false })

const ContactSchema = new mongoose.Schema({
    email: {type: String, required: false, default: ""},
    linkedin:  {type: String, required: false, default: ""},
}, { _id: false })

const ResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    jobIds: {type: [mongoose.Schema.Types.ObjectId], ref: 'Job', required: false, default: null},
    isMainResume: {type: Boolean, required: true},
    pdfFilePath: {type: String, required: false, default: null},
    name: {type: String, required: false, default: null},
    headline: {type: String, required: false, default: null},
    location: {type: String, required: false, default: null},
    summary:  {type: String, required: false, default: null},
    skills: {type: SkillsSchema, required: false, default: null},
    experience: {type: [ExperienceSchema], required: false, default: null},
    education: {type: [EducationSchema], required: false, default: null},
    languages: {type: [LanguageSchema], required: false, default: null},
    soft_skills: {type: [String], required: false, default: null},
    contacts: {type: ContactSchema, required: false, default: null},
}, { timestamps: true });

export default mongoose.model('Resume', ResumeSchema);