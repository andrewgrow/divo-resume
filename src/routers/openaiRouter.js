// /src/routers/openaiRouter.js

import express from "express";
import { askOpenAI } from "../tools/openAi.js";
import { parseJob, adaptResume } from "../controllers/openAiController.js";

const router = express.Router({ mergeParams: true });

router.post("/parseJob/:jobId", parseJob);

router.post("/adaptResume/:jobId", adaptResume)

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