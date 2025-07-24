// ./src/routers/resumesRouter.js

import express from "express";
import {
    getAll,
    getOne,
    createOne,
    createPdf,
    deleteOne,
    updateOne,
    uploadPdf,
    parseResumeFromPdf
} from "../controllers/resumeController.js";
import withMainResume from "../utils/wrappers/withMainResume.js";
import withValidResumeId from "../utils/wrappers/withValidResumeId.js";
import uploadPdfFileMiddleware from "../middleware/uploadPdfFileMiddleware.js";
import withFoundResume from "../utils/wrappers/withFoundResume.js";
import {withValidObjectIds} from "../utils/wrappers/withValidObjectIds.js";
import withAiToken from "../utils/wrappers/withAiToken.js";

const router = express.Router({ mergeParams: true });

// GET /users/:userId/resumes/main (return the primary resume)
/**
 * @openapi
 * /users/{userId}/resumes/main:
 *   get:
 *     summary: Get the user's main resume
 *     description: Returns the primary (main) resume for the specified user. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         description: The user's main resume
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid userId or input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.get("/main", withValidObjectIds(
    ["userId"],
    withMainResume(getOne)
));

// GET /users/:userId/resumes/:resumeId (return an existing resume)
/**
 * @openapi
 * /users/{userId}/resumes/{resumeId}:
 *   get:
 *     summary: Get a specific resume by ID
 *     description: Returns the resume with the specified ID for the specified user. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume
 *     responses:
 *       200:
 *         description: The requested resume
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid userId or resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.get("/:resumeId", withValidObjectIds(
    ["userId", "resumeId"], getOne
    )
);

// POST /users/:userId/resumes/:resumeId/createPdf (create PDF from resume)
/**
 * @openapi
 * /users/{userId}/resumes/{resumeId}/createPdf:
 *   post:
 *     summary: Create a PDF from a resume
 *     description: Generates a PDF document from the specified resume. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume
 *     responses:
 *       201:
 *         description: PDF created successfully. Returns the updated resume object (with PDF path or URL).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid userId or resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.post("/:resumeId/createPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(createPdf)
    )
)

// POST /users/:userId/resumes/:resumeId/parseResumeFromPdf (parse Resume from PDF via AI)
/**
 * @openapi
 * /users/{userId}/resumes/{resumeId}/parseResumeFromPdf:
 *   post:
 *     summary: Parse resume content from a PDF using AI
 *     description: Uses AI to parse the content of a resume from its PDF representation. Requires authentication and an AI token.
 *     tags:
 *       - Resumes
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
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume
 *       - in: header
 *         name: x-openai-token
 *         required: true
 *         schema:
 *           type: string
 *         description: OpenAI API token
 *     responses:
 *       200:
 *         description: Resume parsed from PDF successfully. Returns the updated resume object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: AI token is absent, invalid userId or resumeId, or invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.post("/:resumeId/parseResumeFromPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(
            withAiToken(parseResumeFromPdf)
        )
    )
)

// POST /users/:userId/resumes (create new resume from JSON)
/**
 * @openapi
 * /users/{userId}/resumes:
 *   post:
 *     summary: Create a new resume
 *     description: Creates a new resume for the specified user from a JSON object. Requires authentication.
 *     tags:
 *       - Resumes
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
 *             $ref: '#/components/schemas/Resume'
 *     responses:
 *       201:
 *         description: Resume created successfully. Returns the created resume object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post("/", createOne);

// DELETE /users/:userId/resumes/:resumeId (delete a resume)
/**
 * @openapi
 * /users/{userId}/resumes/{resumeId}:
 *   delete:
 *     summary: Delete a resume
 *     description: Deletes the resume with the specified ID for the specified user. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resume deleted"
 *       400:
 *         description: Invalid userId or resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.delete("/:resumeId", withValidObjectIds(
    ["userId", "resumeId"],
    deleteOne)
);

// GET /users/:userId/resumes (return all user's resumes
/**
 * @openapi
 * /users/{userId}/resumes:
 *   get:
 *     summary: Get all resumes for a user
 *     description: Returns all resumes for the specified user. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         description: List of resumes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid userId
 *       401:
 *         description: Unauthorized
 */
router.get("/", getAll);

// PUT /users/:userId/resumes/:resumeId (update an existing resume)
/**
 * @openapi
 * /users/{userId}/resumes/{resumeId}:
 *   put:
 *     summary: Update a resume
 *     description: Updates the specified resume for the specified user. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         name: resumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the resume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resume'
 *     responses:
 *       200:
 *         description: Resume updated successfully. Returns the updated resume object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid input data or resumeId
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resume not found
 */
router.put("/:resumeId", withValidResumeId(updateOne));

// POST /users/:userId/resumes/uploadPdf (upload PDF and add it to new resume)
/**
 * @openapi
 * /users/{userId}/resumes/uploadPdf:
 *   post:
 *     summary: Upload a PDF file and create a new resume
 *     description: Uploads a PDF file and creates a new resume for the specified user based on its content. Requires authentication.
 *     tags:
 *       - Resumes
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       201:
 *         description: Resume created successfully from the uploaded PDF. Returns the created resume object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resume'
 *       400:
 *         description: Invalid userId or file missing/invalid
 *       401:
 *         description: Unauthorized
 */
router.post("/uploadPdf", uploadPdfFileMiddleware, uploadPdf);

export default router;