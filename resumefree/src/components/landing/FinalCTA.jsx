// src/components/landing/FinalCTA.jsx
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    // Page bg behind this section should be light (#f8fafc / #e8edf2)
    // so the dark card visibly "floats". No bottom margin/padding here —
    // Footer.jsx (with attachedTop) sits flush against this immediately below.
    <section className="px-3 sm:px-5 lg:px-6 pt-3 sm:pt-5 lg:pt-6">
      <div
        className="relative rounded-t-3xl overflow-hidden"
        style={{ background: "#0a1628" }}
      >
        {/* grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 85%)",
          }}
        />

        {/* top glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px]"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(5,150,105,0.30) 0%, transparent 70%)",
          }}
        />

        <div className="relative px-6 pt-20 sm:pt-24 pb-16 sm:pb-20 text-center">
          {/* logo mark */}
          <div
            className="mx-auto mb-7 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: "0 8px 24px -6px rgba(5,150,105,0.5)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 4.5C6 3.67 6.67 3 7.5 3H14l4 4v12.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5v-15Z"
                stroke="white"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M14 3v4h4" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
              <path
                d="M9 13.5l2 2 4-4.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="inline-block font-sohne text-[11px] font-semibold tracking-widest uppercase text-emerald-400/80 mb-5">
            Ready When You Are
          </span>

          <h2
            className="text-[34px] sm:text-[46px] text-white leading-[1.08] mb-5"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Build your resume today — in 8 minutes.
          </h2>

          <p className="font-sohne text-[15px] sm:text-[16px] text-white/55 max-w-lg mx-auto mb-9 leading-relaxed">
            Fill the form, let AI polish your bullets, check your ATS score, and download your PDF — all on one page, no sign-up needed.
          </p>

          <Link
            to="/builder"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-buttons overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: "0 8px 24px -6px rgba(5,150,105,0.45)",
            }}
          >
            <span
              className="font-sohne text-[14.5px] text-white tracking-[-0.009em]"
              style={{ fontWeight: 600 }}
            >
              Start Building
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 14 14"
              fill="none"
              className="text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1"
            >
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <p className="mt-6 font-sohne text-[12.5px] text-white/40 tracking-[-0.006em]">
            No sign-up · No watermark · Free forever
          </p>
        </div>
      </div>
    </section>
  );
}