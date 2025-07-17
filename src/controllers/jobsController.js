// /src/controllers/jobsController.js

import { v4 as UUIDv4 } from "uuid";
import { makeScreenshotAsPdf } from "../tools/puppeteer.js";
import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";
import { filePath } from "../utils/wrappers/filePath.js";
import { responsesAPI } from "../tools/openAi.js";
import { clearAiAnswer } from "../utils/clearing/clearAiAnswer.js";
import {allJobsByUser, createJob, updateJob} from "../database/services/jobsService.js";

export async function getAllJobs(req, res) {
    const jobs = await allJobsByUser(req.params.userId);

    if (!jobs || !jobs.length || jobs.length === 0) {
        return res.status(404).json({ error: "No jobs found" });
    } else {
        res.json(jobs);
    }
}

export async function createOne(req, res) {
    const userId = req.params.userId;
    const jobData = req.body;
    const job = { userId, ...jobData };
    const createdJob = await createJob(job)
    res.status(201).json(createdJob);
}

export async function takeScreenshot(req, res) {
    const job = req.foundJob;
    job.screenshot = await makeScreenshotAsPdf(job.url) // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";
    const updatedJob = await updateJob(job)
    res.json(updatedJob);
}

export async function parseJob(req, res) {
    const job = req.foundJob;
    const jobId = job._id;
    const screenshotPath = job.screenshot // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";
    if (!screenshotPath) {
        return res.status(400).json({ message: `Screenshot for the Job ${jobId} does not exist` });
    }

    const fileName = path.basename(screenshotPath);

    // PDF
    const pdfAsBase64 = fs.readFileSync(screenshotPath, "base64");

    // Schema for the Response
    const schemaRaw = await readFile(
        filePath('../schemas/parseJob.schema.json'),
        'utf-8'
    );
    const jsonSchema = JSON.parse(schemaRaw);
    const schemaName = jsonSchema.title;

    // Task
    const taskText = `Check the screenshot of a website represented by PDF document. 
    Recognize text in the document. Create a response in English.`

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

    // AI credentials
    const token = req.foundAiToken;
    const model = "gpt-4.1";

    try {
        const response = await responsesAPI(
            { model, input, token, jsonSchema, schemaName }
        )
        console.log(`[${req.requestId}] Response from OpenAi:\n${JSON.stringify(response)}`)
        job.recognized = clearAiAnswer(response.output_text);
        const updatedJob = await updateJob(job)
        res.json(updatedJob);
    } catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
}

/** Check if the Resume matches with the Job */
export async function match(req, res) {
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
                `
    const input = [
        {
            role: "user",
            content: taskText
        },
        {
            role: "user",
            content: `Resume:\n${JSON.stringify(resume, null, 2)}`
        },
        {
            role: "user",
            content: `Vacancy:\n${JSON.stringify(recognizedJob, null, 2)}`
        },
    ]

    // Schema for the Response
    const rawSchema = await readFile(
        filePath('../schemas/matchResume.schema.json'),
        'utf-8'
    );
    const jsonSchema = JSON.parse(rawSchema);
    const schemaName = jsonSchema.title;

    // AI credentials
    const token = req.foundAiToken;
    const model = "gpt-4.1";

    try {
        const response = await responsesAPI(
            {model, input, token, jsonSchema, schemaName}
        )
        console.log(`[${req.requestId}] Response from OpenAi:\n${JSON.stringify(response)}`)
        const result = clearAiAnswer(response.output_text)

        result.openai_response_id = response.id // add to the Result Object the OpenAi Request ID

        res.json(result);
    }  catch (e) {
        console.error(`[${req.requestId}] [OpenAI Error]:`, e);
        res.status(500).json({ error: String(e) });
    }
}