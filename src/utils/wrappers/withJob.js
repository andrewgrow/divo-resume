// /src/utils/wrappers/withJob.js

import { db } from "../../data/fakeDb.js";

export default function withJob(handler) {
    return function (req, res, next) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ message: "JobId token is absent" });
        }

        const job = db.jobs[jobId];
        if (!job) {
            return res.status(404).json({ message: `Job with id ${jobId} not found` });
        }

        req.foundJob = job;

        return handler(req, res, next);
    }
}