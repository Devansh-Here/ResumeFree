// src/components/landing/Features.jsx
import ScrollGlow from '../ui/ScrollGlow'
/* ─── Mini Visuals ─── */

function AIBulletVisual() {
  return (
    <div className="w-full space-y-3">
      <div className="bg-fog border border-dove/50 rounded-inputs p-4">
        <p className="font-sohne text-[11px] tracking-widest text-graphite uppercase mb-2">✗ Before</p>
        <p className="font-sohne text-[14px] text-ash leading-[1.5]">
          Worked on a project related to databases for college
        </p>
      </div>
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-px bg-dove/50" />
        <span className="font-sohne text-[11px] text-rust">✨ AI</span>
        <div className="flex-1 h-px bg-dove/50" />
      </div>
      <div className="bg-apricot-wash border border-rust/30 rounded-inputs p-4 relative">
        <p className="font-sohne text-[11px] tracking-widest text-rust uppercase mb-2">✓ After</p>
        <p className="font-sohne text-[14px] text-ink leading-[1.5]">
          Optimized MySQL queries for 500-record inventory system, reducing load time from{" "}
          <span className="font-[500]">3s → 400ms</span>
        </p>
        <span className="absolute -top-2.5 -right-2 font-sohne text-[9px] font-[500] text-rust border border-rust/50 bg-white px-1.5 py-0.5 rounded" style={{ transform: "rotate(-6deg)" }}>
          ATS PASS ✓
        </span>
      </div>
    </div>
  );
}

function JDMatcherVisual() {
  const keywords = [
    { word: "Java",         match: true  },
    { word: "Spring Boot",  match: true  },
    { word: "MySQL",        match: true  },
    { word: "REST API",     match: false },
    { word: "Docker",       match: false },
    { word: "Microservices",match: false },
    { word: "Git",          match: true  },
    { word: "Agile",        match: false },
  ];
  return (
    <div className="w-full bg-white border border-dove/40 rounded-cards overflow-hidden"
      style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 8px 16px -4px" }}>
      <div className="px-4 py-3 bg-fog border-b border-dove/40 flex items-center justify-between">
        <span className="font-sohne text-[11px] text-graphite tracking-[-0.009em]">JD Keyword Match</span>
        <span className="font-sohne text-[11px] font-[500] text-rust">65 / 100</span>
      </div>
      <div className="p-4 flex flex-wrap gap-2">
        {keywords.map(({ word, match }) => (
          <span key={word}
            className={`font-sohne text-[12px] px-2.5 py-1 rounded-tags border tracking-[-0.009em] ${
              match
                ? "bg-apricot-wash border-rust/30 text-rust"
                : "bg-fog border-dove/50 text-graphite"
            }`}>
            {match ? "✓" : "+"} {word}
          </span>
        ))}
      </div>
      <div className="px-4 pb-4">
        <p className="font-sohne text-[12px] text-graphite tracking-[-0.009em]">
          <span className="text-ink font-[500]">+ REST API, Docker, Microservices</span> — add these to reach 90+
        </p>
      </div>
    </div>
  );
}

function ATSVisual() {
  const score  = 72;
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;
  return (
    <div className="w-full bg-white border border-dove/40 rounded-cards p-5 flex flex-col items-center gap-4"
      style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 8px 16px -4px" }}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#cbd5e1" strokeWidth="8" />
          <circle cx="60" cy="60" r={radius} fill="none"
            stroke="#059669" strokeWidth="8"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-signifier text-[28px] text-ink leading-none">{score}</span>
          <span className="font-sohne text-[11px] text-graphite mt-1">/ 100</span>
        </div>
      </div>
      <div className="w-full bg-fog border border-dove/40 rounded-inputs p-3 space-y-2">
        <p className="font-sohne text-[11px] text-graphite uppercase tracking-wider">Missing keywords</p>
        {["Docker", "Microservices", "REST API"].map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rust flex-shrink-0" />
            <span className="font-sohne text-[13px] text-ash tracking-[-0.009em]">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PDFVisual() {
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-44 bg-white border border-dove/40 rounded-cards overflow-hidden"
        style={{ boxShadow: "rgba(15,23,42,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.12) 0px 16px 32px -8px" }}>
        <div className="bg-ink px-3 py-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="w-2 h-2 rounded-full bg-rust" />
          <span className="ml-2 font-sohne text-[9px] text-white/50">resume.pdf</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-ink rounded-sm w-3/4" />
          <div className="h-2 bg-dove/50 rounded-sm w-1/2" />
          <div className="h-px bg-dove/40 my-1" />
          {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
            <div key={i} className="h-1.5 bg-dove/40 rounded-sm" style={{ width: `${w * 100}%` }} />
          ))}
          <div className="h-px bg-dove/40 my-1" />
          {[0.85, 0.65, 0.75].map((w, i) => (
            <div key={i} className="h-1.5 bg-dove/40 rounded-sm" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-sohne text-[10px] font-[500] text-rust border border-rust/50 px-2 py-0.5 rounded bg-white/90"
            style={{ transform: "rotate(-12deg)" }}>
            NO WATERMARK
          </span>
        </div>
      </div>
    </div>
  );
}

function TemplatesVisual() {
  const templates = [
    { name: "Classic", color: "#0a1628" },
    { name: "Modern",  color: "#059669" },
    { name: "Minimal", color: "#4a6fa5" },
  ];
  return (
    <div className="w-full flex gap-3 justify-center">
      {templates.map(({ name, color }, idx) => (
        <div key={name}
          className="flex-1 bg-white border border-dove/40 rounded-images overflow-hidden"
          style={{
            transform: idx === 1 ? "scale(1.05)" : "scale(0.97)",
            zIndex: idx === 1 ? 2 : 1,
            boxShadow: idx === 1 ? "rgba(15,23,42,0.08) 0px 8px 24px -4px" : "none"
          }}>
          <div className="h-1.5 w-full" style={{ background: color }} />
          <div className="p-2.5 space-y-1.5">
            <div className="h-2.5 rounded-sm" style={{ background: color, width: "70%" }} />
            <div className="h-1.5 bg-dove/40 rounded-sm w-1/2" />
            <div className="h-px bg-dove/30 my-1" />
            {[0.9, 0.7, 0.8].map((w, i) => (
              <div key={i} className="h-1 bg-dove/40 rounded-sm" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
          <div className="text-center pb-2">
            <span className="font-sohne text-[8px] tracking-widest uppercase" style={{ color }}>
              {name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AutoSaveVisual() {
  return (
    <div className="w-full bg-white border border-dove/40 rounded-cards overflow-hidden"
      style={{ boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 8px 16px -4px" }}>
      <div className="px-4 py-3 bg-fog border-b border-dove/40 flex items-center justify-between">
        <span className="font-sohne text-[11px] text-graphite tracking-[-0.009em]">Auto-Save Log</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rust animate-pulse" />
          <span className="font-sohne text-[11px] text-rust">Live</span>
        </span>
      </div>
      <div className="p-4 space-y-3">
        {[
          { time: "09:41", action: "Education section saved",  bold: false },
          { time: "09:43", action: "2 bullet points updated",  bold: false },
          { time: "09:44", action: "Skills list saved",        bold: false },
          { time: "Now",   action: "All changes saved ✓",     bold: true  },
        ].map(({ time, action, bold }) => (
          <div key={time} className="flex items-center gap-3">
            <span className="font-sohne text-[11px] text-dove w-8 shrink-0 tracking-[-0.009em]">{time}</span>
            <span className={`font-sohne text-[13px] tracking-[-0.009em] ${bold ? "text-rust font-[500]" : "text-graphite"}`}>
              {action}
            </span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 bg-apricot-wash border border-rust/20 rounded-inputs p-3">
        <p className="font-sohne text-[11px] text-rust tracking-[-0.009em]">
          localStorage · 0 accounts · 0 servers · your device only
        </p>
      </div>
    </div>
  );
}

/* ─── Feature Data ─── */
const FEATURES = [
  {
    id: "ai-bullets",
    label: "AI Bullet Improver",
    heading: "Turn weak bullets into interview-winning lines",
    body: "Paste your bullet — AI rewrites it with metrics, strong action verbs, and real impact. No more 'Worked on...' or 'Was responsible for...'.",
    tag: "Free · 3 improvements",
    premium: false,
    visual: <AIBulletVisual />,
  },
  {
    id: "jd-matcher",
    label: "JD Matcher",
    heading: "Tailored for TCS, Infosys, or any startup",
    body: "Paste the job description. AI spots the keyword gap, rewrites bullets to match, and tells you exactly what to add. One resume → tailored for every job.",
    tag: "Premium",
    premium: true,
    visual: <JDMatcherVisual />,
  },
  {
    id: "ats-score",
    label: "ATS Score Checker",
    heading: "Know if your resume survives the robot",
    body: "Get a 0–100 ATS score instantly. See which keywords you're missing and exactly where to add them — before you hit submit.",
    tag: "Free · 1 check",
    premium: false,
    visual: <ATSVisual />,
  },
  {
    id: "free-pdf",
    label: "Instant PDF Download",
    heading: "No watermark. No paywall. No ₹5 surprise.",
    body: "PDF generates right in your browser — no server, no account, no hidden charge. Download in 2 seconds and send it directly to HR.",
    tag: "Always free",
    premium: false,
    visual: <PDFVisual />,
  },
  {
    id: "templates",
    label: "Indian ATS Templates",
    heading: "Designed for TCS, Capgemini and Indian HR",
    body: "5 clean single-column templates built for Indian ATS systems. CGPA format, +91 phone, Indian address — no US formatting confusion.",
    tag: "Free · 5 templates",
    premium: false,
    visual: <TemplatesVisual />,
  },
  {
    id: "autosave",
    label: "Auto-Save",
    heading: "Close the tab. Your resume stays.",
    body: "Everything saves to your browser automatically. Come back tomorrow on the same device — every field exactly where you left it. Zero data loss.",
    tag: "Free · No sign-up",
    premium: false,
    visual: <AutoSaveVisual />,
  },
];

/* ─── Main ─── */
export default function Features() {
  return (
    <section id="features" className="relative bg-white py-24 px-5 sm:px-8 overflow-hidden">
      <ScrollGlow position="top-right"   size="lg" opacity={0.08} delay={0}   />
      <ScrollGlow position="bottom-left" size="md" opacity={0.06} delay={300} />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-8 h-px bg-dove" />
          <span className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">What you get</span>
          <span className="w-8 h-px bg-dove" />
        </div>
        <h2
          className="font-signifier text-ink leading-[1.1] max-w-2xl mx-auto"
          style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", letterSpacing: "-0.66px" }}
        >
          Everything you need.{" "}
          <em className="not-italic" style={{ color: "#059669" }}>Nothing you don&apos;t.</em>
        </h2>
        <p className="mt-5 font-sohne text-graphite max-w-xl mx-auto leading-[1.5] tracking-[-0.009em]"
          style={{ fontSize: "16px" }}>
          No bloated dashboards. No "upgrade to unlock" on every click. Just the tools that actually get you the interview.
        </p>
      </div>

      {/* Alternating rows */}
      <div className="max-w-5xl mx-auto">
        {FEATURES.map(({ id, label, heading, body, tag, premium, visual }, idx) => (
          <div
            key={id}
            className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center py-16 ${
              idx !== FEATURES.length - 1 ? "border-b border-dove/30" : ""
            }`}
          >
            {/* Text */}
            <div className={`${idx % 2 === 0 ? "md:order-1" : "md:order-2"} space-y-5`}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sohne text-[12px] text-graphite tracking-[-0.009em] uppercase">{label}</span>
                <span className={`font-sohne text-[11px] px-2.5 py-1 rounded-tags tracking-[-0.009em] ${
                  premium
                    ? "bg-ink/8 text-ink border border-ink/15"
                    : "bg-apricot-wash text-rust border border-rust/20"
                }`}>
                  {tag}
                </span>
              </div>

              <h3
                className="font-signifier text-ink leading-[1.18]"
                style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", letterSpacing: "-0.23px" }}
              >
                {heading}
              </h3>

              <p className="font-sohne text-ash leading-[1.5] tracking-[-0.009em]" style={{ fontSize: "16px" }}>
                {body}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="w-6 h-px bg-rust" />
                <span className="font-sohne text-[12px] text-graphite tracking-[-0.009em]">resumefree</span>
              </div>
            </div>

            {/* Visual */}
            <div className={`${idx % 2 === 0 ? "md:order-2" : "md:order-1"} relative`}>
              {visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}