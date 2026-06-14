// src/components/builder/PersonalInfoForm.jsx
import { useResumeStore } from "../../store/resumeStore";

const inputClass =
  "w-full bg-white border border-[#DDD6C8] rounded-lg px-3 py-2.5 text-sm text-[#161A2E] placeholder:text-[#161A2E]/30 focus:outline-none focus:border-[#161A2E] focus:ring-1 focus:ring-[#161A2E]/10 transition-colors";

const labelClass =
  "block text-[10px] font-mono tracking-widest uppercase text-[#161A2E]/50 mb-1.5";

function Field({ label, id, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {label}{" "}
        {optional && (
          <span className="text-[#161A2E]/30 normal-case tracking-normal font-sans">
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
          className="text-lg font-bold text-[#161A2E]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Personal Info
        </h2>
        <p
          className="text-xs text-[#161A2E]/45 mt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
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
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Field>

      {/* Email + Phone — side by side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            placeholder="arjun@gmail.com"
            value={p.email}
            onChange={handleChange("email")}
            className={inputClass}
            style={{ fontFamily: "'Inter', sans-serif" }}
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
            style={{ fontFamily: "'Inter', sans-serif" }}
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
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Field>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#DDD6C8]" />
        <span
          className="text-[10px] font-mono tracking-widest text-[#161A2E]/30 uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Online Profiles
        </span>
        <div className="flex-1 h-px bg-[#DDD6C8]" />
      </div>

      {/* LinkedIn */}
      <Field label="LinkedIn" id="linkedin" optional>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#161A2E]/30 select-none pointer-events-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            linkedin.com/in/
          </span>
          <input
            id="linkedin"
            type="text"
            placeholder="arjun-sharma"
            value={p.linkedin}
            onChange={handleChange("linkedin")}
            className={`${inputClass} pl-[7.5rem]`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
      </Field>

      {/* GitHub */}
      <Field label="GitHub" id="github" optional>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#161A2E]/30 select-none pointer-events-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            github.com/
          </span>
          <input
            id="github"
            type="text"
            placeholder="arjun-sharma"
            value={p.github}
            onChange={handleChange("github")}
            className={`${inputClass} pl-[5.75rem]`}
            style={{ fontFamily: "'Inter', sans-serif" }}
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
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
      </Field>

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