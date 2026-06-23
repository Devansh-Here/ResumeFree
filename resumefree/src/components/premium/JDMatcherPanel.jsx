// src/components/premium/JDMatcherPanel.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import UpgradeModal from "./UpgradeModal";

function collectBullets(resume) {
  const items = [];
  resume.experience.forEach((exp, i) => {
    exp.bullets.forEach((b, j) => {
      if (b && b.trim()) {
        items.push({
          label: `E${i + 1}-B${j + 1}`,
          type: "experience",
          entryId: exp.id,
          bulletIdx: j,
          text: b,
        });
      }
    });
  });
  resume.projects.forEach((proj, i) => {
    proj.bullets.forEach((b, j) => {
      if (b && b.trim()) {
        items.push({
          label: `P${i + 1}-B${j + 1}`,
          type: "project",
          entryId: proj.id,
          bulletIdx: j,
          text: b,
        });
      }
    });
  });
  return items;
}

export default function JDMatcherPanel() {
  const resume = useResumeStore((s) => s.resume);
  const updateExperienceBullet = useResumeStore((s) => s.updateExperienceBullet);
  const updateProjectBullet = useResumeStore((s) => s.updateProjectBullet);
  const isPremium = useAuthStore((s) => s.isPremium());

  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState({});

  const handleOpen = () => {
    if (!isPremium) {
      setUpgradeOpen(true);
      return;
    }
    setOpen(true);
  };

  const reset = () => {
    setJd("");
    setResult(null);
    setError(null);
    setApplied({});
  };

  const handleAnalyze = async () => {
    if (!jd.trim() || jd.trim().length < 30) {
      setError("Paste the full job description (at least a few lines).");
      return;
    }

    const bullets = collectBullets(resume);
    if (bullets.length === 0) {
      setError("Add at least one experience or project bullet first.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    const skills = [
      ...(resume.skills?.technical || []),
      ...(resume.skills?.tools || []),
      ...(resume.skills?.languages || []),
    ];

    try {
      const res = await fetch("/api/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullets: bullets.map(({ label, text }) => ({ label, text })),
          skills,
          jobDescription: jd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not analyze. Try again.");
      setResult({ ...data, bullets });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const applySuggestion = (label, tailored) => {
    const bullet = result.bullets.find((b) => b.label === label);
    if (!bullet) return;
    if (bullet.type === "experience") {
      updateExperienceBullet(bullet.entryId, bullet.bulletIdx, tailored);
    } else {
      updateProjectBullet(bullet.entryId, bullet.bulletIdx, tailored);
    }
    setApplied((prev) => ({ ...prev, [label]: true }));
  };

  const scoreColor =
    result && result.matchScore >= 70
      ? "#1E8E5A"
      : result && result.matchScore >= 40
      ? "#E2A33B"
      : "#dc2626";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
          isPremium
            ? "bg-white border-[#DDD6C8] text-[#161A2E] hover:border-[#161A2E]/40"
            : "bg-[#E2A33B]/8 border-[#E2A33B]/30 text-[#E2A33B] hover:bg-[#E2A33B]/15"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {isPremium ? "🎯 JD Match" : "🔒 JD Match"}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#161A2E]/60 px-4">
            <div className="bg-[#F6F4EF] rounded-lg max-w-lg w-full p-6 relative border border-[#DDD6C8] max-h-[85vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="absolute top-3 right-3 text-[#161A2E]/40 hover:text-[#161A2E] text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>

              <h3
                className="text-lg font-bold text-[#161A2E] mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                🎯 JD Matcher
              </h3>
              <p
                className="text-sm text-[#161A2E]/60 mb-4"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Paste a job description — we'll score your match and tailor your bullets to it.
              </p>

              {!result && (
                <>
                  <textarea
                    rows={8}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full border border-[#DDD6C8] rounded-lg px-3 py-2.5 text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 focus:outline-none focus:border-[#1E8E5A] resize-none mb-2"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-[#161A2E] text-[#F6F4EF] font-semibold py-2.5 rounded hover:bg-[#1E8E5A] transition-colors disabled:opacity-50"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {loading ? "Analyzing..." : "Analyze Match"}
                  </button>
                  <p
                    className="text-[10px] text-[#161A2E]/30 mt-3"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Only your bullets, skills & this job description are sent — never your personal info.
                  </p>
                </>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-3 bg-white border border-[#DDD6C8] rounded-lg p-3">
                    <svg width="48" height="48" viewBox="0 0 40 40" className="shrink-0">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#E8E5DF" strokeWidth="3.5" />
                      <circle
                        cx="20"
                        cy="20"
                        r="15"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={`${(result.matchScore / 100) * 94.2} 94.2`}
                        transform="rotate(-90 20 20)"
                      />
                      <text
                        x="20"
                        y="20"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="10"
                        fontWeight="700"
                        fill="#161A2E"
                      >
                        {result.matchScore}
                      </text>
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-[#161A2E]">{result.matchScore}/100 match</p>
                      <p className="text-xs text-[#161A2E]/50">against this job description</p>
                    </div>
                  </div>

                  {/* Missing keywords */}
                  {result.missingKeywords?.length > 0 && (
                    <div>
                      <p
                        className="text-[10px] font-mono uppercase tracking-widest text-[#161A2E]/50 mb-1.5"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Missing — this JD mentions, your resume doesn't
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-xs rounded-md"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions?.length > 0 && (
                    <div>
                      <p
                        className="text-[10px] font-mono uppercase tracking-widest text-[#161A2E]/50 mb-1.5"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Tailored bullet suggestions
                      </p>
                      <div className="space-y-2">
                        {result.suggestions.map((s) => (
                          <div key={s.label} className="bg-white border border-[#DDD6C8] rounded-lg p-3">
                            <p className="text-xs text-[#161A2E]/40 line-through mb-1">
                              {result.bullets.find((b) => b.label === s.label)?.text}
                            </p>
                            <p
                              className="text-sm text-[#161A2E] mb-2"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {s.tailored}
                            </p>
                            {applied[s.label] ? (
                              <span className="text-xs text-[#1E8E5A] font-semibold">✓ Applied</span>
                            ) : (
                              <div>
                                <p className="text-[10px] text-[#E2A33B] mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                  ⚠ Verify: only accept if facts match your actual experience
                                </p>
                                <button
                                  type="button"
                                  onClick={() => applySuggestion(s.label, s.tailored)}
                                  className="text-xs font-semibold text-white bg-[#1E8E5A] px-3 py-1.5 rounded hover:bg-[#161A2E] transition-colors"
                                >
                                  Apply to resume
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.suggestions?.length === 0 && result.missingKeywords?.length === 0 && (
                    <p className="text-sm text-[#161A2E]/60">
                      Your resume already matches this job description well!
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={reset}
                    className="w-full py-1.5 text-xs text-[#161A2E]/40 hover:text-[#161A2E] border border-[#DDD6C8] rounded-lg transition-colors"
                  >
                    ↻ Try another job description
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}