import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runQueryFromNLP } from "./services/runQuery";
import { summarizeResults } from "./agents/summaryAgent";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:9002",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json());

// POST /query
app.post("/query", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'query' in request body" });
  }

  try {
    console.log("🔍 Received NLP query:", query);
    const rawResults = await runQueryFromNLP(query);
    const summary = await summarizeResults(rawResults, query);

    // ✅ Send only the summary to the frontend
    res.json({ summary });

  } catch (err: any) {
    console.error("❌ Error handling query:", err);
    res.status(500).json({
      error: "Failed to process query",
      message: err.message || "Unexpected error",
    });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
