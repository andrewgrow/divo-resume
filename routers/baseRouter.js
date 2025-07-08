// src/routers/baseRouter.js

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

export default router;