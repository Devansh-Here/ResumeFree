// src/components/landing/FAQ.jsx
//
// UX AUDIT FIX: accordion had no ARIA wiring — a screen reader user had no
// way to know whether a given question was expanded or collapsed, or which
// content block a question's button controlled. Added aria-expanded on the
// trigger button, aria-controls linking it to the answer's id, and
// role="region" + aria-labelledby on the answer so it reads as a proper
// labeled disclosure widget (WCAG 4.1.2 Name, Role, Value).

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Is ResumeFree actually free? No hidden charges?",
    a: "Haan, fully free. Build your resume, get 3 AI bullet improvements, run a basic ATS check, and download your PDF — no sign-up, no watermark, no card details, no surprise charges. Resume.com style hidden $5 deductions yahan nahi hote. If you want unlimited AI, JD matching, and premium templates, you can grab a one-time pass — but the core builder + PDF download is free forever.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "Nahi. Free users get instant access — no email, no password, no OTP. Just open the builder and start filling your details. Your data auto-saves in your browser as you type. Sign-up is only needed if you want to save resumes to the cloud or buy a premium pass.",
  },
  {
    q: "What's the difference between Free and a Pass?",
    a: "Free gives you 5 ATS templates, 3 AI bullet improvements, a basic ATS score, and unlimited PDF downloads. A Pass (Sprint ₹79 / Placement ₹199 / Season ₹399) unlocks unlimited AI improvements, the JD Matcher (tailor your resume to a specific job description), advanced ATS scoring with keyword gap analysis, AI cover letter generation, and 20+ premium templates — for a fixed number of days, no auto-renewal.",
  },
  {
    q: "What exactly does the JD Matcher do?",
    a: "Paste any job description — say, a Software Engineer role at TCS — and the JD Matcher compares it against your resume. It shows a match score, lists keywords you're missing (like 'Microservices' or 'Docker'), and suggests specific bullet rewrites so your resume actually speaks the job's language. This is the single biggest reason tailored resumes get more interview calls than generic ones.",
  },
  {
    q: "How does the AI bullet improvement work?",
    a: "Type a weak bullet like 'Worked on database project' and hit improve. The AI rewrites it with strong action verbs, real metrics, and a tighter structure — something like 'Optimized MySQL queries for a 500-record system, cutting load time from 3s to 400ms.' Free users get 3 improvements; pass holders get unlimited.",
  },
  {
    q: "Is this actually ATS-friendly for Indian companies?",
    a: "Yes — templates are single-column and built around keyword sets for common Indian recruiters like TCS, Infosys, and Capgemini, not generic US formats. The ATS checker scans your resume for role-relevant keywords (Java, React, SQL, AWS, etc.) and gives you a 0–100 score with what's missing.",
  },
  {
    q: "Will my resume have a watermark or locked PDF?",
    a: "No. Every PDF — free or paid — downloads instantly, full quality, zero watermark. PDF generation happens entirely in your browser, so there's no waiting, no server queue, and your data never has to leave your device unless you choose to save it to the cloud.",
  },
  {
    q: "What happens when my pass expires?",
    a: "You keep every resume and PDF you've already downloaded — nothing gets deleted or locked. You simply drop back to the free tier (3 AI improvements, basic ATS, 5 templates) until you grab another pass. There's no auto-renewal or recurring charge to worry about.",
  },
];

function ChevronIcon({ open }) {
  return (
    <span
      aria-hidden="true"
      className="rf-faq-chevron flex items-center justify-center w-7 h-7 rounded-full border border-dove shrink-0 transition-all duration-300"
      style={{
        background: open ? "#0a1628" : "transparent",
        borderColor: open ? "#0a1628" : "#cbd5e1",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 4.5L6 8L9.5 4.5"
          stroke={open ? "#ffffff" : "#4a6fa5"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function FAQItem({ item, index, isOpen, onToggle }) {
  const buttonId  = `faq-button-${index}`;
  const contentId = `faq-content-${index}`;

  return (
    <div
      className="rf-faq-item border-b border-dove/60 last:border-b-0"
    >
      <button
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left group"
      >
        <span
          className="font-sohne text-[15px] sm:text-[16px] tracking-[-0.011em] transition-colors duration-200"
          style={{
            color: isOpen ? "#0a1628" : "#1e3a5f",
            fontWeight: isOpen ? 600 : 500,
          }}
        >
          {item.q}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <p
            className="pb-5 sm:pb-6 pr-9 font-sohne text-[14px] leading-relaxed text-ash tracking-[-0.006em]"
          >
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative bg-fog py-20 sm:py-28">
      <style>{`
        .rf-faq-item button:hover .rf-faq-chevron {
          border-color: #0a1628;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block font-sohne text-[11px] font-semibold tracking-widest uppercase text-rust mb-4">
            Questions, Answered
          </span>
          <h2
            className="text-[32px] sm:text-[42px] text-ink leading-[1.1] mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Everything you're wondering, sorted.
          </h2>
          <p className="font-sohne text-[15px] text-ash max-w-xl mx-auto leading-relaxed">
            From zero sign-up to JD tailoring — here's exactly what ResumeFree gives you, what's free, and what a pass unlocks.
          </p>
        </div>

        {/* Accordion card */}
        <div
          className="bg-white rounded-3xl px-6 sm:px-8"
          style={{
            border: "1px solid #cbd5e1",
            boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 20px 25px -5px",
          }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Bottom nudge */}
        <p className="text-center mt-8 font-sohne text-[13px] text-graphite">
          Still have a question?{" "}
          <a
            href="mailto:support@resumefree.in"
            className="text-rust font-medium hover:underline underline-offset-2"
          >
            Email us
          </a>{" "}
          — our team replies, usually within a day.
        </p>
      </div>
    </section>
  );
}