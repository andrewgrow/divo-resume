// ./src/routers/resumesRouter.js

import express from "express";
import {getAll, getOne, createOne, createPdf, deleteOne} from "../controllers/resumeController.js";
import withMainResume from "../utils/wrappers/withMainResume.js";

const router = express.Router({ mergeParams: true });

// GET /users/:userId/resumes
router.get("/", getAll)

// GET /users/:userId/resumes/:resumeId
router.get("/:resumeId", getOne);

// POST /users/:userId/resumes/:resumeId/createPdf
router.post("/:resumeId/createPdf", withMainResume(createPdf))

// POST /users/:userId/resumes
router.post("/", createOne);

// DELETE /users/:userId/resumes/:resumeId
router.delete("/:resumeId", deleteOne)

export default router;