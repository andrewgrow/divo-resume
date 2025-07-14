// /src/controllers/jobsController.js

import { v4 as UUIDv4 } from "uuid";
import { db } from "../data/fakeDb.js";

// [
//     {
//         "jobId": "random_uuid_as_local_job_id",
//         "userId": "random_uuid_as_user_local_id",
//         "url": "https://example.com/vacancies/some_job_id"
//     }
// ]
export function getAll(req, res) {
    const userId = req.params.userId;
    const jobs = Object.values(db.jobs).filter(j => j.userId === userId);
    if (jobs.length === 0) {
        return res.status(400).json({ error: "No jobs found" });
    } else {
        res.json(jobs);
    }
}

// {
//     "jobId": "random_uuid_as_local_job_id",
//     "userId": "random_uuid_as_user_local_id",
//     "url": "https://example.com/vacancies/some_job_id",
//     "screenshot": "/cache/job_screenshot_as_file.pdf",
//     "recognized": {
//         "statusCode": 200,
//         "status": "OK",
//         "statusDetails": "Job posting detected and parsed successfully.",
//         "jobTitle": "Senior Backend Product Software Engineer",
//          ... etc ...
//       }
// }
export async function createOne(req, res) {
    const userId = req.params.userId;
    const jobData = req.body;
    const jobId = UUIDv4();
    const job = { jobId, userId, ...jobData };

    db.jobs[jobId] = job;
    res.status(201).json(job);
}