// /src/routers/jobsRouter.js

import express from "express";
import { getAll, createOne, takeScreenshot, parseJob, match } from "../controllers/jobsController.js"
import withResume from "../utils/wrappers/withResume.js";
import withJob from "../utils/wrappers/withJob.js";
import withAiToken from "../utils/wrappers/withAiToken.js";

const router = express.Router({ mergeParams: true });

// POST /users/:userId/jobs/:jobId/takeScreenshot
router.post("/:jobId/takeScreenshot", withJob(takeScreenshot))

// POST /users/:userId/jobs/:jobId/parseJob
router.post("/:jobId/parseJob", withAiToken(withJob(parseJob)))

// POST /users/:userId/jobs/:jobId/match
router.post("/:jobId/match", withAiToken(withJob(withResume(match))))

// GET /users/:userId/jobs
router.get("/", getAll);

// POST /users/:userId/jobs
router.post("/", createOne);

export default router;