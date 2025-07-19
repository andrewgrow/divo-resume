// /tests/src/routers/resumeRouter.test.js

import request from "supertest";
import express from "express";
import usersRouter from "../../../src/routers/usersRouter.js";
import {connectMongoose} from "../../../src/database/connection/db.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {validResume} from "../materials/validResume.js";
import User from "../../../src/database/models/user.js";
import Resume from "../../../src/database/models/resume.js";
import path from "path";
import fs from "fs";
import {generateResumePdf} from "../../../src/tools/pdfCreator.js";
dotenv.config({ path: ".env.test" });

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("Resumes API", () => {
    let userId;
    let resumeId;
    let token;

    beforeAll(async () => {
        if (process.env.NODE_ENV !== "test") {
            throw new Error("Tests should be run with test environment");
        }

        await connectMongoose();

        // Create test user
        await request(app)
            .post("/users")
            .send({ login: "test@email.com", password: "123456" });

        // Get token and userId
        const loginRes = await request(app)
            .post("/users/login")
            .send({ login: "test@email.com", password: "123456" });

        token = loginRes.body.token;
        userId  = loginRes.body.userId;
    });

    afterEach(async () => {
        if (resumeId) await Resume.deleteOne({ _id: resumeId });
        resumeId = null;
    })

    afterAll(async () => {
        // remove user
        await User.deleteMany();
        await Resume.deleteMany();
        await mongoose.connection.close();
    });

    it("POST /users/:userId/resumes — 401 if not token", async () => {
        await request(app)
            .post(`/users/${userId}/resumes`)
            .send(validResume)
            .expect(401);
    });

    it("POST /users/:userId/resumes — 400 when resume is not valid", async () => {
        await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send( { resume: "test"} )
            .expect(400);
    });

    it("POST /users/:userId/resumes — 400 if userId is not valid", async () => {
        const invalidUserId = "notAnObjectId";
        const res = await request(app)
            .post(`/users/${invalidUserId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("GET /users/:userId/resumes/:resumeId — 400 if resume id is not valid", async () => {
        const invalidResumeId = "notAnObjectId";
        const res = await request(app)
            .get(`/users/${userId}/resumes/${invalidResumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("GET /users/:userId/resumes — 400 if userId is not valid", async () => {
        const invalidUserId = "notAnObjectId";
        const res = await request(app)
            .get(`/users/${invalidUserId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("POST /users/:userId/resumes create new resume", async () => {
        const createResumeResponse = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(201);

        expect(createResumeResponse.body).toHaveProperty("_id");
        expect(createResumeResponse.body.userId).toBe(userId);
        resumeId = createResumeResponse.body._id;
    });

    it("GET /users/:userId/resumes — 401 if not token", async () => {
        await request(app)
            .get(`/users/${userId}/resumes`)
            .expect(401);
    });

    it("GET /users/:userId/resumes returns all resumes", async () => {
        // check empty collection
        await request(app)
            .get(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404); // because not created yet

        // Generate new resume
        const createResumeResponse = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume);

        resumeId = createResumeResponse.body._id;

        // Check OK result
        const response = await request(app)
            .get(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].userId).toBe(userId);
        expect(response.body.length).toBe(1);
    });

    it("GET /users/:userId/resumes/:resumeId return specified resume", async () => {
        const createResumeResponse = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume);
        resumeId = createResumeResponse.body._id;

        const getResumeResponse = await request(app)
            .get(`/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(getResumeResponse.body._id).toBe(resumeId);
        expect(getResumeResponse.body.userId).toBe(userId);
    });

    it("DELETE /users/:userId/resumes/:resumeId delete specified resume", async () => {
        const post = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume);
        resumeId = post.body._id;

        await request(app)
            .delete(`/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        await request(app)
            .get(`/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("GET /users/:userId/resumes/:resumeId — 403 if try to get resume owned by other user", async () => {
        // primary user create his own resume
        const createResumeResponse = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume);
        resumeId = createResumeResponse.body._id;

        // create user2
        const user2CreateResponse = await request(app)
            .post("/users")
            .send({ login: "test2@email.com", password: "123456" });

        const user2token = user2CreateResponse.body.token
        const user2id = user2CreateResponse.body.userId

        // User2 try to get resume owned by User1
        await request(app)
            .get(`/users/${user2id}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${user2token}`)
            .expect(404); // 404 Not Found

        // User1 still can see his own resume
        await request(app)
            .get(`/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200); // still exists

    });

    it("POST /users/:userId/resumes with isMainResume:true — create or update only main user's resume", async () => {
        // 1. Check that user doesn't have any primary resume
        await request(app)
            .get(`/users/${userId}/resumes/main`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);

        // 2. Create main resume
        await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, isMainResume: true })
            .expect(201);

        // 3. Check that user has the primary resume
        const firstMain = await request(app)
            .get(`/users/${userId}/resumes/main`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(firstMain.body).toHaveProperty("isMainResume", true);

        // 4. Create new main resume
        const updatedMain = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, name: "New Main Resume", isMainResume: true })
            .expect(201);

        // 5. Check that user has 2 resumes but only one is primary
        const allResumes = await request(app)
            .get(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`);

        expect(allResumes.body.length).toBe(2)
        const mains = allResumes.body.filter(r => r.isMainResume === true);
        expect(mains.length).toBe(1);
        expect(mains[0].name).toBe("New Main Resume");
    });

    it("PUT /users/:userId/resumes/:resumeId — successful update user's resume", async () => {
        // Create new one
        const createResp = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(201);

        const resumeId = createResp.body._id;

        // Update partially
        const updatedData = {
            ...validResume,
            name: "Updated Name",
            headline: "Updated Headline"
        };

        const updateResp = await request(app)
            .put(`/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedData)
            .expect(200);

        console.info(updateResp.body);

        expect(updateResp.body._id).toBe(resumeId);
        expect(updateResp.body.name).toBe("Updated Name");
        expect(updateResp.body.headline).toBe("Updated Headline");
    });

    it("PUT /users/:userId/resumes/:resumeId — 400 if resumeId is invalid", async () => {
        const invalidResumeId = "notAnObjectId";
        const updateResp = await request(app)
            .put(`/users/${userId}/resumes/${invalidResumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(400);

        expect(updateResp.body).toHaveProperty("error");
    });

    it("PUT /users/:userId/resumes/:resumeId — 404 if resume not found", async () => {
        const notExistId = new mongoose.Types.ObjectId().toString();
        const updateResp = await request(app)
            .put(`/users/${userId}/resumes/${notExistId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(404);

        expect(updateResp.body).toHaveProperty("message", "Resume not found");
    });

    it("PUT /users/:userId/resumes/:resumeId — 403/404 если чужое резюме", async () => {
        // Create the second user
        await request(app)
            .post("/users")
            .send({ login: "test2@email.com", password: "123456" });

        const loginResponse =
            await request(app)
                .post("/users/login")
                .send({ login: "test2@email.com", password: "123456" });

        const user2token = loginResponse.body.token;
        const user2id = loginResponse.body.userId;

        // Create the first user's resume
        const createResp = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(201);

        const resumeId = createResp.body._id;

        // User2 try to update the resume of the first user
        const updateResp = await request(app)
            .put(`/users/${user2id}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${user2token}`)
            .send({ ...validResume, name: "Hacker Name" })
            .expect(404);
    });

    it("PUT /users/:userId/resumes/:resumeId — если резюме становится главным, прошлое главное теряет флаг isMainResume", async () => {
        // 1. Create the primary resume
        const mainResp = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, name: "Main Resume", isMainResume: true })
            .expect(201);
        const mainResumeId = mainResp.body._id;

        // 2. Create the second (regular) resume
        const secondaryResp = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, name: "Secondary Resume", isMainResume: false })
            .expect(201);
        const secondaryResumeId = secondaryResp.body._id;

        // 3. Update the second resume, set is as primary
        await request(app)
            .put(`/users/${userId}/resumes/${secondaryResumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ isMainResume: true })
            .expect(200);

        // 4. Check, that the second resume only has isMainResume === true
        const allResumesResp = await request(app)
            .get(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const mains = allResumesResp.body.filter(r => r.isMainResume === true);
        expect(mains.length).toBe(1);
        expect(mains[0]._id).toBe(secondaryResumeId);

        // 5. Check the first resume has isMainResume теперь false
        const oldMain = allResumesResp.body.find(r => r._id === mainResumeId);
        expect(oldMain.isMainResume).toBe(false);
    });

    it("POST /users/:userId/resumes/uploadPdf — успешно загружает PDF файл", async () => {
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
    });
});