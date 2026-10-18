import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

export default function JDMatcherContent({ open, onClose }) {
  const resume = useResumeStore((s) => s.resume);
  const updateExperienceBullet = useResumeStore((s) => s.updateExperienceBullet);
  const updateProjectBullet = useResumeStore((s) => s.updateProjectBullet);

  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState({});
  // drives the score-ring / keyword-pill fill-in animation, one tick after a result lands
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (result) {
      const raf = requestAnimationFrame(() => setAnimateIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setAnimateIn(false);
  }, [result]);

  if (!open) return null;

  const reset = () => {
    setJd("");
    setResult(null);
    setError(null);
    setApplied({});
    setAnimateIn(false);
  };

  function handleClose() {
    onClose();
    reset();
  }

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

  const scoreColor = result && result.matchScore >= 70 ? '#059669' : result && result.matchScore >= 40 ? '#b45309' : '#dc2626';
  const scoreBg    = result && result.matchScore >= 70 ? '#ecfdf5' : result && result.matchScore >= 40 ? '#fffbeb' : '#fef2f2';
  const scoreBorder= result && result.matchScore >= 70 ? '#a7f3d0' : result && result.matchScore >= 40 ? '#fde68a' : '#fca5a5';
  const scoreText  = result && result.matchScore >= 70 ? '#065f46' : result && result.matchScore >= 40 ? '#92400e' : '#991b1b';
  const scoreLabel = result && result.matchScore >= 70 ? 'Strong match' : result && result.matchScore >= 40 ? 'Partial match' : 'Weak match';

  // "Everything already covered" state — celebratory message shown on the
  // left when there's genuinely nothing left to flag (great score, no gaps).
  const isFullyCovered = result && result.suggestions?.length === 0 && result.missingKeywords?.length === 0 && result.matchScore >= 60;
  // Any other case where suggestions came back empty (e.g. after applying
  // the only real improvement, or bullets already match this JD's wording)
  // gets a plain, honest "nothing more to tailor" message instead of either
  // a blank column or a trivial/duplicate suggestion.
  const noMoreSuggestions = result && result.suggestions?.length === 0 && !isFullyCovered;

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <style>{`
        @keyframes rf-pill-pop {
          from { opacity: 0; transform: scale(0.85) translateY(3px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .rf-pill-pop { animation: rf-pill-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
        .rf-ring-fill circle:last-child { transition: stroke-dasharray 0.8s cubic-bezier(0.22,0.61,0.36,1); }
        .rf-hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .rf-hover-lift:hover { transform: translateY(-1px); }
      `}</style>

      <div
        className="rf-modal-in w-full max-w-3xl max-h-[90vh] bg-paper-white rounded-cards overflow-hidden flex flex-col"
        style={{
          border: '1px solid #e0e0e0',
          boxShadow: 'rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="text-2xl text-graphite-ink font-heading leading-none mb-1.5">
              JD Matcher
            </h2>
            <p className="text-[13px] text-ash font-body">
              {result ? `${result.matchScore}/100 match against this job` : 'Paste a job description to tailor your resume'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-buttons transition-colors hover:bg-soft-snow text-ash hover:text-graphite-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">

          {/* Input state — kept narrow & centered, columns don't help before a result exists */}
          {!result && (
            <div className="max-w-xl mx-auto space-y-4">
              <textarea
                rows={8}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full border border-mist rounded-inputs px-4 py-3 text-sm text-graphite-ink placeholder:text-fog focus:outline-none focus:border-iris-violet focus:ring-2 focus:ring-iris-violet/15 transition-all resize-none font-body"
              />
              {error && (
                <p className="text-xs text-[#dc2626] -mt-2 font-body">{error}</p>
              )}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2.5 rounded-buttons text-sm font-semibold text-white transition-colors disabled:opacity-50 font-body"
                style={{ background: loading ? '#a69ea7' : '#7451f2' }}
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
              <p className="text-[10px] text-fog text-center font-body">
                Only your bullets, skills, and this JD are sent — never your personal info.
              </p>
            </div>
          )}

          {/* Results state — 2-column, same information-hierarchy pattern as ATS Checker */}
          {result && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── LEFT COLUMN: Score + applied nudge + missing keywords ── */}
                <div className="space-y-4">
                  <div className="rf-hover-lift flex items-center gap-4 p-4 rounded-cards" style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}>
                    <svg width="64" height="64" viewBox="0 0 40 40" className="shrink-0 rf-ring-fill">
                      <circle cx="20" cy="20" r="15" fill="none" stroke="#e0e0e0" strokeWidth="3" />
                      <circle cx="20" cy="20" r="15" fill="none" stroke={scoreColor} strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={animateIn ? `${(result.matchScore / 100) * 94.2} 94.2` : '0 94.2'}
                        transform="rotate(-90 20 20)" />
                      <text x="20" y="20" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={scoreColor}>
                        {result.matchScore}
                      </text>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold leading-none mb-1 font-heading" style={{ color: scoreText }}>
                        {result.matchScore}/100
                      </p>
                      <p className="text-xs font-semibold font-body" style={{ color: scoreColor }}>
                        {scoreLabel}
                      </p>
                      <p className="text-[10px] mt-0.5 font-body" style={{ color: scoreText + 'aa' }}>
                        against this job description
                      </p>
                    </div>
                    {anyApplied && (
                      <button
                        type="button"
                        onClick={handleReanalyze}
                        disabled={loading}
                        className="shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-buttons border transition-all disabled:opacity-50 font-body"
                        style={{ background: '#ffffff', borderColor: scoreColor + '40', color: scoreText }}
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
                    <div className="rf-hover-lift flex items-center gap-2 px-3 py-2 rounded-inputs" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <span className="text-[#059669] text-sm">✓</span>
                      <p className="text-[11px] text-[#065f46] font-body">
                        {Object.keys(applied).length} suggestion{Object.keys(applied).length > 1 ? 's' : ''} applied — hit Re-analyze to see your updated score.
                      </p>
                    </div>
                  )}

                  {result.missingKeywords?.length > 0 && (
                    <div className="p-4 rounded-cards border border-mist">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-2.5 font-mono">
                        Missing from your resume
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw, i) => (
                          <span key={kw} className="rf-pill-pop px-2.5 py-0.5 text-[11px] rounded-buttons font-body"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', animationDelay: `${i * 30}ms` }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {isFullyCovered && (
                    <div className="text-center py-6 rounded-cards border border-mist">
                      <p className="text-2xl mb-1">🎉</p>
                      <p className="text-sm font-semibold text-graphite-ink font-heading">Strong match!</p>
                      <p className="text-[11px] text-ash font-body">Your resume already matches this job description well.</p>
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN: Tailored bullet suggestions ── */}
                <div className="space-y-4">
                  {result.suggestions?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash mb-2.5 font-mono">
                        Tailored bullet suggestions
                      </p>
                      <div className="space-y-2.5">
                        {result.suggestions.map((s) => (
                          <div key={s.label} className="rf-hover-lift bg-soft-snow border border-mist rounded-cards p-3.5">
                            <p className="text-[11px] text-fog line-through mb-1.5 font-body">
                              {result.bullets.find((b) => b.label === s.label)?.text}
                            </p>
                            <p className="text-sm text-graphite-ink mb-3 leading-relaxed font-body">
                              {s.tailored}
                            </p>
                            {applied[s.label] ? (
                              <span className="text-xs font-semibold text-[#059669] font-body">✓ Applied</span>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[10px] text-[#b45309] font-body">
                                  ⚠ Verify facts match your actual experience
                                </p>
                                <button
                                  type="button"
                                  onClick={() => applySuggestion(s.label, s.tailored)}
                                  className="shrink-0 text-[11px] font-semibold text-white px-3 py-1.5 rounded-buttons transition-colors font-body"
                                  style={{ background: '#7451f2' }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#5952a1'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#7451f2'}
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

                  {noMoreSuggestions && (
                    <div className="text-center py-6 rounded-cards border border-mist">
                      <p className="text-2xl mb-1">✅</p>
                      <p className="text-sm font-semibold text-graphite-ink font-heading">No more bullet tailoring to suggest</p>
                      <p className="text-[11px] text-ash font-body">
                        Your bullets already reflect this JD as well as they honestly can — check the missing keywords on the left instead.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Try another — full width, below both columns */}
              <button
                type="button"
                onClick={reset}
                className="w-full mt-6 py-2.5 text-[11px] text-ash hover:text-graphite-ink border border-mist hover:border-ash rounded-cards transition-all font-body"
              >
                ↻ Try another job description
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}