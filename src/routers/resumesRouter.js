// ./src/routers/resumesRouter.js

import express from "express";
import {deleteOne, getAll, getOne, updateOne, createOne} from "../controllers/resumeController.js";
import withResume from "../utils/wrappers/withResume.js";

const router = express.Router({ mergeParams: true });

// GET /users/:userId/resumes
router.get("/", getAll)

// GET /users/:userId/resumes/:resumeId
router.get("/:resumeId", withResume(getOne));

// POST /users/:userId/resumes
router.post("/", createOne);

// PUT /users/:userId/resumes/:resumeId
router.put("/:resumeId", withResume(updateOne))

// DELETE /users/:userId/resumes/:resumeId
router.delete("/:resumeId", withResume(deleteOne));

export default router;