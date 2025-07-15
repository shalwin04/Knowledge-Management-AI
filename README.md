# KM-Agents-Demo

A TypeScript project demonstrating LangChain agents with Google Gemini and LangGraph.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Google API key:**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set the environment variable:
     ```bash
     # Windows (PowerShell)
     $env:GOOGLE_API_KEY="your-api-key-here"
     
     # Windows (Command Prompt)
     set GOOGLE_API_KEY=your-api-key-here
     
     # Linux/Mac
     export GOOGLE_API_KEY=your-api-key-here
     ```

## Usage

### Basic LangChain + Gemini Example
```bash
npm run dev
```

### Agent Example with LangGraph
```bash
npx ts-node src/agent-example.ts
```

### Build and Run
```bash
npm run build
npm start
```

## Project Structure

```
KM-Agents-Demo/
├── src/
│   ├── index.ts           # Basic LangChain + Gemini example
│   └── agent-example.ts   # Agent implementation using LangGraph
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- **langchain**: Main LangChain library
- **@langchain/core**: Core LangChain components
- **@langchain/community**: Community integrations
- **@langchain/google-genai**: Google Gemini integration
- **@langchain/langgraph**: Graph-based agent framework
- **typescript**: TypeScript compiler
- **ts-node**: TypeScript execution environment
- **@types/node**: Node.js type definitions

## Features

- ✅ TypeScript setup with proper configuration
- ✅ Google Gemini integration via LangChain
- ✅ LangGraph for building stateful agents
- ✅ Example implementations for basic chat and agent workflows
- ✅ Development and build scripts

## Next Steps

1. Set your `GOOGLE_API_KEY` environment variable
2. Run the examples to test the setup
3. Modify the agent examples to suit your needs
4. Add more sophisticated agent behaviors using LangGraph

## Notes

- Make sure you have a valid Google API key with Gemini access
- The examples are configured to use the `gemini-pro` model
- Error handling is included for missing API keys
