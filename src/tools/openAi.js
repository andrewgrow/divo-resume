// /src/tools/openAi.js

import { OpenAI } from "openai";

export async function askOpenAI({ model, messages, token }) {
    const openai = new OpenAI({ apiKey: token });
    return openai.chat.completions.create({
        model,
        messages
    });
}