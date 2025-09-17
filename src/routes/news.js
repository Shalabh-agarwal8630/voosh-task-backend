// src/routes/news.js
const express = require("express");
const prisma = require("../config/db");

const router = express.Router();

// Add a news article
router.post("/", async (req, res) => {
  const { title, content, url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const article = await prisma.newsArticle.create({
      data: { title, content, url },
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error("Create article error:", err);
    return res.status(500).json({ error: "Failed to create article" });
  }
});

// Fetch all news articles
router.get("/", async (req, res) => {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!articles.length) {
      return res.status(404).json({ error: "No articles found" });
    }

    return res.json(articles);
  } catch (err) {
    console.error("Fetch articles error:", err);
    return res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Fetch a single article by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const article = await prisma.newsArticle.findUnique({
      where: { id: Number(id) },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.json(article);
  } catch (err) {
    console.error("Get article error:", err);
    return res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Delete article by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const article = await prisma.newsArticle.findUnique({
      where: { id: Number(id) },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    await prisma.newsArticle.delete({ where: { id: Number(id) } });
    return res.json({ message: "Article deleted" });
  } catch (err) {
    console.error("Delete article error:", err);
    return res.status(500).json({ error: "Failed to delete article" });
  }
});

module.exports = router;
