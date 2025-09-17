const express = require("express");
const prisma = require("../config/db");
const { client: redis } = require("../config/redis");
const { retrieveAndAnswer } = require("../services/chat");

const router = express.Router();

// POST /api/chat/:sessionId
router.post("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    // 1. Find session
    const session = await prisma.session.findUnique({ where: { sessionId } });
    if (!session) return res.status(404).json({ error: "Session not found" });

    // 2. Get answer from RAG pipeline
    const answer = await retrieveAndAnswer(query);

    // 3. Save user + bot messages in DB
    const userMsg = await prisma.message.create({
      data: { role: "user", content: query, sessionId: session.id },
    });
    const botMsg = await prisma.message.create({
      data: { role: "bot", content: answer, sessionId: session.id },
    });

    // 4. Update Redis
    const key = `session:${sessionId}`;
    const history = await redis.get(key);
    const messages = history ? JSON.parse(history) : [];
    messages.push({ role: "user", content: query });
    messages.push({ role: "bot", content: answer });
    await redis.set(key, JSON.stringify(messages));

    res.json({ answer, messages: [userMsg, botMsg] });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Failed to process chat" });
  }
});

module.exports = router;
