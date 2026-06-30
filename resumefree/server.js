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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/api/test", (req, res) => {
  res.json({ status: "API server working!" });
});

// Pass config — single source of truth
// pass_type => { amount in paise, duration_days, label }
// Addons have duration_days: null (one-time use, no expiry needed)
const PASS_CONFIG = {
  sprint:              { amount: 7900,  duration_days: 7,   label: "Sprint Pass (7 days)" },
  placement:           { amount: 19900, duration_days: 30,  label: "Placement Pass (30 days)" },
  season:              { amount: 39900, duration_days: 90,  label: "Season Pass (90 days)" },
  addon_cover_letter:  { amount: 9900,  duration_days: null, label: "Cover Letter (Add-on)" },
  addon_jd_tailoring:  { amount: 4900,  duration_days: null, label: "JD Tailoring (Add-on)" },
  addon_ats:           { amount: 9900,  duration_days: null, label: "Advanced ATS (Add-on)" },
};

// POST /api/improve-bullet
app.post("/api/improve-bullet", async (req, res) => {
  const { bullet } = req.body;
  if (!bullet || bullet.trim().length < 5) {
    return res.status(400).json({ error: "Invalid bullet text" });
  }
  const sanitized = bullet
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email]")
    .replace(/(\+91[\s-]?)?\d{10}/g, "[phone]")
    .trim();
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are an expert resume writer for Indian college students applying to TCS, Infosys, and startups." },
          { role: "user", content: `Improve this resume bullet: "${sanitized}". Add metrics, strong action verbs, keep under 150 chars, focus on impact. Return ONLY the improved bullet, nothing else.` },
        ],
      }),
    });
    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content?.trim();
    if (!improved) return res.status(502).json({ error: "No improvement returned." });
    return res.json({ improved });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/create-order
app.post("/api/create-order", async (req, res) => {
  const { pass_type } = req.body || {};

  const config = PASS_CONFIG[pass_type];
  if (!config) {
    return res.status(400).json({
      error: `Invalid pass_type. Valid options: ${Object.keys(PASS_CONFIG).join(", ")}`,
    });
  }

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
      body: JSON.stringify({
        amount: config.amount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { pass_type, label: config.label },
      }),
    });
    const order = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: order.error?.description || "Razorpay order creation failed" });
    }
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      pass_type,
      duration_days: config.duration_days,
      label: config.label,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/verify-payment
app.post("/api/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
    name,
    pass_type,
    amount,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !pass_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const config = PASS_CONFIG[pass_type];
  if (!config) {
    return res.status(400).json({ error: "Invalid pass_type" });
  }

  // Signature verification
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

    // Find or create user
    let userId;
    const { data: existingUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = existingUsers.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
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

    // Calculate expiry
    // For passes: now + duration_days
    // For addons: no expiry on profile (they're one-time feature unlocks — handle separately if needed)
    let premiumExpiresAt = null;
    let activePassType = null;

    if (config.duration_days) {
      // It's a pass — update profile expiry
      // If user already has an active pass, extend from current expiry (not from now)
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("premium_expires_at")
        .eq("id", userId)
        .single();

      const baseDate =
        existingProfile?.premium_expires_at &&
        new Date(existingProfile.premium_expires_at) > new Date()
          ? new Date(existingProfile.premium_expires_at) // extend from current expiry
          : new Date(); // start fresh from now

      baseDate.setDate(baseDate.getDate() + config.duration_days);
      premiumExpiresAt = baseDate.toISOString();
      activePassType = pass_type;
    }

    // Update profile
    const profileUpdate = {
      id: userId,
      email,
      name: name || null,
      is_premium: !!premiumExpiresAt, // true for passes, false for addons (addon logic separate)
      ...(premiumExpiresAt && { premium_expires_at: premiumExpiresAt }),
      ...(activePassType && { active_pass_type: activePassType }),
    };

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .upsert(profileUpdate);
    if (profileErr) throw profileErr;

    // Log payment
    const { error: paymentErr } = await supabaseAdmin.from("payments").insert({
      profile_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      amount: amount || config.amount / 100,
      plan: pass_type,        // keeping 'plan' col for backward compat
      pass_type,
      duration_days: config.duration_days,
      expires_at: premiumExpiresAt,
      status: "success",
    });
    if (paymentErr) throw paymentErr;

    return res.status(200).json({
      success: true,
      pass_type,
      label: config.label,
      expires_at: premiumExpiresAt,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/jd-match
app.post("/api/jd-match", async (req, res) => {
  const { bullets, skills, jobDescription } = req.body || {};
  if (!Array.isArray(bullets) || bullets.length === 0) {
    return res.status(400).json({ error: "Add at least one bullet to your resume first." });
  }
  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({ error: "Paste the full job description first." });
  }

  const bulletLines = bullets.map((b) => `${b.label}: ${b.text}`).join("\n");
  const skillsLine  = (skills || []).join(", ") || "(none listed)";

  const jdWords = new Set(
    jobDescription.toLowerCase()
      .split(/[\s,.()\[\]{};:!"'\/\\|<>]+/)
      .filter(w => w.length >= 3)
  );
  const resumeWords = new Set(
    [...skills, ...bullets.map(b => b.text)].join(" ").toLowerCase()
      .split(/[\s,.()\[\]{};:!"'\/\\|<>]+/)
      .filter(w => w.length >= 3)
  );
  let overlap = 0;
  jdWords.forEach(w => { if (resumeWords.has(w)) overlap++; });
  const clientScore = Math.min(100, Math.round((overlap / Math.max(jdWords.size, 1)) * 200));

  const prompt = `You are a strict, accurate resume reviewer. Your job is to help a student improve their resume for a specific job.

RESUME SKILLS:
${skillsLine}

RESUME BULLETS (label: text):
${bulletLines}

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

YOUR TASKS:

TASK 1 — MISSING KEYWORDS:
List up to 8 specific technical skills, tools, or technologies mentioned in the job description that are genuinely absent from the resume skills and bullets above.
Rules:
- Only list concrete technical terms (e.g. "Kubernetes", "Spring Boot", "SQL") — never soft skills like "communication" or vague terms like "experience" or "ability"
- A keyword is only "missing" if it literally does not appear anywhere in the resume skills or bullets
- Never invent keywords not in the job description

TASK 2 — BULLET REWRITES:
Pick at most 4 resume bullets that are most relevant to this job and rewrite them to better match the job description language.
STRICT RULES for rewrites:
- You may only use facts, numbers, technologies, and achievements that already exist in the original bullet
- NEVER add new metrics, percentages, or achievements that are not in the original bullet
- NEVER add technologies not mentioned in the original bullet
- Only rephrase using keywords from the job description — the substance must be identical
- Keep under 150 characters

Return ONLY a raw JSON object (no markdown, no explanation):
{"missingKeywords": [<string>, ...], "suggestions": [{"label": "<label>", "original": "<original bullet text>", "tailored": "<rewritten bullet>"}]}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a strict JSON-only API. Output ONLY a raw JSON object. No markdown, no code fences, no explanation. Never add facts not present in the input." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return res.status(502).json({ error: "No response from AI. Try again." });
    raw = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) return res.status(502).json({ error: "Could not read the AI response. Try again." });
      parsed = JSON.parse(raw.slice(start, end + 1));
    }
    const missingKeywords = (Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [])
      .filter(kw => typeof kw === "string" && kw.trim().length >= 2 && jobDescription.toLowerCase().includes(kw.toLowerCase()))
      .slice(0, 8);
    const suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .filter(s => s && s.label && s.tailored && s.original)
      .filter(s => (s.tailored.match(/\d+/g) || []).filter(n => !(s.original.match(/\d+/g) || []).includes(n)).length === 0)
      .filter(s => s.tailored.trim().toLowerCase() !== s.original.trim().toLowerCase())
      .slice(0, 4);
    return res.status(200).json({ matchScore: clientScore, missingKeywords, suggestions });
  } catch (err) {
    console.error("jd-match error:", err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

app.listen(3001, () => {
  console.log("🚀 API server running on http://localhost:3001");
  console.log("   GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ loaded" : "❌ missing");
});