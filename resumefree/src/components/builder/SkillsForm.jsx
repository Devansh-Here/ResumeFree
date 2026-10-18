// src/components/builder/SkillsForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { Lightbulb } from "lucide-react";
import {
  sectionHeadingClass,
  sectionSubtextClass,
  labelClass,
  cardClass,
  autoSaveDotClass,
  autoSaveTextClass,
} from "./formStyles";

const SUGGESTIONS = {
  technical: [
    "Python", "Java", "JavaScript", "C++", "C", "React.js", "Node.js",
    "Express.js", "Spring Boot", "Django", "Flask", "REST API",
    "MySQL", "MongoDB", "PostgreSQL", "Firebase", "Docker", "Git",
    "AWS", "Linux", "HTML", "CSS", "TypeScript", "Redux",
  ],
  tools: [
    "VS Code", "Git", "GitHub", "Postman", "Figma", "Jira", "Notion",
    "IntelliJ IDEA", "Eclipse", "Android Studio", "Jupyter Notebook",
    "Google Colab", "Tableau", "Power BI", "Excel", "Canva",
  ],
  languages: [
    "English", "Hindi", "Tamil", "Telugu", "Marathi", "Bengali",
    "Gujarati", "Kannada", "Malayalam", "Punjabi",
  ],
};

const CATEGORY_LABELS = {
  technical: { label: "Technical Skills", placeholder: "Type to add a skill..." },
  tools:     { label: "Tools & Software", placeholder: "Type to add a tool..." },
  languages: { label: "Languages",        placeholder: "Type to add a language..." },
};

function SkillCategory({ category, skills, onAdd, onRemove }) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const { label, placeholder } = CATEGORY_LABELS[category];

  const notAdded = SUGGESTIONS[category].filter((s) => !skills.includes(s));
  const filtered = notAdded.filter((s) =>
    s.toLowerCase().includes(input.toLowerCase())
  );

  const handleAdd = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onAdd(category, [...skills, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) handleAdd(input);
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      onRemove(category, skills.slice(0, -1));
    }
  };

  return (
    <div className={`${cardClass} space-y-2.5`}>
      <label className={labelClass}>
        {label}
      </label>

      {/* Tags + Input box */}
      <div
        className="min-h-[2.625rem] flex flex-wrap gap-1.5 p-2.5 bg-soft-snow border border-mist rounded-inputs cursor-text focus-within:border-iris-violet focus-within:ring-2 focus-within:ring-iris-violet/20 transition-all duration-150"
        onClick={() => document.getElementById(`input-${category}`).focus()}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="font-body flex items-center gap-1.5 bg-paper-white border border-mist text-graphite-ink text-[0.75rem] px-2.5 py-0.5 rounded-tags"
          >
            {skill}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(category, skills.filter((s) => s !== skill));
              }}
              className="text-fog hover:text-error-text transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}

        <input
          id={`input-${category}`}
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="font-body flex-1 min-w-[7.5rem] bg-transparent text-[14px] text-graphite-ink placeholder:text-fog outline-none"
        />
      </div>

      <p className="font-body text-[11px] text-fog">
        Type and press Enter or comma to add · Backspace to remove last
      </p>

      {/* Dropdown — when typing */}
      {showDropdown && input.length > 0 && filtered.length > 0 && (
        <div className="border border-mist rounded-inputs overflow-hidden bg-paper-white">
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              onMouseDown={() => handleAdd(s)}
              className="font-body w-full text-left px-3.5 py-2 text-[0.8125rem] text-ash hover:bg-soft-snow hover:text-graphite-ink transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick-add pills */}
      {notAdded.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="font-body text-[11px] text-fog self-center mr-1">
            Quick add:
          </span>
          {notAdded.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => handleAdd(s)}
              className="font-body text-[0.75rem] px-2.5 py-0.5 rounded-tags border border-mist text-ash hover:border-iris-violet hover:text-iris-violet transition-all duration-150"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SkillsForm() {
  const { resume, updateSkills } = useResumeStore();
  const { skills } = resume;

  const handleAdd    = (category, newSkills) => updateSkills(category, newSkills);
  const handleRemove = (category, newSkills) => updateSkills(category, newSkills);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className={sectionHeadingClass}>Skills</h2>
        <p className={sectionSubtextClass}>
          Add skills relevant to the jobs you're applying for. ATS scans these first.
        </p>
      </div>

      {/* ATS tip — semantic success tokens (not brand violet), with a left
      accent bar + SVG icon (not emoji — emoji renders inconsistently
      across OS/browsers and looks unprofessional in a production app) for
      stronger visual weight. */}
      <div className="relative bg-success-bg border-2 border-success-border rounded-inputs pl-5 pr-4 py-3.5 flex items-center gap-3 overflow-hidden shadow-sm">
  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-success-text" aria-hidden="true" />
  <svg className="text-success-text flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" /><path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.6.6 1.24 1.42 1.41 2.5" />
  </svg>
  <p className="font-body text-[0.8125rem] text-slate leading-relaxed">
    <span className="font-semibold text-success-text">ATS tip:</span> Add skills exactly as they appear in the job description. "React.js" and "ReactJS" are different to an ATS.
  </p>
</div>

      <SkillCategory category="technical" skills={skills.technical} onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="tools"     skills={skills.tools}     onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="languages" skills={skills.languages} onAdd={handleAdd} onRemove={handleRemove} />

      {/* Auto-save notice */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className={autoSaveDotClass} />
        <p className={autoSaveTextClass}>
          Auto-saved to your browser — no account needed
        </p>
      </div>
    </div>
  );
}