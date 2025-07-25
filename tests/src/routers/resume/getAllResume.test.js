// /tests/src/routers/resume/getAllResume.test.js

import {
    app,
    closeDb,
    createResumeRecord,
    createUserAndLogin,
    globalSetup,
} from "./abcSetup.js";
import request from "supertest";
import User from "../../../../src/database/models/user.js";
import Resume from "../../../../src/database/models/resume.js";

describe("Get All Resume", () => {
    let loggedUser;
    let resume;

    beforeAll(async () => {
        await globalSetup();
        loggedUser = await createUserAndLogin();
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

    it("GET /api/users/:userId/resumes — 400 if userId is not valid", async () => {
        const token = loggedUser.token;

        const invalidUserId = "notAnObjectId";
        const res = await request(app)
            .get(`/api/users/${invalidUserId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("GET /api/users/:userId/resumes — 401 if not token", async () => {
        const userId = loggedUser.userId;

        await request(app)
            .get(`/api/users/${userId}/resumes`)
            .expect(401);
    });

    it("GET /api/users/:userId/resumes returns all resumes", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // check empty collection
        await request(app)
            .get(`/api/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404); // because not created yet

        resume = await createResumeRecord(userId, token);

        // Check OK result
        const response = await request(app)
            .get(`/api/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].userId).toBe(userId);
        expect(response.body.length).toBe(1);
    });
});