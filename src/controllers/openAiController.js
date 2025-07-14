// /src/controllers/openAiController.js

import { db } from "../data/fakeDb.js";
import fs from "fs";
import { analyzeInputAI } from "../tools/openAi.js";
import { filePath } from "../utils/wrappers/filePath.js";
import { readFile } from "fs/promises";
import path from 'path';
import {makeScreenshotAsPdf} from "../tools/puppeteer.js";

export async function parseJob(req, res) {
    const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
    if (!token) {
        res.status(400).json({ message: "AI token is absent" });
        return
    }

    const model = "gpt-4.1";

    const jobId = req.params.jobId;
    const job = db.jobs[jobId];

    job.screenshot = await makeScreenshotAsPdf(job.url)

    const screenshotPath = job.screenshot // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";
    const fileName = path.basename(screenshotPath);

    // PDF
    const pdfAsBase64 = fs.readFileSync(screenshotPath, "base64");
    const schemaRaw = await readFile(
        filePath('../schemas/jobPage.schema.json'),
        'utf-8'
    );
    const taskText = `Проверь скриншот сайта. Распознай текст на странице. Верни ответ на английском в виде JSON по схеме ${schemaRaw}`
    const input = [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    filename: fileName,
                    file_data: `data:application/pdf;base64,${pdfAsBase64}`,
                },
                {
                    type: "input_text",
                    text: taskText,
                },
            ],
        },
    ]

    // PROCESSING RESULT
    try {
        const response = await analyzeInputAI({model, input, token})
        job.recognized = clearAiAnswer(response.output_text);
        db.jobs[jobId] = job;
        res.json(job);
    } catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
}

export async function adaptResume(req, res) {
    const model = "gpt-4.1";
    const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
    if (!token) {
        res.status(400).json({ message: "AI token is absent" });
        return
    }

    const jobId = req.params.jobId;
    if (!jobId) {
        res.status(400).json({ message: "JobId token is absent" });
        return
    }

    const job = db.jobs[jobId];
    if (!jobId) {
        res.status(404).json({ message: `Job with id ${jobId} not found` });
        return
    }

    const recognizedJob = job.recognized
    if (!recognizedJob || !recognizedJob.keywords) {
        res.status(400).json({ message: `Job with id ${jobId} does not contain keywords` });
    }
}

function clearAiAnswer(responseText) {
    // Clear markdown ```json ... ```
    if (responseText.startsWith("```")) {
        responseText = responseText.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1').trim();
    }

    // Always parse as JSON
    let result;
    try {
        result = JSON.parse(responseText);
    } catch (err) {
        // If not parsed just use as is
        result = { raw_openai_result: responseText };
    }
    return result
}