/* global process */
import { createClient } from "@supabase/supabase-js";

// api/jd-match.js — Vercel Serverless Function
const MAX_BULLETS = 40;
const MAX_SKILLS = 80;
const MAX_BULLET_TEXT_CHARS = 16000;
const MAX_SKILL_CHARS = 80;
const MAX_JOB_DESCRIPTION_CHARS = 8000;

function cleanText(value, maxLength) {
  return typeof value === "string"
    ? value.split(String.fromCharCode(0)).join(" ").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

async function requireJdAccess(req) {
  const authorization = req.headers?.authorization || "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!accessToken || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    return false;
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at, addon_jd_tailoring_unlocked")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || !profile) return false;

  const activePass = profile.is_premium
    && profile.premium_expires_at
    && new Date(profile.premium_expires_at).getTime() > Date.now();
  return Boolean(activePass || profile.addon_jd_tailoring_unlocked);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireJdAccess(req))) {
    return res.status(403).json({ error: "JD tailoring access is required for this report." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const rawBullets = Array.isArray(body.bullets) ? body.bullets.slice(0, MAX_BULLETS) : [];
  const bullets = rawBullets
    .map((bullet, index) => ({
      label: cleanText(bullet?.label || `B${index + 1}`, 80),
      text: cleanText(bullet?.text, MAX_BULLET_TEXT_CHARS),
    }))
    .filter((bullet) => bullet.text.length > 0);
  const skills = (Array.isArray(body.skills) ? body.skills : [])
    .slice(0, MAX_SKILLS)
    .map((skill) => cleanText(skill, MAX_SKILL_CHARS))
    .filter(Boolean);
  const jobDescription = cleanText(body.jobDescription, MAX_JOB_DESCRIPTION_CHARS);

  if (bullets.length === 0) {
    return res.status(400).json({ error: "Add readable resume text before matching a job description." });
  }
  if (jobDescription.length < 20) {
    return res.status(400).json({ error: "Paste the full job description first." });
  }

  const bulletLines = bullets.map((b) => `${b.label}: ${b.text}`).join("\n");
  const skillsLine  = skills.join(", ") || "(none listed)";

  // ── Client-side match score (deterministic, not AI-generated) ────────────
  // We compute this ourselves so it cannot be hallucinated.
  // Extract tech keywords from JD (words 2+ chars, likely technical terms)
  const jdWords = new Set(
    jobDescription
      .toLowerCase()
      .split(/[\s,.(){};:!"'\\|<>]+/)
      .filter((w) => w.length >= 3)
  );

  const resumeWords = new Set(
    [...skills, ...bullets.map((b) => b.text)]
      .join(" ")
      .toLowerCase()
      .split(/[\s,.(){};:!"'\\|<>]+/)
      .filter((w) => w.length >= 3)
  );

  // Overlap ratio — how many JD words appear in resume
  let overlap = 0;
  jdWords.forEach((w) => { if (resumeWords.has(w)) overlap++; });
  const clientScore = Math.min(100, Math.round((overlap / Math.max(jdWords.size, 1)) * 200));
  // *2 scaling because JD always has filler words; 100% overlap unrealistic

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.2, // lower = more conservative, less hallucination
        messages: [
          {
            role: "system",
            content: "You are a strict JSON-only API. Output ONLY a raw JSON object. No markdown, no code fences, no explanation. Never add facts not present in the input.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return res.status(502).json({ error: "No response from AI. Try again." });
    }

    // Strip markdown fences if model added them anyway
    raw = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const start = raw.indexOf("{");
      const end   = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        return res.status(502).json({ error: "Could not read the AI response. Try again." });
      }
      parsed = JSON.parse(raw.slice(start, end + 1));
    }

    // ── Validate + sanitize AI output ────────────────────────────────────────

    // Missing keywords: filter out anything not actually in the JD
    const rawMissing = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [];
    const missingKeywords = rawMissing
      .filter((kw) => {
        if (typeof kw !== "string" || kw.trim().length < 2) return false;
        // Keyword must actually appear in the JD (prevents hallucination)
        return jobDescription.toLowerCase().includes(kw.toLowerCase());
      })
      .slice(0, 8);

    // Suggestions: validate that tailored version doesn't add new numbers/% not in original
    const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const suggestions = rawSuggestions
      .filter((s) => s && s.label && s.tailored && s.original)
      .filter((s) => {
        // Extract all numbers from original and tailored
        // Reject if tailored has numbers not in original (hallucinated metrics)
        const tailoredExtra = (s.tailored.match(/\d+/g) || []).filter(
          (n) => !(s.original.match(/\d+/g) || []).includes(n)
        );
        return tailoredExtra.length === 0;
      })
      .slice(0, 4);

    // Use our deterministic client score, not AI-generated
    return res.status(200).json({
      matchScore: clientScore,
      missingKeywords,
      suggestions,
    });

  } catch (error) {
    console.error("jd-match error:", error?.message || "Unknown server error");
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}