// server.js — local dev API server
// Run with: node server.js
import express from "express";
import { readFileSync } from "fs";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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

// POST /api/create-order
app.post("/api/create-order", async (req, res) => {
  const { plan } = req.body || {};
  const AMOUNTS = { monthly: 19900, yearly: 49900 };
  const amount = AMOUNTS[plan];

  if (!amount) return res.status(400).json({ error: "Invalid plan" });

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys not configured" });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ amount, currency: "INR", receipt: `rcpt_${Date.now()}`, notes: { plan } }),
    });
    const order = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: order.error?.description || "Razorpay order creation failed" });
    }
    return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/verify-payment
app.post("/api/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, name, plan, amount } =
    req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !plan) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed — signature mismatch" });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let userId;
    const { data: existingUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = existingUsers.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    const expiresAt = new Date();
    if (plan === "yearly") expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    else expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      name: name || null,
      is_premium: true,
      premium_plan: plan,
      premium_expires_at: expiresAt.toISOString(),
    });
    if (profileErr) throw profileErr;

    const { error: paymentErr } = await supabaseAdmin.from("payments").insert({
      profile_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      amount: amount || 0,
      plan,
      status: "success",
    });
    if (paymentErr) throw paymentErr;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 API server running on http://localhost:3001");
  console.log("   GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ loaded" : "❌ missing");
}); 