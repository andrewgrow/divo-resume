// /src/middleware/requestId.js

import { v4 as UUIDv4 } from 'uuid';

export function requestId(req, res, next) {
    // Store the `x-request-uuid` from the client or generate new one
    const incomingId = req.headers['x-request-uuid'] || req.headers['x-correlation-id'];
    const id = incomingId || UUIDv4();

    req.requestId = id;
    res.setHeader('x-request-uuid', id);

    next();
}