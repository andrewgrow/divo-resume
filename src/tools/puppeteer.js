// /src/tools/puppeteer.js

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

export async function makeScreenshotAsPdf(url) {
    console.log(`job.url: ${url}`);
    console.log(`cacheDir: ${cacheDir}`);

    const uniqUUID = UUIDv4();

    const screenshotPath = path.join(cacheDir, `${uniqUUID}.pdf`);

    // puppeteer usage as normal
    const browser = await puppeteer.launch({ headless: true });
    try {
        console.log('Running puppeteer screenshot..')
        const page = await browser.newPage()
        await page.setViewport({width: 1280, height: 1920}); // Set screen size.
        await page.goto(url) // open the destination page
        await setTimeout(3100);
        await page.pdf({
            path: screenshotPath,
            fullPage: true,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            scale: 0.75
        });
        console.log(`All done, check the screenshot ${screenshotPath} ✨`)
    } catch (e) {
        console.log(e)
    } finally {
        await browser.close()
    }

    return screenshotPath;
}