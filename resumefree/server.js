// server.js — local dev API server
// Run with: node server.js
import express from "express";
import { readFileSync } from "fs";

// Load .env manually
try {
  const env = readFileSync(".env.local", "utf-8");
  env.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    const val = rest.join("=");
    if (key && val) process.env[key.trim()] = val.trim();
  });
  console.log("📁 Loaded .env.local");
} catch {
  try {
    const env = readFileSync(".env", "utf-8");
    env.split("\n").forEach((line) => {
      const [key, ...rest] = line.split("=");
      const val = rest.join("=");
      if (key && val) process.env[key.trim()] = val.trim();
    });
    console.log("📁 Loaded .env");
  } catch {
    console.log("⚠️ No .env file found");
  }
}

const app = express();
app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ status: "API server working!" });
});

// POST /api/improve-bullet
app.post("/api/improve-bullet", async (req, res) => {
  console.log("✅ Request received:", req.body);

  const { bullet } = req.body;

  if (!bullet || bullet.trim().length < 5) {
    return res.status(400).json({ error: "Invalid bullet text" });
  }

  // Sanitize PII
  const sanitized = bullet
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email]")
    .replace(/(\+91[\s-]?)?\d{10}/g, "[phone]")
    .trim();

  console.log("🔄 Calling Groq with:", sanitized);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer for Indian college students applying to TCS, Infosys, and startups.",
          },
          {
            role: "user",
            content: `Improve this resume bullet: "${sanitized}". Add metrics, strong action verbs, keep under 150 chars, focus on impact. Return ONLY the improved bullet, nothing else.`,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("📦 Groq response:", JSON.stringify(data, null, 2));

    const improved = data.choices?.[0]?.message?.content?.trim();

    if (!improved) {
      return res.status(502).json({ error: "No improvement returned." });
    }

    console.log(`✅ Improved: "${bullet}" → "${improved}"`);
    return res.json({ improved });

  } catch (err) {
    console.error("❌ Error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3001, () => {
  console.log("🚀 API server running on http://localhost:3001");
  console.log("   GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ loaded" : "❌ missing");
});