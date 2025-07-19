// ./src/routers/resumesRouter.js

import express from "express";
import {
    getAll,
    getOne,
    createOne,
    createPdf,
    deleteOne,
    updateOne,
    uploadPdf
} from "../controllers/resumeController.js";
import withMainResume from "../utils/wrappers/withMainResume.js";
import withValidResumeId from "../utils/wrappers/withValidResumeId.js";
import uploadPdfFileMiddleware from "../middleware/uploadPdfFileMiddleware.js";

const router = express.Router({ mergeParams: true });

// GET /users/:userId/resumes/main (get primary resume)
router.get("/main", withMainResume(getOne));

// GET /users/:userId/resumes/:resumeId (get resume)
router.get("/:resumeId", withValidResumeId(getOne));

// POST /users/:userId/resumes/:resumeId/createPdf (create PDF)
router.post("/:resumeId/createPdf", withValidResumeId(withMainResume(createPdf)))

// POST /users/:userId/resumes (create new resume)
router.post("/", createOne);

// DELETE /users/:userId/resumes/:resumeId (delete resume)
router.delete("/:resumeId", withValidResumeId(deleteOne))

// GET /users/:userId/resumes
router.get("/", getAll)

// PUT /users/:userId/resumes/:resumeId
router.put("/:resumeId", withValidResumeId(updateOne))

// POST /users/:userId/resumes/uploadPdf (upload resume from PDF)
router.post("/uploadPdf", uploadPdfFileMiddleware, uploadPdf)

export default router;