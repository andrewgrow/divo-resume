// /src/utils/wrappers/withJob.js

import { findJobById } from '../../database/services/jobsService.js'

export default function withJob(handler) {
    return async function (req, res, next) {
        const jobId = req.params.jobId;
        if (!jobId) {
            return res.status(400).json({ message: "JobId is absent" });
        }

        const job = await findJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: `Job with id ${jobId} not found` });
        }

        req.foundJob = job;

        return handler(req, res, next);
    }
}