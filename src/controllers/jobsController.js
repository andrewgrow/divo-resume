// /src/controllers/jobsController.js

import { v4 as UUIDv4 } from "uuid";
import { db } from "../data/fakeDb.js";

export function getAll(req, res) {
    const userId = req.params.userId;
    const jobs = Object.values(db.jobs).filter(j => j.userId === userId);
    if (jobs.length === 0) {
        return res.status(400).json({ error: "No jobs found" });
    } else {
        res.json(jobs);
    }
}

export function createOne(req, res) {
    const userId = req.params.userId;
    const jobData = req.body;
    const jobId = UUIDv4();
    const job = { jobId, userId, ...jobData };
    db.jobs[jobId] = job;
    res.status(201).json(job);
}