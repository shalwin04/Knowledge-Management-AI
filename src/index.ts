import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Example setup for Gemini with LangChain
async function main() {
  // Initialize the Gemini model
  // Note: You'll need to set your GOOGLE_API_KEY environment variable
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
  });

  try {
    // Create a simple conversation
    const messages = [
      new SystemMessage("You are a helpful AI assistant."),
      new HumanMessage("Hello! Can you tell me about LangChain?"),
    ];

    console.log("Sending message to Gemini...");
    const response = await model.invoke(messages);
    console.log("Response:", response.content);
  } catch (error) {
    console.error("Error:", error);
    console.log("Make sure to set your GOOGLE_API_KEY environment variable");
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
