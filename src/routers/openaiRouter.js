// /src/routers/openaiRouter.js

import express from "express";
import { askOpenAI } from "../api/openai.js";
import { db } from "../data/fakeDb.js";
import { readFile } from "fs/promises";
import { filePath } from "../utils/wrappers/filePath.js"; // path from this file (relative of import)

const router = express.Router();

router.post("/parseJob/:jobId", async (req, res) => {
    const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
    const model = "gpt-4.1";
    const jobId = req.params.jobId;
    const job = db.jobs[jobId];
    const schemaRaw = await readFile(
        filePath('../schemas/jobPage.schema.json'),
        'utf-8'
    );

    const messages = [
        {
            role: "system",
            content: `Do NOT invent or guess any data. It is important get only real data or refuse request. It is okay if you cannot retrieve any data, just describe it.`
        },
        {
            role: "user",
            content: `
You are a system for validating web pages containing job postings.
- Answer ONLY based on the actual data found on the provided web page.
- Always reply in English, regardless of the original page language.
- Output STRICTLY as a JSON object matching the attached schema.
- No explanations, only the JSON result.
- Do not use web search. 
- Choose appropriate status as it described in JSON schema.
- Do NOT invent or guess any data. It is okay if you cannot retrieve any data, just describe it.

If you cannot open this page directly or there are other issues make appropriate status as it described in JSON schema.

Return the validated JSON according to the schema:

JSON SCHEMA:
${schemaRaw}

Open this url directly for preparing answer: ${job.url} or just return appropriate result.`
        }
    ];

    console.log(messages);

    try {
        const response = await askOpenAI({model, messages, token})

        // Get string result
        let result = response.choices[0].message.content.trim();

        // Clear markdown ```json ... ```
        if (result.startsWith("```")) {
            result = result.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim();
        }

        // Always parse as JSON
        let resultObj;
        try {
            resultObj = JSON.parse(result);
        } catch (err) {
            // If not parsed just use as is
            resultObj = { raw_text: result };
        }

        res.json({ result: resultObj, raw: response });

    } catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
})

router.post("/", async (req, res) => {
    const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
    if (!token) {
        return res.status(401).json({ error: "Token is absent" });
    }

    const { model, instruction, question, resume, vacancy } = req.body;
    if (!model || !instruction || !question || !resume || !vacancy) {
        return res.status(400).json({ error: "Fields 'model', 'instruction', 'question', 'resume', 'vacancy' are required" });
    }

    // Create prompt
    const messages = [
        { role: "system", content: instruction },
        { role: "user", content:
                `Below are two separate JSON objects.

                Object #1 (resume) is the candidate's resume.
                Object #2 (vacancy) is the job description.

                ${question}

                Resume:
                ${JSON.stringify(resume, null, 2)}

                Vacancy:
                ${JSON.stringify(vacancy, null, 2)}
                `
        }
    ];

    try {
        const response = await askOpenAI({model, messages, token})

        // Get string result
        let result = response.choices[0].message.content.trim();

        // Clear markdown ```json ... ```
        if (result.startsWith("```")) {
            result = result.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim();
        }

        // Always parse as JSON
        let resultObj;
        try {
            resultObj = JSON.parse(result);
        } catch (err) {
            // If not parsed just use as is (rarely)
            resultObj = { raw_text: result };
        }

        res.json({ result: resultObj, raw: response });

    } catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
});

export default router;