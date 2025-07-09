// ./src/utils/wrappers/withResume.js

import { db } from "../../data/fakeDb.js";

export function withResume(handler) {
    return function (req, res, next) {
        const { userId, resumeId } = req.params;
        const resume = db.resumes[resumeId];
        if (!resume || resume.userId !== userId) {
            return res.status(404).json({ error: "Resume not found" });
        }
        req.foundResume = resume; // inside handler there is a resume from now
        console.log("withResume -> calling handler", handler.name, typeof handler);
        return handler(req, res, next);
    }
}