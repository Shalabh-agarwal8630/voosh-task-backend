// scripts/ingestNews.js
require("dotenv").config();
const Parser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const prisma = require("../src/config/db");

const parser = new Parser();

// ✅ Updated with working feeds
const RSS_FEEDS = [
  "http://feeds.bbci.co.uk/news/rss.xml",
  "http://rss.cnn.com/rss/edition.rss",
  "https://www.theguardian.com/world/rss",
  "https://apnews.com/apf-topnews?format=rss",
  "https://www.aljazeera.com/xml/rss/all.xml",
];

// Helper: fetch article full content if RSS snippet too short
async function fetchArticleFullContent(url) {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    const html = res.data;
    const $ = cheerio.load(html);

    let paragraphs = [];
    $("p").each((i, p) => {
      const text = $(p).text().trim();
      if (text && text.length > 50) {
        paragraphs.push(text);
      }
    });

    return paragraphs.join("\n\n") || null;
  } catch (err) {
    console.warn("⚠️ Could not fetch full content:", url, err.message);
    return null;
  }
}

async function ingest() {
  try {
    let totalCount = 0;

    for (const feedUrl of RSS_FEEDS) {
      console.log(`🔄 Fetching from ${feedUrl}`);

      let feed;
      try {
        feed = await parser.parseURL(feedUrl);
      } catch (err) {
        console.warn(`⚠️ Failed to fetch RSS ${feedUrl}:`, err.message);
        continue;
      }

      let feedCount = 0;

      for (const item of feed.items) {
        if (totalCount >= 50) break;
        if (!item.link) continue;

        // skip duplicates
        const exists = await prisma.newsArticle.findFirst({
          where: { url: item.link },
        });
        if (exists) continue;

        // content
        let content = item.contentSnippet || item.content;
        if (!content || content.length < 200) {
          const fetched = await fetchArticleFullContent(item.link);
          if (fetched) content = fetched;
        }
        if (!content) continue;

        await prisma.newsArticle.create({
          data: {
            title: item.title || "No title",
            content: content,
            url: item.link,
          },
        });

        totalCount++;
        feedCount++;
        console.log(`✅ Ingested #${totalCount}: ${item.title}`);

        if (totalCount >= 50) break;
      }

      console.log(`📌 From ${feedUrl}: added ${feedCount} articles`);
      if (totalCount >= 50) break;
    }

    console.log(`🎉 Done ingesting ${totalCount} articles total`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Ingestion error:", err);
    process.exit(1);
  }
}

ingest();
