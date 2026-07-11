// src/components/builder/ExperienceForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";

const inputClass =
  "w-full bg-white border border-[#cbd5e1] rounded-2xl px-3.5 py-2.5 text-[0.8125rem] text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all duration-150";

const labelClass =
  "block text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-1.5";

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
    <div className="space-y-1.5">
      <div className="flex gap-2 items-start">
        <span className="text-[#cbd5e1] mt-2.5 text-[0.75rem] select-none">•</span>
        <textarea
          rows={2}
          placeholder="e.g. Worked on backend APIs using Node.js"
          value={value}
          onChange={(e) => updateExperienceBullet(expId, bulletIdx, e.target.value)}
          className={`${inputClass} resize-none flex-1`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
          <button
            onClick={handleImprove}
            disabled={loading || !canUseAi || !value.trim()}
            title={!canUseAi ? "AI limit reached — upgrade to Premium" : "Improve with AI"}
            className={`text-[0.625rem] font-semibold px-2 py-1 rounded-full border transition-all duration-150 whitespace-nowrap ${
              !canUseAi
                ? "text-amber-500 border-amber-200 bg-amber-50 cursor-not-allowed"
                : loading
                ? "text-[#059669]/50 border-[#059669]/20 cursor-wait"
                : "text-[#059669] border-[#059669]/30 hover:bg-[#059669]/10 disabled:opacity-40"
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {loading ? "···" : canUseAi ? "✨ AI" : "🔒 AI"}
          </button>
          <button
            onClick={() => removeExperienceBullet(expId, bulletIdx)}
            className="text-[0.625rem] text-[#4a6fa5]/50 hover:text-red-400 transition-colors px-2 py-1 rounded-full border border-transparent hover:border-red-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="ml-3.5 text-[0.75rem] text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>
          {error}
        </p>
      )}

      {/* AI Suggestion card */}
      {showSuggestion && improved && (
        <div className="ml-3.5 bg-[#d1fae5] border border-[#059669]/30 rounded-2xl p-2.5 space-y-1.5">
          <p
            className="text-[0.6875rem] font-semibold tracking-widest text-[#059669] uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ✨ AI Suggestion
          </p>
          <p className="text-[0.8125rem] text-[#0a1628]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {improved}
          </p>
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="text-[0.75rem] font-semibold text-white bg-[#059669] px-2.5 py-1 rounded-full hover:bg-[#0a1628] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Accept
            </button>
            <button
              onClick={rejectSuggestion}
              className="text-[0.75rem] text-[#4a6fa5] px-2.5 py-1 rounded-full border border-[#cbd5e1] hover:border-[#4a6fa5] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Reject
            </button>
          </div>
          <p
            className="text-[0.625rem] text-[#4a6fa5]/60"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
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
      <div className="flex items-start justify-between gap-3.5">
        <div>
          <h2
            className="text-[1.375rem] text-[#0a1628]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Experience
          </h2>
          <p
            className="text-[0.75rem] text-[#4a6fa5] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Internships, part-time jobs, freelance work — add all of them.
          </p>
        </div>

        {/* AI usage badge */}
        <div
          className={`flex-shrink-0 text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${
            isPremium || aiLeft > 0
              ? "text-[#059669] border-[#059669]/30 bg-[#d1fae5]"
              : "text-amber-600 border-amber-200 bg-amber-50"
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {isPremium ? "✨ Unlimited AI" : aiLeft > 0 ? `✨ ${aiLeft} AI left` : "🔒 Upgrade for more AI"}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-[#cbd5e1] rounded-3xl p-6 text-center">
          <p
            className="text-[0.8125rem] text-[#4a6fa5] mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No experience added yet.
          </p>
          <p
            className="text-[0.75rem] text-[#4a6fa5]/60 mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Even a 2-week internship counts — add it.
          </p>
          <button
            onClick={addExperience}
            className="text-[0.8125rem] font-semibold text-[#059669] hover:underline"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + Add Experience
          </button>
        </div>
      )}

      {/* Entries */}
      {entries.map((exp, idx) => (
        <div
          key={exp.id}
          className="bg-white border border-[#cbd5e1] rounded-3xl p-4 space-y-3.5"
          style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px -2px" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4a6fa5]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Experience {idx + 1}
            </span>
            <button
              onClick={() => removeExperience(exp.id)}
              className="text-[0.75rem] text-[#4a6fa5]/60 hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                Job Title / Role
              </label>
              <input
                type="text"
                placeholder="Software Engineer Intern"
                value={exp.role}
                onChange={(e) => updateExperience(exp.id, "role", e.target.value)}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
                Company Name
              </label>
              <input
                type="text"
                placeholder="TCS / Startup / Freelance"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
              Duration
            </label>
            <input
              type="text"
              placeholder="June 2024 – August 2024"
              value={exp.duration}
              onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
              What you did — use ✨ AI to improve each bullet
            </label>
            <div className="space-y-2.5">
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
              className="mt-2.5 text-[0.75rem] text-[#4a6fa5]/60 hover:text-[#059669] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              + Add bullet point
            </button>
          </div>
        </div>
      ))}

      {entries.length > 0 && (
        <button
          onClick={addExperience}
          className="w-full border border-dashed border-[#cbd5e1] rounded-3xl py-2.5 text-[0.8125rem] text-[#4a6fa5] hover:border-[#059669] hover:text-[#059669] transition-all duration-150"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          + Add Another Experience
        </button>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
        <p
          className="text-[0.6875rem] text-[#4a6fa5]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Auto-saved to your browser — no account needed
        </p>
      </div>
    </div>
  );
}