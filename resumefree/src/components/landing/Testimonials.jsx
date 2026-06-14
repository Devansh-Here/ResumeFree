// src/components/landing/Testimonials.jsx
import { Link } from "react-router-dom";

const TESTIMONIALS = [
  {
    quote:
      "I built my resume in under 10 minutes. The AI rewrote my internship bullets and added actual numbers I hadn't thought to include. Got a TCS interview call the same week.",
    name: "Arjun Sharma",
    detail: "B.Tech CSE · KIET Group of Institutions · Got TCS interview",
    initials: "AS",
    color: "#1E8E5A",
  },
  {
    quote:
      "Every other tool I tried either watermarked the PDF or asked me to pay before downloading. This one just... worked. Clean PDF, no sign-up, no surprises.",
    name: "Priya Nair",
    detail: "MBA · Symbiosis Pune · Applying for Business Analyst roles",
    initials: "PN",
    color: "#161A2E",
  },
  {
    quote:
      "My CGPA is 7.1 so I was worried. The AI helped me frame my projects properly — focused on what I built and the impact, not just the tech stack. Looks genuinely professional.",
    name: "Rahul Verma",
    detail: "B.Tech IT · AKTU Lucknow · Infosys offer received",
    initials: "RV",
    color: "#E2A33B",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-white border-t border-[#DDD6C8] py-16 sm:py-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="font-mono text-[10px] tracking-widest text-[#1E8E5A] uppercase mb-3"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            From students like you
          </p>
          <h2
            className="font-bold text-[#161A2E]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(1.4rem, 3.5vw, 2.25rem)",
            }}
          >
            Resumes that actually got responses.
          </h2>
        </div>

        {/* Cards — 1 col mobile, 3 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map(({ quote, name, detail, initials, color }) => (
            <div
              key={name}
              className="flex flex-col justify-between bg-[#F6F4EF] border border-[#DDD6C8] rounded-xl p-5 sm:p-6"
            >
              {/* Quote mark */}
              <div>
                <span
                  className="block text-3xl leading-none mb-3"
                  style={{ color, fontFamily: "'Space Grotesk', sans-serif", opacity: 0.4 }}
                  aria-hidden="true"
                >
                  "
                </span>
                <p
                  className="text-sm sm:text-[0.9rem] text-[#161A2E]/75 leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#DDD6C8]">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: color, fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold text-[#161A2E] truncate"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {name}
                  </p>
                  <p
                    className="text-[11px] text-[#161A2E]/45 leading-snug mt-0.5"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p
            className="text-[#161A2E]/50 mb-5 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Your resume is 8 minutes away.
          </p>
          <Link
            to="/builder"
            className="inline-block w-full sm:w-auto bg-[#1E8E5A] text-white font-semibold px-8 py-3.5 rounded hover:bg-[#161A2E] transition-colors text-base shadow-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Get Your Free Resume →
          </Link>
          <p
            className="mt-3 text-xs text-[#161A2E]/35"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            No credit card · No account · No watermark
          </p>
        </div>
      </div>
    </section>
  );
}