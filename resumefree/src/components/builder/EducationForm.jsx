// src/components/builder/EducationForm.jsx
import { useResumeStore } from "../../store/resumeStore";
import { sectionHeadingClass, sectionSubtextClass, labelClass, inputClass, cardClass, autoSaveDotClass, autoSaveTextClass } from "./formStyles";

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
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className={sectionHeadingClass}>Education</h2>
        <p className={sectionSubtextClass}>
          Add your most recent degree first. You can add multiple entries.
        </p>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border border-dashed border-mist rounded-cards p-6 text-center">
          <p className="font-body text-[12px] text-ash mb-2.5">
            No education added yet.
          </p>
          <button
            onClick={addEducation}
            className="font-body text-[12px] font-semibold text-iris-violet hover:underline"
          >
            + Add Education
          </button>
        </div>
      )}

      {/* Education entries */}
      {entries.map((edu, idx) => (
        <div key={edu.id} className={`${cardClass} space-y-4`}>
          {/* Entry header */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash">
              Education {idx + 1}
            </span>
            <button
              onClick={() => removeEducation(edu.id)}
              className="font-body text-[12px] text-fog hover:text-[#dc2626] transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Education Type — pill selector */}
          <div>
            <label className={labelClass}>Type</label>
            <div className="flex flex-wrap gap-2">
              {EDU_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateEducation(edu.id, "type", value)}
                  className={`font-body text-[12px] px-3 py-1 rounded-tags border transition-all duration-150 whitespace-nowrap ${
                    edu.type === value
                      ? "bg-graphite-ink text-white border-graphite-ink"
                      : "bg-paper-white text-ash border-mist hover:border-slate hover:text-graphite-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Degree / Course name */}
          <div>
            <label className={labelClass}>Degree / Course Name</label>
            <input
              type="text"
              placeholder="e.g. B.Tech in Computer Science Engineering"
              value={edu.degree}
              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* College / School */}
          <div>
            <label className={labelClass}>
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
            />
          </div>

          {/* CGPA + Year — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {edu.type === "10th" || edu.type === "12th" ? "Percentage / Grade" : "CGPA / %"}
              </label>
              <input
                type="text"
                placeholder={edu.type === "10th" || edu.type === "12th" ? "e.g. 92%" : "e.g. 8.4 or 84%"}
                value={edu.cgpa}
                onChange={(e) => updateEducation(edu.id, "cgpa", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Passing Year</label>
              <input
                type="text"
                placeholder="2025"
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add another button */}
      {entries.length > 0 && (
        <button
          onClick={addEducation}
          className="font-body w-full border border-dashed border-mist rounded-cards py-2 text-[12px] text-ash hover:border-iris-violet hover:text-iris-violet transition-all duration-150"
        >
          + Add Another Education
        </button>
      )}

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