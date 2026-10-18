// src/components/builder/ExperienceForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import {
  sectionHeadingClass,
  sectionSubtextClass,
  labelClass,
  entryLabelClass,
  inputClass,
  cardClass,
  autoSaveDotClass,
  autoSaveTextClass,
} from "./formStyles";

// ── AI Bullet Row ─────────────────────────────────────────────
function BulletRow({ expId, bulletIdx, value, canUseAi, onAiUse }) {
  const { updateExperienceBullet, removeExperienceBullet } = useResumeStore();
  const [loading, setLoading] = useState(false);
  const [improved, setImproved] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [error, setError] = useState(null);

  const handleImprove = async () => {
    if (!value.trim() || !canUseAi || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setLoading(false);
        return;
      }

      if (data.improved) {
        setImproved(data.improved);
        setShowSuggestion(true);
        onAiUse();
      }
    } catch (err) {
      setError("Network error. Check your connection.");
    }

    setLoading(false);
  };

  const acceptSuggestion = () => {
    updateExperienceBullet(expId, bulletIdx, improved);
    setShowSuggestion(false);
    setImproved(null);
  };

  const rejectSuggestion = () => {
    setShowSuggestion(false);
    setImproved(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-start">
        <span className="text-mist mt-2.5 text-xs select-none font-body">•</span>
        <textarea
          rows={2}
          placeholder="e.g. Worked on backend APIs using Node.js"
          value={value}
          onChange={(e) => updateExperienceBullet(expId, bulletIdx, e.target.value)}
          className={`${inputClass} resize-none flex-1`}
        />
        <div className="flex flex-col gap-1.5 flex-shrink-0 mt-0.5">
          <button
            onClick={handleImprove}
            disabled={loading || !canUseAi || !value.trim()}
            title={!canUseAi ? "AI limit reached — upgrade to Premium" : "Improve with AI"}
            className={`font-body text-[0.625rem] font-semibold px-2 py-1 rounded-buttons border transition-all duration-150 whitespace-nowrap ${
              !canUseAi
                ? "text-warning-text border-warning-border bg-warning-bg cursor-not-allowed"
                : loading
                ? "text-iris-violet/50 border-iris-violet/20 cursor-wait"
                : "text-iris-violet border-iris-violet/30 hover:bg-iris-violet/10 disabled:opacity-40"
            }`}
          >
            {loading ? "···" : canUseAi ? "✨ AI" : "🔒 AI"}
          </button>
          <button
            onClick={() => removeExperienceBullet(expId, bulletIdx)}
            className="font-body text-[0.625rem] text-fog hover:text-error-text transition-colors px-2 py-1 rounded-buttons border border-transparent hover:border-error-border"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="ml-3.5 font-body text-xs text-error-text">
          {error}
        </p>
      )}

      {/* AI Suggestion card */}
      {showSuggestion && improved && (
        <div className="ml-3.5 bg-success-bg border border-success-border rounded-cards p-4 space-y-2">
          <p className="font-mono text-[0.6875rem] font-medium tracking-wide text-success-text uppercase">
            ✨ AI Suggestion
          </p>
          <p className="font-body text-[0.8125rem] text-graphite-ink">
            {improved}
          </p>
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="font-body text-xs font-semibold text-paper-white bg-success-text px-2.5 py-1 rounded-buttons hover:bg-graphite-ink transition-colors"
            >
              Accept
            </button>
            <button
              onClick={rejectSuggestion}
              className="font-body text-xs text-ash px-2.5 py-1 rounded-buttons border border-mist hover:border-ash transition-colors"
            >
              Reject
            </button>
          </div>
          <p className="font-body text-[0.625rem] text-fog">
            Only this bullet was sent for improvement — never your personal info.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────
export default function ExperienceForm() {
  const {
    resume,
    addExperience,
    updateExperience,
    addExperienceBullet,
    removeExperience,
    aiUsageCount,
    incrementAiUsage,
    canUseAi,
  } = useResumeStore();

  const entries = resume.experience;
  const isPremium = useAuthStore((s) => s.isPremium());
  const aiLeft = 3 - aiUsageCount;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={sectionHeadingClass}>Experience</h2>
          <p className={sectionSubtextClass}>
            Internships, part-time jobs, freelance work — add all of them.
          </p>
        </div>

        {/* AI usage badge */}
        <div
          className={`flex-shrink-0 font-body text-[0.6875rem] font-semibold px-2.5 py-1 rounded-buttons border whitespace-nowrap ${
            isPremium || aiLeft > 0
              ? "text-success-text border-success-border bg-success-bg"
              : "text-warning-text border-warning-border bg-warning-bg"
          }`}
        >
          {isPremium ? "✨ Unlimited AI" : aiLeft > 0 ? `✨ ${aiLeft} AI left` : "🔒 Upgrade for more AI"}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-mist rounded-cards p-6 text-center">
          <p className="font-body text-[0.8125rem] text-ash mb-1">
            No experience added yet.
          </p>
          <p className="font-body text-xs text-fog mb-2.5">
            Even a 2-week internship counts — add it.
          </p>
          <button
            onClick={addExperience}
            className="font-body text-[0.8125rem] font-semibold text-iris-violet hover:underline"
          >
            + Add Experience
          </button>
        </div>
      )}

      {/* Entries */}
      {entries.map((exp, idx) => (
        <div key={exp.id} className={`${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <span className={entryLabelClass}>
              Experience {idx + 1}
            </span>
            <button
              onClick={() => removeExperience(exp.id)}
              className="font-body text-xs text-fog hover:text-error-text transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Title / Role</label>
              <input
                type="text"
                placeholder="Software Engineer Intern"
                value={exp.role}
                onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                type="text"
                placeholder="TCS / Startup / Freelance"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Duration</label>
            <input
              type="text"
              placeholder="June 2024 – August 2024"
              value={exp.duration}
              onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              What you did — use ✨ AI to improve each bullet
            </label>
            <div className="space-y-4 mt-2">
              {exp.bullets.map((bullet, bIdx) => (
                <BulletRow
                  key={bIdx}
                  expId={exp.id}
                  bulletIdx={bIdx}
                  value={bullet}
                  canUseAi={canUseAi()}
                  onAiUse={incrementAiUsage}
                />
              ))}
            </div>
            <button
              onClick={() => addExperienceBullet(exp.id)}
              className="mt-2.5 font-body text-xs text-fog hover:text-iris-violet transition-colors"
            >
              + Add bullet point
            </button>
          </div>
        </div>
      ))}

      {entries.length > 0 && (
        <button
          onClick={addExperience}
          className="w-full border border-dashed border-mist rounded-cards py-2 font-body text-[0.8125rem] text-ash hover:border-iris-violet hover:text-iris-violet transition-all duration-150"
        >
          + Add Another Experience
        </button>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <span className={autoSaveDotClass} />
        <p className={autoSaveTextClass}>
          Auto-saved to your browser — no account needed
        </p>
      </div>
    </div>
  );
}