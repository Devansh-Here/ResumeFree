// src/components/landing/HowItWorks.jsx
import { Link } from "react-router-dom";

const PAIN_POINTS = [
  {
    emoji: "😤",
    text: "Downloaded the PDF — watermark all over it. Completely unusable.",
  },
  {
    emoji: "🤦",
    text: "Filled the entire form. Asked for payment right before downloading.",
  },
  {
    emoji: "😕",
    text: "Template had no CGPA field. Everything was in US format.",
  },
  {
    emoji: "😐",
    text: "AI gave generic lines. No metrics, no strong verbs, nothing.",
  },
];

const STEPS = [
  {
    number: "01",
    heading: "Fill the form — takes 5 minutes",
    body: "Add your education, internships, skills, and projects. No account. No email verification. Just open and build.",
    tag: "No sign-up",
  },
  {
    number: "02",
    heading: "Let AI improve your bullets",
    body: "'Worked on a project' becomes 'Optimized MySQL queries, reducing load time from 3s to 400ms'. One click.",
    tag: "AI powered",
  },
  {
    number: "03",
    heading: "Download your PDF — free",
    body: "No watermark. No paywall. No surprise charges. A clean, single-page PDF that Indian ATS systems can actually parse.",
    tag: "Always free",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F6F4EF]">

      {/* ── Pain Points ───────────────────────────────────── */}
      <div className="border-t border-b border-[#DDD6C8] py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">

          <p
            className="text-center font-mono text-[10px] tracking-widest text-[#161A2E]/40 uppercase mb-3"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Sound familiar?
          </p>

          <h2
            className="text-center font-bold text-[#161A2E] mb-10"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(1.4rem, 3.5vw, 2.25rem)",
            }}
          >
            Placement season is stressful enough.{" "}
            <span className="text-[#E2A33B]">Your resume tool shouldn't be.</span>
          </h2>

          {/* Pain grid — 1 col mobile, 2 col sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAIN_POINTS.map(({ emoji, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 bg-white border border-[#DDD6C8] rounded-xl px-4 py-4"
              >
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                <p
                  className="text-sm text-[#161A2E]/70 leading-snug"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Bridge */}
          <div className="flex items-center gap-4 mt-10">
            <div className="flex-1 h-px bg-[#DDD6C8]" />
            <p
              className="text-sm text-[#161A2E]/50 text-center whitespace-nowrap"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              None of this happens here.
            </p>
            <div className="flex-1 h-px bg-[#DDD6C8]" />
          </div>
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────── */}
      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <p
              className="font-mono text-[10px] tracking-widest text-[#1E8E5A] uppercase mb-3"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              How it works
            </p>
            <h2
              className="font-bold text-[#161A2E]"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(1.4rem, 3.5vw, 2.25rem)",
              }}
            >
              Three steps. Eight minutes. Done.
            </h2>
          </div>

          {/* Steps — stacked on mobile, same on desktop */}
          <div className="relative">
            {/* Vertical line — hidden on mobile, shown md+ */}
            <div
              className="hidden md:block absolute left-[1.2rem] top-12 bottom-12 w-px bg-[#DDD6C8]"
              aria-hidden="true"
            />

            <div className="space-y-4">
              {STEPS.map(({ number, heading, body, tag }, idx) => (
                <div
                  key={number}
                  className="flex gap-4 md:gap-6 items-start bg-white border border-[#DDD6C8] rounded-xl p-5 md:p-6"
                >
                  {/* Circle */}
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#161A2E] bg-[#F6F4EF] flex items-center justify-center z-10">
                    <span
                      className="font-mono text-[11px] font-bold text-[#161A2E]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {number}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3
                        className="font-bold text-[#161A2E] text-sm sm:text-base leading-snug"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {heading}
                      </h3>
                      <span
                        className="font-mono text-[9px] tracking-widest uppercase text-[#1E8E5A] border border-[#1E8E5A]/30 bg-[#1E8E5A]/10 px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {tag}
                      </span>
                    </div>
                    <p
                      className="text-sm text-[#161A2E]/55 leading-relaxed"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {body}
                    </p>
                  </div>

                  {/* ATS stamp on last step */}
                  {idx === STEPS.length - 1 && (
                    <div className="flex-shrink-0 self-center hidden sm:block">
                      <span
                        className="font-mono text-[9px] font-bold text-[#1E8E5A] border-2 border-[#1E8E5A] px-2 py-0.5 rounded bg-white shadow-sm block"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          transform: "rotate(-4deg)",
                        }}
                      >
                        ATS PASS ✓
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/builder"
              className="inline-block w-full sm:w-auto bg-[#161A2E] text-[#F6F4EF] font-semibold px-8 py-3.5 rounded hover:bg-[#1E8E5A] transition-colors text-base shadow-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Start Building — No Sign-Up →
            </Link>
            <p
              className="mt-3 text-xs text-[#161A2E]/35"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              No credit card · No account · 8 min
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}