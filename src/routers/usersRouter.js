// /src/routers/usersRouter.js

import express from "express";
import resumesRouter from "./resumesRouter.js";
import jobsRouter from "./jobsRouter.js";

const router = express.Router();

// resumes router includes into users path, so it looks like /users/:userId/resumes
router.use("/:userId/resumes", resumesRouter);

// jobs router includes into users path, so it looks like /users/:userId/jobs
router.use("/:userId/jobs", jobsRouter);

export default router;