// /src/tools/puppeteer.js

import puppeteer from 'puppeteer';
import path, {dirname} from 'path';
import fs from 'fs';
import { filePath } from "../utils/wrappers/filePath.js";
import { v4 as UUIDv4 } from 'uuid';

// prepare cacheDir
const cacheDir = filePath("../../../cache")
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}

export async function makeWebsiteScreenshot(url) {
    console.log(`job.url: ${url}`);
    console.log(`cacheDir: ${cacheDir}`);

    const uniqUUID = await UUIDv4();

    const screenshotPath = path.join(cacheDir, `${uniqUUID}.png`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // await page.goto(url, {
    await page.goto("https://webhook.site/1e904a6a-d7c1-4bf8-b8d2-808892ac1758", {
        waitUntil: 'networkidle2',
    });
    await page.screenshot({
        path: screenshotPath,
    });
    await browser.close();
    return screenshotPath;
}