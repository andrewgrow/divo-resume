console.log('Happy developing ✨')

import express from "express";
import { OpenAI } from "openai";
import "dotenv/config";

const app = express();
const port = 3000;

// Middleware for JSON body
app.use(express.json());

// test GET index
app.get("/", (req, res) => {
    console.log(`received GET request for path ${req.path} `);
    res.json({
        request: "/ GET",
        query: req.query,
        headers: req.headers,
        path: req.path
    });
});

// test POST index
app.post("/", (req, res) => {
    console.log(`received POST request for path ${req.path} `);
    res.json({
        request: "/ POST",
        body: req.body,
        headers: req.headers,
        path: req.path
    });
});

// ask OpenAi
app.post("/openai", async (req, res) => {
    console.log({
        request: "/openai POST",
        headers: req.headers,
        body: req.body,
    })
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

    const openai = new OpenAI({ apiKey: token });

    try {
        const response = await openai.chat.completions.create({
            model,
            messages
        });

        // Get string result
        let result = response.choices[0].message.content.trim();

        // Clear markdown ```json ... ```
        if (result.startsWith("```")) {
            result = result.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim();
        }

        // Always parse as JSON
        let resultObj = result;
        try {
            resultObj = JSON.parse(result);
        } catch (err) {
            // If not parsed just use as is (rarely)
            resultObj = { raw_text: result };
        }

        res.json({ result: resultObj, raw: response });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }

});

app.listen(port, () => {
    if (process.env.OPENAI_API_KEY) {
        console.log(`Found OpenAI token: ${process.env.OPENAI_API_KEY}`);
    }
    console.log(`Echo server listening at http://localhost:${port}`);
});