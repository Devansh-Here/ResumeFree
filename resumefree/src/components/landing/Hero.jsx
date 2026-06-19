import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Simulated "before" and "after" bullets for the live demo strip
const BULLETS = [
  {
    before: "Worked on database project",
    after: "Optimized MySQL queries for 500-record inventory system, reducing load time from 3s → 400ms",
  },
  {
    before: "Made a website for college fest",
    after: "Built responsive React.js event portal for 2,000+ attendees; cut registration time by 60%",
  },
  {
    before: "Did internship at a startup",
    after: "Developed REST APIs at fintech startup handling ₹4L/day transactions using Node.js + MongoDB",
  },
];

const STATS = [
  { value: "0", label: "sign-up required" },
  { value: "₹0", label: "to download PDF" },
  { value: "100%", label: "ATS friendly" },
  { value: "8 min", label: "to build resume" },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const [stamped, setStamped] = useState(false);

  // Cycle through bullet examples
  useEffect(() => {
    const cycle = setInterval(() => {
      setShowAfter(false);
      setStamped(false);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % BULLETS.length);
        setTimeout(() => setShowAfter(true), 400);
        setTimeout(() => setStamped(true), 900);
      }, 300);
    }, 3500);
    // kick off immediately
    const init = setTimeout(() => {
      setShowAfter(true);
      setTimeout(() => setStamped(true), 500);
    }, 600);
    return () => {
      clearInterval(cycle);
      clearTimeout(init);
    };
  }, []);

  const bullet = BULLETS[activeIdx];

  return (
    <section
      className="min-h-[calc(100vh-56px)] bg-[#F6F4EF] flex flex-col items-center justify-center px-4 pt-10 pb-16 relative overflow-hidden"
    >
      {/* Subtle ruled-paper background lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 31px, #DDD6C8 31px, #DDD6C8 32px)",
          opacity: 0.35,
        }}
      />

      {/* Top eyebrow */}
      <div className="relative z-10 mb-5 flex items-center gap-2">
        <span
          className="font-mono text-[10px] tracking-widest text-[#1E8E5A] uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Free · No Sign-Up · Indian ATS Optimized
        </span>
      </div>

      {/* Headline */}
      <h1
        className="relative z-10 text-center text-[#161A2E] font-bold leading-[1.1] max-w-3xl"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
        }}
      >
        Build a resume that{" "}
        <span className="relative inline-block">
          <span className="text-[#1E8E5A]">passes ATS</span>
          <svg
            className="absolute -bottom-1 left-0 w-full"
            viewBox="0 0 200 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 5.5 Q50 1 100 5.5 Q150 10 199 5.5"
              stroke="#E2A33B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <br />— in under 8 minutes
      </h1>

      {/* Sub-headline */}
      <p
        className="relative z-10 mt-5 text-center text-[#161A2E]/60 max-w-xl leading-relaxed"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
        }}
      >
        AI improves your bullets, JD matcher tailors for TCS/Infosys/startups,
        and you download a clean PDF — no sign-up, no watermark, no hidden ₹5 charge.
      </p>

      {/* CTA Row */}
      <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-3 items-center">
        <Link
          to="/builder"
          className="bg-[#161A2E] text-[#F6F4EF] font-semibold px-7 py-3 rounded hover:bg-[#1E8E5A] transition-colors text-base shadow-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Build My Resume — It's Free →
        </Link>
        <a
          href="#how-it-works"
          className="text-sm text-[#161A2E]/60 hover:text-[#161A2E] underline underline-offset-4 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          See how it works
        </a>
      </div>

      {/* Trust line */}
      <p
        className="relative z-10 mt-3 text-xs text-[#161A2E]/40"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        No credit card · No account · Just your resume
      </p>

      {/* ── Live AI Demo Card ── */}
      <div className="relative z-10 mt-12 w-full max-w-2xl bg-white border border-[#DDD6C8] rounded-lg shadow-md overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F6F4EF] border-b border-[#DDD6C8]">
          <span
            className="text-[10px] tracking-widest uppercase text-[#161A2E]/40"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            AI Bullet Improver — Live Demo
          </span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DDD6C8]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#DDD6C8]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E8E5A]" />
          </div>
        </div>

        <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <p
              className="text-[10px] uppercase tracking-widest text-[#161A2E]/40 mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ✗ Before
            </p>
            <div className="bg-[#F6F4EF] border border-[#DDD6C8] rounded p-3 text-sm text-[#161A2E]/70 min-h-[56px]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {bullet.before}
            </div>
          </div>

          {/* After */}
          <div className="relative">
            <p
              className="text-[10px] uppercase tracking-widest text-[#1E8E5A] mb-2"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ✓ After AI
            </p>
            <div
              className={`bg-white border border-[#1E8E5A]/40 rounded p-3 text-sm text-[#161A2E] min-h-[56px] transition-all duration-500 ${
                showAfter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {bullet.after}
            </div>

            {/* Stamp */}
            <div
              className={`absolute -top-2 -right-2 transition-all duration-300 ${
                stamped ? "opacity-100 scale-100 rotate-[-8deg]" : "opacity-0 scale-75"
              }`}
              aria-hidden="true"
            >
              <span
                className="block text-[#1E8E5A] border-2 border-[#1E8E5A] rounded px-2 py-0.5 text-[9px] font-bold tracking-widest bg-white shadow-sm"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ATS PASS ✓
              </span>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {BULLETS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setShowAfter(false);
                setStamped(false);
                setActiveIdx(i);
                setTimeout(() => setShowAfter(true), 300);
                setTimeout(() => setStamped(true), 750);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === activeIdx ? "bg-[#1E8E5A]" : "bg-[#DDD6C8]"
              }`}
              aria-label={`Example ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 mt-10 w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#DDD6C8] border border-[#DDD6C8] rounded-lg overflow-hidden">
        {STATS.map(({ value, label }) => (
          <div key={label} className="bg-[#F6F4EF] flex flex-col items-center py-4 px-2">
            <span
              className="text-2xl font-bold text-[#161A2E]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {value}
            </span>
            <span
              className="text-[10px] uppercase tracking-widest text-[#161A2E]/40 mt-0.5 text-center"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* vs Resume.com jab */}
      <p
        className="relative z-10 mt-6 text-xs text-center text-[#161A2E]/35 max-w-md"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Resume.com has a 1.4/5 rating on Trustpilot and charges $5 without permission.
        ResumeFree doesn't.
      </p>
    </section>
  );
}