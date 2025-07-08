// src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
    const now = new Date().toISOString();
    console.error(`[${now}] [${req?.requestId}] [Error]`, err);

    // response for client
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'? 'Internal Server Error' : String(err),
        requestId: req?.requestId,
    });
}