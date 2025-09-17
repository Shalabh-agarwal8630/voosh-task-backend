const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,   // Upstash requires TLS
    rejectUnauthorized: false, // prevent SSL issues locally
  },
});

client.on("connect", () => {
  console.log("✅ Redis connected");
});

client.on("error", (err) => {
  console.error(" Redis error:", err);
});

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

module.exports = { client, connectRedis };
