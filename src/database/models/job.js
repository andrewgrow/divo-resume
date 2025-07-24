// /src/database/models/job.js

import mongoose from "mongoose";

const RecognizedJobSchema = new mongoose.Schema({
    openAiResponseId: { type: String },
    statusCode: { type: Number },
    status: { type: String },
    statusDetails: { type: String },
    jobTitle: { type: String },
    jobDescription: { type: String },
    keywords: { type: [String] },
    responsibilities: { type: [String] },
    requirements: { type: [String] },
    nice_to_have: { type: [String] },
}, { _id: false });

const JobSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    url: {type: String},
    screenshot: {type: String},
    recognized: {type: RecognizedJobSchema},
}, { timestamps: true });

const JobSchemaForSwagger = {
    type: "object",
    properties: {
        _id: { type: "string", example: "654fd1c9a72eaec8f5fdfc98" },
        userId: { type: "string", example: "653e5cdeaebad5d7f77a8143" },
        url: { type: "string", example: "https://company.com/job/123" },
        screenshot: { type: "string", example: "/cache/dbe14e044fc09.pdf" },
        recognized: {
            type: "object",
            properties: {
                openAiResponseId: { type: "string", example: "response-abcdef" },
                statusCode: { type: "number", example: 200 },
                status: { type: "string", example: "parsed" },
                statusDetails: { type: "string", example: "All good" },
                jobTitle: { type: "string", example: "Backend Developer" },
                jobDescription: { type: "string", example: "Some job description..." },
                keywords: {
                    type: "array",
                    items: { type: "string" },
                    example: ["backend", "nodejs", "mongodb"]
                },
                responsibilities: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Build APIs", "Maintain databases"]
                },
                requirements: {
                    type: "array",
                    items: { type: "string" },
                    example: ["3+ years Node.js", "Experience with MongoDB"]
                },
                nice_to_have: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Docker experience", "CI/CD skills"]
                }
            }
        },
        createdAt: { type: "string", format: "date-time", example: "2025-07-24T17:23:45.000Z" },
        updatedAt: { type: "string", format: "date-time", example: "2025-07-24T17:23:45.000Z" }
    },
    required: ["_id", "userId", "url", "screenshot", "createdAt", "updatedAt"]
};
export { JobSchemaForSwagger };

export default mongoose.model('Job', JobSchema);