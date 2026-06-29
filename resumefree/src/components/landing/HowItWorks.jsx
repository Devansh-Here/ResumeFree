// src/components/landing/HowItWorks.jsx
import { Link } from "react-router-dom";
import ScrollGlow from '../ui/ScrollGlow' 

const PAIN_POINTS = [
  { emoji: "😤", text: "Downloaded the PDF — watermark all over it. Completely unusable." },
  { emoji: "🤦", text: "Filled the entire form. Asked for payment right before downloading." },
  { emoji: "😕", text: "Template had no CGPA field. Everything was in US format." },
  { emoji: "😐", text: "AI gave generic lines. No metrics, no strong verbs, nothing." },
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
    <section id="how-it-works" className="relative bg-fog overflow-hidden">
      <ScrollGlow position="center-right" size="lg" opacity={0.07} delay={100} />
      <ScrollGlow position="top-left"     size="sm" opacity={0.05} delay={400} />

      {/* ── Pain Points ── */}
      <div className="border-t border-b border-dove/40 py-16 sm:py-20 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-dove" />
            <span className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">Sound familiar?</span>
            <span className="w-8 h-px bg-dove" />
          </div>

          <h2
            className="font-signifier text-ink text-center mb-10 leading-[1.18]"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", letterSpacing: "-0.23px" }}
          >
            Placement season is stressful enough.{" "}
            <em className="not-italic text-graphite">Your resume tool shouldn&apos;t be.</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAIN_POINTS.map(({ emoji, text }) => (
              <div key={text}
                className="flex items-start gap-4 bg-white border border-dove/40 rounded-cards px-5 py-4"
                style={{ boxShadow: "rgba(15,23,42,0.03) 0px 0px 0px 1px" }}>
                <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">{emoji}</span>
                <p className="font-sohne text-[14px] text-ash leading-[1.5] tracking-[-0.009em]">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-10">
            <div className="flex-1 h-px bg-dove/40" />
            <p className="font-sohne text-[14px] text-graphite tracking-[-0.009em] whitespace-nowrap">
              None of this happens here.
            </p>
            <div className="flex-1 h-px bg-dove/40" />
          </div>
        </div>
      </div>

      {/* ── Steps ── */}
      <div className="py-16 sm:py-24 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="w-8 h-px bg-dove" />
              <span className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">How it works</span>
              <span className="w-8 h-px bg-dove" />
            </div>
            <h2
              className="font-signifier text-ink leading-[1.18]"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", letterSpacing: "-0.23px" }}
            >
              Three steps. Eight minutes. Done.
            </h2>
          </div>

          <div className="space-y-3">
            {STEPS.map(({ number, heading, body, tag }, idx) => (
              <div key={number}
                className="flex gap-5 items-start bg-white border border-dove/40 rounded-cards p-6"
                style={{ boxShadow: "rgba(15,23,42,0.03) 0px 0px 0px 1px" }}>

                {/* Number circle */}
                <div className="shrink-0 w-10 h-10 rounded-[9999px] border border-ink/20 bg-fog flex items-center justify-center">
                  <span className="font-sohne text-[12px] font-[500] text-ink tracking-[-0.009em]">{number}</span>
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3
                      className="font-sohne text-ink font-[500] leading-snug tracking-[-0.009em]"
                      style={{ fontSize: "15px" }}
                    >
                      {heading}
                    </h3>
                    <span className="font-sohne text-[11px] px-2.5 py-1 rounded-tags bg-apricot-wash text-rust border border-rust/20 tracking-[-0.009em]">
                      {tag}
                    </span>
                  </div>
                  <p className="font-sohne text-[14px] text-graphite leading-[1.5] tracking-[-0.009em]">{body}</p>
                </div>

                {idx === STEPS.length - 1 && (
                  <div className="shrink-0 self-center hidden sm:block">
                    <span className="font-sohne text-[10px] font-[500] text-rust border border-rust/40 px-2 py-0.5 rounded bg-white block"
                      style={{ transform: "rotate(-4deg)" }}>
                      ATS PASS ✓
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              to="/builder"
              className="inline-block px-8 py-3.5 bg-ink hover:bg-ink/85 text-white font-sohne rounded-buttons transition-colors tracking-[-0.009em]"
              style={{ fontSize: "15px", fontWeight: 450 }}
            >
              Start building — no sign-up &rarr;
            </Link>
            <p className="mt-3 font-sohne text-[13px] text-dove tracking-[-0.009em]">
              No credit card · No account · 8 min
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}