// src/routes/session.js
const express = require("express");
const { v4: uuidv4 } = require("uuid"); 
const prisma = require("../config/db");
const { client: redis } = require("../config/redis");

const router = express.Router();

// TTL (seconds) for Redis session key (default 7 days)
const SESSION_TTL = Number(process.env.SESSION_TTL_SECONDS) || 7 * 24 * 3600;

// Start a new session
router.post("/start", async (req, res) => {
  const sessionId = uuidv4();
  let sessionRecord;

  try {
    // 1) Create in Postgres
    sessionRecord = await prisma.session.create({
      data: { sessionId },
    });

    // 2) Initialize Redis cache for this session
    const key = `session:${sessionId}`;
    const empty = JSON.stringify([]);

    try {
      if (SESSION_TTL > 0) {
        // set with expiry
        await redis.set(key, empty, { EX: SESSION_TTL });
      } else {
        await redis.set(key, empty);
      }
    } catch (redisErr) {
      // Redis failed — rollback DB to avoid orphaned session
      try {
        await prisma.session.delete({ where: { id: sessionRecord.id } });
      } catch (rollbackErr) {
        console.error("Rollback failed after Redis error:", rollbackErr);
      }
      console.error("Redis init failed:", redisErr);
      return res.status(500).json({ error: "Failed to initialize session cache" });
    }

    return res.status(201).json({
      sessionId,
      createdAt: sessionRecord.createdAt,
    });
  } catch (err) {
    console.error("Create session error:", err);
    return res.status(500).json({ error: "Failed to create session" });
  }
});

// Get session history (prefer Redis; fallback to Postgres)
router.get("/:id", async (req, res) => {
  const sessionId = req.params.id;
  const key = `session:${sessionId}`;

  try {
    // Try Redis first
    const cached = await redis.get(key);
    if (cached) {
      const messages = JSON.parse(cached);
      return res.json({ sessionId, messages});
    }

    // Fallback: read from Postgres (persisted messages)
    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const messages = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));

    // Repopulate Redis cache (best-effort)
    try {
      if (SESSION_TTL > 0) {
        await redis.set(key, JSON.stringify(messages), { EX: SESSION_TTL });
      } else {
        await redis.set(key, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn("Failed to repopulate Redis cache:", e.message || e);
    }

    return res.json({ sessionId, messages });
  } catch (err) {
    console.error("Get session history error:", err);
    return res.status(500).json({ error: "Failed to fetch session history" });
  }
});

// Clear session (Redis + Postgres cleanup)
router.delete("/:id", async (req, res) => {
  const sessionId = req.params.id;

  try {
    // Find the session
    const session = await prisma.session.findUnique({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Delete redis key (best-effort)
    const key = `session:${sessionId}`;
    try {
      await redis.del(key);
    } catch (e) {
      console.warn("Redis DEL failed:", e.message || e);
    }

    // Delete messages first (FK constraint) then session
    await prisma.message.deleteMany({ where: { sessionId: session.id } });
    await prisma.session.delete({ where: { id: session.id } });

    return res.json({ message: "Session cleared" });
  } catch (err) {
    console.error("Clear session error:", err);
    return res.status(500).json({ error: "Failed to clear session" });
  }
});

module.exports = router;
