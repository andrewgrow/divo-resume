// /src/utils/wrappers/withValidObjectIds.js

import mongoose from "mongoose";

export function withValidObjectIds(paramNames, handler) {
    return function (req, res, next) {
        for (const paramName of paramNames) {
            const id = req.params[paramName];
            if (!id || !mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: `${paramName} is invalid` });
            }
        }
        return handler(req, res, next);
    }
}