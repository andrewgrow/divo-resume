// /src/controllers/jobsController.js

import { v4 as UUIDv4 } from "uuid";
import { db, getAllResumeByUser } from "../data/fakeDb.js";
import { makeScreenshotAsPdf } from "../tools/puppeteer.js";
import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";
import { filePath } from "../utils/wrappers/filePath.js";
import {analyzeInputAI, askOpenAI} from "../tools/openAi.js";
import { clearAiAnswer } from "../utils/clearing/clearAiAnswer.js";

export function getAll(req, res) {
    const jobs = getAllResumeByUser(req.params.userId);

    if (jobs.length === 0) {
        return res.status(400).json({ error: "No jobs found" });
    } else {
        res.json(jobs);
    }
}

export async function createOne(req, res) {
    const userId = req.params.userId;
    const jobData = req.body;
    const jobId = UUIDv4();
    const job = { jobId, userId, ...jobData };

    db.jobs[jobId] = job;
    res.status(201).json(job);
}

export async function takeScreenshot(req, res) {
    const job = req.foundJob;
    const jobId = job.jobId;
    job.screenshot = await makeScreenshotAsPdf(job.url) // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";
    db.jobs[jobId] = job;
    res.json(job);
}

export async function parseJob(req, res) {
    const job = req.foundJob;
    const jobId = job.jobId;
    const screenshotPath = job.screenshot // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";
    if (!screenshotPath) {
        return res.status(400).json({ message: `Screenshot for the Job ${jobId} does not exist` });
    }

    const fileName = path.basename(screenshotPath);

    // PDF
    const pdfAsBase64 = fs.readFileSync(screenshotPath, "base64");
    const schemaRaw = await readFile(
        filePath('../schemas/jobPage.schema.json'),
        'utf-8'
    );
    const taskText = `Check the screenshot of a website represented by PDF document. 
    Recognize text in the document. 
    Create a response in English as a JSON by scheme: ${schemaRaw}`
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

    // PROCESSING
    const token = req.foundAiToken;
    const model = "gpt-4.1";
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
    const job = req.foundJob;
    const recognizedJob = job?.recognized;
    if (!recognizedJob || !recognizedJob.keywords) {
        return res.status(400).json({
            message: `Job with id ${job.jobId} does not contain keywords or recognized block`
        });
    }
    const resume = req.foundResume;

    const taskText = `Below are two separate JSON objects.

                Object #1 (resume) is the candidate's resume.
                Object #2 (vacancy) is the job description.
                
                Describe why this resume matches for this job, which keywords and experience can be used for this job and other details.
                Otherwise describe why this resume cannot be used for this job and should be changed.
                
                Return Your answer strickly as an JSON object.

                Resume:
                ${JSON.stringify(resume, null, 2)}

                Vacancy:
                ${JSON.stringify(recognizedJob, null, 2)}`

    const messages = [
        { role: "user", content: taskText }
    ]

    const token = req.foundAiToken;
    const model = "gpt-4.1";
    const response = await askOpenAI({ model, token, messages })
    let result = response.choices[0].message.content.trim();

    res.json(clearAiAnswer(result));
}