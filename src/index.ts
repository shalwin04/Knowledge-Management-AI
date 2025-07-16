import { runQueryFromNLP } from "./services/runQuery";

async function main() {
  const testCases = [
    "projects under etfm"
  ];

  for (const testCase of testCases) {
    console.log("\n🔍 Testing query:", testCase);
    try {
      const data = await runQueryFromNLP(testCase);
      console.log("📊 Results:", JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("❌ Failed to answer:", err);
    }
  }
}

main();
