// /src/tools/puppeteer.js

// import puppeteer from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import { filePath } from "../utils/wrappers/filePath.js";
import { v4 as UUIDv4 } from 'uuid';
import { setTimeout } from "node:timers/promises";

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
puppeteer.use(StealthPlugin());

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

    // puppeteer usage as normal
    await puppeteer.launch({ headless: true }).then(async browser => {
        console.log('Running puppeteer..')
        const page = await browser.newPage()
        await page.goto('https://webhook.site/1e904a6a-d7c1-4bf8-b8d2-808892ac1758')
        // await page.goto(url)
        await setTimeout(3100);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        await browser.close()
        console.log(`All done, check the screenshot. ✨`)
    })

    return screenshotPath;
}