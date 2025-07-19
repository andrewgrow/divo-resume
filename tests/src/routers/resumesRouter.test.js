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
        await User.deleteOne({ _id: userId })
        await User.deleteMany({ login: "test@email.com" });
        await User.deleteMany({ login: "test2@email.com"  })
        await Resume.deleteMany({ name: /Test User$/ });
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
});