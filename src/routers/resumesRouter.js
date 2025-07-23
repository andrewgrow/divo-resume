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
router.get("/main", withValidObjectIds(
    ["userId"],
    withMainResume(getOne)
));

// GET /users/:userId/resumes/:resumeId (return an existing resume)
router.get("/:resumeId", withValidObjectIds(
    ["userId", "resumeId"], getOne
    )
);

// POST /users/:userId/resumes/:resumeId/createPdf (create PDF from resume)
router.post("/:resumeId/createPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(createPdf)
    )
)

// POST /users/:userId/resumes/:resumeId/parseResumeFromPdf (parse Resume from PDF via AI)
router.post("/:resumeId/parseResumeFromPdf",
    withValidObjectIds(["userId", "resumeId"],
        withFoundResume(
            withAiToken(parseResumeFromPdf)
        )
    )
)

// POST /users/:userId/resumes (create new resume from JSON)
router.post("/", createOne);

// DELETE /users/:userId/resumes/:resumeId (delete a resume)
router.delete("/:resumeId", withValidObjectIds(
    ["userId", "resumeId"],
    deleteOne)
);

// GET /users/:userId/resumes (return all user's resumes
router.get("/", getAll);

// PUT /users/:userId/resumes/:resumeId (update an existing resume)
router.put("/:resumeId", withValidResumeId(updateOne));

// POST /users/:userId/resumes/uploadPdf (upload PDF and add it to new resume)
router.post("/uploadPdf", uploadPdfFileMiddleware, uploadPdf);

export default router;