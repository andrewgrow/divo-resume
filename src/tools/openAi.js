// /src/clearing/openAi.js

import { OpenAI } from "openai";

/**
 * Examples:
 * 1) Analyze image or text input using an OpenAI model (e.g., gpt-4.1).
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
 * 2) Asking questions:
 * ```
 * const input = [
 *   {
 *     role: "user",
 *     content: [
 *       { type: "input_text", text: "Write a one-sentence bedtime story about a unicorn." },
 *     ],
 *   },
 * ];
 * ```
 *
 * @param {Object} params
 * @param {string} params.model - OpenAI model ID, e.g. "gpt-4.1"
 * @param {Array} params.input - Array of user message objects with text/image
 * @param {string} params.token - OpenAI API key
 * @param {Object} params.jsonSchema - Schema for response that openAi will be use
 * @param {string} params.schemaName - Unique name of the Schema for response
 * @returns {Promise<any>} Model response
 */
export async function responsesAPI({ model, input, token = "", jsonSchema, schemaName, previousResponseId }) {
    console.log(`openAi token for request: ${token}`);
    const openai = new OpenAI({ apiKey: token });

    // base question object
    const requestPayload = {
        model: model,
        input: input,
        text: {
            format: {
                type: "json_schema",
                name: schemaName,
                schema: jsonSchema,
            }
        }
    };

    // add previousResponseId if exists
    if (previousResponseId) {
        requestPayload.previous_response_id = previousResponseId;
    }

    return openai.responses.create(requestPayload);
}