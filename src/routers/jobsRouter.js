// /src/routers/jobsRouter.js

import express from "express";
import {
    getAllJobs,
    createOne,
    takeScreenshot,
    parseJob,
    match,
    improveResume
} from "../controllers/jobsController.js";
import withMainResume from "../utils/wrappers/withMainResume.js";
import withJob from "../utils/wrappers/withJob.js";
import withAiToken from "../utils/wrappers/withAiToken.js";
import {withValidObjectIds} from "../utils/wrappers/withValidObjectIds.js";
import withFoundResume from "../utils/wrappers/withFoundResume.js";

const router = express.Router({ mergeParams: true });

// POST /users/:userId/jobs/:jobId/takeScreenshot
router.post("/:jobId/takeScreenshot", withJob(takeScreenshot));

// POST /users/:userId/jobs/:jobId/parseJob
router.post("/:jobId/parseJob", withAiToken(withJob(parseJob)));

// POST /users/:userId/jobs/:jobId/match
router.post("/:jobId/match", withAiToken(withJob(withMainResume(match))));

// POST /users/:userId/jobs/:jobId/improveResume
router.post("/:jobId/improveResume/:resumeId",
    withAiToken(
        withValidObjectIds(['userId', 'resumeId', 'jobId'],
            withJob(
                withFoundResume(
                    improveResume)
            )
        )
    )
);

// GET /users/:userId/jobs
router.get("/", getAllJobs);

// POST /users/:userId/jobs
router.post("/", createOne);

export default router;