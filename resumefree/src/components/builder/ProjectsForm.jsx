// src/components/builder/ProjectsForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";

const inputClass =
  "w-full bg-white border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all duration-150";

const labelClass =
  "block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2";

// ── AI Bullet Row ─────────────────────────────────────────────
function BulletRow({ projId, bulletIdx, value, canUseAi, onAiUse }) {
  const { updateProjectBullet, removeProjectBullet } = useResumeStore();
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
    updateProjectBullet(projId, bulletIdx, improved);
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
        <span className="text-[#cbd5e1] mt-3 text-xs select-none">•</span>
        <textarea
          rows={2}
          placeholder="e.g. Built a web app using React and Node.js"
          value={value}
          onChange={(e) => updateProjectBullet(projId, bulletIdx, e.target.value)}
          className={`${inputClass} resize-none flex-1`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
          <button
            onClick={handleImprove}
            disabled={loading || !canUseAi || !value.trim()}
            title={!canUseAi ? "AI limit reached — upgrade to Premium" : "Improve with AI"}
            className={`text-[10px] font-semibold px-2 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
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
            onClick={() => removeProjectBullet(projId, bulletIdx)}
            className="text-[10px] text-[#4a6fa5]/50 hover:text-red-400 transition-colors px-2 py-1.5 rounded-full border border-transparent hover:border-red-200"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <p className="ml-4 text-xs text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>
          {error}
        </p>
      )}

      {showSuggestion && improved && (
        <div className="ml-4 bg-[#d1fae5] border border-[#059669]/30 rounded-2xl p-3 space-y-2">
          <p
            className="text-[11px] font-semibold tracking-widest text-[#059669] uppercase"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ✨ AI Suggestion
          </p>
          <p className="text-sm text-[#0a1628]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {improved}
          </p>
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="text-xs font-semibold text-white bg-[#059669] px-3 py-1.5 rounded-full hover:bg-[#0a1628] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Accept
            </button>
            <button
              onClick={rejectSuggestion}
              className="text-xs text-[#4a6fa5] px-3 py-1.5 rounded-full border border-[#cbd5e1] hover:border-[#4a6fa5] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Reject
            </button>
          </div>
          <p
            className="text-[10px] text-[#4a6fa5]/60"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Only this bullet was sent for improvement — never your personal info.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tech Stack Tags ───────────────────────────────────────────
function TechStackInput({ projId, techStack }) {
  const { updateProject } = useResumeStore();
  const [input, setInput] = useState("");

  const handleAdd = (tech) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      updateProject(projId, "techStack", [...techStack, trimmed]);
    }
    setInput("");
  };

  const handleRemove = (tech) => {
    updateProject(projId, "techStack", techStack.filter((t) => t !== tech));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) handleAdd(input);
    }
    if (e.key === "Backspace" && !input && techStack.length > 0) {
      handleRemove(techStack[techStack.length - 1]);
    }
  };

  return (
    <div>
      <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
        Tech Stack
      </label>
      <div
        className="min-h-[48px] flex flex-wrap gap-2 p-3 bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl cursor-text focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/15 transition-all duration-150"
        onClick={() => document.getElementById(`tech-${projId}`).focus()}
      >
        {techStack.map((tech) => (
          <span
            key={tech}
            className="flex items-center gap-1 bg-white border border-[#cbd5e1] text-[#0a1628] text-xs px-3 py-1 rounded-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {tech}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(tech); }}
              className="text-[#4a6fa5]/50 hover:text-red-400 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={`tech-${projId}`}
          type="text"
          value={input}
          placeholder={techStack.length === 0 ? "e.g. React.js, Node.js, MongoDB" : ""}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>
      <p
        className="text-[11px] text-[#4a6fa5]/60 mt-1.5"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Press Enter or comma to add each technology
      </p>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────
export default function ProjectsForm() {
  const {
    resume,
    addProject,
    updateProject,
    addProjectBullet,
    removeProject,
    aiUsageCount,
    incrementAiUsage,
    canUseAi,
  } = useResumeStore();

  const entries = resume.projects;
  const isPremium = useAuthStore((s) => s.isPremium());
  const aiLeft = 3 - aiUsageCount;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-2xl text-[#0a1628]"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Projects
          </h2>
          <p
            className="text-xs text-[#4a6fa5] mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            College projects, personal projects, hackathons — all count.
          </p>
        </div>

        {/* AI usage badge */}
        <div
          className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap ${
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
        <div className="border border-dashed border-[#cbd5e1] rounded-3xl p-8 text-center">
          <p
            className="text-sm text-[#4a6fa5] mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No projects added yet.
          </p>
          <p
            className="text-xs text-[#4a6fa5]/60 mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Even a college assignment project counts — add it.
          </p>
          <button
            onClick={addProject}
            className="text-sm font-semibold text-[#059669] hover:underline"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + Add Project
          </button>
        </div>
      )}

      {/* Project entries */}
      {entries.map((proj, idx) => (
        <div
          key={proj.id}
          className="bg-white border border-[#cbd5e1] rounded-3xl p-5 space-y-4"
          style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px -2px" }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Project {idx + 1}
            </span>
            <button
              onClick={() => removeProject(proj.id)}
              className="text-xs text-[#4a6fa5]/60 hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Remove
            </button>
          </div>

          {/* Project Name */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Inventory Management System"
              value={proj.name}
              onChange={(e) => updateProject(proj.id, "name", e.target.value)}
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* Tech Stack */}
          <TechStackInput projId={proj.id} techStack={proj.techStack} />

          {/* Bullets */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
              What you built — use ✨ AI to improve each bullet
            </label>
            <div className="space-y-3">
              {proj.bullets.map((bullet, bIdx) => (
                <BulletRow
                  key={bIdx}
                  projId={proj.id}
                  bulletIdx={bIdx}
                  value={bullet}
                  canUseAi={canUseAi()}
                  onAiUse={incrementAiUsage}
                />
              ))}
            </div>
            <button
              onClick={() => addProjectBullet(proj.id)}
              className="mt-3 text-xs text-[#4a6fa5]/60 hover:text-[#059669] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              + Add bullet point
            </button>
          </div>
        </div>
      ))}

      {entries.length > 0 && (
        <button
          onClick={addProject}
          className="w-full border border-dashed border-[#cbd5e1] rounded-3xl py-3 text-sm text-[#4a6fa5] hover:border-[#059669] hover:text-[#059669] transition-all duration-150"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          + Add Another Project
        </button>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
        <p
          className="text-[11px] text-[#4a6fa5]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Auto-saved to your browser — no account needed
        </p>
      </div>
    </div>
  );
}