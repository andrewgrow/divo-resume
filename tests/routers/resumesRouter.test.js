// ./tests/routers/resumeRouter.test.js

import request from "supertest";
import express from "express";
import usersRouter from "../../routers/usersRouter.js";
import { db } from "../../data/fakeDb.js";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("Resumes API", () => {
    let userId = "user42";
    let resumeId;

    beforeEach(() => {
        // Clear in-memory database before each test
        db.resumes = {};
    });

    it("POST /users/:userId/resumes create new resume", async () => {
        const response = await request(app)
            .post(`/users/${userId}/resumes`)
            .send({ title: "QA Engineer" })
            .expect(201);

        expect(response.body).toHaveProperty("resumeId");
        expect(response.body.userId).toBe(userId);
        resumeId = response.body.resumeId;
    });

    it("GET /users/:userId/resumes returns all resumes", async () => {
        // Generate no resume before
        await request(app)
            .post(`/users/${userId}/resumes`)
            .send({ title: "Android Dev" });

        // Check OK result
        const response = await request(app)
            .get(`/users/${userId}/resumes`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].userId).toBe(userId);
    });

    it("GET /users/:userId/resumes/:resumeId return specified resume", async () => {
        const post = await request(app)
            .post(`/users/${userId}/resumes`)
            .send({ title: "PM" });
        resumeId = post.body.resumeId;

        const response = await request(app)
            .get(`/users/${userId}/resumes/${resumeId}`)
            .expect(200);

        expect(response.body.resumeId).toBe(resumeId);
        expect(response.body.userId).toBe(userId);
    });

    it("DELETE /users/:userId/resumes/:resumeId delete specified resume", async () => {
        const post = await request(app).post(`/users/${userId}/resumes`).send({ title: "DeleteMe" });
        resumeId = post.body.resumeId;

        await request(app)
            .delete(`/users/${userId}/resumes/${resumeId}`)
            .expect(200);

        await request(app)
            .get(`/users/${userId}/resumes/${resumeId}`)
            .expect(404);
    });

});