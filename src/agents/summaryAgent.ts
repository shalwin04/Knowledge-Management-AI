import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.3,
});

export async function summarizeResults(records: any[], query: string) {
  const raw = JSON.stringify(records, null, 2);

  const prompt = `
You're a helpful assistant. A user asked: "${query}"
Here are raw DB results:

${raw}

Summarize the result in plain English for display in a UI:
  `;

  const res = await llm.invoke(prompt);
  return res.content;
}
