// /src/tools/openAi.js

import { OpenAI } from "openai";

/**
 * Send a chat message to an OpenAI model and get the response.
 *
 * Example:
 * ```js
 * const model = "gpt-4.1";
 * const messages = [{ role: "user", content: "Tell me a joke." }];
 * const token = process.env.OPENAI_API_KEY;
 * ```
 *
 * @param {Object} params
 * @param {string} params.model - OpenAI model ID (e.g. "gpt-4o")
 * @param {Array} params.messages - Array of chat message objects (role, content)
 * @param {string} params.token - OpenAI API key
 * @returns {Promise<any>} Model response
 */
export async function askOpenAI({ model, messages, token }) {
    const openai = new OpenAI({ apiKey: token });
    return openai.chat.completions.create({
        model,
        messages
    });
}

/**
 * Analyze image or text input using an OpenAI model (e.g., gpt-4.1).
 *
 * ```js
 * const fs = require('fs');
 * const base64Image = fs.readFileSync(screenshotPath, 'base64');
 * const input = [
 *   {
 *     role: "user",
 *     content: [
 *       { type: "input_text", text: "Recognize text on the page" },
 *       { type: "input_image", image_url: `data:image/jpeg;base64,${base64Image}` }
 *     ],
 *   },
 * ];
 * ```
 *
 * @param {Object} params
 * @param {string} params.model - OpenAI model ID, e.g. "gpt-4.1"
 * @param {Array} params.input - Array of user message objects with text/image
 * @param {string} params.token - OpenAI API key
 * @returns {Promise<any>} Model response
 */
export async function analyzeInputAI({ model, input, token }) {
    const openai = new OpenAI({ apiKey: token });
    return openai.responses.create({
        model: model,
        input: input,
    });
}