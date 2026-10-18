// src/components/builder/PersonalInfoForm.jsx
import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import PhotoEditorPanel from "../premium/PhotoEditorPanel";
import PhotoFeatureShowcaseModal from "../premium/PhotoFeatureShowcaseModal";
import { templateSupportsPhoto } from "../templates/templateRegistry";
import {
  sectionHeadingClass,
  sectionSubtextClass,
  labelClass,
  inputClass,
  autoSaveDotClass,
  autoSaveTextClass,
} from "./formStyles";

function Field({ label, id, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}{" "}
        {optional && (
          <span className="font-body text-fog normal-case tracking-normal font-normal">
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
      <div className="flex-1 h-px bg-mist" />
      <span className="font-mono text-[11px] font-semibold tracking-widest text-ash uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-mist" />
    </div>
  );
}

function PhotoFeatureDiscoveryHint() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3 text-left bg-iris-violet/[0.06] border border-iris-violet/25 rounded-cards px-4 py-3 hover:bg-iris-violet/[0.09] hover:border-iris-violet/40 transition-colors duration-150
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2"
      >
        {/* Decorative — adjacent text already conveys the meaning */}
        <span className="text-lg shrink-0" aria-hidden="true">📷</span>
        <span className="font-body text-[12px] text-slate leading-snug">
          <span className="font-semibold text-graphite-ink">Want a photo on your resume?</span>{" "}
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
        <h2 className={sectionHeadingClass}>Personal Info</h2>
        <p className={sectionSubtextClass}>
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
          autoComplete="name"
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
            autoComplete="email"
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
            autoComplete="tel"
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
          autoComplete="street-address"
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
          <span className="font-body absolute left-4 top-1/2 -translate-y-1/2 text-[12px] text-fog select-none pointer-events-none">
            linkedin.com/in/
          </span>
          <input
            id="linkedin"
            type="text"
            autoComplete="url"
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
          <span className="font-body absolute left-4 top-1/2 -translate-y-1/2 text-[12px] text-fog select-none pointer-events-none">
            github.com/
          </span>
          <input
            id="github"
            type="text"
            autoComplete="url"
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
          autoComplete="url"
          placeholder="https://arjunsharma.dev"
          value={p.portfolio}
          onChange={handleChange("portfolio")}
          className={inputClass}
        />
      </Field>

      {/* Auto-save notice — dot intentionally stays the semantic
          success-text green (#059669), NOT brand violet, per the
          design system's "success is always this green" rule (§3.2). */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className={autoSaveDotClass} aria-hidden="true" />
        <p className={autoSaveTextClass}>
          Auto-saved to your browser — no account needed
        </p>
      </div>

    </div>
  );
}