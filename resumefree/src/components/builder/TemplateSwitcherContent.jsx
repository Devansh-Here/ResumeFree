import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import { TEMPLATES } from "../templates/templateRegistry";

// Shared dummy content — same "fake resume" data reused across every
// template, now with FULL depth (2 education, 2 experience w/ bullets,
// a project, skills, languages) so each mockup fills the whole card like
// a real one-page resume instead of trailing off into blank space.
const MOCK = {
  name: "Jordan Patel",
  contact: "jordan@email.com  ·  Jaipur, India",
  edu: [
    { degree: "B.Tech, Computer Science", school: "NIT Jaipur", year: "2024" },
    { degree: "Senior Secondary (XII)", school: "DPS Jaipur", year: "2020" },
  ],
  exp: [
    { role: "Software Engineer Intern", company: "TCS", year: "2023–24", bullets: ["Built REST APIs, cutting response time by 30%", "Automated CI/CD deploy pipeline with Docker"] },
    { role: "Web Dev Intern", company: "Startup Co.", year: "2022–23", bullets: ["Shipped 4 client landing pages in React"] },
  ],
  project: { name: "AI Resume Builder", detail: "Built an ATS scoring tool used by 500+ students" },
  skills: "React · Node.js · Python · SQL · AWS",
  languages: "English, Hindi",
};

function TemplateMockup({ id }) {
  const base = "text-[#0a1628]";
  const muted = "text-[#94a3b8]";
  const line = "text-[#334155]";
  const fam = { fontFamily: "'Inter', sans-serif" };
  const tight = { lineHeight: 1.25 };

  switch (id) {
    case "classic":
      return (
        <div className="w-full h-full px-5 pt-5 overflow-hidden" style={fam}>
          <div className="text-center">
            <p className={`text-[15px] font-bold ${base} leading-none`}>{MOCK.name}</p>
            <p className={`text-[8.5px] ${muted} leading-none mt-[3px]`}>{MOCK.contact}</p>
          </div>
          <div className="h-[1.5px] bg-[#059669] w-full my-2" />

          <p className={`text-[9.5px] font-bold ${line} leading-none`}>EDUCATION</p>
          {MOCK.edu.map((e, i) => (
            <div key={i} className="mt-[3px]">
              <p className={`text-[8.5px] ${base}`} style={tight}>{e.degree}</p>
              <p className={`text-[7.5px] ${muted} leading-none`}>{e.school} · {e.year}</p>
            </div>
          ))}

          <p className={`text-[9.5px] font-bold ${line} leading-none mt-2`}>EXPERIENCE</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="mt-[3px]">
              <p className={`text-[8.5px] font-semibold ${base}`} style={tight}>{e.role} · {e.company}</p>
              {e.bullets.map((b, j) => (
                <p key={j} className={`text-[7.3px] ${muted} mt-[1px]`} style={tight}>• {b}</p>
              ))}
            </div>
          ))}

          <p className={`text-[9.5px] font-bold ${line} leading-none mt-2`}>PROJECTS</p>
          <p className={`text-[8.5px] font-semibold ${base} mt-[3px]`} style={tight}>{MOCK.project.name}</p>
          <p className={`text-[7.3px] ${muted} mt-[1px]`} style={tight}>• {MOCK.project.detail}</p>

          <p className={`text-[9.5px] font-bold ${line} leading-none mt-2`}>SKILLS</p>
          <p className={`text-[7.5px] ${muted} mt-[3px]`} style={tight}>{MOCK.skills}</p>
        </div>
      );

    case "modern":
      return (
        <div className="w-full h-full px-5 pt-5 overflow-hidden" style={fam}>
          <p className="text-[15px] font-bold text-[#059669] leading-none">{MOCK.name}</p>
          <p className={`text-[8.5px] ${muted} leading-none mt-[3px]`}>{MOCK.contact}</p>

          <p className="text-[9.5px] font-bold text-[#059669] leading-none mt-3">EXPERIENCE</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="mt-[3px]">
              <p className={`text-[8.5px] font-semibold ${base}`} style={tight}>{e.role}</p>
              <p className={`text-[7.5px] ${muted} leading-none`}>{e.company} · {e.year}</p>
              {e.bullets.map((b, j) => (
                <p key={j} className={`text-[7.3px] ${muted} mt-[1px]`} style={tight}>• {b}</p>
              ))}
            </div>
          ))}

          <p className="text-[9.5px] font-bold text-[#059669] leading-none mt-2">EDUCATION</p>
          {MOCK.edu.map((e, i) => (
            <p key={i} className={`text-[7.8px] ${muted} mt-[2px]`} style={tight}>{e.school} · {e.year}</p>
          ))}

          <p className="text-[9.5px] font-bold text-[#059669] leading-none mt-2">SKILLS</p>
          <p className={`text-[7.5px] ${muted} mt-[3px]`} style={tight}>{MOCK.skills}</p>
        </div>
      );

    case "minimal":
      return (
        <div className="w-full h-full px-7 pt-7 overflow-hidden" style={fam}>
          <p className={`text-[14px] font-medium ${base} leading-none`}>{MOCK.name}</p>
          <p className={`text-[8px] ${muted} leading-none mt-1`}>{MOCK.contact}</p>

          <p className={`text-[9px] font-medium ${muted} tracking-wide leading-none mt-4`}>Experience</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="mt-1">
              <p className={`text-[8.5px] ${base}`} style={tight}>{e.role}</p>
              <p className={`text-[7.5px] ${muted} mt-[1px]`} style={tight}>{e.company} · {e.year}</p>
            </div>
          ))}

          <p className={`text-[9px] font-medium ${muted} tracking-wide leading-none mt-4`}>Education</p>
          {MOCK.edu.map((e, i) => (
            <p key={i} className={`text-[8px] ${base} mt-1`} style={tight}>{e.school}</p>
          ))}

          <p className={`text-[9px] font-medium ${muted} tracking-wide leading-none mt-4`}>Skills</p>
          <p className={`text-[7.5px] ${muted} mt-1`} style={tight}>{MOCK.skills}</p>
        </div>
      );

    case "compact":
      return (
        <div className="w-full h-full px-4 pt-4 overflow-hidden" style={fam}>
          <p className={`text-[13px] font-bold ${base} leading-none`}>{MOCK.name}</p>
          <p className={`text-[7px] ${muted} leading-none mt-[2px]`}>{MOCK.contact}</p>
          <div className="h-[0.5px] bg-[#cbd5e1] w-full my-1.5" />

          <p className="text-[8.5px] font-bold text-[#059669] leading-none">EXPERIENCE</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="mt-[2px]">
              <p className={`text-[7.8px] font-semibold ${base}`} style={tight}>{e.role} · {e.company}</p>
              {e.bullets.map((b, j) => (
                <p key={j} className={`text-[6.8px] ${muted}`} style={tight}>• {b}</p>
              ))}
            </div>
          ))}

          <p className="text-[8.5px] font-bold text-[#059669] leading-none mt-1.5">PROJECTS</p>
          <p className={`text-[7.8px] font-semibold ${base} mt-[2px]`} style={tight}>{MOCK.project.name}</p>
          <p className={`text-[6.8px] ${muted}`} style={tight}>• {MOCK.project.detail}</p>

          <p className="text-[8.5px] font-bold text-[#059669] leading-none mt-1.5">EDUCATION</p>
          {MOCK.edu.map((e, i) => (
            <p key={i} className={`text-[7px] ${muted} mt-[2px]`} style={tight}>{e.degree} · {e.school}</p>
          ))}

          <p className="text-[8.5px] font-bold text-[#059669] leading-none mt-1.5">SKILLS</p>
          <p className={`text-[7px] ${muted} mt-[2px]`} style={tight}>{MOCK.skills}</p>
          <p className={`text-[7px] ${muted} mt-[2px]`} style={tight}>Languages: {MOCK.languages}</p>
        </div>
      );

    case "executive":
      return (
        <div className="w-full h-full px-5 pt-5 overflow-hidden" style={fam}>
          <div className="text-center">
            <p className={`text-[16px] font-bold ${base} leading-none tracking-wide`}>{MOCK.name.toUpperCase()}</p>
            <p className={`text-[8px] ${muted} leading-none mt-1.5`}>{MOCK.contact}</p>
          </div>
          <div className="h-[2px] bg-[#0a1628] w-full my-2.5" />

          <p className={`text-[9.5px] font-bold ${base} leading-none tracking-wide`}>EXPERIENCE</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="mt-[3px]">
              <p className={`text-[8.5px] font-semibold ${base}`} style={tight}>{e.role}</p>
              <p className={`text-[7.3px] ${muted} leading-none`}>{e.company} · {e.year}</p>
              {e.bullets.map((b, j) => (
                <p key={j} className={`text-[7px] ${muted} mt-[1px]`} style={tight}>• {b}</p>
              ))}
            </div>
          ))}

          <p className={`text-[9.5px] font-bold ${base} leading-none tracking-wide mt-2`}>EDUCATION</p>
          {MOCK.edu.map((e, i) => (
            <p key={i} className={`text-[7.8px] ${muted} mt-[3px]`} style={tight}>{e.degree} — {e.school}</p>
          ))}
        </div>
      );

    // ── Premium templates — full clear thumbnails, no blur ──

    case "corporate-elite":
      return (
        <div className="w-full h-full flex overflow-hidden" style={fam}>
          <div className="h-full flex-shrink-0" style={{ width: "38%", backgroundColor: "#0a1628" }}>
            <div className="px-3 pt-5">
              <p className="text-[13px] font-bold text-white leading-none" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {MOCK.name}
              </p>
              <div className="h-[1.5px] w-4 bg-[#059669] my-1.5" />
              <p className="text-[7px] text-[#cbd5e1] leading-snug">{MOCK.contact}</p>
              <p className="text-[8px] font-bold text-white/80 mt-3 mb-1">SKILLS</p>
              <div className="flex flex-wrap gap-[3px]">
                {["React", "Node", "SQL"].map((s, i) => (
                  <span key={i} className="text-[6px] px-1.5 py-[1px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[8px] font-bold text-white/80 mt-3 mb-1">EDUCATION</p>
              <p className="text-[7px] text-[#cbd5e1] leading-snug">{MOCK.edu[0].school}</p>
            </div>
          </div>
          <div className="flex-1 px-3 pt-5">
            <p className="text-[8.5px] font-bold text-[#0a1628]">EXPERIENCE</p>
            {MOCK.exp.map((e, i) => (
              <div key={i} className="mt-[3px]">
                <p className={`text-[7.8px] font-semibold ${base}`} style={tight}>{e.role}</p>
                <p className={`text-[6.8px] ${muted}`} style={tight}>{e.company}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "startup-bold":
      return (
        <div className="w-full h-full overflow-hidden" style={fam}>
          <div className="px-4 py-3" style={{ backgroundColor: "#059669" }}>
            <p className="text-[13px] font-bold text-white leading-none">{MOCK.name}</p>
            <p className="text-[7px] leading-none mt-1" style={{ color: "#d1fae5" }}>{MOCK.contact}</p>
          </div>
          <div className="px-4 pt-2.5">
            <div className="flex flex-wrap gap-1">
              {["React", "Node.js", "AWS"].map((s, i) => (
                <span key={i} className="text-[6.5px] px-1.5 py-[1px] rounded-full font-medium" style={{ backgroundColor: "#d1fae5", color: "#065f46" }}>
                  {s}
                </span>
              ))}
            </div>
            <p className="text-[8.5px] font-bold text-[#0a1628] mt-2">EXPERIENCE</p>
            {MOCK.exp.map((e, i) => (
              <p key={i} className={`text-[7.5px] font-semibold ${base} mt-[2px]`} style={tight}>
                {e.role} @ <span style={{ color: "#059669" }}>{e.company}</span>
              </p>
            ))}
          </div>
        </div>
      );

    case "creative-edge":
      return (
        <div className="w-full h-full px-5 pt-5 overflow-hidden" style={fam}>
          <p className="text-[16px] leading-none text-[#0a1628]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {MOCK.name}
          </p>
          <div className="h-[1.5px] bg-[#0a1628] w-full my-2" />
          <p className="text-[8.5px] font-bold" style={{ color: "#059669" }}>EXPERIENCE</p>
          {MOCK.exp.map((e, i) => (
            <div key={i} className="flex gap-1.5 mt-[3px]">
              <span className="w-1 h-1 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: "#059669" }} />
              <p className={`text-[7.8px] font-semibold ${base}`} style={tight}>{e.role} · {e.company}</p>
            </div>
          ))}
          <p className="text-[8.5px] font-bold mt-2" style={{ color: "#059669" }}>PROJECTS</p>
          <div className="rounded-lg mt-1 p-1.5" style={{ backgroundColor: "#ecfdf5" }}>
            <p className={`text-[7.5px] font-semibold ${base}`} style={tight}>{MOCK.project.name}</p>
          </div>
        </div>
      );

    case "technical-pro":
      return (
        <div className="w-full h-full px-4 pt-4 overflow-hidden" style={fam}>
          <p className={`text-[13px] font-bold ${base} leading-none`}>{MOCK.name}</p>
          <p className="text-[7px] leading-none mt-1" style={{ color: "#059669" }}>github.com/jordanp</p>
          <div className="flex gap-1 mt-2">
            {["Technical", "Tools"].map((label, i) => (
              <div key={i} className="flex-1 rounded p-1" style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1" }}>
                <p className="text-[6px] font-bold uppercase" style={{ color: "#4a6fa5" }}>{label}</p>
                <span className="text-[6px] px-1 rounded inline-block mt-0.5" style={{ backgroundColor: "#0a1628", color: "#d1fae5" }}>React</span>
              </div>
            ))}
          </div>
          <p className="text-[8.5px] font-bold text-[#0a1628] mt-2">
            <span style={{ color: "#059669" }}>{"//"}</span> EXPERIENCE
          </p>
          {MOCK.exp.map((e, i) => (
            <p key={i} className={`text-[7.5px] font-semibold ${base} mt-[2px]`} style={tight}>{e.role} · {e.company}</p>
          ))}
        </div>
      );

    case "grid-professional":
      return (
        <div className="w-full h-full px-4 pt-4 overflow-hidden" style={fam}>
          <div className="text-center pb-1.5" style={{ borderBottom: "1.5px solid #0a1628" }}>
            <p className={`text-[13px] font-bold ${base} leading-none`}>{MOCK.name}</p>
            <p className={`text-[7px] ${muted} leading-none mt-1`}>{MOCK.contact}</p>
          </div>
          <div className="flex gap-1.5 mt-2">
            <div className="flex-shrink-0 rounded border p-1.5" style={{ width: "34%", borderColor: "#cbd5e1" }}>
              <p className="text-[6.5px] font-bold text-[#0a1628]">SKILLS</p>
              <p className={`text-[6px] ${muted} mt-0.5`} style={tight}>React, SQL</p>
            </div>
            <div className="flex-1 rounded border p-1.5" style={{ borderColor: "#cbd5e1" }}>
              <p className="text-[6.5px] font-bold text-[#0a1628]">EXPERIENCE</p>
              <p className={`text-[6.5px] font-semibold ${base} mt-0.5`} style={tight}>{MOCK.exp[0].role}</p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-[13px] text-[#4a6fa5]">
          Preview
        </div>
      );
  }
}

// Small animated "PRO" badge — Von Restorff isolation effect (draws the eye
// without hiding the design underneath it). Reuses the established
// conic-gradient rotating-ring pattern from the Premium navbar badge /
// "Most Popular" pricing badge.
function ProBadge() {
  return (
    <div className="absolute top-2 right-2 z-10 rounded-full overflow-hidden p-[1.5px]">
      <div className="relative rounded-full overflow-hidden">
        <div
          className="absolute inset-[-150%]"
          style={{
            background: "conic-gradient(from 0deg, #059669, #d1fae5, #059669)",
            animation: "rf-pro-badge-spin 3s linear infinite",
          }}
        />
        <span
          className="relative z-10 block bg-[#0a1628] text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          PRO
        </span>
      </div>
    </div>
  );
}

function TemplateCard({ t, active, locked, onSelect }) {
  return (
    <button
      key={t.id}
      type="button"
      onClick={() => onSelect(t)}
      className={`group/tpl relative rounded-2xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-[#059669] bg-[#ecfdf5]"
          : locked
          ? "border-[#cbd5e1] bg-white hover:border-[#059669]/40 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(5,150,105,0.28)]"
          : "border-[#cbd5e1] bg-white hover:border-[#4a6fa5]/50 hover:-translate-y-0.5"
      }`}
    >
      {/* Thumbnail — always shown at full clarity, never blurred/dimmed.
          The design itself is the pitch; a lock icon does the gating. */}
      <div className="w-full aspect-[0.74] rounded-lg bg-white border border-[#e2e8f0] mb-3 overflow-hidden relative">
        <div className="w-full h-full transition-transform duration-300 ease-out group-hover/tpl:scale-[1.035]">
          <TemplateMockup id={t.id} />
        </div>

        {locked && <ProBadge />}

        {/* Curiosity + peak-moment CTA: only appears on hover, exactly when
            the user is engaged and admiring the design (not before). */}
        {locked && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover/tpl:translate-y-0 transition-transform duration-200 ease-out">
            <div
              className="flex items-center justify-center gap-1 py-2 text-[10.5px] font-semibold text-white"
              style={{ backgroundColor: "#0a1628" }}
            >
              <span>Unlock this style</span>
              <span className="transition-transform duration-200 group-hover/tpl:translate-x-0.5">→</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-[14px] font-semibold text-[#0a1628]" style={{ fontFamily: "'Inter', sans-serif" }}>
        {t.name}
      </p>
      <p className="text-[11.5px] text-[#4a6fa5] mt-0.5 leading-snug" style={{ fontFamily: "'Inter', sans-serif" }}>
        {t.description}
      </p>

      {active && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#059669] flex items-center justify-center">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

export default function TemplateSwitcherContent({ open, onClose, onRequestUpgrade }) {
  const selectedTemplateId = useResumeStore((s) => s.selectedTemplateId);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const isPremium = useAuthStore((s) => s.isPremium());

  if (!open) return null;

  const freeTemplates = TEMPLATES.filter((t) => !t.isPremium);
  const premiumTemplates = TEMPLATES.filter((t) => t.isPremium);

  function handleSelect(t) {
    if (t.isPremium && !isPremium) {
      onRequestUpgrade?.();
      return;
    }
    setTemplate(t.id);
    onClose?.();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes rf-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rf-pro-badge-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl overflow-hidden flex flex-col"
        style={{
          border: "1px solid #e2e8f0",
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px",
          animation: "rf-modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 shrink-0" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 className="text-2xl text-[#0a1628] leading-none mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Templates
            </h2>
            <p className="text-[13px] text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Pick a look — your data stays the same
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#f1f5f9] text-[#4a6fa5] hover:text-[#0a1628] text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6">
          {/* Free section */}
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Free Templates
            </h3>
            <span className="h-px flex-1 bg-[#f1f5f9]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            {freeTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                t={t}
                active={t.id === selectedTemplateId}
                locked={false}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Premium section */}
          {premiumTemplates.length > 0 && (
            <>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Premium Templates
                </h3>
                <span className="h-px flex-1 bg-[#f1f5f9]" />
                {!isPremium && (
                  <button
                    type="button"
                    onClick={onRequestUpgrade}
                    className="text-[10.5px] font-semibold text-[#059669] hover:text-[#047857] whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Unlock all with any pass →
                  </button>
                )}
              </div>
              {/* Loss-aversion + anchoring, stated honestly — reminds the
                  user their content is already done, and anchors against
                  the cheapest pass price already established elsewhere. */}
              {!isPremium && (
                <p className="text-[11.5px] text-[#4a6fa5]/80 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Your resume content is ready — these styles just present it better. Starting at ₹79.
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {premiumTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    t={t}
                    active={t.id === selectedTemplateId}
                    locked={!isPremium}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}