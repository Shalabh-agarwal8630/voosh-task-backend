const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Routes
const sessionRoutes = require("./routes/session");
const messageRoutes = require("./routes/message");
const newsRoutes = require("./routes/news");
const chatRoutes = require("./routes/chat");


// Config
const prisma = require("./config/db");
const { connectRedis } = require("./config/redis");

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: true,        // allow all origins (adjust for prod)
    credentials: true,   // allow cookies/credentials
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/session", sessionRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/news",newsRoutes);
app.use("/api/chat", chatRoutes);


app.get("/", (req, res) => {
  res.send("🚀 RAG Chatbot Backend is running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
async function startServer() {
  try {
    await connectRedis(); // Connect to Redis
    await prisma.$connect(); // Connect to Postgres
    console.log("✅ Postgres connected");

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
