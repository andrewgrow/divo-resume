// /tests/src/routers/resume/createResume.test.js

import {
    app,
    closeDb,
    createResumeRecord,
    createUserAndLogin,
    globalSetup
} from "./abcSetup.js";
import request from "supertest";
import {validResume} from "../../materials/validResume.js";
import Resume from "../../../../src/database/models/resume.js";
import User from "../../../../src/database/models/user.js";

describe("Create New Resume", () => {
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

    it("POST /users/:userId/resumes — 401 if not token", async () => {
        const userId = loggedUser.userId;

        await request(app)
            .post(`/users/${userId}/resumes`)
            .send(validResume)
            .expect(401);
    });

    it("POST /users/:userId/resumes — 400 when resume is not valid", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send( { resume: "test"} )
            .expect(400);
    });

    it("POST /users/:userId/resumes — 400 if userId is not valid", async () => {
        const token = loggedUser.token;

        const invalidUserId = "notAnObjectId";
        const res = await request(app)
            .post(`/users/${invalidUserId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(400);

        expect(res.body).toHaveProperty("error");
    });

    it("POST /users/:userId/resumes create new resume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const createResumeResponse = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(201);

        expect(createResumeResponse.body).toHaveProperty("_id");
        expect(createResumeResponse.body.userId).toBe(userId);

        await Resume.deleteOne({ _id: createResumeResponse.body._id }); // clear
    });

    it("POST /users/:userId/resumes with isMainResume:true — create or update only main user's resume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        await Resume.deleteMany({userId: userId });

        // 1. Check that user doesn't have any primary resume
        await request(app)
            .get(`/users/${userId}/resumes/main`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);

        // 2. Create main resume
        const firstResume = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, isMainResume: true })
            .expect(201);
        const firstResumeId = firstResume.body._id;

        // 3. Check that user has the primary resume
        const firstMain = await request(app)
            .get(`/users/${userId}/resumes/main`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(firstMain.body).toHaveProperty("isMainResume", true);
        expect(firstMain.body._id).toBe(firstResumeId);

        // 4. Create new main resume (second)
        const secondResume = await request(app)
            .post(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`)
            .send({ ...validResume, userName: { value: "New Main Resume" }, isMainResume: true })
            .expect(201);
        const secondResumeId = secondResume.body._id;
        expect(secondResume.body.isMainResume).toBe(true);

        // 5. Check that user has 2 resumes but only one is primary
        const allResumes = await request(app)
            .get(`/users/${userId}/resumes`)
            .set("Authorization", `Bearer ${token}`);

        expect(allResumes.body.length).toBe(2)
        const mains = allResumes.body.filter(r => r.isMainResume === true);
        expect(mains.length).toBe(1);
        expect(mains[0].userName.value).toBe("New Main Resume");
        expect(mains[0].userName.value).toBe(secondResume.body.userName.value);

        // clear
        await Resume.deleteMany({_id: {$in: [firstResumeId, secondResumeId] }});
    });
});