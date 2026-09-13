import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { getAIConfiguration } from "./config/openai.js";
import chatRouter from "./routes/chat.js";

const app = express();
const port = process.env.PORT || 5000;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(currentDirectory, "..", "public");

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(publicDirectory));

app.get("/api", (_request, response) => {
  response.json({ message: "AI Agent API is running" });
});

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/status", (_request, response) => {
  response.json({
    status: "ok",
    ...getAIConfiguration(),
  });
});

app.use("/api/chat", chatRouter);

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({
      success: false,
      error: "Invalid JSON body",
    });
  }

  console.error("Unexpected server error", { name: error?.name || "UnknownError" });

  return response.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`AI Agent API is running on http://localhost:${port}`);
});
