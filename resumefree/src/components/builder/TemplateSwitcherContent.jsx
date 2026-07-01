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
      // Centered header, thin emerald divider, single column, full content
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
      // Left-aligned, emerald name + emerald section labels, full content
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
      // Lots of whitespace, thin gray type, no dividers — but still full content
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
      // Dense, small margins, packed lines — fits the MOST content, startup feel
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
      // Bold centered formal header, thick divider, senior-role feel, full content
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

    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-[13px] text-[#4a6fa5]">
          Preview
        </div>
      );
  }
}

function TemplateCard({ t, active, locked, onSelect }) {
  return (
    <button
      key={t.id}
      type="button"
      onClick={() => onSelect(t)}
      className={`group/tpl relative rounded-2xl border p-4 text-left transition-all duration-150 ${
        active ? "border-[#059669] bg-[#ecfdf5]" : "border-[#cbd5e1] bg-white hover:border-[#4a6fa5]/50"
      } ${locked ? "opacity-90" : ""}`}
    >
      <div className="w-full aspect-[0.74] rounded-lg bg-white border border-[#e2e8f0] mb-3 overflow-hidden relative">
        <TemplateMockup id={t.id} />
        {locked && (
          <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center transition-opacity">
            <span className="w-8 h-8 rounded-full bg-[#0a1628]/80 flex items-center justify-center text-white text-[15px]">
              🔒
            </span>
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
    // Close the modal right after a successful selection — no need to make
    // the user click × separately once they've picked a template.
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
              <div className="mb-4 flex items-center gap-2">
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
                    Unlock with any pass →
                  </button>
                )}
              </div>
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