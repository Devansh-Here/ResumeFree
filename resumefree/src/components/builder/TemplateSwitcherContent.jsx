import { createPortal } from "react-dom";
  import { useResumeStore } from "../../store/resumeStore";
  import { useAuthStore } from "../../store/authStore";
  import { TEMPLATES } from "../templates/templateRegistry";

  // Single shared sample resume, matching the EXACT shape every real
  // template component expects (resume.personal / education / experience /
  // skills / projects). This is rendered through the actual template
  // components below — never a hand-copied mockup — so thumbnails can
  // never drift out of sync with what the live preview / PDF actually look like.
  const MOCK_RESUME = {
    personal: {
      name: "Jordan Patel",
      email: "jordan@email.com",
      phone: "+91 98765 43210",
      address: "Jaipur, India",
      linkedin: "jordan-patel",
      github: "jordan-codes",
      portfolio: "",
    },
    education: [
      { id: "e1", degree: "B.Tech, Computer Science", college: "NIT Jaipur", year: "2024", cgpa: "8.7" },
      { id: "e2", degree: "Senior Secondary (XII)", college: "DPS Jaipur", year: "2020", cgpa: "92%" },
    ],
    experience: [
      {
        id: "x1",
        role: "Software Engineer Intern",
        company: "TCS",
        duration: "2023–24",
        bullets: [
          "Built REST APIs, cutting response time by 30%",
          "Automated CI/CD deploy pipeline with Docker",
        ],
      },
      {
        id: "x2",
        role: "Web Dev Intern",
        company: "Startup Co.",
        duration: "2022–23",
        bullets: ["Shipped 4 client landing pages in React"],
      },
    ],
    skills: {
      technical: ["React", "Node.js", "Python", "SQL"],
      tools: ["Git", "AWS", "Docker"],
      languages: ["English", "Hindi"],
    },
    projects: [
      {
        id: "p1",
        name: "AI Resume Builder",
        techStack: ["React", "Node.js"],
        bullets: ["Built an ATS scoring tool used by 500+ students"],
      },
    ],
  };

  // Renders the ACTUAL template component at its natural "full-page" width,
  // then shrinks the whole thing down with CSS `zoom` (real reflow, not a
  // visual-only transform) so it looks like a true miniature of the real
  // output — same technique already used for the live preview panel in
  // BuilderPage.jsx. `700px` matches the width the templates are designed/
  // tested at elsewhere in the app (BuilderPage's preview wrapper).
  function TemplateMockup({ Component }) {
    return (
      <div className="w-full h-full overflow-hidden relative bg-white">
        <div style={{ width: "700px", zoom: 0.4 }}>
          <Component resume={MOCK_RESUME} />
        </div>
      </div>
    );
  }

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

  // NEW — ATS-safety indicator badge. 'safe' = single-column, linear
  // reading order, parses reliably in legacy/bulk-hiring ATS systems.
  // 'moderate' = has a sidebar, grid, or side-by-side column block that
  // some ATS parsers may read out of order. This is a transparency signal,
  // not a restriction — see handoff Section 5q for the product reasoning.
  function ATSBadge({ rating }) {
    const isSafe = rating === "safe";
    return (
      <span
        title={
          isSafe
            ? "Single-column layout — reads cleanly in most ATS systems, including bulk-hiring ones like TCS/Infosys."
            : "Has a sidebar or multi-column block — most modern ATS handle this fine, but some bulk-hiring ATS may read it out of order."
        }
        className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
          isSafe
            ? "bg-[#ecfdf5] text-[#059669] border border-[#059669]/25"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isSafe ? "bg-[#059669]" : "bg-amber-500"}`} />
        {isSafe ? "ATS-Safe" : "Moderate ATS"}
      </span>
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
        <div className="w-full aspect-[0.74] rounded-lg bg-white border border-[#e2e8f0] mb-3 overflow-hidden relative">
          <div className="w-full h-full transition-transform duration-300 ease-out group-hover/tpl:scale-[1.035]">
            <TemplateMockup Component={t.component} />
          </div>

          {locked && <ProBadge />}

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

        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-semibold text-[#0a1628]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t.name}
          </p>
          <ATSBadge rating={t.atsRating} />
        </div>
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

          <div className="overflow-y-auto flex-1 px-7 py-6">
            {/* NEW — ATS badge legend, shown once at the top so users
                understand the dot/badge meaning before scanning cards */}
            <div
              className="flex items-center gap-4 mb-5 px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#f1f5f9] text-[10.5px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="text-[#4a6fa5] font-medium">ATS reading order:</span>
              <span className="inline-flex items-center gap-1.5 text-[#059669]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" /> ATS-Safe — single column, reads top to bottom
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Moderate — sidebar/grid layout
              </span>
            </div>

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