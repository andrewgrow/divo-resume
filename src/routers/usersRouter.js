// /src/routers/usersRouter.js

import express from "express";
import resumesRouter from "./resumesRouter.js";
import jobsRouter from "./jobsRouter.js";
import {createOne as createUser, loginUser} from "../controllers/usersController.js";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import userIdMiddleware from "../middleware/userIdMiddleware.js";

const router = express.Router();

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
/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secretPassword123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid credentials or missing data
 *       429:
 *         description: Too many login attempts. Please try again later.
 */
router.post("/login", loginLimiter, loginUser);

const registerLimiter = rateLimit({
    windowMs: 1000 * 3, // 3 seconds
    max: process.env.NODE_ENV === "test" ? 100_000 : 1, // 1 requests per IP
    message: { error: 'Too many registration attempts. Please try again later.' }
});

// POST /users
/**
 * @openapi
 * /users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns the created user object.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecretPassword1
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *             required:
 *               - email
 *               - password
 *               - name
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "6539fae2e30c5a12e3f64cf9"
 *                 email:
 *                   type: string
 *                   example: "newuser@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *       400:
 *         description: Invalid input data
 *       429:
 *         description: Too many registration attempts. Please try again later.
 */
router.post("/", registerLimiter, createUser);

export default router;