// api/jd-match.js — Vercel Serverless Function
// Premium feature: scores resume bullets against a job description and
// suggests tailored rewrites. Calls Groq — never sees personal info.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bullets, skills, jobDescription } = req.body || {};

  if (!Array.isArray(bullets) || bullets.length === 0) {
    return res.status(400).json({ error: "Add at least one bullet to your resume first." });
  }
  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({ error: "Paste the full job description first." });
  }

  const bulletLines = bullets.map((b) => `${b.label}: ${b.text}`).join("\n");
  const skillsLine = (skills || []).join(", ") || "(none listed)";

  const prompt = `You are an expert resume-to-job-description matcher for Indian tech job applications.

RESUME SKILLS:
${skillsLine}

RESUME BULLETS:
${bulletLines}

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

Task:
1. Score how well this resume matches the job description, 0-100.
2. List up to 10 important keywords/skills from the job description that are MISSING from the resume skills and bullets.
3. Pick at most 5 of the most relevant resume bullets and rewrite each to better match the job description's language and requirements — keep the same underlying facts, just reframe the wording, under 150 characters each.

Return ONLY valid JSON, no markdown, no code fences, matching exactly this shape:
{"matchScore": <integer>, "missingKeywords": [<string>, ...], "suggestions": [{"label": "<bullet label>", "tailored": "<rewritten bullet>"}]}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 900,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are a precise JSON-only API. Never include markdown formatting, code fences, or commentary — output only the raw JSON object.",
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

    // Strip markdown code fences in case the model added them anyway
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
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        return res.status(502).json({ error: "Could not read the AI response. Try again." });
      }
      parsed = JSON.parse(raw.slice(start, end + 1));
    }

    const matchScore = Math.max(0, Math.min(100, Math.round(Number(parsed.matchScore) || 0)));
    const missingKeywords = Array.isArray(parsed.missingKeywords)
      ? parsed.missingKeywords.slice(0, 10)
      : [];
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s) => s && s.label && s.tailored).slice(0, 5)
      : [];

    return res.status(200).json({ matchScore, missingKeywords, suggestions });
  } catch (error) {
    console.error("jd-match error:", error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}