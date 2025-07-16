import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { driver } from "./neo4j";
import dotenv from "dotenv";

dotenv.config();

const embedder = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  taskType: "retrieval_document" as any,
});

async function embedExistingDocs() {
  const session = driver.session();

  try {
    console.log("🔍 Fetching all documents...");

    const result = await session.run(`
      MATCH (d:Document)
      RETURN d
    `);

    const docs = result.records.map((record) => {
      const node = record.get("d");
      return {
        id: node.properties.id,
        title: node.properties.title,
        description: node.properties.description,
        hasEmbedding: !!node.properties.embedding,
      };
    });

    console.log(`📄 Total documents found: ${docs.length}`);

    for (const doc of docs) {
      if (doc.hasEmbedding) {
        console.log(`⏭️ Already embedded: ${doc.id} (${doc.title})`);
        continue;
      }

      try {
        console.log(`🔄 Embedding: ${doc.id} (${doc.title})`);
        const [embedding] = await embedder.embedDocuments([doc.description]);

        await session.run(
          `
          MATCH (d:Document {id: $id})
          SET d.embedding = $embedding
        `,
          { id: doc.id, embedding }
        );

        console.log(`✅ Embedded and updated: ${doc.id}`);
      } catch (err) {
        console.error(`❌ Failed to embed ${doc.id}:`, err);
      }
    }
  } catch (err) {
    console.error("❗ Error during fetch:", err);
  } finally {
    await session.close();
    console.log("🔚 Session closed.");
  }
}

embedExistingDocs();
