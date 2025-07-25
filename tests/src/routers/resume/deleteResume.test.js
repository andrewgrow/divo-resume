// /tests/src/routers/resume/deleteResume.test.js

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

describe("Delete Resume", () => {
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

    it("DELETE /api/users/:userId/resumes/:resumeId delete specified resume", async () => {
        const userId = loggedUser.userId;
        const token = loggedUser.token;

        const resumeId = resume._id;

        await request(app)
            .delete(`/api/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        await request(app)
            .get(`/api/users/${userId}/resumes/${resumeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });
});