// /src/utils/wrappers/withValidResumeId.js

import mongoose from "mongoose";

export default function withValidResumeId(handler) {
    return function (req, res, next) {
        const resumeId = req.params.resumeId;
        if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
            return res.status(400).json({ error: 'Resume id is invalid' });
        }
        return handler(req, res, next);
    }
}