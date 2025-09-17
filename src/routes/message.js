const express = require("express");
const prisma = require("../config/db");
const { client: redis } = require("../config/redis");

const router = express.Router();

// Add a message (user/bot) to a session
router.post("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("sessionId",sessionId)
    const { role, content } = req.body;

    if (!["user", "bot"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'user' or 'bot'" });
    }

    // Check if session exists
    const session = await prisma.session.findUnique({ where: { sessionId } });
    console.log("session is ",session)
    if (!session) return res.status(404).json({ error: "Session not found" });

    // Save message in Postgres
    const message = await prisma.message.create({
      data: { role, content, sessionId: session.id },
    });

    // Update Redis history
    const history = await redis.get(`session:${sessionId}`);
    const messages = history ? JSON.parse(history) : [];
    messages.push({ role, content });
    await redis.set(`session:${sessionId}`, JSON.stringify(messages));

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all messages for a session (from Postgres)
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: { messages: true },
    });

    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json(session.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
