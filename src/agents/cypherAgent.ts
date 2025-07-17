import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const schema = `
Node Types and Properties:
- Org: name, description
- System: name, description  
- Domain: name, description
- Client: name, description
- SubDomain: name, description
- Document: id, title, description, link, source, owner, createdAt, lastModified, mimeType, tags

Relationships:
(:Org)-[:HAS_SYSTEM]->(:System)
(:System)-[:HAS_DOMAIN]->(:Domain)
(:Domain)-[:HAS_CLIENT]->(:Client)
(:Domain)-[:HAS_SUBDOMAIN]->(:SubDomain)
(:SubDomain)-[:HAS_DOCUMENT]->(:Document)
(:Client)-[:HAS_DOCUMENT]->(:Document)
`;

const QA_TEMPLATE = `
IMPORTANT: Respond with ONLY the Cypher query. No explanations, no "Okay", no conversational text.

Schema:
{schema}

Question: {question}

For "projects under etfm", the correct query is:
MATCH (d:Domain {{name: "ETFM"}})-[:HAS_CLIENT]->(c:Client) RETURN c.name

Response (Cypher only):
`;

const prompt = new PromptTemplate({
  template: QA_TEMPLATE,
  inputVariables: ["question"],
  partialVariables: { schema },
});

const llm = new ChatOpenAI({
  modelName: "gpt-4-turbo",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

export async function getCypherFromQuery(input: { query: string }): Promise<string> {
  const { query } = input;

  console.log("🧠 Sending question to LLM:", query);

  const formattedPrompt = await prompt.format({ question: query });
  console.log("📝 Prompt sent:\n", formattedPrompt);

  const llmRes = await llm.invoke(formattedPrompt);
  let raw = '';
  if (typeof llmRes.content === 'string') {
    raw = llmRes.content.trim();
  } else if (Array.isArray(llmRes.content)) {
    raw = llmRes.content[0]?.toString() || '';
  } else {
    raw = '';
  }

  console.log("🧠 Raw LLM Response:\n", raw);

  // Clean ```cypher markdown
  let cypher = raw.replace(/```cypher/g, "").replace(/```/g, "").trim();

  const cypherLines = cypher.split("\n").filter((line: string) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("MATCH") ||
      trimmed.startsWith("RETURN") ||
      trimmed.startsWith("CREATE") ||
      trimmed.startsWith("MERGE") ||
      trimmed.startsWith("DELETE") ||
      trimmed.startsWith("SET") ||
      trimmed.startsWith("WITH") ||
      trimmed.startsWith("UNWIND") ||
      trimmed.startsWith("OPTIONAL") ||
      trimmed.startsWith("WHERE") ||
      trimmed.startsWith("ORDER") ||
      trimmed.startsWith("LIMIT") ||
      trimmed.startsWith("SKIP")
    );
  });

  if (cypherLines.length > 0) {
    cypher = cypherLines.join("\n").trim();
  }

  console.log("🔧 Final Cleaned Cypher query:\n", cypher);

  if (!cypher.toLowerCase().startsWith("match")) {
    throw new Error(`❌ Invalid or empty Cypher query generated:\n${cypher}`);
  }

  return cypher;
}
