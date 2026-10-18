// src/components/premium/TemplateSwitcherContent.jsx
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import { TEMPLATES } from "../templates/templateRegistry";

// v2 FIX (this session): the modal panel previously used <LiquidGlassCard>
// (backdrop-blur + SVG feTurbulence/feDisplacementMap distortion filter +
// violet tint layer). The distortion filter used
// `filterUnits="objectBoundingBox"` with `feDisplacementMap scale="200"` —
// scale is in absolute user-space pixels while the filter region is a 0–1
// fraction of the element's bounding box, so a 200px displacement against
// a modal-sized box pushed pixels far outside the visible region. Result:
// blank/melted-looking panel instead of a subtle glass effect.
//
// Decision (confirmed, revised twice): first pass dropped translucency
// entirely (flat opaque bg-soft-snow). Second pass brought back a frosted
// "snow glass" translucent look via `bg-paper-white/85` + `backdrop-blur-md`.
// FINAL (this session) — reverted to a SOLID opaque panel to match
// ATSContent.jsx's background exactly, per Devansh's explicit request for
// uniformity between the two "centered wide modal" surfaces: `bg-paper-white`
// (fully opaque) + `1px solid #e0e0e0` border + the same two-layer box-shadow
// ATSContent uses. No backdrop-blur on the panel itself anymore — only the
// outer full-screen overlay behind the modal still blurs the page content.
// Nothing else in this file changed.
//
// MICRO-INTERACTIONS PASS (this session): added a staggered card
// entrance, a gentle backdrop/header fade-in, a soft breathing pulse on
// the ATS legend dots, and an arrow micro-shift on the "Unlock all with
// any pass" link. All additive — no layout, color, or radius changes.
// Everything respects `prefers-reduced-motion` via the existing media
// query block.

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
// DENSITY PASS: zoom dropped 0.4 → 0.24 to match the smaller card
// footprint below — otherwise the mockup gets clipped by the smaller
// `overflow-hidden` container instead of shrinking with it.
function TemplateMockup({ Component }) {
  return (
    <div className="w-full h-full overflow-hidden relative bg-paper-white">
      <div style={{ width: "700px", zoom: 0.24 }}>
        <Component resume={MOCK_RESUME} />
      </div>
    </div>
  );
}

function ProBadge() {
  return (
    <div className="absolute top-1.5 right-1.5 z-10 rounded-full overflow-hidden p-[1.5px]">
      <div className="relative rounded-full overflow-hidden">
        <div
          className="absolute inset-[-150%]"
          style={{
            background: "conic-gradient(from 0deg, #7451f2, #d8cffb, #7451f2)",
            animation: "rf-pro-badge-spin 3s linear infinite",
          }}
        />
        <span className="relative z-10 block bg-graphite-ink text-paper-white font-mono text-[8px] font-medium tracking-wider px-2 py-[3px] rounded-full">
          PRO
        </span>
      </div>
    </div>
  );
}

// ATS-safety indicator badge — pulled from the v2 semantic tokens (§3.2),
// NOT from brand violet. 'safe' = single-column, linear reading order,
// parses reliably in legacy/bulk-hiring ATS systems. 'moderate' = has a
// sidebar/grid block some ATS parsers may read out of order.
function ATSBadge({ rating }) {
  const isSafe = rating === "safe";
  return (
    <span
      title={
        isSafe
          ? "Single-column layout — reads cleanly in most ATS systems, including bulk-hiring ones like TCS/Infosys."
          : "Has a sidebar or multi-column block — most modern ATS handle this fine, but some bulk-hiring ATS may read it out of order."
      }
      className="inline-flex items-center gap-1 font-mono text-[8px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap border shrink-0 transition-transform duration-200 hover:scale-[1.04]"
      style={{
        background: isSafe ? "rgb(var(--color-success-bg))" : "rgb(var(--color-warning-bg))",
        color: isSafe ? "rgb(var(--color-success-text))" : "rgb(var(--color-warning-text))",
        borderColor: isSafe ? "rgb(var(--color-success-border))" : "rgb(var(--color-warning-border))",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: isSafe ? "rgb(var(--color-success-text))" : "rgb(var(--color-warning-text))",
          animation: "rf-dot-breathe 2.4s ease-in-out infinite",
        }}
      />
      {isSafe ? "ATS-SAFE" : "MODERATE"}
    </span>
  );
}

function TemplateCard({ t, active, locked, onSelect, index }) {
  return (
    <button
      key={t.id}
      type="button"
      onClick={() => onSelect(t)}
      className={`group/tpl relative rounded-cards border p-2.5 text-left transition-all duration-200 opacity-0 ${
        active
          ? "border-iris-violet bg-[rgba(116,81,242,0.06)]"
          : locked
          ? "border-mist bg-paper-white hover:border-iris-violet/40 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(116,81,242,0.28)]"
          : "border-mist bg-paper-white hover:border-slate/50 hover:-translate-y-0.5"
      }`}
      style={{
        animation: "rf-card-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        animationDelay: `${Math.min(index, 10) * 35}ms`,
      }}
    >
      <div className="w-full aspect-[0.74] rounded-cards bg-paper-white border border-mist mb-2 overflow-hidden relative">
        <div
          className={`w-full h-full transition-transform duration-300 ease-out group-hover/tpl:scale-[1.035] ${
            locked ? "blur-[3px] scale-105" : ""
          }`}
        >
          <TemplateMockup Component={t.component} />
        </div>

        {locked && <ProBadge />}

        {locked && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover/tpl:translate-y-0 transition-transform duration-200 ease-out">
            <div className="flex items-center justify-center gap-1 py-1.5 font-body text-[9.5px] font-semibold text-paper-white bg-graphite-ink">
              <span>Unlock this style</span>
              <span className="transition-transform duration-200 group-hover/tpl:translate-x-0.5">→</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-1.5">
        <p className="font-body text-[12px] font-semibold text-graphite-ink transition-colors duration-200 group-hover/tpl:text-iris-violet leading-tight">
          {t.name}
        </p>
        <ATSBadge rating={t.atsRating} />
      </div>
      <p className="font-body text-[10px] text-ash mt-0.5 leading-snug line-clamp-2">
        {t.description}
      </p>

      {active && (
        <span
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-iris-violet flex items-center justify-center"
          style={{
            animation: "rf-check-pop 220ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
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
      style={{
        background: "rgba(10,22,40,0.45)",
        backdropFilter: "blur(2px)",
        animation: "rf-backdrop-in 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* rf-modal-in keyframe lives once in global.css — not redeclared here */}
      <style>{`
        @keyframes rf-pro-badge-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Subtle light pass around the modal boundary */
        @keyframes rf-modal-border-shimmer {
          0%, 65%, 100% {
            opacity: 0;
            transform: translateX(-120%);
          }
          72% {
            opacity: 0.65;
          }
          85% {
            opacity: 0;
            transform: translateX(120%);
          }
        }

        /* Tiny selected-template check pop */
        @keyframes rf-check-pop {
          0% {
            opacity: 0;
            transform: scale(0.55);
          }
          65% {
            transform: scale(1.12);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Backdrop fade so the dim + blur doesn't just snap in */
        @keyframes rf-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Staggered card entrance — fade + tiny rise, not a slide */
        @keyframes rf-card-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Soft breathing pulse on ATS legend dots — status, not decoration,
           so kept very subtle (opacity only, no scale/color shift) */
        @keyframes rf-dot-breathe {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }

        /* Close button entrance — arrives a beat after the panel itself */
        @keyframes rf-close-in {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-90deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        /* Close button hover — playful overshoot spin+scale instead of a
           flat rotate, same spring-easing convention used elsewhere */
        @keyframes rf-close-hover-spin {
          0%   { transform: scale(1) rotate(0deg); }
          60%  { transform: scale(1.12) rotate(100deg); }
          100% { transform: scale(1.06) rotate(90deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Modal panel — v2 FINAL (this session): solid opaque bg-paper-white,
          matching ATSContent.jsx's panel exactly (same border color, same
          two-layer box-shadow). No backdrop-blur on the panel itself —
          only the full-screen overlay behind it blurs page content. */}
      <div
        className="group/modal relative rounded-cards w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col bg-paper-white"
        style={{
          animation: "rf-modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          border: "1px solid #e0e0e0",
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px",
        }}
      >
        {/* One quiet light pass around the panel — intentionally not a permanent glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-cards"
        >
          <div
            className="absolute top-0 left-0 h-px w-28"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(116,81,242,0.55), transparent)",
              animation: "rf-modal-border-shimmer 5.5s ease-in-out infinite",
            }}
          />
        </div>
        <div className="flex items-start justify-between gap-4 px-7 py-6 shrink-0 border-b border-mist/50">
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-[26px] text-graphite-ink leading-tight">
              Templates
            </h2>
            <p className="font-body text-[13px] text-ash">
              Pick a look — your data stays the same
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close templates"
            className="group/close w-8 h-8 shrink-0 flex items-center justify-center rounded-buttons transition-colors duration-200 hover:bg-soft-snow active:scale-90 text-ash hover:text-graphite-ink"
            style={{ animation: "rf-close-in 0.32s cubic-bezier(0.34,1.56,0.64,1) 0.12s backwards" }}
          >
            <span className="inline-block text-xl leading-none transition-transform duration-200 group-hover/close:[animation:rf-close-hover-spin_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
              ×
            </span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-7 py-6">
          {/* ATS badge legend, shown once at the top so users understand
              the dot/badge meaning before scanning cards */}
          <div className="flex items-center gap-4 mb-5 px-3.5 py-2.5 rounded-cards bg-paper-white border border-mist font-body text-[10.5px] transition-shadow duration-200 hover:border-mist">
            <span className="text-ash font-medium">ATS reading order:</span>
            <span className="inline-flex items-center gap-1.5 transition-transform duration-200 hover:scale-[1.03]" style={{ color: "rgb(var(--color-success-text))" }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "rgb(var(--color-success-text))", animation: "rf-dot-breathe 2.4s ease-in-out infinite" }}
              />
              ATS-Safe — single column, reads top to bottom
            </span>
            <span className="inline-flex items-center gap-1.5 transition-transform duration-200 hover:scale-[1.03]" style={{ color: "rgb(var(--color-warning-text))" }}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "rgb(var(--color-warning-text))", animation: "rf-dot-breathe 2.4s ease-in-out infinite", animationDelay: "0.6s" }}
              />
              Moderate — sidebar/grid layout
            </span>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-mono text-[11px] font-medium tracking-widest uppercase text-ash">
              Free Templates
            </h3>
            <span className="h-px flex-1 bg-mist" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-7">
            {freeTemplates.map((t, i) => (
              <TemplateCard
                key={t.id}
                t={t}
                index={i}
                active={t.id === selectedTemplateId}
                locked={false}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {premiumTemplates.length > 0 && (
            <>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="font-mono text-[11px] font-medium tracking-widest uppercase text-ash">
                  Premium Templates
                </h3>
                <span className="h-px flex-1 bg-mist" />
                {!isPremium && (
                  <button
                    type="button"
                    onClick={onRequestUpgrade}
                    className="group/unlock font-body text-[10.5px] font-semibold text-iris-violet hover:text-deep-iris whitespace-nowrap inline-flex items-center gap-1"
                  >
                    <span>Unlock all with any pass</span>
                    <span className="inline-block transition-transform duration-200 ease-out group-hover/unlock:translate-x-0.5">→</span>
                  </button>
                )}
              </div>
              {!isPremium && (
                <p className="font-body text-[11.5px] text-ash/80 mb-3.5">
                  Your resume content is ready — these styles just present it better. Starting at ₹79.
                </p>
              )}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {premiumTemplates.map((t, i) => (
                  <TemplateCard
                    key={t.id}
                    t={t}
                    index={freeTemplates.length + i}
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