require("dotenv").config();
const prisma = require("../src/config/db");
const { embedText } = require("../src/services/embeddings");
const qdrant = require("../src/config/qdrant");

const COLLECTION = "news_articles";

async function main() {
  try {
    // Ensure collection exists
    await qdrant.createCollection(COLLECTION, {
      vectors: { size: 768, distance: "Cosine" }, // Jina uses 768-dim vectors
    }).catch(err => {
      if (err.response?.status !== 409) { // 409 = already exists
        throw err;
      }
    });

    // Fetch articles from Postgres
    const articles = await prisma.newsArticle.findMany();

    console.log(`🔄 Embedding ${articles.length} articles...`);

    for (const article of articles) {
      const embedding = await embedText(article.content);
      if (!embedding) {
        console.warn(`⚠️ Skipped article ${article.id} (embedding failed)`);
        continue;
      }

      await qdrant.upsert(COLLECTION, {
        points: [
          {
            id: article.id, // use DB id as point id
            vector: embedding,
            payload: {
              title: article.title,
              content: article.content,
              url: article.url,
            },
          },
        ],
      });

      console.log(`✅ Embedded + stored article ${article.id}`);
    }

    console.log("🎉 All articles embedded and stored in Qdrant");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error embedding:", err);
    process.exit(1);
  }
}

main();
