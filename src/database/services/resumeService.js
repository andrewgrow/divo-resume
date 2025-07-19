// /src/database/services/resumeService.js

import mongoose from 'mongoose';
import Resume from "../models/resume.js";
import User from "../models/user.js";

export async function getAllResume(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
    }
    return Resume.find({ userId: userId }).limit(1000);
}

export async function getMainResume(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    const allResume = await Resume.find({ userId: userId, isMainResume: true }).limit(1000);
    if (!allResume || allResume.length > 1) {
        throw new Error('User has too many resumes');
    } else if (allResume.length === 1) {
        return allResume[0];
    } else {
        return [];
    }
}

export async function createOne(resume) {
    if (!mongoose.Types.ObjectId.isValid(resume.userId)) {
        throw new Error('Invalid userId format');
    }
    const userId = new mongoose.Types.ObjectId(resume.userId)
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return Resume.create(resume);
}

export async function getOne(userId, resumeId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        throw new Error('Invalid resumeId format');
    }
    return Resume.findOne({ _id: resumeId, userId: userId });
}

export async function deleteOne(userId, resumeId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
        return null;
    }
    return Resume.deleteOne({ _id: resumeId, userId: userId });
}

export async function updateOne(resume) {
    return Resume.findByIdAndUpdate(resume._id, resume, { new: true, runValidators: true });
}

export async function setAllResumeAsNonMain(userId) {
    return Resume.updateMany(
        { userId, isMainResume: true },
        { $set: { isMainResume: false } }
    );
}