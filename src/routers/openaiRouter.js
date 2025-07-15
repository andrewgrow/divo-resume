// /src/routers/openaiRouter.js

import express from "express";
import {processQuestion} from "../controllers/openAiController.js";

const router = express.Router({ mergeParams: true });

router.post("/", processQuestion)

export default router;