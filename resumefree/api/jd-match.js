// api/jd-match.js — Vercel Serverless Function
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
  const skillsLine  = (skills || []).join(", ") || "(none listed)";

  function tokenize(text) {
    return text
      .toLowerCase()
      .split(/[\s,.()\[\]{};:!"'\/\\|<>]+/)
      .filter((w) => w.length >= 2);
  }

  // Words that carry no real meaning on their own — used to detect
  // "trivial" suggestions where the AI only swapped a connector/preposition
  // (e.g. "using React" -> "with React") without actually improving anything.
  const STOPWORDS = new Set([
    "a", "an", "the", "of", "for", "to", "in", "on", "at", "with", "using",
    "by", "and", "or", "is", "are", "was", "were", "be", "been", "this",
    "that", "from", "as", "via", "into", "over", "under", "than", "then",
  ]);

  function contentWords(text) {
    return tokenize(text).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  }

  const resumeText = [...(skills || []), ...bullets.map((b) => b.text)].join(" ");
  const resumeTextLower = resumeText.toLowerCase();

  const prompt = `You are a strict, accurate resume reviewer. Your job is to help a student improve their resume for a specific job.

RESUME SKILLS:
${skillsLine}

RESUME BULLETS (label: text):
${bulletLines}

JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

YOUR TASKS:

TASK 1 — REQUIRED KEYWORDS:
List up to 12 specific technical skills, tools, technologies, or concrete qualifications mentioned in the job description that a strong candidate for THIS role would need to show on their resume.
Rules:
- Only concrete technical terms (e.g. "Kubernetes", "Spring Boot", "SQL", "3+ years experience") — never soft skills like "communication" or vague filler like "team player"
- List these regardless of whether the resume already has them or not — this is the full required list, not a gap list
- Never invent terms not present in the job description

TASK 2 — BULLET REWRITES:
Pick at most 4 resume bullets that are most relevant to this job and rewrite them to sound more aligned with the job description's language.
STRICT RULES for rewrites — read carefully, these are non-negotiable:
- You may ONLY use facts, numbers, technologies, and achievements that already exist in the original bullet
- NEVER add new metrics, percentages, or achievements that are not in the original bullet
- NEVER add technologies not mentioned in the original bullet
- You may reword phrasing to match the job description's terminology ONLY when it describes something already in the bullet (e.g. original says "built APIs" and JD says "developed RESTful services" → you may write "developed RESTful APIs" since REST/API concept is already present)
- If a bullet has nothing in common with the job description's language, make only light stylistic improvements (stronger verb, tighter phrasing) — do NOT force-fit unrelated JD terms into it
- **CRITICAL — DO NOT DROP CONTENT:** every fact, technology, number, and achievement present in the original bullet MUST still appear in the tailored version. The tailored bullet must never be shorter or "thinner" than the original. If you cannot improve a bullet without removing something, leave that detail in and only adjust phrasing around it.
- **CRITICAL — NEVER RETURN THE BULLET UNCHANGED.** The tailored version must be genuinely different in wording from the original — stronger verb, tighter phrasing, reordered emphasis, or JD-aligned terminology for a concept already present. If, after honestly trying, you cannot improve a bullet's wording at all without fabricating something, DO NOT include that bullet in "suggestions" — skip it entirely. Returning a suggestion whose "tailored" text is identical (or near-identical) to "original" is a failure and worse than not suggesting anything.
- **CRITICAL — NO TRIVIAL SWAPS.** Changing only a connector/preposition (e.g. "using React" → "with React", "for the team" → "on the team") while every meaningful word stays exactly the same is NOT a real improvement. If that's the only change you can make, skip that bullet entirely instead of returning a cosmetic swap.
- It's fine and expected to return fewer than 4 suggestions, or even zero, if the resume genuinely has nothing worth rewording for this JD. Do not pad the list with unchanged or trivially-changed bullets just to reach 4.
- Prefer picking bullets that are already closest to a required keyword, so the rewrite can genuinely surface that overlap in the JD's own language
- Keep under 150 characters

Return ONLY a raw JSON object (no markdown, no explanation):
{"requiredKeywords": [<string>, ...], "suggestions": [{"label": "<label>", "original": "<original bullet text>", "tailored": "<rewritten bullet>"}]}`;

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
        temperature: 0.35, // was 0.2 — too conservative was causing the model to echo bullets back unchanged as the "safest" option
        messages: [
          {
            role: "system",
            content: "You are a strict JSON-only API. Output ONLY a raw JSON object. No markdown, no code fences, no explanation. Never add facts not present in the input. Never remove facts present in the input.",
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

    // ── Validate + sanitize the required-keywords list ──────────────────────
    const jdTextLower = jobDescription.toLowerCase();
    const rawRequired = Array.isArray(parsed.requiredKeywords) ? parsed.requiredKeywords : [];
    const seen = new Set();
    const requiredKeywords = rawRequired
      .filter((kw) => {
        if (typeof kw !== "string" || kw.trim().length < 2) return false;
        const kwLower = kw.toLowerCase().trim();
        if (seen.has(kwLower)) return false;
        if (!jdTextLower.includes(kwLower)) return false; // must actually be in the JD
        seen.add(kwLower);
        return true;
      })
      .slice(0, 12);

    // ── Deterministic score + missing keywords, both from the SAME list ─────
    const missingKeywords = requiredKeywords.filter((kw) => !resumeTextLower.includes(kw.toLowerCase()));
    const matchedCount = requiredKeywords.length - missingKeywords.length;

    let matchScore;
    if (requiredKeywords.length > 0) {
      matchScore = Math.round((matchedCount / requiredKeywords.length) * 100);
    } else {
      const jdWords = new Set(tokenize(jobDescription).filter((w) => w.length >= 3));
      const resumeWords = new Set(tokenize(resumeText).filter((w) => w.length >= 3));
      let overlap = 0;
      jdWords.forEach((w) => { if (resumeWords.has(w)) overlap++; });
      matchScore = Math.min(100, Math.round((overlap / Math.max(jdWords.size, 1)) * 100));
    }

    // Suggestions: validate against hallucination (added numbers), against
    // content-stripping (removed facts/technologies), AND against trivial
    // cosmetic-only swaps (this session's fix).
    const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const suggestions = rawSuggestions
      .filter((s) => s && s.label && s.tailored && s.original)
      .filter((s) => bullets.some((b) => b.label === s.label)) // label must match a real bullet
      .filter((s) => {
        // Reject if the AI just returned the bullet unchanged (or only
        // whitespace/punctuation differs).
        const normalize = (t) => t.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
        if (normalize(s.tailored) === normalize(s.original)) return false;

        // NEW — Reject "trivial" suggestions: same meaningful (non-filler)
        // words, in the same order, with only a connector/preposition
        // swapped (e.g. "using React" -> "with React"). This is the exact
        // bug Devansh hit — technically "different text", zero real value.
        const origContentWords = contentWords(s.original);
        const tailoredContentWords = contentWords(s.tailored);
        if (
          origContentWords.length === tailoredContentWords.length &&
          origContentWords.every((w, i) => w === tailoredContentWords[i])
        ) {
          return false;
        }

        // Reject if tailored has numbers not in original (hallucinated metrics)
        const tailoredExtra = (s.tailored.match(/\d+/g) || []).filter(
          (n) => !(s.original.match(/\d+/g) || []).includes(n)
        );
        if (tailoredExtra.length > 0) return false;

        // Reject if the tailored bullet drops meaningful content from the
        // original — require ~80% of the original's words to still be
        // present in the tailored version.
        const origContent = tokenize(s.original).filter((w) => w.length >= 3);
        const tailoredContentSet = new Set(tokenize(s.tailored).filter((w) => w.length >= 3));
        if (origContent.length > 0) {
          const preserved = origContent.filter((w) => tailoredContentSet.has(w)).length;
          const preservationRatio = preserved / origContent.length;
          if (preservationRatio < 0.8) return false;
        }
        return true;
      })
      .slice(0, 4);

    return res.status(200).json({
      matchScore,
      missingKeywords,
      suggestions,
    });

  } catch (error) {
    console.error("jd-match error:", error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}