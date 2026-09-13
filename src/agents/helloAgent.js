import { getAIClient, getAIModel } from "../config/openai.js";

const AGENT_INSTRUCTIONS =
  "You are a simple Hello World AI agent created for an API integration demonstration. Respond clearly, briefly, and helpfully.";

export async function helloAgent(message) {
  const client = getAIClient();

  const response = await client.chat.completions.create({
    model: getAIModel(),
    messages: [
      { role: "system", content: AGENT_INSTRUCTIONS },
      { role: "user", content: message },
    ],
    max_tokens: 512,
    temperature: 0.2,
  });

  const responseText = response.choices[0]?.message?.content?.trim();

  if (!responseText) {
    throw new Error("AI provider returned no text response");
  }

  return responseText;
}
