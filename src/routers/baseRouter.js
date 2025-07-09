// ./src/routers/baseRouter.js

import express from "express";

const router = express.Router();

// test GET index
router.get("/", async (req, res) => {
    res.json({
        result: `Received GET request for path ${req.path}`,
    });
})

// test POST index
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