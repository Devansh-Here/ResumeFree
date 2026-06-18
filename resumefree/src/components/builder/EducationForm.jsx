// src/components/builder/EducationForm.jsx
import { useResumeStore } from "../../store/resumeStore";

const inputClass =
  "w-full bg-white border border-[#DDD6C8] rounded-lg px-3 py-2.5 text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 focus:outline-none focus:border-[#161A2E] focus:ring-1 focus:ring-[#161A2E]/10 transition-colors";

const labelClass =
  "block text-[10px] font-mono tracking-widest uppercase text-[#161A2E]/50 mb-1.5";

const EDU_TYPES = [
  { value: "10th",    label: "High School (10th)" },
  { value: "12th",    label: "Intermediate (12th)" },
  { value: "btech",   label: "B.Tech / B.E." },
  { value: "bsc",     label: "B.Sc" },
  { value: "bcom",    label: "B.Com" },
  { value: "ba",      label: "B.A." },
  { value: "bca",     label: "BCA" },
  { value: "mba",     label: "MBA" },
  { value: "mca",     label: "MCA" },
  { value: "mtech",   label: "M.Tech / M.E." },
  { value: "msc",     label: "M.Sc" },
  { value: "diploma", label: "Diploma" },
  { value: "other",   label: "Other" },
];

export default function EducationForm() {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const entries = resume.education;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2
          className="text-lg font-bold text-[#161A2E]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Education
        </h2>
        <p
          className="text-xs text-[#161A2E]/45 mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Add your most recent degree first. You can add multiple entries.
        </p>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-[#DDD6C8] rounded-xl p-8 text-center">
          <p
            className="text-sm text-[#161A2E]/40 mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No education added yet.
          </p>
          <button
            onClick={addEducation}
            className="text-sm font-semibold text-[#1E8E5A] hover:underline"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            + Add Education
          </button>
        </div>
      )}

      {/* Education entries */}
      {entries.map((edu, idx) => (
        <div
          key={edu.id}
          className="bg-white border border-[#DDD6C8] rounded-xl p-4 sm:p-5 space-y-4"
        >
          {/* Entry header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono tracking-widest text-[#161A2E]/40 uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Education {idx + 1}
            </span>
            <button
              onClick={() => removeEducation(edu.id)}
              className="text-xs text-[#161A2E]/30 hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Remove
            </button>
          </div>

          {/* Education Type — pill selector */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {EDU_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateEducation(edu.id, "type", value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                    edu.type === value
                      ? "bg-[#161A2E] text-[#F6F4EF] border-[#161A2E]"
                      : "bg-white text-[#161A2E]/50 border-[#DDD6C8] hover:border-[#161A2E]/40 hover:text-[#161A2E]"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Degree / Course name — auto-filled based on type but editable */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Degree / Course Name
            </label>
            <input
              type="text"
              placeholder="e.g. B.Tech in Computer Science Engineering"
              value={edu.degree}
              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* College / School */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {edu.type === "10th" || edu.type === "12th" ? "School Name" : "College / University"}
            </label>
            <input
              type="text"
              placeholder={
                edu.type === "10th" || edu.type === "12th"
                  ? "e.g. Delhi Public School, Noida"
                  : "e.g. KIET Group of Institutions, Ghaziabad"
              }
              value={edu.college}
              onChange={(e) => updateEducation(edu.id, "college", e.target.value)}
              className={inputClass}
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* CGPA + Year — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {edu.type === "10th" || edu.type === "12th" ? "Percentage / Grade" : "CGPA / %"}
              </label>
              <input
                type="text"
                placeholder={edu.type === "10th" || edu.type === "12th" ? "e.g. 92%" : "e.g. 8.4 or 84%"}
                value={edu.cgpa}
                onChange={(e) => updateEducation(edu.id, "cgpa", e.target.value)}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Passing Year
              </label>
              <input
                type="text"
                placeholder="2025"
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                className={inputClass}
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add another button */}
      {entries.length > 0 && (
        <button
          onClick={addEducation}
          className="w-full border border-dashed border-[#DDD6C8] rounded-xl py-3 text-sm text-[#161A2E]/40 hover:border-[#1E8E5A] hover:text-[#1E8E5A] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          + Add Another Education
        </button>
      )}

      {/* Auto-save notice */}
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