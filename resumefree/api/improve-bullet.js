// api/improve-bullet.js
// Vercel Serverless Function — API key never exposed to browser

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bullet } = req.body;

  if (!bullet || typeof bullet !== "string" || bullet.trim().length < 5) {
    return res.status(400).json({ error: "Invalid bullet text" });
  }

  // Sanitize PII
  const sanitized = bullet
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email]")
    .replace(/(\+91[\s-]?)?\d{10}/g, "[phone]")
    .trim();

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
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

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return res.status(502).json({ error: "AI service unavailable. Try again." });
    }

    const data = await response.json();
    const improved = data.choices?.[0]?.message?.content?.trim();

    if (!improved) {
      return res.status(502).json({ error: "No improvement returned. Try again." });
    }

    return res.status(200).json({ improved });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
}