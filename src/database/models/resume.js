// /src/database/models/resume.js

import mongoose from 'mongoose';

const SkillsSchema = new mongoose.Schema({
    programming_languages: {type: [String], required: true},
    architecture: {type: [String], required: true},
    frameworks: {type: [String], required: true},
    libraries: {type: [String], required: true},
    cloud: {type: [String], required: true},
    design_patterns: {type: [String], required: true},
    development_tools: {type: [String], required: true},
    ci_cd: {type: [String], required: true},
    monitoring: {type: [String], required: true},
    testing: {type: [String], required: true},
}, { _id: false })

const ProjectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    technologies: {type: [String], required: true},
}, {_id: false})

const ExperienceSchema = new mongoose.Schema({
    title: {type: String, required: true},
    company: {type: String, required: true},
    date_start: {type: String, required: true},
    date_end: {type: String, required: true},
    location: {type: String, required: true},
    achievements:  {type: [String], required: true},
    projects: { type: [ProjectSchema], required: false, default: [] }
}, { _id: false })

const EducationSchema = new mongoose.Schema({
    institution: {type: String, required: true},
    degree: {type: String, required: true},
    specialty: {type: String, required: true},
    date_start: {type: String, required: true},
    date_end: {type: String, required: true},
}, { _id: false })

const LanguageSchema = new mongoose.Schema({
    language: {type: String, required: true},
    level: {type: String, required: true},
}, { _id: false })

const ContactSchema = new mongoose.Schema({
    email: {type: String, required: true},
    linkedin:  {type: String, required: true},
}, { _id: false })

const ResumeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    jobIds: {type: [mongoose.Schema.Types.ObjectId], ref: 'Job'},
    isMainResume: {type: Boolean, required: true, default: false},
    name: {type: String, required: true},
    headline: {type: String, required: true},
    location: {type: String, required: true},
    summary:  {type: String, required: true},
    skills: {type: [SkillsSchema], required: true},
    experience: {type: [ExperienceSchema], required: true},
    education: {type: [EducationSchema], required: true},
    languages: {type: [LanguageSchema], required: true},
    soft_skills: {type: [String], required: true},
    contacts: {type: [ContactSchema], required: true},
}, { timestamps: true });

export default mongoose.model('Resume', ResumeSchema);