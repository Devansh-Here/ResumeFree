// src/components/builder/PersonalInfoForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import PhotoEditorPanel from "../premium/PhotoEditorPanel";
import ColorThemePicker from "../premium/ColorThemePicker";
import PhotoFeatureShowcaseModal from "../premium/PhotoFeatureShowcaseModal";
import { templateSupportsPhoto } from "../templates/templateRegistry";

const inputClass =
  "w-full bg-white border border-[#cbd5e1] rounded-2xl px-3.5 py-2.5 text-[0.8125rem] text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#0a1628] focus:ring-2 focus:ring-[#0a1628]/8 transition-all duration-150";

const labelClass =
  "block text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-1.5";

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

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      <div className="flex-1 h-px bg-[#cbd5e1]" />
      <span className="text-[0.6875rem] font-semibold tracking-widest text-[#4a6fa5]/60 uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#cbd5e1]" />
    </div>
  );
}

function PhotoFeatureDiscoveryHint() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3 text-left bg-[#ecfdf5] border border-[#059669]/20 rounded-2xl px-4 py-3 hover:border-[#059669]/40 transition-colors duration-150"
      >
        <span className="text-lg shrink-0">📷</span>
        <span className="text-[0.75rem] text-[#1e3a5f] leading-snug">
          <span className="font-semibold text-[#0a1628]">Want a photo on your resume?</span>{" "}
          Some premium templates support it — tap to see how it works.
        </span>
      </button>

      {showModal && (
        <PhotoFeatureShowcaseModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default function PersonalInfoForm() {
  const { resume, updatePersonal, selectedTemplateId } = useResumeStore();
  const isPremium = useAuthStore((s) => s.isPremium());
  const p = resume.personal;
  const photoAllowed = templateSupportsPhoto(selectedTemplateId);

  const handleChange = (field) => (e) => updatePersonal(field, e.target.value);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2
          className="text-[1.375rem] font-bold text-[#0a1628] leading-tight"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Personal Info
        </h2>
        <p className="text-[0.8125rem] text-[#1e3a5f]/60 mt-1">
          This appears at the top of your resume. Keep it professional.
        </p>
      </div>

      {/* Profile Photo (premium — background removal + custom backgrounds).
          Only shown when the SELECTED TEMPLATE has a spot for a photo —
          see supportsPhoto in templateRegistry.js */}
      {photoAllowed && <PhotoEditorPanel />}

      {/* Discovery hint — shown to free users ONLY when their current
          template doesn't support a photo, so the feature is never
          completely invisible to someone who hasn't browsed templates. */}
      {!photoAllowed && !isPremium && <PhotoFeatureDiscoveryHint />}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
      <SectionDivider label="Online Profiles" />

      {/* LinkedIn */}
      <Field label="LinkedIn" id="linkedin" optional>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.75rem] text-[#4a6fa5]/60 select-none pointer-events-none">
            linkedin.com/in/
          </span>
          <input
            id="linkedin"
            type="text"
            placeholder="arjun-sharma"
            value={p.linkedin}
            onChange={handleChange("linkedin")}
            className={`${inputClass} pl-[6.75rem]`}
          />
        </div>
      </Field>

      {/* GitHub */}
      <Field label="GitHub" id="github" optional>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.75rem] text-[#4a6fa5]/60 select-none pointer-events-none">
            github.com/
          </span>
          <input
            id="github"
            type="text"
            placeholder="arjun-sharma"
            value={p.github}
            onChange={handleChange("github")}
            className={`${inputClass} pl-[5.25rem]`}
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

      {/* Divider */}
      <SectionDivider label="Resume Style" />

      {/* Accent Color (premium) */}
      <ColorThemePicker />

      {/* Auto-save notice */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669] flex-shrink-0" />
        <p className="text-[0.6875rem] text-[#4a6fa5]/70">
          Auto-saved to your browser — no account needed
        </p>
      </div>

    </div>
  );
}