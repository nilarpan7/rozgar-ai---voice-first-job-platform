import { Router } from "express";
import {
  parseVoiceController,
  generateJobDescriptionController,
  chatController,
} from "../controllers/ai.controllers.js";

export const aiRouter = Router();

aiRouter.post("/parse-voice", parseVoiceController);
aiRouter.post("/generate-job-description", generateJobDescriptionController);
aiRouter.post("/chat", chatController);