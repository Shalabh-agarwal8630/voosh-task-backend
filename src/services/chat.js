const qdrant = require("../config/qdrant");
const { embedText } = require("./embeddings");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function retrieveAndAnswer(query) {
  // 1. Embed user query
  const queryEmbedding = await embedText(query);

  // 2. Search in Qdrant
  const search = await qdrant.search("news_articles", {
    vector: queryEmbedding,
    limit: 5, // retrieve top 5 passages
  });

  // 3. Prepare context
  const context = search.map(p => `- ${p.payload.title}: ${p.payload.content}`).join("\n\n");

  // 4. Call Gemini with context
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
You are a helpful news assistant. Use the following news articles as context to answer the question.

Context:
${context}

Question: ${query}

Answer in a clear and concise way:
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { retrieveAndAnswer };
