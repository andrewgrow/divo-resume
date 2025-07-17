// /src/utils/wrappers/withResume.js

import {getMainResume} from "../../database/services/resumeService.js";

export default function withMainResume(handler) {
    return async function (req, res, next) {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: "User id is absent" });
        }
        const resume = await getMainResume(userId);
        if (!resume) {
            return res.status(404).json({ error: "Resume not found" });
        }
        req.foundResume = resume; // inside handler there is a resume from now
        return handler(req, res, next);
    }
}