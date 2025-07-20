// /tests/src/routers/resume/uploadPdf.test.js

import {
    app,
    closeDb,
    createResumeRecord,
    createUserAndLogin,
    globalSetup,
} from "./abcSetup.js";
import request from "supertest";
import {validResume} from "../../materials/validResume.js";
import {generateResumePdf} from "../../../../src/tools/pdfCreator.js";
import fs from "fs";
import path from "path";
import User from "../../../../src/database/models/user.js";
import Resume from "../../../../src/database/models/resume.js";

describe("Upload Pdf to Resume", () => {
    let loggedUser;
    let resume;

    beforeAll(async () => {
        await globalSetup();
        loggedUser = await createUserAndLogin();
        resume = await createResumeRecord(loggedUser.userId, loggedUser.token);
    });

    afterAll(async () => {
        if (loggedUser) {
            await User.deleteOne({ _id: loggedUser.userId });
        }
        if (resume) {
            await Resume.deleteOne({ _id: resume._id });
        }
        await closeDb();
    });

    it("POST /users/:userId/resumes/uploadPdf — successful upload PDF файл", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // 1. generate pdf
        const { stream, resumePath } = generateResumePdf(
            validResume,
            "../../../cache"
        );

        // 2. Waiting for end of stream
        await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });

        await new Promise(r => setTimeout(r, 50));

        // Impossible to upload without auth
        await request(app)
            .post(`/users/${userId}/resumes/uploadPdf`)
            .attach("upload_file", resumePath)
            .expect(401);

        // 3. Upload file via Endpoint
        const response = await request(app)
            .post(`/users/${userId}/resumes/uploadPdf`)
            .set("Authorization", `Bearer ${token}`)
            .attach("upload_file", resumePath)
            .expect(200);

        await new Promise(r => setTimeout(r, 50));

        expect(response.body).toHaveProperty("filePath");
        expect(response.body.filePath.endsWith(".pdf")).toBe(true);
        expect(fs.existsSync(response.body.filePath)).toBe(true);

        // Clearing: remove both files
        await new Promise(r => setTimeout(r, 50));

        await fs.unlinkSync(response.body.filePath);
        await fs.unlinkSync(resumePath);

        // Check removing
        expect(fs.existsSync(response.body.filePath)).toBe(false);
        expect(fs.existsSync(resumePath)).toBe(false);
    });

    it("POST /users/:userId/resumes/uploadPdf — error if not PDF", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // Create txt file
        const testTxtPath = path.resolve("./cache/test_resume.txt");
        fs.writeFileSync(testTxtPath, "not a pdf");

        await new Promise(r => setTimeout(r, 50));

        const response = await request(app)
            .post(`/users/${userId}/resumes/uploadPdf`)
            .set("Authorization", `Bearer ${token}`)
            .attach("upload_file", testTxtPath)
            .expect(400);

        expect(response.body).toHaveProperty("error");
        // Clear
        await fs.unlinkSync(testTxtPath);
    });

    it("POST /users/:userId/resumes/uploadPdf — error if file too large", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // Create large file (more than 3 Mb)
        const bigPdfPath = path.resolve("./cache/big_test_resume.pdf");
        const bigBuffer = Buffer.alloc(3 * 1024 * 1024 + 1, 0); // 3 Mb + 1 byte
        fs.writeFileSync(bigPdfPath, bigBuffer);

        await new Promise(r => setTimeout(r, 50));

        const response = await request(app)
            .post(`/users/${userId}/resumes/uploadPdf`)
            .set("Authorization", `Bearer ${token}`)
            .attach("upload_file", bigPdfPath)
            .expect(400);

        expect(response.body).toHaveProperty("error");
        // Clear
        fs.unlinkSync(bigPdfPath);
        expect(fs.existsSync(bigPdfPath)).toBe(false);
    });
});