// src/middleware/logger.js

export function logger(req, res, next) {
    const now = new Date().toISOString();
    console.log(`[${now}] [${req.requestId}] [Request] Method: ${req.method} Original Url: ${req.originalUrl}`);
    console.log(`[${now}] [${req.requestId}] [Request] Headers: ${JSON.stringify(req.headers)}, Body: ${JSON.stringify(req.body)}`);

    const start = Date.now(); // Store the start time because measure process duration

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[${now}] [${req.requestId}] [Response] Status ${res.statusCode} sent in ${duration}ms`);
    });

    next();
}