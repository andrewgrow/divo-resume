// /src/database/services/resumeService.js

import mongoose from 'mongoose';
import Resume from "../models/resume.js";
import User from "../models/user.js";

export async function getAllResume(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
    }
    return Resume.find({ userId: new mongoose.Types.ObjectId(userId) }).limit(1000);
}

export async function getMainResume(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
    }
    return Resume.findOne({ userId: new mongoose.Types.ObjectId(userId), isMainResume: true });
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