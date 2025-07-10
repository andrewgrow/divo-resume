// /src/routers/jobsRouter.js

import express from "express";
import { getAll, createOne } from "../controllers/jobsController.js"

const router = express.Router({ mergeParams: true });

// GET /users/:userId/jobs
router.get("/", getAll);

// POST /users/:userId/jobs
router.post("/", createOne);

export default router;