// /tests/src/routers/resume/getResume.test.js

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

describe("Get Resume", () => {
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

    it("GET /api/users/:userId/resumes/:resumeId — 400 if resume id is not valid", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const invalidResumeId = "notAnObjectId";
        const res = await request(app)
            .get(`/api/users/${userId}/resumes/${invalidResumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("GET /api/users/:userId/resumes/:resumeId return specified resume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const resumeId = resume._id;

        const getResumeResponse = await request(app)
            .get(`/api/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(getResumeResponse.body._id).toBe(resumeId);
        expect(getResumeResponse.body.userId).toBe(userId);
    });

    it("GET /api/users/:userId/resumes/:resumeId — 403 if try to get resume owned by other user", async () => {
        // primary user create his own resume
        const userId = loggedUser.userId;
        const token = loggedUser.token;
        const resumeId = resume._id;

        // create user2
        const user2 = await createUserAndLogin()
        const user2token = user2.token //
        const user2id = user2.userId

        // User2 try to get resume owned by User1
        await request(app)
            .get(`/api/users/${user2id}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${user2token}`)
            .expect(404); // 404 Not Found

        // User1 still can see his own resume
        await request(app)
            .get(`/api/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200); // still exists

        await User.deleteOne({ _id: user2id });
    });
});