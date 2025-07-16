import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { GraphCypherQAChain } from "@langchain/community/chains/graph_qa/cypher";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

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
  modelName: "gpt-4-turbo", // Or "gpt-4"
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

export async function getCypherFromQuery(input: { query: string }): Promise<string> {
  const { query } = input;

  const graph = await Neo4jGraph.initialize({
    url: process.env.NEO4J_URI!,
    username: process.env.NEO4J_USERNAME!,
    password: process.env.NEO4J_PASSWORD!,
  });

  const chain = await GraphCypherQAChain.fromLLM({
    llm,
    graph,
    cypherPrompt: prompt,
  });

  console.log("🧠 Sending question to LLM:", query);

  const formattedPrompt = await prompt.format({ question: query });
  console.log("📝 Formatted prompt being sent:", formattedPrompt);

  const res = await chain.invoke({
    question: query,
  });

  let cypher = (res.result || res.text || "").trim();
  console.log("📤 Raw Cypher output from LLM:\n", cypher);

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

  console.log("🔧 Cleaned Cypher query:\n", cypher);

  return cypher;
}
