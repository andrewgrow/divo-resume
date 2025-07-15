export function clearAiAnswer(responseText) {
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