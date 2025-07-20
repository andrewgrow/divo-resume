// /tests/src/routers/resume/abcSetup.js

import request from "supertest";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {connectMongoose} from "../../../../src/database/connection/db.js";
import usersRouter from "../../../../src/routers/usersRouter.js";
import {validResume} from "../../materials/validResume.js";
import * as UUID from "uuid";

dotenv.config({ path: ".env.test" });

export const app = express();
app.use(express.json());
app.use("/users", usersRouter);

export async function globalSetup() {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Tests should be run with test environment");
    }
    await connectMongoose();
}

export async function createUserAndLogin(email = `email${UUID.v4()}@example.com`) {
    // Create test user
    await request(app)
        .post("/users")
        .send({ login: email, password: "123456" });

    // Get token and userId
    const loginRes = await request(app)
        .post("/users/login")
        .send({ login: email, password: "123456" });

    return { token: loginRes.body.token, userId: loginRes.body.userId };
}

export async function createResumeRecord(userId, token) {
    const res = await request(app)
        .post(`/users/${userId}/resumes`)
        .set("Authorization", `Bearer ${token}`)
        .send(validResume)
        .expect(201);

    return res.body;
}

export async function closeDb() {
    console.log("Close Mongoose!");
    await mongoose.connection.close();
}