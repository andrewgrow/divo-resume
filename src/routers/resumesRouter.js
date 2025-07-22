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

const router = express.Router({ mergeParams: true });

// GET /users/:userId/resumes/main (get primary resume)
router.get("/main", withValidObjectIds(["userId"], withMainResume(getOne)));

// GET /users/:userId/resumes/:resumeId (get resume)
router.get("/:resumeId", withValidObjectIds(["userId", "resumeId"], getOne));

// POST /users/:userId/resumes/:resumeId/createPdf (create PDF)
router.post("/:resumeId/createPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(createPdf))
)

// POST /users/:userId/resumes/:resumeId/parseResumeFromPdf (parse Resume From PDF)
router.post("/:resumeId/parseResumeFromPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(parseResumeFromPdf))
)

// POST /users/:userId/resumes (create new resume)
router.post("/", createOne);

// DELETE /users/:userId/resumes/:resumeId (delete resume)
router.delete("/:resumeId", withValidObjectIds(["userId", "resumeId"], deleteOne));

// GET /users/:userId/resumes
router.get("/", getAll);

// PUT /users/:userId/resumes/:resumeId
router.put("/:resumeId", withValidResumeId(updateOne));

// POST /users/:userId/resumes/uploadPdf (upload resume from PDF)
router.post("/uploadPdf", uploadPdfFileMiddleware, uploadPdf);

export default router;