// /src/middleware/userIdMiddleware.js

import mongoose from "mongoose";

export default function userIdMiddleware(req, res, next) {
    const userId = req.params.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({error: "You must provide a valid userId"});
    }
    return next();
}