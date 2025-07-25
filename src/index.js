// /src/index.js

if (process.env.NODE_ENV === 'development') {
    console.log('Happy developing mode is enabled ✨')
}

import {connectMongoose} from "./database/connection/db.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import { requestId } from "./middleware/requestId.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import express from "express";
import "dotenv/config";

import baseRouter from "./routers/baseRouter.js";
import usersRouter from "./routers/usersRouter.js";
import rateLimit from "express-rate-limit";
import prepareSwaggerOptions from "./utils/preparing/prepareSwaggerOptions.js";
import cors from 'cors';

let swaggerOptions = process.env.NODE_ENV === 'development' ? prepareSwaggerOptions : null;
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN] // production frontend
    : ['http://localhost:5173']; // development frontend

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

app.use(cors({origin: allowedOrigins})); // CORS

// development mode
if (swaggerOptions) {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger UI available at http://localhost:' + port + '/api-docs'); // e.g. http://localhost:3000/api-docs
}

const rateLimiter = rateLimit({
    windowMs: 1000 * 3, // 3 seconds
    max: process.env.NODE_ENV === "test" ? 100_000 : 25, // 25 requests per IP
    message: { error: 'Too many registration attempts. Please try again later.' }
});

app.use("/api/users", rateLimiter, usersRouter);
app.use("/", baseRouter) // final router

app.use(errorHandler)

async function startServer() {
    try {
        await connectMongoose();
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

startServer().then(r => {});