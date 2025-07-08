// src/index.js

console.log('Happy developing ✨')

import { requestId } from "./middleware/requestId.js";
import { logger } from "./middleware/logger.js";

import express from "express";
import "dotenv/config";

import openAiRouter from "./routers/openaiRouter.js";
import baseRouter from "./routers/baseRouter.js";

const app = express();
const port = 3000;

app.use(requestId) // Always first because need to set UUID
app.use(express.json()); // Always the second because need to parse JSON
app.use(logger) // Always the third because need to logging requests and responses

app.use("/openai", openAiRouter)
app.use("/", baseRouter) // final router

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});