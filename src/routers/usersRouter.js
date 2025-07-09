// ./src/routers/usersRouter.js

import express from "express";
import resumesRouter from "./resumesRouter.js";

const router = express.Router();

router.use("/:userId/resumes", resumesRouter);

export default router;