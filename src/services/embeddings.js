// src/services/embeddings.js
const axios = require("axios");

async function embedText(text) {
  try {
    const response = await axios.post(
      "https://api.jina.ai/v1/embeddings",
      {
        model: "jina-embeddings-v2-base-en",
        input: text,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data[0].embedding; // returns embedding array
  } catch (err) {
    console.error("❌ Embedding failed:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { embedText };
