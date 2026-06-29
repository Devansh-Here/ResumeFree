// src/components/landing/Testimonials.jsx
import { Link } from "react-router-dom";
import ScrollGlow from '../ui/ScrollGlow'

const TESTIMONIALS = [
  {
    quote: "I built my resume in under 10 minutes. The AI rewrote my internship bullets and added actual numbers I hadn't thought to include. Got a TCS interview call the same week.",
    name: "Arjun Sharma",
    detail: "B.Tech CSE · KIET Group of Institutions · TCS interview",
    initials: "AS",
  },
  {
    quote: "Every other tool I tried either watermarked the PDF or asked me to pay before downloading. This one just... worked. Clean PDF, no sign-up, no surprises.",
    name: "Priya Nair",
    detail: "MBA · Symbiosis Pune · Business Analyst roles",
    initials: "PN",
  },
  {
    quote: "My CGPA is 7.1 so I was worried. The AI helped me frame my projects properly — focused on what I built and the impact, not just the tech stack. Looks genuinely professional.",
    name: "Rahul Verma",
    detail: "B.Tech IT · AKTU Lucknow · Infosys offer received",
    initials: "RV",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-white border-t border-dove/30 py-16 sm:py-24 px-5 sm:px-8 overflow-hidden">
      <ScrollGlow position="bottom-right" size="lg" opacity={0.09} delay={0}   />
      <ScrollGlow position="top-left"     size="md" opacity={0.05} delay={500} />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-dove" />
            <span className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">From students like you</span>
            <span className="w-8 h-px bg-dove" />
          </div>
          <h2
            className="font-signifier text-ink leading-[1.18]"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", letterSpacing: "-0.23px" }}
          >
            Resumes that actually got responses.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map(({ quote, name, detail, initials }) => (
            <div key={name}
              className="flex flex-col justify-between bg-fog border border-dove/40 rounded-cards p-6"
              style={{ boxShadow: "rgba(15,23,42,0.03) 0px 0px 0px 1px" }}>

              {/* Quote */}
              <div>
                <span
                  className="block font-signifier text-[40px] leading-none mb-3 text-dove"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-sohne text-[14px] text-ash leading-[1.5] tracking-[-0.009em]">
                  {quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-dove/40">
                <div className="w-9 h-9 rounded-[9999px] bg-apricot-wash flex items-center justify-center shrink-0">
                  <span className="font-sohne text-[12px] font-[500] text-rust">{initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-sohne text-[14px] font-[500] text-ink truncate tracking-[-0.009em]">{name}</p>
                  <p className="font-sohne text-[12px] text-graphite mt-0.5 tracking-[-0.009em]">{detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="font-sohne text-[15px] text-graphite mb-5 tracking-[-0.009em]">
            Your resume is 8 minutes away.
          </p>
          <Link
            to="/builder"
            className="inline-block px-8 py-3.5 bg-ink hover:bg-ink/85 text-white font-sohne rounded-buttons transition-colors tracking-[-0.009em]"
            style={{ fontSize: "15px", fontWeight: 450 }}
          >
            Get your free resume &rarr;
          </Link>
          <p className="mt-3 font-sohne text-[13px] text-dove tracking-[-0.009em]">
            No credit card · No account · No watermark
          </p>
        </div>
      </div>
    </section>
  );
}