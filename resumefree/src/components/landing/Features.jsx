// src/components/landing/Features.jsx

const FEATURES = [
  {
    id: "ai-bullets",
    label: "AI Bullet Improver",
    heading: "Turn weak bullets into interview-winning lines",
    body: "Paste your bullet — AI rewrites it with metrics, strong action verbs, and real impact. No more 'Worked on...' or 'Was responsible for...'.",
    tag: "Free · 3 improvements",
    visual: <AIBulletVisual />,
  },
  {
    id: "jd-matcher",
    label: "JD Matcher",
    heading: "Tailored for TCS, Infosys, or any startup",
    body: "Paste the job description. AI spots the keyword gap, rewrites bullets to match, and tells you exactly what to add. One resume → tailored for every job.",
    tag: "Premium",
    visual: <JDMatcherVisual />,
  },
  {
    id: "ats-score",
    label: "ATS Score Checker",
    heading: "Know if your resume survives the robot",
    body: "Get a 0–100 ATS score instantly. See which keywords you're missing and exactly where to add them — before you hit submit.",
    tag: "Free · 1 check",
    visual: <ATSVisual />,
  },
  {
    id: "free-pdf",
    label: "Instant PDF Download",
    heading: "No watermark. No paywall. No ₹5 surprise.",
    body: "PDF generates right in your browser — no server, no account, no hidden charge. Download in 2 seconds and send it directly to HR.",
    tag: "Always free",
    visual: <PDFVisual />,
  },
  {
    id: "templates",
    label: "Indian ATS Templates",
    heading: "Designed for TCS, Capgemini and Indian HR",
    body: "5 clean single-column templates built for Indian ATS systems. CGPA format, +91 phone, Indian address — no US formatting confusion.",
    tag: "Free · 5 templates",
    visual: <TemplatesVisual />,
  },
  {
    id: "autosave",
    label: "Auto-Save",
    heading: "Close the tab. Your resume stays.",
    body: "Everything saves to your browser automatically. Come back tomorrow on the same device — every field exactly where you left it. Zero data loss.",
    tag: "Free · No sign-up",
    visual: <AutoSaveVisual />,
  },
];

/* ─── Mini visuals ─────────────────────────────────────────── */

function AIBulletVisual() {
  return (
    <div className="w-full space-y-3">
      {/* Before */}
      <div className="bg-[#F6F4EF] border border-[#DDD6C8] rounded-lg p-4">
        <p className="text-[10px] font-mono tracking-widest text-[#161A2E]/40 uppercase mb-2">✗ Before</p>
        <p className="text-sm text-[#161A2E]/60" style={{ fontFamily: "'Inter', sans-serif" }}>
          Worked on a project related to databases for college
        </p>
      </div>
      {/* Arrow */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-px bg-[#DDD6C8]" />
        <span className="text-[#1E8E5A] text-xs font-mono">✨ AI</span>
        <div className="flex-1 h-px bg-[#DDD6C8]" />
      </div>
      {/* After */}
      <div className="bg-white border border-[#1E8E5A]/50 rounded-lg p-4 relative">
        <p className="text-[10px] font-mono tracking-widest text-[#1E8E5A] uppercase mb-2">✓ After</p>
        <p className="text-sm text-[#161A2E]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Optimized MySQL queries for 500-record inventory system, reducing load time from{" "}
          <span className="font-semibold">3s → 400ms</span>
        </p>
        <span className="absolute -top-2.5 -right-2 font-mono text-[9px] font-bold text-[#1E8E5A] border-2 border-[#1E8E5A] bg-white px-1.5 py-0.5 rounded rotate-[-6deg] shadow-sm">
          ATS PASS ✓
        </span>
      </div>
    </div>
  );
}

function JDMatcherVisual() {
  const keywords = [
    { word: "Java", match: true },
    { word: "Spring Boot", match: true },
    { word: "MySQL", match: true },
    { word: "REST API", match: false },
    { word: "Docker", match: false },
    { word: "Microservices", match: false },
    { word: "Git", match: true },
    { word: "Agile", match: false },
  ];
  return (
    <div className="w-full bg-white border border-[#DDD6C8] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#DDD6C8] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-[#161A2E]/40 uppercase">JD Keyword Match</span>
        <span className="font-mono text-[10px] font-bold text-[#E2A33B]">65 / 100</span>
      </div>
      <div className="p-4 flex flex-wrap gap-2">
        {keywords.map(({ word, match }) => (
          <span
            key={word}
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              match
                ? "bg-[#1E8E5A]/10 border-[#1E8E5A]/30 text-[#1E8E5A]"
                : "bg-[#E2A33B]/10 border-[#E2A33B]/30 text-[#E2A33B]"
            }`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {match ? "✓" : "+"} {word}
          </span>
        ))}
      </div>
      <div className="px-4 pb-4">
        <p className="text-[11px] text-[#161A2E]/50" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-[#E2A33B] font-semibold">+ REST API, Docker, Microservices, Agile</span> — add these to reach 90+
        </p>
      </div>
    </div>
  );
}

function ATSVisual() {
  const score = 72;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;

  return (
    <div className="w-full bg-white border border-[#DDD6C8] rounded-lg p-5 flex flex-col items-center gap-4">
      {/* Score ring */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#DDD6C8" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke="#1E8E5A" strokeWidth="8"
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#161A2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {score}
          </span>
          <span className="font-mono text-[10px] text-[#161A2E]/40 tracking-widest uppercase">/ 100</span>
        </div>
      </div>
      {/* Missing keywords */}
      <div className="w-full bg-[#F6F4EF] border border-[#DDD6C8] rounded p-3 space-y-1.5">
        <p className="font-mono text-[10px] tracking-widest text-[#161A2E]/40 uppercase">Missing keywords</p>
        {["Docker", "Microservices", "REST API"].map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2A33B] flex-shrink-0" />
            <span className="text-xs text-[#161A2E]/60" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PDFVisual() {
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-44 bg-white border border-[#DDD6C8] rounded-lg shadow-lg overflow-hidden">
        {/* PDF header */}
        <div className="bg-[#161A2E] px-3 py-2 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-[#1E8E5A]" />
          <span className="ml-2 font-mono text-[9px] text-white/50">resume.pdf</span>
        </div>
        {/* Simulated resume lines */}
        <div className="p-3 space-y-2">
          <div className="h-3 bg-[#161A2E] rounded-sm w-3/4" />
          <div className="h-2 bg-[#DDD6C8] rounded-sm w-1/2" />
          <div className="h-px bg-[#DDD6C8] my-1" />
          {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
            <div key={i} className="h-1.5 bg-[#DDD6C8] rounded-sm" style={{ width: `${w * 100}%` }} />
          ))}
          <div className="h-px bg-[#DDD6C8] my-1" />
          {[0.85, 0.65, 0.75].map((w, i) => (
            <div key={i} className="h-1.5 bg-[#DDD6C8] rounded-sm" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        {/* No watermark stamp */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-mono text-[10px] font-bold text-[#1E8E5A] border-2 border-[#1E8E5A] px-2 py-0.5 rounded rotate-[-12deg] bg-white/90 shadow-sm"
          >
            NO WATERMARK
          </span>
        </div>
      </div>

      {/* Download badge */}
      <div className="absolute bottom-4 right-4">
        <span className="bg-[#1E8E5A] text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow">
          ↓ Free PDF
        </span>
      </div>
    </div>
  );
}

function TemplatesVisual() {
  const templates = [
    { name: "Classic", color: "#161A2E" },
    { name: "Modern", color: "#1E8E5A" },
    { name: "Minimal", color: "#E2A33B" },
  ];
  return (
    <div className="w-full flex gap-3 justify-center">
      {templates.map(({ name, color }, idx) => (
        <div
          key={name}
          className="flex-1 bg-white border border-[#DDD6C8] rounded-lg overflow-hidden shadow-sm"
          style={{ transform: idx === 1 ? "scale(1.05)" : "scale(0.97)", zIndex: idx === 1 ? 2 : 1 }}
        >
          <div className="h-1.5 w-full" style={{ background: color }} />
          <div className="p-2.5 space-y-1.5">
            <div className="h-2.5 rounded-sm" style={{ background: color, width: "70%" }} />
            <div className="h-1.5 bg-[#DDD6C8] rounded-sm w-1/2" />
            <div className="h-px bg-[#DDD6C8] my-1" />
            {[0.9, 0.7, 0.8].map((w, i) => (
              <div key={i} className="h-1 bg-[#DDD6C8] rounded-sm" style={{ width: `${w * 100}%` }} />
            ))}
          </div>
          <div className="text-center pb-2">
            <span className="font-mono text-[8px] tracking-widest uppercase" style={{ color }}>
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
    <div className="w-full bg-white border border-[#DDD6C8] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 bg-[#F6F4EF] border-b border-[#DDD6C8] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest text-[#161A2E]/40 uppercase">Auto-Save Log</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E5A] animate-pulse" />
          <span className="font-mono text-[10px] text-[#1E8E5A]">Live</span>
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { time: "09:41", action: "Education section saved", ok: true },
          { time: "09:43", action: "2 bullet points updated", ok: true },
          { time: "09:44", action: "Skills list saved", ok: true },
          { time: "Now", action: "All changes saved ✓", ok: true, bold: true },
        ].map(({ time, action, bold }) => (
          <div key={time} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[#161A2E]/30 w-8 flex-shrink-0">{time}</span>
            <span
              className={`text-xs ${bold ? "text-[#1E8E5A] font-semibold" : "text-[#161A2E]/50"}`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {action}
            </span>
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 bg-[#1E8E5A]/8 border border-[#1E8E5A]/20 rounded p-2.5">
        <p className="font-mono text-[10px] text-[#1E8E5A]">
          localStorage · 0 accounts · 0 servers · your device only
        </p>
      </div>
    </div>
  );
}

/* ─── Main Features Component ──────────────────────────────── */

export default function Features() {
  return (
    <section id="features" className="bg-[#F6F4EF] py-24 px-4">
      {/* Section header */}
      <div className="max-w-6xl mx-auto mb-20 text-center">
        <p
          className="font-mono text-[10px] tracking-widest text-[#1E8E5A] uppercase mb-4"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          What you get
        </p>
        <h2
          className="text-[#161A2E] font-bold leading-tight"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          }}
        >
          Everything you need.{" "}
          <span className="text-[#1E8E5A]">Nothing you don't.</span>
        </h2>
        <p
          className="mt-4 text-[#161A2E]/50 max-w-xl mx-auto"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem" }}
        >
          No bloated dashboards. No "upgrade to unlock" on every click. Just the tools that actually get you the interview.
        </p>
      </div>

      {/* Alternating rows */}
      <div className="max-w-5xl mx-auto space-y-0">
        {FEATURES.map(({ id, label, heading, body, tag, visual }, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={id}
              className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center py-16 ${
                idx !== FEATURES.length - 1 ? "border-b border-[#DDD6C8]" : ""
              }`}
            >
              {/* Text — left on even, right on odd */}
              <div className={`${isEven ? "md:order-1" : "md:order-2"} space-y-5`}>
                {/* Label + tag */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="font-mono text-[10px] tracking-widest text-[#161A2E]/40 uppercase"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {label}
                  </span>
                  <span
                    className={`font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                      tag === "Premium"
                        ? "text-[#E2A33B] border-[#E2A33B]/40 bg-[#E2A33B]/8"
                        : "text-[#1E8E5A] border-[#1E8E5A]/30 bg-[#1E8E5A]/8"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {tag}
                  </span>
                </div>

                {/* Heading */}
                <h3
                  className="text-[#161A2E] font-bold leading-snug"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                  }}
                >
                  {heading}
                </h3>

                {/* Body */}
                <p
                  className="text-[#161A2E]/55 leading-relaxed text-base"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {body}
                </p>

                {/* Divider tick */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-6 h-px bg-[#1E8E5A]" />
                  <span
                    className="font-mono text-[10px] text-[#161A2E]/30 tracking-widest uppercase"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    resumefree.in
                  </span>
                </div>
              </div>

              {/* Visual — right on even, left on odd */}
              <div className={`${isEven ? "md:order-2" : "md:order-1"} relative`}>
                {visual}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}