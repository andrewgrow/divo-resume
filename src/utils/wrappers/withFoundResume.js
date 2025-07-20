// /src/utils/wrappers/withFoundResume.js

import {getOne} from "../../database/services/resumeService.js";

export default function withFoundResume(handler) {
    return async function (req, res, next) {
        try {
            const userId = req.params.userId;
            if (!userId) {
                return res.status(400).json({ message: "User id is absent" });
            }
            const resumeId = req.params.resumeId;
            if (!resumeId) {
                return res.status(400).json({ error: "Resume id is absent" });
            }

            const resume = await getOne(userId, resumeId);
            if (!resume || !resume._id) {
                return res.status(404).json({ error: "Resume not found" });
            }
            req.foundResume = resume;
            return handler(req, res, next);
        } catch (err) {
            next(err);
        }
    }
}