import "dotenv/config";
import OpenAI from "openai";

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";

export class MissingAIKeyError extends Error {
  constructor() {
    super("NVIDIA_API_KEY is not configured");
    this.name = "MissingAIKeyError";
  }
}

let aiClient;

export function getAIClient() {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();

  if (!apiKey) {
    throw new MissingAIKeyError();
  }

  if (!aiClient) {
    aiClient = new OpenAI({
      apiKey,
      baseURL: process.env.NVIDIA_BASE_URL?.trim() || DEFAULT_BASE_URL,
    });
  }

  return aiClient;
}

export function getAIModel() {
  return process.env.NVIDIA_MODEL?.trim() || DEFAULT_MODEL;
}

export function getAIConfiguration() {
  return {
    provider: "NVIDIA NIM",
    model: getAIModel(),
    configured: Boolean(process.env.NVIDIA_API_KEY?.trim()),
  };
}
