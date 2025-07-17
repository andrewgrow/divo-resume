// /src/middleware/authMiddleware.js

import { verifyToken } from '../database/services/jwtService.js';

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader || typeof authHeader !== 'string') {
        return res.status(401).json({"message": "No token provided"});
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next();
}