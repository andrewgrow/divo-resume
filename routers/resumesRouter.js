// src/routers/resumesRouter.js

import express from "express";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../data/fakeDb.js";

const router = express.Router({ mergeParams: true });


// GET /users/:userId/resumes
router.get("/", (req, res) => {
    const userId = req.params.userId;
    const resumes = Object.values(db.resumes).filter(r => r.userId === userId);
    if (resumes.length === 0) {
        return res.status(404).json({ error: "No resumes found" });
    } else {
        res.json(resumes);
    }
});

// GET /users/:userId/resumes/:resumeId
router.get("/:resumeId", (req, res) => {
    const { userId, resumeId } = req.params;
    const resume = db.resumes[resumeId];
    if (!resume || resume.userId !== userId) {
        return res.status(404).json({ error: "Resume not found" });
    }
    res.json(resume);
});

// POST /users/:userId/resumes
router.post("/", (req, res) => {
    const userId = req.params.userId;
    const resumeData = req.body;
    const resumeId = uuidv4();
    const resume = { resumeId, userId, ...resumeData };
    db.resumes[resumeId] = resume;
    res.status(201).json(resume);
});

// PUT /users/:userId/resumes/:resumeId
router.put("/:resumeId", (req, res) => {
    const { userId, resumeId } = req.params;
    const resume = db.resumes[resumeId];
    if (!resume || resume.userId !== userId) {
        return res.status(404).json({ error: "Resume not found" });
    }
    const { resumeId: ignore1, userId: ignore2, ...allowedFields } = req.body;
    Object.assign(resume, allowedFields);
    db.resumes[resumeId] = resume;
    res.json(resume);
});

// DELETE /users/:userId/resumes/:resumeId
router.delete("/:resumeId", (req, res) => {
    const { userId, resumeId } = req.params;
    const resume = db.resumes[resumeId];
    if (!resume || resume.userId !== userId) {
        return res.status(404).json({ error: "Resume not found" });
    }
    delete db.resumes[resumeId];
    res.json({ success: true });
});

export default router;