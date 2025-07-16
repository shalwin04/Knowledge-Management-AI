import { GoogleGenerativeAIEmbeddings} from "@langchain/google-genai";
import { driver } from "../utils/neo4j";
import dotenv from "dotenv";

dotenv.config();
const embedder = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  taskType: "retrieval_document" as any, 
});


async function embedAndStoreDoc({
  id,
  title,
  description,
  tags,
  source,
  owner,
  createdAt,
  lastModified,
  link,
}: {
  id: string;
  title: string;
  description: string;
  tags: string[];
  source: string;
  owner: string;
  createdAt: string;
  lastModified: string;
  link: string;
}) {
  const [embedding] = await embedder.embedDocuments([description]);

  const session = driver.session();
  try {
    await session.run(
      `
      CREATE (doc:Document {
        id: $id,
        title: $title,
        description: $description,
        tags: $tags,
        source: $source,
        owner: $owner,
        createdAt: $createdAt,
        lastModified: $lastModified,
        link: $link,
        embedding: $embedding
      })
      `,
      {
        id,
        title,
        description,
        tags,
        source,
        owner,
        createdAt,
        lastModified,
        link,
        embedding,
      }
    );
    console.log(`✅ Stored: ${title}`);
  } finally {
    await session.close();
  }
}

// Dummy test
embedAndStoreDoc({
  id: "doc-001",
  title: "CI/CD Pipeline",
  description: "Jenkins CI/CD setup for Nestlé's DevOps projects",
  tags: ["DevOps", "CI/CD", "Nestlé"],
  source: "GDrive",
  owner: "Joshna",
  createdAt: "2024-09-01",
  lastModified: "2025-01-15",
  link: "https://drive.google.com/example",
});
