// /src/index.js

import {connectMongoose} from "./database/connection/db.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

import { JobSchemaForSwagger } from "./database/models/job.js";

let swaggerOptions = null;

if (process.env.NODE_ENV === 'development') {
    console.log('Happy developing mode is enabled ✨')

    // Swagger options
    swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'Example API',
                version: '1.0.0',
                description: 'Backend API Documentation',
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
                responses: {
                    NotFound: {
                        description: "Route not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        error: { type: "string", example: "Route not found" }
                                    }
                                }
                            }
                        }
                    }
                },
                schemas: {
                    Job: JobSchemaForSwagger,
                    Resume: ResumeSchemaForSwagger,
                }
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
        apis: ['./src/routers/*.js'], // path to routers
    };
}

import { requestId } from "./middleware/requestId.js";
import { logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import express from "express";
import "dotenv/config";

import baseRouter from "./routers/baseRouter.js";
import usersRouter from "./routers/usersRouter.js";
import {ResumeSchemaForSwagger} from "./database/models/resume.js";

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

// development mode
if (swaggerOptions) {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('Swagger UI available at http://localhost:' + port + '/api-docs'); // e.g. http://localhost:3000/api-docs
}

app.use("/users", usersRouter);
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