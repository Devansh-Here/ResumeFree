// src/components/landing/Hero.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const BULLETS = [
  {
    before: "Worked on database project",
    after:  "Optimized MySQL queries for 500-record inventory system, reducing load time from 3s → 400ms",
    role:   "Backend Dev",
  },
  {
    before: "Made a website for college fest",
    after:  "Built responsive React.js event portal for 2,000+ attendees; cut registration time by 60%",
    role:   "Frontend Dev",
  },
  {
    before: "Did internship at a startup",
    after:  "Developed REST APIs at fintech startup handling ₹4L/day transactions using Node.js + MongoDB",
    role:   "Fullstack Dev",
  },
];

const AUTO_CYCLE_MS = 3800;

export default function Hero({ dark = false }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAfter, setShowAfter] = useState(false);
  const [stamped,   setStamped]   = useState(false);
  const isFirstReveal = useRef(true);

  // UX AUDIT FIX — reveal/stamp timing.
  // Keyed on `activeIdx` alone, so it fires identically whether `activeIdx`
  // changed because the auto-cycle advanced OR because the user clicked a
  // dot manually. First reveal keeps the original slower 700ms/1200ms feel;
  // every subsequent change uses the snappier 350ms/850ms timing.
  useEffect(() => {
    setShowAfter(false);
    setStamped(false);
    const revealDelay = isFirstReveal.current ? 700 : 350;
    const stampDelay  = isFirstReveal.current ? 1200 : 850;
    isFirstReveal.current = false;

    const t1 = setTimeout(() => setShowAfter(true), revealDelay);
    const t2 = setTimeout(() => setStamped(true), stampDelay);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeIdx]);

  // UX AUDIT FIX — auto-cycle bug + reduced-motion.
  // BUG (was): this interval ran independently of `activeIdx`, so clicking
  // a dot manually didn't reset the countdown — the auto-cycle could jump
  // to the next bullet moments after a manual selection, fighting the
  // user's own action (violates "user control and freedom").
  // FIX: depend the effect on `activeIdx`. Every time it changes — from
  // auto-advance OR a manual click — the old interval is cleared and a
  // fresh one starts, so a manual pick always gets the full 3.8s before
  // anything auto-advances again.
  // ALSO: respects prefers-reduced-motion — if set, no interval is created
  // at all (WCAG 2.2.2-friendly for users sensitive to continuous motion);
  // manual dot navigation still works either way.
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveIdx((i) => (i + 1) % BULLETS.length);
    }, AUTO_CYCLE_MS);

    return () => clearInterval(timer);
  }, [activeIdx]);

  const bullet = BULLETS[activeIdx];

  return (
    <section className="relative bg-transparent overflow-hidden">

      {/* ── Main grid ──
          Top padding now accounts for the fixed glass navbar
          (≈ pt-3 spacing + h-14 nav + a little breathing room ≈ 100px),
          so the eyebrow/headline never sits behind it. */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-[104px] sm:pt-[112px] lg:pt-[124px] pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Editorial copy ── */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-white/20" />
              <span className="font-sohne text-[13px] text-white/50 tracking-[-0.009em]">
                Free · No sign-up · Indian ATS optimised
              </span>
            </div>

            {/* Display headline — Signifier */}
            <h1
              className="font-signifier text-white leading-[1.05]"
              style={{ fontSize: "clamp(3rem, 6.5vw, 4.5rem)", letterSpacing: "-1.6px" }}
            >
              Build a resume
              <br />
              that{" "}
              <span className="relative inline-block">
                <span style={{ color: "#34d399" }}>passes ATS</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 10" fill="none" aria-hidden="true"
                >
                  <path
                    d="M2 7 Q75 2 150 7 Q225 12 298 7"
                    stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              in under{" "}
              <em className="not-italic" style={{ color: "#34d399" }}>8 minutes</em>
            </h1>

            {/* Body copy */}
            <p
              className="mt-6 font-sohne text-white/60 leading-[1.5] max-w-md"
              style={{ fontSize: "17px", letterSpacing: "-0.14px" }}
            >
              AI rewrites your bullets, JD matcher tailors your resume for
              TCS/Infosys/startups, and you download a clean PDF —
              no sign-up, no watermark, no hidden ₹5 charge.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex items-center gap-5 flex-wrap">
              <Link
                to="/builder"
                className="px-7 py-3.5 bg-white hover:bg-white/90 text-ink font-sohne rounded-buttons transition-colors tracking-[-0.009em]"
                style={{ fontSize: "15px", fontWeight: 500 }}
              >
                Build my resume — it&apos;s free &rarr;
              </Link>
              <Link
                to="/resume-checker"
                className="border border-white/30 px-5 py-3.5 font-sohne text-white/75 transition-all duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white/10 hover:text-white active:scale-[0.97] rounded-buttons"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                Check an existing resume
              </Link>

              <a href="#how-it-works"
                className="font-sohne text-white/50 hover:text-white transition-colors tracking-[-0.009em]"
                style={{ fontSize: "14px" }}
              >
                See how it works
              </a>
            </div>

            {/* Trust micro-copy — UX AUDIT FIX: was text-white/30 (~2.67:1,
                fails WCAG AA). Bumped to text-white/55 (~6.1:1, passes). */}
            <p
              className="mt-4 font-sohne text-white/55 tracking-[-0.009em]"
              style={{ fontSize: "13px" }}
            >
              No credit card · No account · Just your resume
            </p>

            {/* ── Stats inline strip ── */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "0",     label: "sign-ups" },
                { value: "₹0",   label: "to download" },
                { value: "100%", label: "ATS-safe" },
                { value: "8 min",label: "avg build time" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p
                    className="font-signifier text-white leading-none"
                    style={{ fontSize: "26px", letterSpacing: "-0.23px" }}
                  >
                    {value}
                  </p>
                  {/* UX AUDIT FIX: was text-white/40 (~3.80:1, fails AA for
                      13px normal text). Bumped to text-white/60 (~7:1). */}
                  <p
                    className="mt-1.5 font-sohne text-white/60 tracking-[-0.009em]"
                    style={{ fontSize: "13px" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Floating AI demo card ── */}
          <div className="relative">

            {/* Role pill above card */}
            <div className="flex items-center justify-between mb-3 px-1">
              {/* UX AUDIT FIX: was text-white/40 (~3.80:1, fails AA).
                  Bumped to text-white/60 (~7:1). */}
              <span className="font-sohne text-[12px] text-white/60 tracking-[-0.009em]">
                AI Bullet Improver
              </span>
              <span className="px-3 py-1 rounded-tags bg-white/10 font-sohne text-[12px] text-white/70 tracking-[-0.009em] transition-all duration-300">
                {bullet.role}
              </span>
            </div>

            {/* Main demo card — white on dark bg */}
            <div
              className="bg-white rounded-cards overflow-hidden"
              style={{
                boxShadow: "rgba(0,0,0,0.3) 0px 0px 0px 1px, rgba(0,0,0,0.25) 0px 20px 40px -8px",
              }}
            >
              {/* Card top bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-dove/40 bg-fog">
                <span className="w-2.5 h-2.5 rounded-full bg-dove/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-dove/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-rust" />
                <span className="ml-auto font-sohne text-[11px] text-graphite tracking-[-0.009em]">
                  Live demo
                </span>
              </div>

              {/* Before */}
              <div className="px-5 pt-5 pb-4">
                <p className="font-sohne text-[11px] text-graphite uppercase tracking-wider mb-2">
                  ✗ Before
                </p>
                <div
                  className="bg-fog border border-dove/40 rounded-inputs px-4 py-3.5 font-sohne text-ash"
                  style={{ fontSize: "14px", lineHeight: "1.5", letterSpacing: "-0.009em" }}
                >
                  {bullet.before}
                </div>
              </div>

              {/* Arrow divider */}
              <div className="flex items-center gap-3 px-5 py-1">
                <div className="flex-1 h-px bg-dove/30" />
                <span className="font-sohne text-[11px] text-rust tracking-[-0.009em]">AI &darr;</span>
                <div className="flex-1 h-px bg-dove/30" />
              </div>

              {/* After */}
              <div className="px-5 pt-4 pb-5 relative">
                <p className="font-sohne text-[11px] text-rust uppercase tracking-wider mb-2">
                  ✓ After AI
                </p>
                <div
                  className={`bg-apricot-wash border border-rust/20 rounded-inputs px-4 py-3.5 font-sohne text-ink transition-all duration-500 ${
                    showAfter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                  style={{ fontSize: "14px", lineHeight: "1.5", letterSpacing: "-0.009em" }}
                >
                  {bullet.after}
                </div>

                {/* ATS stamp */}
                <div
                  className={`absolute top-3 right-3 transition-all duration-300 ${
                    stamped ? "opacity-100 scale-100 rotate-[-6deg]" : "opacity-0 scale-75"
                  }`}
                >
                  <span className="block font-sohne text-[10px] text-rust border border-rust/40 rounded px-2 py-0.5 bg-white/80 tracking-wider">
                    ATS PASS ✓
                  </span>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-dove/20 bg-fog">
                <div className="flex gap-1.5" role="tablist" aria-label="Example bullet improvements">
                  {BULLETS.map((b, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === activeIdx}
                      aria-label={`Show ${b.role} example`}
                      onClick={() => setActiveIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-rust focus-visible:outline-offset-2 ${
                        i === activeIdx ? "bg-rust" : "bg-dove/50"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-sohne text-[11px] text-graphite tracking-[-0.009em]">
                  {activeIdx + 1} / {BULLETS.length}
                </span>
              </div>
            </div>

            {/* Social proof below card — UX AUDIT FIX: was text-white/25
                (~2.23:1, fails AA badly). Bumped to text-white/55 (~6.1:1). */}
            <p
              className="mt-4 text-center font-sohne text-white/55 tracking-[-0.009em] px-2"
              style={{ fontSize: "12px" }}
            >
              Other resume builders charge ₹500+ with hidden fees. ResumeFree doesn&apos;t.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}