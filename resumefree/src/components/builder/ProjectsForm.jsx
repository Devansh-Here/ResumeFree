// src/components/builder/ProjectsForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";

const inputClass =
  "w-full bg-white border border-[#DDD6C8] rounded-lg px-3 py-2.5 text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 focus:outline-none focus:border-[#161A2E] focus:ring-1 focus:ring-[#161A2E]/10 transition-colors";

const labelClass =
  "block text-[10px] font-mono tracking-widest uppercase text-[#161A2E]/50 mb-1.5";

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
        <span className="text-[#DDD6C8] mt-2.5 text-xs select-none">•</span>
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
            className={`text-[10px] font-mono px-2 py-1.5 rounded border transition-colors whitespace-nowrap ${
              !canUseAi
                ? "text-[#E2A33B] border-[#E2A33B]/30 bg-[#E2A33B]/5 cursor-not-allowed"
                : loading
                ? "text-[#1E8E5A]/50 border-[#1E8E5A]/20 cursor-wait"
                : "text-[#1E8E5A] border-[#1E8E5A]/30 hover:bg-[#1E8E5A]/10 disabled:opacity-40"
            }`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {loading ? "···" : canUseAi ? "✨ AI" : "🔒 AI"}
          </button>
          <button
            onClick={() => removeProjectBullet(projId, bulletIdx)}
            className="text-[10px] text-[#161A2E]/25 hover:text-red-400 transition-colors px-2 py-1.5 rounded border border-transparent hover:border-red-200"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
        <div className="ml-4 bg-[#F6F4EF] border border-[#1E8E5A]/30 rounded-lg p-3 space-y-2">
          <p
            className="text-[10px] font-mono tracking-widest text-[#1E8E5A] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            ✨ AI Suggestion
          </p>
          <p className="text-sm text-[#161A2E]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {improved}
          </p>
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="text-xs font-semibold text-white bg-[#1E8E5A] px-3 py-1.5 rounded hover:bg-[#161A2E] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Accept
            </button>
            <button
              onClick={rejectSuggestion}
              className="text-xs text-[#161A2E]/50 px-3 py-1.5 rounded border border-[#DDD6C8] hover:border-[#161A2E]/30 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Reject
            </button>
          </div>
          <p
            className="text-[10px] text-[#161A2E]/30"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
      <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        Tech Stack
      </label>
      <div
        className="min-h-[44px] flex flex-wrap gap-2 p-2.5 bg-white border border-[#DDD6C8] rounded-lg cursor-text focus-within:border-[#161A2E] transition-colors"
        onClick={() => document.getElementById(`tech-${projId}`).focus()}
      >
        {techStack.map((tech) => (
          <span
            key={tech}
            className="flex items-center gap-1 bg-[#F6F4EF] border border-[#DDD6C8] text-[#161A2E] text-xs px-2.5 py-1 rounded-full"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {tech}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(tech); }}
              className="text-[#161A2E]/30 hover:text-red-400 transition-colors"
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
          className="flex-1 min-w-[140px] bg-transparent text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>
      <p
        className="text-[10px] text-[#161A2E]/30 mt-1.5"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
  const aiLeft = 3 - aiUsageCount;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-lg font-bold text-[#161A2E]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Projects
          </h2>
          <p
            className="text-xs text-[#161A2E]/45 mt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            College projects, personal projects, hackathons — all count.
          </p>
        </div>

        {/* AI usage badge */}
        <div
          className={`flex-shrink-0 text-[10px] font-mono px-2.5 py-1.5 rounded-full border whitespace-nowrap ${
            aiLeft > 0
              ? "text-[#1E8E5A] border-[#1E8E5A]/30 bg-[#1E8E5A]/8"
              : "text-[#E2A33B] border-[#E2A33B]/30 bg-[#E2A33B]/8"
          }`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {aiLeft > 0 ? `✨ ${aiLeft} AI left` : "🔒 Upgrade for more AI"}
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-[#DDD6C8] rounded-xl p-8 text-center">
          <p
            className="text-sm text-[#161A2E]/40 mb-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No projects added yet.
          </p>
          <p
            className="text-xs text-[#161A2E]/30 mb-4"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Even a college assignment project counts — add it.
          </p>
          <button
            onClick={addProject}
            className="text-sm font-semibold text-[#1E8E5A] hover:underline"
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
          className="bg-white border border-[#DDD6C8] rounded-xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono tracking-widest text-[#161A2E]/40 uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Project {idx + 1}
            </span>
            <button
              onClick={() => removeProject(proj.id)}
              className="text-xs text-[#161A2E]/30 hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Remove
            </button>
          </div>

          {/* Project Name */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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
            <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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
              className="mt-3 text-xs text-[#161A2E]/40 hover:text-[#1E8E5A] transition-colors"
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
          className="w-full border border-dashed border-[#DDD6C8] rounded-xl py-3 text-sm text-[#161A2E]/40 hover:border-[#1E8E5A] hover:text-[#1E8E5A] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          + Add Another Project
        </button>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E5A] flex-shrink-0" />
        <p
          className="text-[11px] text-[#161A2E]/35"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Auto-saved to your browser — no account needed
        </p>
      </div>
    </div>
  );
}