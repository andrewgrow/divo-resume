// /tests/src/routers/resume/createPdf.test.js

import {
    app,
    closeDb,
    createResumeRecord,
    createUserAndLogin,
    globalSetup
} from "./abcSetup.js";
import request from "supertest";
import fs from "fs";
import Resume from "../../../../src/database/models/resume.js";
import User from "../../../../src/database/models/user.js";

describe("Create PDF from Resume", () => {
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

    it("POST /users/:userId/resumes/:resumeId/createPdf — 401 without auth", async () => {
        const userId = loggedUser.userId;
        const notExistId = "64c789012345678901234567";

        await request(app)
            .post(`/users/${userId}/resumes/${notExistId}/createPdf`)
            .expect(401);
    });

    it("POST /users/:userId/resumes/:resumeId/createPdf — 404 if resume does not exist", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // make test ObjectId
        const notExistId = "64c789012345678901234567";
        await request(app)
            .post(`/users/${userId}/resumes/${notExistId}/createPdf`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("POST /users/:userId/resumes/:resumeId/createPdf — 400 if resumeId is invalid", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        await request(app)
            .post(`/users/${userId}/resumes/notAnObjectId/createPdf`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("POST /users/:userId/resumes/:resumeId/createPdf — 400 if userId is invalid", async () => {
        const token = loggedUser.token;
        const resumeId = resume._id;

        await request(app)
            .post(`/users/notAnObjectId/resumes/${resumeId}/createPdf`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);
    });

    it("POST /users/:userId/resumes/:resumeId/createPdf — successfully creates PDF and updates pdfFilePath in DB", async () => {
        // create user
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // take resume id
        const resumeId = resume._id;

        const response = await request(app)
            .post(`/users/${userId}/resumes/${resumeId}/createPdf`)
            .set("Authorization", `Bearer ${token}`)
            .expect(201);

        expect(response.body).toHaveProperty("pdfFilePath");
        expect(response.body.pdfFilePath.endsWith(".pdf")).toBe(true);

        // Check that the file exists on disk
        expect(fs.existsSync(response.body.pdfFilePath)).toBe(true);

        // Fetch the resume from DB and check that pdfFilePath is updated correctly
        const resumeFromDb = await Resume.findById(resumeId).lean();
        expect(resumeFromDb).not.toBeNull();
        expect(resumeFromDb.pdfFilePath).toBe(response.body.pdfFilePath);

        // Remove the file after the test
        fs.unlinkSync(response.body.pdfFilePath);
        expect(fs.existsSync(response.body.pdfFilePath)).toBe(false);
    });

    it("POST /users/:userId/resumes/:resumeId/createPdf — 404 if user try to create pdf by someone else's resume", async () => {
        const resumeId = resume._id;

        // Create the second user
        const user2 = await createUserAndLogin();
        // user2 try to create pdf by someone else's resume
        await request(app)
            .post(`/users/${user2.userId}/resumes/${resumeId}/createPdf`)
            .set("Authorization", `Bearer ${user2.token}`)
            .expect(404);

        await User.deleteOne({ _id: user2.userId }); // clear user2
    });
});