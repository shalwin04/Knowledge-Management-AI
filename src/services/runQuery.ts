import { getCypherFromQuery } from "../agents/cypherAgent";
import { driver } from "../utils/neo4j";

export async function runQueryFromNLP(nlp: string) {
  const cypher = await getCypherFromQuery({ query: nlp });

  // Basic check
  if (!cypher || !/(MATCH|RETURN|CREATE|MERGE)/i.test(cypher)) {
    throw new Error("❌ Invalid or empty Cypher query generated.");
  }

  const session = driver.session();
  try {
    console.log("🚀 Executing Cypher Query:");
    console.log(cypher);
    const result = await session.run(cypher);
    const data = result.records.map((r) => r.toObject());
    console.log("✅ Query executed. Raw DB output:\n", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("🔥 Cypher execution failed:", err);
    throw err;
  } finally {
    await session.close();
  }
}
