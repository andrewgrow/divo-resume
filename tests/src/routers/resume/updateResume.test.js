// /tests/src/routers/resume/updateResume.test.js

import {
    app,
    closeDb,
    createResumeRecord,
    createUserAndLogin,
    globalSetup,
} from "./abcSetup.js";
import request from "supertest";
import {validResume} from "../../materials/validResume.js";
import mongoose from "mongoose";
import User from "../../../../src/database/models/user.js";
import Resume from "../../../../src/database/models/resume.js";

describe("Update Resume", () => {
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

    it("PUT /users/:userId/resumes/:resumeId — successful update user's resume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;
        const resumeId = resume._id;

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
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const invalidResumeId = "notAnObjectId";
        const updateResp = await request(app)
            .put(`/users/${userId}/resumes/${invalidResumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(400);

        expect(updateResp.body).toHaveProperty("error");
    });

    it("PUT /users/:userId/resumes/:resumeId — 404 if resume not found", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const notExistId = new mongoose.Types.ObjectId().toString();
        const updateResp = await request(app)
            .put(`/users/${userId}/resumes/${notExistId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(validResume)
            .expect(404);

        expect(updateResp.body).toHaveProperty("message", "Resume not found");
    });

    it("PUT /users/:userId/resumes/:resumeId — 404 when user2 is not an owner", async () => {
        // create the first user
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        // Create the second user
        const user2 = await createUserAndLogin();
        const user2token = user2.token;
        const user2id = user2.userId;

        // Create the first user's resume
        resume = await createResumeRecord(userId, token);
        const resumeId = resume._id;

        // User2 try to update the resume of the first user
        await request(app)
            .put(`/users/${user2id}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${user2token}`)
            .send({ ...validResume, name: "Hacker Name" })
            .expect(404);

        await User.deleteOne({ _id: user2id }); // clear
        await Resume.deleteOne({ _id: resumeId }); // clear
    });

    it("PUT /users/:userId/resumes/:resumeId — old resume lost isMainResume flag when new resume set isMainResume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

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

        // clear and check
        await Resume.deleteMany({ userId: userId });
    });

});