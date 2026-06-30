// src/components/builder/EducationForm.jsx
import { useResumeStore } from "../../store/resumeStore";

const inputClass =
  "w-full bg-white border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all duration-150";

const labelClass =
  "block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2";

const EDU_TYPES = [
  { value: "10th",    label: "10th" },
  { value: "12th",    label: "12th" },
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
          className="text-2xl text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Education
        </h2>
        <p
          className="text-xs text-[#4a6fa5] mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Add your most recent degree first. You can add multiple entries.
        </p>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-[#cbd5e1] rounded-3xl p-8 text-center">
          <p
            className="text-sm text-[#4a6fa5] mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            No education added yet.
          </p>
          <button
            onClick={addEducation}
            className="text-sm font-semibold text-[#059669] hover:underline"
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
          className="bg-white border border-[#cbd5e1] rounded-3xl p-5 space-y-4"
          style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 4px 12px -2px" }}
        >
          {/* Entry header */}
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Education {idx + 1}
            </span>
            <button
              onClick={() => removeEducation(edu.id)}
              className="text-xs text-[#4a6fa5]/60 hover:text-red-400 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Remove
            </button>
          </div>

          {/* Education Type — pill selector */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {EDU_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateEducation(edu.id, "type", value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
                    edu.type === value
                      ? "bg-[#0a1628] text-white border-[#0a1628]"
                      : "bg-white text-[#4a6fa5] border-[#cbd5e1] hover:border-[#4a6fa5] hover:text-[#0a1628]"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Degree / Course name */}
          <div>
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
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
            <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
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
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
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
              <label className={labelClass} style={{ fontFamily: "'Inter', sans-serif" }}>
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
          className="w-full border border-dashed border-[#cbd5e1] rounded-3xl py-3 text-sm text-[#4a6fa5] hover:border-[#059669] hover:text-[#059669] transition-all duration-150"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          + Add Another Education
        </button>
      )}

      {/* Auto-save notice */}
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