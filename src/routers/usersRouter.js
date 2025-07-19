// /src/routers/usersRouter.js

import express from "express";
import resumesRouter from "./resumesRouter.js";
import jobsRouter from "./jobsRouter.js";
import {createOne as createUser, loginUser} from "../controllers/usersController.js";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import userIdMiddleware from "../middleware/userIdMiddleware.js";

const router = express.Router();

const isTestEnv = process.env.TEST_ENV === "test";

// resumes router includes into users path, so it looks like /users/:userId/resumes
router.use("/:userId/resumes", authMiddleware, userIdMiddleware, resumesRouter);

// jobs router includes into users path, so it looks like /users/:userId/jobs
router.use("/:userId/jobs", authMiddleware, userIdMiddleware, jobsRouter);

const loginLimiter = rateLimit({
    windowMs: 1000 * 3, // 3 seconds
    max: process.env.NODE_ENV === "test" ? 100_000 : 1, // 1 requests per IP
    message: { error: 'Too many login attempts. Please try again later.' }
});
// POST /users/login
router.post("/login", loginLimiter, loginUser);

const registerLimiter = rateLimit({
    windowMs: 1000 * 3, // 3 seconds
    max: process.env.NODE_ENV === "test" ? 100_000 : 1, // 1 requests per IP
    message: { error: 'Too many registration attempts. Please try again later.' }
});

// POST /users
router.post("/", registerLimiter, createUser);

export default router;