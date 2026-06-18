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

  // Suggestions not already added
  const notAdded = SUGGESTIONS[category].filter((s) => !skills.includes(s));

  // Filtered by current input
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
    <div className="bg-white border border-[#DDD6C8] rounded-xl p-4 sm:p-5 space-y-3">

      <label
        className="block text-[10px] font-mono tracking-widest uppercase text-[#161A2E]/50"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {label}
      </label>

      {/* Tags + Input box */}
      <div
        className="min-h-[44px] flex flex-wrap gap-2 p-2.5 bg-[#F6F4EF] border border-[#DDD6C8] rounded-lg cursor-text focus-within:border-[#161A2E] transition-colors"
        onClick={() => document.getElementById(`input-${category}`).focus()}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 bg-white border border-[#DDD6C8] text-[#161A2E] text-xs px-2.5 py-1 rounded-full"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {skill}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(category, skills.filter((s) => s !== skill));
              }}
              className="text-[#161A2E]/30 hover:text-red-400 transition-colors leading-none"
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
          className="flex-1 min-w-[120px] bg-transparent text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </div>

      <p
        className="text-[10px] text-[#161A2E]/30"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        Type and press Enter or comma to add · Backspace to remove last
      </p>

      {/* Dropdown — when typing */}
      {showDropdown && input.length > 0 && filtered.length > 0 && (
        <div className="border border-[#DDD6C8] rounded-lg overflow-hidden bg-white shadow-sm">
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              onMouseDown={() => handleAdd(s)}
              className="w-full text-left px-3 py-2 text-sm text-[#161A2E]/70 hover:bg-[#F6F4EF] hover:text-[#161A2E] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick-add pills — always show unselected suggestions */}
      {notAdded.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[10px] text-[#161A2E]/30 self-center mr-1"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Quick add:
          </span>
          {notAdded.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => handleAdd(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-[#DDD6C8] text-[#161A2E]/50 hover:border-[#1E8E5A] hover:text-[#1E8E5A] transition-colors"
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
    <div className="space-y-6">

      <div>
        <h2
          className="text-lg font-bold text-[#161A2E]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Skills
        </h2>
        <p
          className="text-xs text-[#161A2E]/45 mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Add skills relevant to the jobs you're applying for. ATS scans these first.
        </p>
      </div>

      {/* ATS tip */}
      <div className="bg-[#1E8E5A]/8 border border-[#1E8E5A]/20 rounded-xl p-3.5 flex items-center gap-3">
        <span className="text-[#1E8E5A] flex-shrink-0">✦</span>
        <p
          className="text-xs text-[#161A2E]/60 leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span className="font-semibold text-[#1E8E5A]">ATS tip:</span> Add skills exactly as they appear in the job description. "React.js" and "ReactJS" are different to an ATS.
        </p>
      </div>

      <SkillCategory category="technical" skills={skills.technical} onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="tools"     skills={skills.tools}     onAdd={handleAdd} onRemove={handleRemove} />
      <SkillCategory category="languages" skills={skills.languages} onAdd={handleAdd} onRemove={handleRemove} />

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