import { useState } from "react";
import { CATEGORY_LABELS } from "../../utils/atsCheck";

const VISIBLE_KEYWORD_LIMIT = 18;

function getScoreTone(score) {
  if (score >= 75) return { label: "Strong", text: "text-success-text", bg: "bg-success-bg", border: "border-success-border", ring: "#059669" };
  if (score >= 50) return { label: "Good", text: "text-info-text", bg: "bg-info-bg", border: "border-info-border", ring: "#0072c6" };
  if (score >= 25) return { label: "Needs work", text: "text-warning-text", bg: "bg-warning-bg", border: "border-warning-border", ring: "#b45309" };
  return { label: "Early draft", text: "text-error-text", bg: "bg-error-bg", border: "border-error-border", ring: "#dc2626" };
}

function ScoreRing({ score, tone }) {
  const circumference = 2 * Math.PI * 42;
  const progress = (Math.max(0, Math.min(score, 100)) / 100) * circumference;

  return (
    <div className="relative h-32 w-32 shrink-0" aria-label={`ATS score ${score} out of 100`}>
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" className="text-mist/60" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={tone.ring}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-700 ease-overshoot"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[32px] leading-none text-graphite-ink">{score}</span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-fog">out of 100</span>
      </div>
    </div>
  );
}

function Reveal({ children, index = 0, className = "" }) {
  return (
    <section
      className={`motion-safe:animate-[rf-modal-in_220ms_var(--ease-overshoot)] motion-reduce:animate-none ${className}`}
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
    >
      {children}
    </section>
  );
}

function KeywordGroup({ title, keywords, tone, emptyText }) {
  const visibleKeywords = keywords.slice(0, VISIBLE_KEYWORD_LIMIT);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">{title}</h3>
        <span className="font-body text-[12px] text-fog">{keywords.length}</span>
      </div>
      {visibleKeywords.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {visibleKeywords.map(({ word }) => (
            <span key={word} className={`border px-2.5 py-1 font-body text-[12px] ${tone.bg} ${tone.border} ${tone.text} rounded-tags`}>
              {word}
            </span>
          ))}
        </div>
      ) : (
        <p className="font-body text-[13px] text-fog">{emptyText}</p>
      )}
      {keywords.length > VISIBLE_KEYWORD_LIMIT && (
        <p className="font-body text-[12px] text-fog">Showing the first {VISIBLE_KEYWORD_LIMIT} keywords.</p>
      )}
    </div>
  );
}

function JdMatchSection({ jd, setJd, jdState, jdResult, jdError, onAnalyze, onReset, onCopy, hasAccess, onUpgrade }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const loading = jdState === "loading";

  async function copySuggestion(key, text) {
    const copied = await onCopy(text);
    if (!copied) return;
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }

  return (
    <div className="border border-violet-wash-border bg-violet-wash p-5 sm:p-6 rounded-cards">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-iris-violet">Tailor for a job</p>
          <h3 className="mt-2 font-heading text-[20px] text-graphite-ink">See how this resume matches a real role</h3>
        </div>
        {!hasAccess && <span className="shrink-0 rounded-tags bg-paper-white px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-deep-iris">Premium</span>}
      </div>

      {!hasAccess ? (
        <>
          <p className="mt-3 max-w-xl font-body text-[14px] leading-relaxed text-ash">
            Basic ATS feedback is free. Unlock JD-specific keyword gaps and conservative bullet suggestions with the existing JD Tailoring access.
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-5 inline-flex items-center gap-2 bg-graphite-ink px-4 py-2.5 font-body text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-deep-iris active:scale-[0.97] rounded-buttons"
          >
            Unlock JD tailoring <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
        </>
      ) : (
        <>
          {!jdResult && (
            <>
              <label htmlFor="resume-checker-jd" className="sr-only">Paste job description</label>
              <textarea
                id="resume-checker-jd"
                rows={7}
                value={jd}
                onChange={(event) => setJd(event.target.value)}
                placeholder="Paste the job description here…"
                disabled={loading}
                className="mt-5 w-full resize-none border border-iris-violet/25 bg-paper-white px-4 py-3 font-body text-[14px] leading-relaxed text-graphite-ink outline-none transition-all duration-150 placeholder:text-fog focus:border-iris-violet focus:ring-2 focus:ring-iris-violet rounded-inputs disabled:bg-soft-snow"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-body text-[12px] text-ash">Only extracted resume text and this job description are sent for matching.</p>
                <button
                  type="button"
                  onClick={onAnalyze}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 bg-iris-violet px-4 py-2.5 font-body text-[13px] font-semibold text-white shadow-cta transition-all duration-200 hover:-translate-y-0.5 hover:bg-deep-iris active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 rounded-buttons"
                >
                  {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />}
                  {loading ? "Analyzing…" : "Analyze match"}
                </button>
              </div>
            </>
          )}

          {jdError && (
            <div className="mt-4 flex items-start justify-between gap-4 border border-error-border bg-error-bg px-4 py-3 rounded-cards" role="alert">
              <p className="font-body text-[13px] leading-relaxed text-error-text">{jdError}</p>
              <button type="button" onClick={onAnalyze} className="shrink-0 font-body text-[12px] font-semibold text-error-text underline underline-offset-2">Retry</button>
            </div>
          )}

          {jdResult && (
            <div className="mt-5 space-y-5">
              <div className="flex flex-col gap-4 border border-mist bg-paper-white p-4 sm:flex-row sm:items-center rounded-cards">
                <div>
                  <p className="font-heading text-[32px] leading-none text-graphite-ink">{jdResult.matchScore}/100</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-iris-violet">Deterministic match score</p>
                </div>
                <p className="font-body text-[13px] leading-relaxed text-ash">This score is based on word overlap between the job description and your extracted resume text. It is not an AI-generated percentage.</p>
              </div>

              {jdResult.missingKeywords?.length > 0 && (
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Keywords to review</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {jdResult.missingKeywords.map((keyword) => (
                      <span key={keyword} className="border border-warning-border bg-warning-bg px-2.5 py-1 font-body text-[12px] text-warning-text rounded-tags">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}

              {jdResult.suggestions?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">Conservative bullet suggestions</h4>
                  {jdResult.suggestions.map((suggestion) => (
                    <div key={`${suggestion.label}-${suggestion.tailored}`} className="border border-mist bg-paper-white p-4 rounded-cards">
                      <p className="font-body text-[12px] leading-relaxed text-fog line-through">{suggestion.original}</p>
                      <p className="mt-2 font-body text-[14px] leading-relaxed text-graphite-ink">{suggestion.tailored}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="font-body text-[11px] text-warning-text">Review every fact before using it.</p>
                        <button
                          type="button"
                          onClick={() => copySuggestion(suggestion.label, suggestion.tailored)}
                          className="shrink-0 border border-deep-iris px-3 py-1.5 font-body text-[12px] font-semibold text-deep-iris transition-all duration-200 hover:-translate-y-0.5 hover:bg-deep-iris hover:text-white active:scale-[0.97] rounded-buttons"
                        >
                          {copiedKey === suggestion.label ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="button" onClick={onReset} className="border border-deep-iris px-4 py-2 font-body text-[13px] font-semibold text-deep-iris transition-all duration-200 hover:-translate-y-0.5 hover:bg-deep-iris hover:text-white active:scale-[0.97] rounded-buttons">Try another job description</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CheckerResultsPanel({ result, extractionWarning, jd, setJd, jdState, jdResult, jdError, onAnalyzeJd, onResetJd, onCopy, hasJdAccess, onUpgrade, onScanAnother }) {
  const tone = getScoreTone(result.score);
  const categories = Object.entries(result.categoryBreakdown).filter(([, data]) => data.relevant);

  return (
    <div className="space-y-6" aria-live="polite">
      <Reveal index={0} className={`border ${tone.border} ${tone.bg} p-5 sm:p-7 rounded-cards`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing score={result.score} tone={tone} />
          <div className="min-w-0">
            <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${tone.text}`}>{tone.label} ATS foundation</p>
            <h2 className="mt-2 font-heading text-[32px] leading-tight text-graphite-ink">Your resume has a starting signal.</h2>
            <p className="mt-2 max-w-xl font-body text-[14px] leading-relaxed text-ash">This basic score checks role-relevant keywords already present in the extracted text. It is guidance, not a hiring decision.</p>
          </div>
        </div>
      </Reveal>

      {extractionWarning && (
        <Reveal index={1} className="flex items-start gap-3 border border-warning-border bg-warning-bg px-4 py-3 rounded-cards">
          <span className="font-mono text-[11px] text-warning-text" aria-hidden="true">!</span>
          <p className="font-body text-[13px] leading-relaxed text-warning-text">{extractionWarning}</p>
        </Reveal>
      )}

      <Reveal index={2} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-mist bg-paper-white p-5 rounded-cards">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog">Role signal</p>
          <p className="mt-3 font-heading text-[20px] text-graphite-ink">{result.roleLabel}</p>
          <p className="mt-2 font-body text-[13px] leading-relaxed text-ash">The report uses this role profile to decide which keywords are most relevant.</p>
        </div>
        <div className="border border-mist bg-paper-white p-5 rounded-cards">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog">Category coverage</p>
          <div className="mt-4 space-y-3">
            {categories.map(([category, data], index) => {
              const percentage = data.total ? Math.round((data.found / data.total) * 100) : 0;
              return (
                <div key={category} className="motion-safe:animate-[rf-modal-in_220ms_var(--ease-overshoot)] motion-reduce:animate-none" style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}>
                  <div className="flex items-center justify-between gap-4 font-body text-[12px] text-ash">
                    <span>{CATEGORY_LABELS[category] || category}</span>
                    <span>{data.found}/{data.total}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden bg-soft-snow rounded-tags">
                    <div className="h-full bg-iris-violet transition-all duration-700 ease-overshoot" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal index={3} className="grid gap-6 md:grid-cols-2">
        <div className="border border-success-border bg-success-bg p-5 rounded-cards">
          <KeywordGroup title="Keywords found" keywords={result.matched} tone={{ bg: "bg-paper-white", border: "border-success-border", text: "text-success-text" }} emptyText="No role keywords were detected yet." />
        </div>
        <div className="border border-warning-border bg-warning-bg p-5 rounded-cards">
          <KeywordGroup title="Keywords to consider" keywords={result.missing} tone={{ bg: "bg-paper-white", border: "border-warning-border", text: "text-warning-text" }} emptyText="Nice start — no missing keywords in this profile." />
        </div>
      </Reveal>

      <Reveal index={4}>
        <JdMatchSection
          jd={jd}
          setJd={setJd}
          jdState={jdState}
          jdResult={jdResult}
          jdError={jdError}
          onAnalyze={onAnalyzeJd}
          onReset={onResetJd}
          onCopy={onCopy}
          hasAccess={hasJdAccess}
          onUpgrade={onUpgrade}
        />
      </Reveal>

      <button type="button" onClick={onScanAnother} className="w-full border border-deep-iris bg-paper-white px-4 py-3 font-body text-[13px] font-semibold text-deep-iris transition-all duration-200 hover:-translate-y-0.5 hover:bg-deep-iris hover:text-white active:scale-[0.97] rounded-buttons">Scan another resume</button>
    </div>
  );
}
