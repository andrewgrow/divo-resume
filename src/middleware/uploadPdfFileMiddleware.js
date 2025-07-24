// /src/middleware/uploadPdfFileMiddleware.js

import multer from "multer";
import {filePath} from "../utils/wrappers/filePath.js";
import fs from "fs";

// prepare cacheDir
const cacheDir = filePath("../../../cache")
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// settings for save files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, cacheDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Extract extension, fallback to 'pdf' if absent
        const parts = file.originalname.split('.');
        const ext = (parts.length > 1 ? parts.pop() : 'pdf').toLowerCase();
        // Remove extension, sanitize base name, and limit length
        const base = file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        const maxBaseLength = 50;
        const truncatedBase = base.substring(0, maxBaseLength);
        // Compose final file name
        const filename = `${uniqueSuffix}-${truncatedBase}.${ext}`;
        cb(null, filename);
    }
});
const upload = multer({
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 Mb
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed!"), false);
        }
        cb(null, true);
    }
});

export default function uploadPdfFileMiddleware(req, res, next) {
    return upload.single("upload_file")(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Multer Error (e.g. size)
            console.info(err.message);
            return res.status(400).json({ error: err.message });
        } else if (err) {
            console.info(err.message);
            // Other Error (e.g. non PDF)
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}