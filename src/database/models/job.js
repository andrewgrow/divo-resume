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

export default mongoose.model('Job', JobSchema);