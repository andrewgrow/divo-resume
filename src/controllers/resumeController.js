// ./src/controllers/resumeController.js

import { v4 as UUIDv4 } from 'uuid';
import { db } from "../data/fakeDb.js";

export function getAll(req, res) {
    const userId = req.params.userId;
    const resumes = Object.values(db.resumes).filter(r => r.userId === userId);
    if (resumes.length === 0) {
        return res.status(404).json({ error: "No resumes found" });
    } else {
        res.json(resumes);
    }
}

export function getOne(req, res) {
    res.json(req.foundResume);
}

export function createOne(req, res) {
    const userId = req.params.userId;
    const resumeData = req.body;
    const resumeId = UUIDv4();
    const resume = { resumeId, userId, ...resumeData };
    db.resumes[resumeId] = resume;
    res.status(201).json(resume);
}

export function updateOne(req, res) {
    const { resumeId: ignore1, userId: ignore2, ...allowedFields } = req.body;
    Object.assign(req.foundResume, allowedFields);
    db.resumes[req.foundResume.resumeId] = req.foundResume;
    res.json(req.foundResume);
}

export function deleteOne(req, res) {
    delete db.resumes[req.foundResume.resumeId];
    res.json({ success: true });
}