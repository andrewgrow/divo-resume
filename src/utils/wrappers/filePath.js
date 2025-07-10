// /src/utils/wrappers/filePath.js

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get path for any file related of import function
 * @param relativePath e.g. '../schemas/jobPage.schema.json'
 * @returns {string} absolutely path e.g. '/Users/admin/WebstormProjects/Divo-Resume/src/utils/schemas/jobPage.schema.json'
 */
export function filePath(relativePath) {
    return join(__dirname, relativePath);
}