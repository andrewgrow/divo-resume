// /src/controllers/jobsController.js

import { v4 as UUIDv4 } from "uuid";
import { db, getFirstResumeByUser } from "../data/fakeDb.js";
import { makeScreenshotAsPdf } from "../tools/puppeteer.js";
import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";
import { filePath } from "../utils/wrappers/filePath.js";
import {analyzeInputAI, askOpenAI} from "../tools/openAi.js";
import { clearAiAnswer } from "../utils/clearing/clearAiAnswer.js";

// [
//     {
//         "jobId": "random_uuid_as_local_job_id",
//         "userId": "random_uuid_as_user_local_id",
//         "url": "https://example.com/vacancies/some_job_id"
//     }
// ]
export function getAll(req, res) {
    const userId = req.params.userId;
    const jobs = Object.values(db.jobs).filter(j => j.userId === userId);
    if (jobs.length === 0) {
        return res.status(400).json({ error: "No jobs found" });
    } else {
        res.json(jobs);
    }
}

// {
//     "jobId": "random_uuid_as_local_job_id",
//     "userId": "random_uuid_as_user_local_id",
//     "url": "https://example.com/vacancies/some_job_id",
//     "screenshot": "/cache/job_screenshot_as_file.pdf",
//     "recognized": {
//         "statusCode": 200,
//         "status": "OK",
//         "statusDetails": "Job posting detected and parsed successfully.",
//         "jobTitle": "Senior Backend Product Software Engineer",
//          ... etc ...
//       }
// }
export async function createOne(req, res) {
    const userId = req.params.userId;
    const jobData = req.body;
    const jobId = UUIDv4();
    const job = { jobId, userId, ...jobData };

    db.jobs[jobId] = job;
    res.status(201).json(job);
}

// return:
// {
//     "jobId": "random_uuid_as_local_job_id",
//     "userId": "random_uuid_as_user_local_id",
//     "url": "https://example.com/vacancies/some_job_id",
//     "screenshot": "/local_storage/cache/screenshot_with_random_name.pdf"
// }
export async function takeScreenshot(req, res) {
    const jobId = req.params.jobId;
    if (!jobId) {
        return res.status(400).json({ message: "Job id is absent" });
    }

    const job = db.jobs[jobId];

    if (!job) {
        return res.status(404).json({ message: `Job with id ${jobId} does not exist` });
    }

    job.screenshot = await makeScreenshotAsPdf(job.url) // e.g. "/Users/hrow/WebstormProjects/Divo-Resume/cache/dropbox-7d82b0c9-1110-4915-a9a8-be14e044fc09.pdf";

    db.jobs[jobId] = job;
    res.json(job);
}

// "recognized": {
//     "$schema": "http://json-schema.org/draft-07/schema#",
//         "title": "VacancyRecognizeResult",
//         "type": "object",
//         "statusCode": 200,
//         "status": "OK",
//         "statusDetails": "Job posting successfully recognized from the document.",
//         "jobTitle": "Senior Backend Product Software Engineer",
//         "jobDescription": "As a Product Engineer at Dropbox, you will play a pivotal role in shaping the future of collaboration and file sharing by developing and enhancing Dropbox Products to deliver exceptional user experiences, especially in the context of building AI-enabled products.",
//         "keywords": [
//         "Backend",
//         "Software Engineer",
//         "Product Engineer",
//         "AI",
//         "Dropbox",
//         "Web applications",
//         "Python",
//         "React",
//         "JavaScript",
//         "MySQL",
//         "Go",
//         "Java",
//         "Rust",
//         "Mentoring",
//         "Cloud"
//     ],
//         "company": "Dropbox",
//         "location": "Remote - Poland",
//         "employmentType": "not available",
//         "remotePolicy": "Remote",
//         "seniority": "Senior",
//         "responsibilities": [
//         "Autonomously deliver ongoing business impact across a team, product capability, or technical system.",
//         "Collaborate effectively with cross-functional teams, including product managers, designers, and other engineers.",
//         "Solve problems and make effective tradeoffs between technical requirements and business goals.",
//         "Mentor junior engineers and contribute to the overall growth and success of the team.",
//         "Adapt to a dynamic and fast-paced work environment focused on continuous learning and development.",
//         "Occasional on-call work to address bugs, outages, or other operational issues."
//     ],
//         "requirements": [
//         "8+ years of experience building applications professionally.",
//         "BS degree or higher in Computer Science or related field (e.g., physics or mathematics), or equivalent technical experience.",
//         "Proven track record delivering results from conceptualization to implementation.",
//         "Experience developing web applications and building robust, scalable systems."
//     ],
//         "nice_to_have": "Contributions to open source projects or technical communities; Full-Stack Development; Experience with JavaScript, HTML/CSS, React, Python, MySQL, Go, Java, Rust.",
//         "languages": [
//         "not available"
//     ],
//         "salary": "314,500 zł—425,500 zł PLN annual"
// }
export async function parseJob(req, res) {
    const token = req.headers["x-openai-token"] || process.env.OPENAI_API_KEY;
    if (!token) {
        res.status(400).json({ message: "AI token is absent" });
        return
    }

    const model = "gpt-4.1";

    const jobId = req.params.jobId;
    if (!jobId) {
        return res.status(400).json({ message: "Job id is absent" });
    }

    const job = db.jobs[jobId];

    if (!job) {
        return res.status(404).json({ message: `Job with id ${jobId} not found` });
    }

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
    const taskText = `Check the screenshot of a website represented by PDF document. Recognize text in the document. Create a response in English as a JSON by scheme: ${schemaRaw}`
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
        return res.status(400).json({ message: "AI token is absent" });
    }

    const jobId = req.params.jobId;
    if (!jobId) {
        return res.status(400).json({ message: "JobId token is absent" });
    }

    const job = db.jobs[jobId];
    if (!jobId) {
        return res.status(404).json({ message: `Job with id ${jobId} not found` });
    }

    const recognizedJob = job?.recognized;
    if (!recognizedJob || !recognizedJob.keywords) {
        return res.status(400).json({ message: `Job with id ${jobId} does not contain keywords` });
    }

    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ message: "User id is absent" });
    }

    const resume = getFirstResumeByUser(userId);
    if (!resume) {
        return res.status(400).json({ message: `Resume for User with id ${userId} not found` });
    }

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

    const response = await askOpenAI({ model, token, messages })
    let result = response.choices[0].message.content.trim();

    res.json(clearAiAnswer(result));
}