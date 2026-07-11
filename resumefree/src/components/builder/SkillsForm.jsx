// src/components/builder/SkillsForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";

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
    <div
      className="bg-white border border-[#cbd5e1] rounded-3xl p-4 space-y-2.5"
      style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px -2px" }}
    >
      <label
        className="block text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4a6fa5]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </label>

      {/* Tags + Input box */}
      <div
        className="min-h-[2.625rem] flex flex-wrap gap-1.5 p-2.5 bg-[#f8fafc] border border-[#cbd5e1] rounded-2xl cursor-text focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/15 transition-all duration-150"
        onClick={() => document.getElementById(`input-${category}`).focus()}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] text-[#0a1628] text-[0.75rem] px-2.5 py-0.5 rounded-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {skill}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(category, skills.filter((s) => s !== skill));
              }}
              className="text-[#4a6fa5]/50 hover:text-red-400 transition-colors leading-none"
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
          className="flex-1 min-w-[7.5rem] bg-transparent text-[0.8125rem] text-[#0a1628] placeholder:text-[#4a6fa5]/50 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>

      <p
        className="text-[0.6875rem] text-[#4a6fa5]/60"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Type and press Enter or comma to add · Backspace to remove last
      </p>

      {/* Dropdown — when typing */}
      {showDropdown && input.length > 0 && filtered.length > 0 && (
        <div className="border border-[#cbd5e1] rounded-2xl overflow-hidden bg-white shadow-sm">
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              onMouseDown={() => handleAdd(s)}
              className="w-full text-left px-3.5 py-2 text-[0.8125rem] text-[#4a6fa5] hover:bg-[#f8fafc] hover:text-[#0a1628] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick-add pills */}
      {notAdded.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[0.6875rem] text-[#4a6fa5]/60 self-center mr-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Quick add:
          </span>
          {notAdded.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => handleAdd(s)}
              className="text-[0.75rem] px-2.5 py-0.5 rounded-full border border-[#cbd5e1] text-[#4a6fa5] hover:border-[#059669] hover:text-[#059669] transition-all duration-150"
              style={{ fontFamily: "'Inter', sans-serif" }}
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
        <h2
          className="text-[1.375rem] text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Skills
        </h2>
        <p
          className="text-[0.75rem] text-[#4a6fa5] mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Add skills relevant to the jobs you're applying for. ATS scans these first.
        </p>
      </div>

      {/* ATS tip */}
      <div className="bg-[#d1fae5] border border-[#059669]/20 rounded-2xl p-3 flex items-center gap-2.5">
        <span className="text-[#059669] flex-shrink-0">✦</span>
        <p
          className="text-[0.75rem] text-[#1e3a5f] leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span className="font-semibold text-[#059669]">ATS tip:</span> Add skills exactly as they appear in the job description. "React.js" and "ReactJS" are different to an ATS.
        </p>
      </div>

      <SkillCategory category="technical" skills={skills.technical} onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="tools"     skills={skills.tools}     onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="languages" skills={skills.languages} onAdd={handleAdd} onRemove={handleRemove} />

      {/* Auto-save notice */}
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