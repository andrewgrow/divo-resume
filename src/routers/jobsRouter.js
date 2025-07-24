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
/**
 * @openapi
 * /users/{userId}/jobs/{jobId}/takeScreenshot:
 *   post:
 *     summary: Take a screenshot of the job posting
 *     description: Takes a screenshot for the specified job and returns the updated job object. Requires authentication.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *     responses:
 *       200:
 *         description: Screenshot taken successfully. The updated job object is returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid userId or jobId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post("/:jobId/takeScreenshot", withJob(takeScreenshot));

// POST /users/:userId/jobs/:jobId/parseJob
/**
 * @openapi
 * /users/{userId}/jobs/{jobId}/parseJob:
 *   post:
 *     summary: Parse a job posting using AI
 *     description: Parses the specified job posting using an external AI service. Requires authentication and an AI token.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *       - in: header
 *         name: x-openai-token
 *         required: true
 *         schema:
 *           type: string
 *         description: OpenAI API token
 *     responses:
 *       200:
 *         description: Job parsed successfully. Returns the updated job object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: AI token is absent, jobId is absent, or invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 */
router.post("/:jobId/parseJob", withAiToken(withJob(parseJob)));

// POST /users/:userId/jobs/:jobId/match
/**
 * @openapi
 * /users/{userId}/jobs/{jobId}/match:
 *   post:
 *     summary: Match a job with the user's main resume using AI
 *     description: Uses AI to match the specified job posting with the user's main resume. Requires authentication and an AI token.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *       - in: header
 *         name: x-openai-token
 *         required: true
 *         schema:
 *           type: string
 *         description: OpenAI API token
 *     responses:
 *       200:
 *         description: Job matched with the user's main resume successfully. Returns the updated job object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: AI token is absent, userId is absent, jobId is absent, or invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job or resume not found
 */
router.post("/:jobId/match", withAiToken(withJob(withMainResume(match))));

// POST /users/:userId/jobs/:jobId/improveResume
/**
 * @openapi
 * /users/{userId}/jobs/{jobId}/improveResume/{resumeId}:
 *   post:
 *     summary: Improve a resume for a specific job using AI
 *     description: Uses AI to improve the specified resume for the selected job. Requires authentication and an AI token.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the job
 *       - in: path
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume to improve
 *       - in: header
 *         name: x-openai-token
 *         required: true
 *         schema:
 *           type: string
 *         description: OpenAI API token
 *     responses:
 *       200:
 *         description: Resume improved successfully. Returns the improved resume object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: AI token is absent, userId/jobId/resumeId is absent or invalid, or invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job or resume not found
 */
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
/**
 * @openapi
 * /users/{userId}/jobs:
 *   get:
 *     summary: Get all jobs for a user
 *     description: Returns a list of all job postings for the specified user. Requires authentication.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of job postings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid userId
 *       401:
 *         description: Unauthorized
 */
router.get("/", getAllJobs);

// POST /users/:userId/jobs
/**
 * @openapi
 * /users/{userId}/jobs:
 *   post:
 *     summary: Create a new job posting
 *     description: Creates a new job posting for the specified user and returns the created job object. Requires authentication.
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://company.com/job/123"
 *             required:
 *               - url
 *     responses:
 *       201:
 *         description: Job successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/", createOne);

export default router;