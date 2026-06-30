// src/components/builder/PersonalInfoForm.jsx
import { useResumeStore } from "../../store/resumeStore";

const inputClass =
  "w-full bg-white border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/8 transition-all duration-150";

const labelClass =
  "block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2";

function Field({ label, id, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}{" "}
        {optional && (
          <span className="text-[#4a6fa5]/50 normal-case tracking-normal font-normal">
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export default function PersonalInfoForm() {
  const { resume, updatePersonal } = useResumeStore();
  const p = resume.personal;

  const handleChange = (field) => (e) => updatePersonal(field, e.target.value);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2
          className="text-[26px] font-bold text-[#0a1628] leading-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Personal Info
        </h2>
        <p className="text-sm text-[#1e3a5f]/60 mt-1">
          This appears at the top of your resume. Keep it professional.
        </p>
      </div>

      {/* Full Name */}
      <Field label="Full Name" id="name">
        <input
          id="name"
          type="text"
          placeholder="Arjun Sharma"
          value={p.name}
          onChange={handleChange("name")}
          className={inputClass}
        />
      </Field>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            placeholder="arjun@gmail.com"
            value={p.email}
            onChange={handleChange("email")}
            className={inputClass}
          />
        </Field>

        <Field label="Phone" id="phone">
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={p.phone}
            onChange={handleChange("phone")}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Address */}
      <Field label="City / Address" id="address">
        <input
          id="address"
          type="text"
          placeholder="Aligarh, Uttar Pradesh"
          value={p.address}
          onChange={handleChange("address")}
          className={inputClass}
        />
      </Field>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-[#cbd5e1]" />
        <span className="text-[11px] font-semibold tracking-widest text-[#4a6fa5]/60 uppercase">
          Online Profiles
        </span>
        <div className="flex-1 h-px bg-[#cbd5e1]" />
      </div>

      {/* LinkedIn */}
      <Field label="LinkedIn" id="linkedin" optional>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#4a6fa5]/60 select-none pointer-events-none">
            linkedin.com/in/
          </span>
          <input
            id="linkedin"
            type="text"
            placeholder="arjun-sharma"
            value={p.linkedin}
            onChange={handleChange("linkedin")}
            className={`${inputClass} pl-[7.5rem]`}
          />
        </div>
      </Field>

      {/* GitHub */}
      <Field label="GitHub" id="github" optional>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#4a6fa5]/60 select-none pointer-events-none">
            github.com/
          </span>
          <input
            id="github"
            type="text"
            placeholder="arjun-sharma"
            value={p.github}
            onChange={handleChange("github")}
            className={`${inputClass} pl-[5.75rem]`}
          />
        </div>
      </Field>

      {/* Portfolio */}
      <Field label="Portfolio" id="portfolio" optional>
        <input
          id="portfolio"
          type="url"
          placeholder="https://arjunsharma.dev"
          value={p.portfolio}
          onChange={handleChange("portfolio")}
          className={inputClass}
        />
      </Field>

      {/* Auto-save notice */}
      <div className="flex items-center gap-2 pt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
        <p className="text-[11px] text-[#4a6fa5]/70">
          Auto-saved to your browser — no account needed
        </p>
      </div>

    </div>
  );
}