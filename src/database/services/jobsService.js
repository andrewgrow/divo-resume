// /src/database/services/jobsService.js

import mongoose from "mongoose";
import Job from "../models/job.js";
import User from "../models/user.js";

export async function allJobsByUser(userId) {
    if (!userId || typeof userId !== "string" || userId.length === 0 || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Valid userId is required");
        return [];
    }
    return Job.find({ userId: new mongoose.Types.ObjectId(userId) }).limit(1000);
}

export async function createJob(job) {
    if (!mongoose.Types.ObjectId.isValid(job.userId)) {
        throw new Error('Invalid userId format');
    }
    const userId = new mongoose.Types.ObjectId(job.userId)
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    job.userId = userId;
    return Job.create(job);
}

export async function updateJob(job) {
    if (!job._id) throw new Error('job._id is required');
    return Job.findByIdAndUpdate(
        job._id,
        job,
        { new: true }
    );
}

export async function findJobById(jobId) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        console.error("Valid jobId is required");
        return null;
    }
    return Job.findById(jobId);
}