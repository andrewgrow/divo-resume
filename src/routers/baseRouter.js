// ./src/routers/baseRouter.js

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// test GET index
/**
 * @openapi
 * /:
 *   get:
 *     summary: Test GET-request for index path
 *     description: Return JSON with echo
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "Received GET request for path /"
 */
router.get("/", async (req, res) => {
    res.json({
        result: `Received GET request for path ${req.path}`,
    });
})

/**
 * @openapi
 * /testAuth:
 *   get:
 *     summary: Test GET-request (need to be authorized)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful answer
 */
router.get("/testAuth", authMiddleware, async (req, res) => {
    res.json({ result: `Received GET request for path ${req.path}` });
});

// test POST index
/**
 * @openapi
 * /:
 *   post:
 *     summary: Test POST endpoint
 *     description: Returns confirmation and echoes the received request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               key: value
 *     responses:
 *       200:
 *         description: Successful response with echoed request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "Received POST request for path /. Return the same body."
 *                 originalBody:
 *                   type: object
 *                   example:
 *                     key: value
 */
router.post("/", async (req, res) => {
    res.json({
        result: `Received POST request for path ${req.path}. Return the same body.`,
        originalBody: req.body,
    });
})

// 404 handler for all undefined paths
router.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default router;