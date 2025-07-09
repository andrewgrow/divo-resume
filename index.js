// src/index.js

if (process.env.NODE_ENV === 'development') {
    console.log('Happy developing ✨')
}

import { requestId } from "./src/middleware/requestId.js";
import { logger } from "./src/middleware/logger.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

import express from "express";
import "dotenv/config";

import openAiRouter from "./src/routers/openaiRouter.js";
import baseRouter from "./src/routers/baseRouter.js";
import usersRouter from "./src/routers/usersRouter.js";

// catch unexpected exceptions
process.on("uncaughtException", (err) => {
    console.error("[UncaughtException]", err);
    // restart process here: pm2, docker restart policy, etc...
});

// catch unexpected promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("[UnhandledRejection]", reason);
});

const app = express();
const port = process.env.PORT || 3000;

app.use(requestId) // Always first because need to set UUID
app.use(express.json()); // Always the second because need to parse JSON
app.use(logger) // Always the third because need to logging requests and responses

app.use("/openai", openAiRouter)
app.use("/users", usersRouter);
app.use("/", baseRouter) // final router

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});