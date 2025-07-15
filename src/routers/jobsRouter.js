// /src/routers/jobsRouter.js

import express from "express";
import { getAll, createOne, takeScreenshot, parseJob, adaptResume } from "../controllers/jobsController.js"

const router = express.Router({ mergeParams: true });

// POST /users/:userId/jobs/:jobId/takeScreenshot
router.post("/:jobId/takeScreenshot", takeScreenshot)

// POST /users/:userId/jobs/:jobId/parseJob
router.post("/:jobId/parseJob", parseJob)

// POST /users/:userId/jobs/:jobId/adaptResume
router.post("/:jobId/adaptResume", adaptResume)

// GET /users/:userId/jobs
router.get("/", getAll);

// POST /users/:userId/jobs
router.post("/", createOne);

export default router;