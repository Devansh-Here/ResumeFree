import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";

function collectBullets(resume) {
  const items = [];
  resume.experience.forEach((exp, i) => {
    exp.bullets.forEach((b, j) => {
      if (b && b.trim()) {
        items.push({ label: `E${i + 1}-B${j + 1}`, type: "experience", entryId: exp.id, bulletIdx: j, text: b });
      }
    });
  });
  resume.projects.forEach((proj, i) => {
    proj.bullets.forEach((b, j) => {
      if (b && b.trim()) {
        items.push({ label: `P${i + 1}-B${j + 1}`, type: "project", entryId: proj.id, bulletIdx: j, text: b });
      }
    });
  });
  return items;
}

export default function JDMatcherContent({ onClose }) {
  const resume = useResumeStore((s) => s.resume);
  const updateExperienceBullet = useResumeStore((s) => s.updateExperienceBullet);
  const updateProjectBullet = useResumeStore((s) => s.updateProjectBullet);

  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState({});

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
        body: JSON.stringify({ bullets: bullets.map(({ label, text }) => ({ label, text })), skills, jobDescription: jd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not analyze. Try again.");
      setResult({ ...data, bullets });
      setApplied({});
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleReanalyze = () => {
    const savedJd = jd;
    setResult(null);
    setError(null);
    setApplied({});
    setJd(savedJd);
    setTimeout(() => handleAnalyze(), 50);
  };

  const applySuggestion = (label, tailored) => {
    const bullet = result.bullets.find((b) => b.label === label);
    if (!bullet) return;
    if (bullet.type === "experience") updateExperienceBullet(bullet.entryId, bullet.bulletIdx, tailored);
    else updateProjectBullet(bullet.entryId, bullet.bulletIdx, tailored);
    setApplied((prev) => ({ ...prev, [label]: true }));
  };

  const anyApplied = Object.keys(applied).length > 0;

  const scoreColor = result && result.matchScore >= 70 ? '#059669' : result && result.matchScore >= 40 ? '#d97706' : '#dc2626';
  const scoreBg    = result && result.matchScore >= 70 ? '#d1fae5' : result && result.matchScore >= 40 ? '#fef3c7' : '#fee2e2';
  const scoreText  = result && result.matchScore >= 70 ? '#065f46' : result && result.matchScore >= 40 ? '#92400e' : '#991b1b';
  const scoreLabel = result && result.matchScore >= 70 ? 'Strong match' : result && result.matchScore >= 40 ? 'Partial match' : 'Weak match';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h2 className="text-base font-semibold text-[#0a1628] leading-none mb-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>
            JD Matcher
          </h2>
          <p className="text-[11px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {result ? `${result.matchScore}/100 match against this job` : 'Paste a job description to tailor your resume'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { onClose(); reset(); }}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[#f1f5f9] text-[#4a6fa5] hover:text-[#0a1628] text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
        {!result && (
          <>
            <textarea
              rows={7}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/40 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all resize-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            {error && (
              <p className="text-xs text-red-500 -mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
            )}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: loading ? '#4a6fa5' : '#0a1628', fontFamily: "'Inter', sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing…
                </span>
              ) : 'Analyze match'}
            </button>
            <p className="text-[10px] text-[#4a6fa5]/50 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
              Only your bullets, skills, and this JD are sent — never your personal info.
            </p>
          </>
        )}

        {result && (
          <>
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: scoreBg, border: `1px solid ${scoreColor}25` }}>
              <svg width="56" height="56" viewBox="0 0 40 40" className="shrink-0">
                <circle cx="20" cy="20" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="20" cy="20" r="15" fill="none" stroke={scoreColor} strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.matchScore / 100) * 94.2} 94.2`}
                  transform="rotate(-90 20 20)" />
                <text x="20" y="20" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={scoreColor}>
                  {result.matchScore}
                </text>
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: scoreText, fontFamily: "'DM Serif Display', serif" }}>
                  {result.matchScore}/100
                </p>
                <p className="text-xs font-semibold" style={{ color: scoreColor, fontFamily: "'Inter', sans-serif" }}>
                  {scoreLabel}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: scoreText + 'aa', fontFamily: "'Inter', sans-serif" }}>
                  against this job description
                </p>
              </div>
              {anyApplied && (
                <button
                  type="button"
                  onClick={handleReanalyze}
                  disabled={loading}
                  className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition-all disabled:opacity-50"
                  style={{ background: 'white', borderColor: scoreColor + '40', color: scoreText, fontFamily: "'Inter', sans-serif" }}
                >
                  {loading ? (
                    <svg className="animate-spin h-2.5 w-2.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : '↻'}
                  {loading ? 'Updating…' : 'Re-analyze'}
                </button>
              )}
            </div>

            {anyApplied && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
                <span className="text-[#059669] text-sm">✓</span>
                <p className="text-[11px] text-[#065f46]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {Object.keys(applied).length} suggestion{Object.keys(applied).length > 1 ? 's' : ''} applied — hit Re-analyze to see your updated score.
                </p>
              </div>
            )}

            {result.missingKeywords?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Missing from your resume
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.map((kw) => (
                    <span key={kw} className="px-2.5 py-0.5 text-[11px] rounded-full"
                      style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontFamily: "'Inter', sans-serif" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4a6fa5] mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Tailored bullet suggestions
                </p>
                <div className="space-y-2.5">
                  {result.suggestions.map((s) => (
                    <div key={s.label} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-3.5">
                      <p className="text-[11px] text-[#4a6fa5]/60 line-through mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {result.bullets.find((b) => b.label === s.label)?.text}
                      </p>
                      <p className="text-sm text-[#0a1628] mb-3 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {s.tailored}
                      </p>
                      {applied[s.label] ? (
                        <span className="text-xs font-semibold text-[#059669]" style={{ fontFamily: "'Inter', sans-serif" }}>✓ Applied</span>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-[#d97706]" style={{ fontFamily: "'Inter', sans-serif" }}>
                            ⚠ Verify facts match your actual experience
                          </p>
                          <button
                            type="button"
                            onClick={() => applySuggestion(s.label, s.tailored)}
                            className="shrink-0 text-[11px] font-semibold text-white px-3 py-1.5 rounded-full transition-colors hover:bg-[#1e3a5f]"
                            style={{ background: '#0a1628', fontFamily: "'Inter', sans-serif" }}
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions?.length === 0 && result.missingKeywords?.length === 0 && result.matchScore >= 60 && (
              <div className="text-center py-4">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-sm font-semibold text-[#0a1628]" style={{ fontFamily: "'DM Serif Display', serif" }}>Strong match!</p>
                <p className="text-[11px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>Your resume already matches this job description well.</p>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="w-full py-2 text-[11px] text-[#4a6fa5] hover:text-[#0a1628] border border-[#cbd5e1] hover:border-[#4a6fa5] rounded-2xl transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ↻ Try another job description
            </button>
          </>
        )}
      </div>
    </>
  );
}