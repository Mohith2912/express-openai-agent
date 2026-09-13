import { Router } from "express";
import { helloAgent } from "../agents/helloAgent.js";
import { MissingAIKeyError } from "../config/openai.js";

const router = Router();

router.post("/", async (request, response) => {
  const { body } = request;

  if (!body || Array.isArray(body) || typeof body !== "object") {
    return response.status(400).json({
      success: false,
      error: "Invalid request body",
    });
  }

  if (!("message" in body) || body.message === null || body.message === undefined) {
    return response.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  if (typeof body.message !== "string") {
    return response.status(400).json({
      success: false,
      error: "Message must be a string",
    });
  }

  const message = body.message.trim();

  if (!message) {
    return response.status(400).json({
      success: false,
      error: "Message is required",
    });
  }

  try {
    const agentResponse = await helloAgent(message);

    return response.json({
      success: true,
      response: agentResponse,
    });
  } catch (error) {
    if (error instanceof MissingAIKeyError) {
      console.error("Chat request failed: NVIDIA API key is not configured");

      return response.status(503).json({
        success: false,
        error: "AI service is not configured",
      });
    }

    if (error?.status === 401 || error?.status === 403) {
      return response.status(502).json({
        success: false,
        error: "AI credentials were rejected",
      });
    }

    if (error?.status === 410) {
      return response.status(502).json({
        success: false,
        error: "The configured AI model is no longer available",
      });
    }

    if (error?.status === 429) {
      return response.status(503).json({
        success: false,
        error: "AI service usage limit reached",
      });
    }

    console.error("Chat request failed", {
      name: error?.name || "UnknownError",
      status: error?.status,
      code: error?.code,
      requestId: error?.request_id,
    });

    return response.status(502).json({
      success: false,
      error: "Failed to process request",
    });
  }
});

export default router;
