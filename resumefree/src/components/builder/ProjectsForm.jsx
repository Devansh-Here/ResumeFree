// src/components/builder/ProjectsForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import {
  sectionHeadingClass,
  sectionSubtextClass,
  entryLabelClass,
  labelClass,
  inputClass,
  cardClass,
  autoSaveDotClass,
  autoSaveTextClass,
} from "./formStyles";

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
    <div className="space-y-1.5">
      <div className="flex gap-2 items-start">
        <span className="font-body text-mist mt-2.5 text-[14px] select-none">•</span>
        <textarea
          rows={2}
          placeholder="e.g. Built a web app using React and Node.js"
          value={value}
          onChange={(e) => updateProjectBullet(projId, bulletIdx, e.target.value)}
          className={`${inputClass} resize-none flex-1`}
        />
        <div className="flex flex-col gap-1 flex-shrink-0 mt-0.5">
          <button
            onClick={handleImprove}
            disabled={loading || !canUseAi || !value.trim()}
            title={!canUseAi ? "AI limit reached — upgrade to Premium" : "Improve with AI"}
            className={`font-body text-[11px] font-semibold px-2 py-1 rounded-buttons border transition-all duration-150 whitespace-nowrap ${
              !canUseAi
                ? "text-warning-text border-warning-border bg-warning-bg cursor-not-allowed"
                : loading
                ? "text-iris-violet/50 border-iris-violet/20 cursor-wait"
                : "text-iris-violet border-deep-iris/40 hover:bg-iris-violet/10 disabled:opacity-40"
            }`}
          >
            {loading ? "···" : canUseAi ? "✨ AI" : "🔒 AI"}
          </button>
          <button
            onClick={() => removeProjectBullet(projId, bulletIdx)}
            className="font-body text-[11px] text-fog hover:text-error-text transition-colors px-2 py-1 rounded-buttons border border-transparent hover:border-error-border"
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <p className="ml-3.5 font-body text-[12px] text-error-text">{error}</p>
      )}

      {showSuggestion && improved && (
        <div className="ml-3.5 bg-success-bg border border-success-border rounded-cards p-2.5 space-y-1.5">
          <p className="font-mono text-[11px] font-semibold tracking-widest text-success-text uppercase">
            ✨ AI Suggestion
          </p>
          <p className="font-body text-[14px] text-graphite-ink">{improved}</p>
          <div className="flex gap-2">
            <button
              onClick={acceptSuggestion}
              className="font-body text-[12px] font-semibold text-white bg-success-text px-2.5 py-1 rounded-buttons hover:bg-graphite-ink transition-colors"
            >
              Accept
            </button>
            <button
              onClick={rejectSuggestion}
              className="font-body text-[12px] text-ash px-2.5 py-1 rounded-buttons border border-mist hover:border-ash transition-colors"
            >
              Reject
            </button>
          </div>
          <p className="font-body text-[11px] text-fog">
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
      <label className={labelClass}>Tech Stack</label>
      <div
        className="min-h-[2.625rem] flex flex-wrap gap-1.5 p-2.5 bg-soft-snow border border-mist rounded-inputs cursor-text focus-within:border-iris-violet focus-within:ring-2 focus-within:ring-iris-violet/20 transition-all duration-150"
        onClick={() => document.getElementById(`tech-${projId}`).focus()}
      >
        {techStack.map((tech) => (
          <span
            key={tech}
            className="font-body flex items-center gap-1 bg-paper-white border border-mist text-graphite-ink text-[12px] px-2.5 py-0.5 rounded-full"
          >
            {tech}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(tech); }}
              className="text-fog hover:text-error-text transition-colors"
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
          className="font-body flex-1 min-w-[8.75rem] bg-transparent text-[14px] text-graphite-ink placeholder:text-fog outline-none"
        />
      </div>
      <p className="font-body text-[11px] text-fog mt-1.5">
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
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3.5">
        <div>
          <h2 className={sectionHeadingClass}>Projects</h2>
          <p className={sectionSubtextClass}>
            College projects, personal projects, hackathons — all count.
          </p>
        </div>

        {/* AI usage badge */}
        <div
          className={`flex-shrink-0 font-body text-[11px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${
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
          <p className="font-body text-[14px] text-ash mb-1">No projects added yet.</p>
          <p className="font-body text-[12px] text-fog mb-3">
            Even a college assignment project counts — add it.
          </p>
          <button
            onClick={addProject}
            className="font-body text-[14px] font-semibold text-iris-violet hover:underline"
          >
            + Add Project
          </button>
        </div>
      )}

      {/* Project entries */}
      {entries.map((proj, idx) => (
        <div key={proj.id} className={`${cardClass} space-y-3.5`}>
          <div className="flex items-center justify-between">
            <span className={entryLabelClass}>Project {idx + 1}</span>
            <button
              onClick={() => removeProject(proj.id)}
              className="font-body text-[12px] text-fog hover:text-error-text transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Project Name */}
          <div>
            <label className={labelClass}>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Inventory Management System"
              value={proj.name}
              onChange={(e) => updateProject(proj.id, "name", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Tech Stack */}
          <TechStackInput projId={proj.id} techStack={proj.techStack} />

          {/* Bullets */}
          <div>
            <label className={labelClass}>
              What you built — use ✨ AI to improve each bullet
            </label>
            <div className="space-y-2.5">
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
              className="mt-2.5 font-body text-[12px] text-fog hover:text-iris-violet transition-colors"
            >
              + Add bullet point
            </button>
          </div>
        </div>
      ))}

      {entries.length > 0 && (
        <button
          onClick={addProject}
          className="w-full border border-dashed border-mist rounded-cards py-2.5 font-body text-[14px] text-ash hover:border-iris-violet hover:text-iris-violet transition-all duration-150"
        >
          + Add Another Project
        </button>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <span className={autoSaveDotClass} />
        <p className={autoSaveTextClass}>Auto-saved to your browser — no account needed</p>
      </div>
    </div>
  );
}