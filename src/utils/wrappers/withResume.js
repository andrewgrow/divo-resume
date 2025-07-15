// /src/utils/wrappers/withResume.js

import { getFirstResumeByUser } from "../../data/fakeDb.js";

export default function withResume(handler) {
    return function (req, res, next) {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: "User id is absent" });
        }
        const resume = getFirstResumeByUser(userId);
        if (!resume || resume.userId !== userId) {
            return res.status(404).json({ error: "Resume not found" });
        }
        req.foundResume = resume; // inside handler there is a resume from now
        return handler(req, res, next);
    }
}