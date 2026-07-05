// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";

const ABOUT_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/pricing" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use",   href: "/terms" },
];

const HELPFUL_LINKS = [
  { label: "ATS Checker",   href: "/#how-it-works" },
  { label: "JD Matcher",    href: "/#how-it-works" },
  { label: "Resume Templates", href: "/#how-it-works" },
  { label: "FAQ",           href: "/pricing" },
];
const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Twitter",   href: "https://twitter.com" },
  { label: "LinkedIn",  href: "https://linkedin.com" },
];

// Pass `attachedTop` when Footer sits directly below FinalCTA on the same
// page (e.g. Landing) — this drops the top margin/rounding so the two
// dark grid-textured cards fuse into one continuous block, separated only
// by a thin internal divider line. Used standalone (e.g. on /pricing,
// no FinalCTA above it) it just renders as its own fully-rounded floating card.
export default function Footer({ attachedTop = false }) {
  return (
    <footer
      className={
        attachedTop
          ? "relative px-3 sm:px-5 lg:px-6 pb-3 sm:pb-5 lg:pb-6"
          : "relative px-3 sm:px-5 lg:px-6 py-3 sm:py-5 lg:py-6"
      }
    >
      <div
        className={
          "relative overflow-hidden " +
          (attachedTop ? "rounded-b-3xl" : "rounded-3xl")
        }
        style={{ background: "#0a1628" }}
      >
        {/* grid texture — matches FinalCTA */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 90% 100% at 50% 100%, black 30%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 100% at 50% 100%, black 30%, transparent 90%)",
          }}
        />

        {/* faint emerald glow — bottom left, echoes FinalCTA's top glow subtly */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[400px]"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 20% 100%, rgba(5,150,105,0.10) 0%, transparent 70%)",
          }}
        />

        {/* seam divider — only meaningful when fused under FinalCTA,
            harmless as a top inner border when standalone */}
        <div className="relative border-t border-white/[0.07]" />

        <div className="relative px-6 sm:px-10 pt-12 pb-6">
          {/* Top row — 4 columns: brand+desc | About Us | Helpful Links | Contact Us */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {/* Col 1 — Logo + description */}
            <div className="lg:pr-4">
              <Link to="/" className="flex items-center gap-2.5 w-fit mb-4">
                <span
                  className="border border-white/20 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-white/60 tracking-widest"
                  style={{ borderRadius: "3px" }}
                >
                  ATS
                </span>
                <span
                  className="font-signifier text-[20px] text-white leading-none"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  ResumeFree
                </span>
              </Link>
              <p className="font-sohne text-[13.5px] leading-relaxed text-white/35 tracking-[-0.006em]">
                Free AI Resume Builder for Indian students — no sign-up,
                no watermark, download your PDF instantly.
              </p>
            </div>

            {/* Col 2 — About Us */}
            <div>
              <h4 className="font-sohne text-[12px] font-semibold uppercase tracking-widest text-white/80 mb-4">
                About Us
              </h4>
              <ul className="flex flex-col gap-3">
                {ABOUT_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="font-sohne text-[14px] text-white/35 hover:text-white/70 transition-colors tracking-[-0.009em]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Helpful Links */}
            <div>
              <h4 className="font-sohne text-[12px] font-semibold uppercase tracking-widest text-white/80 mb-4">
                Helpful Links
              </h4>
              <ul className="flex flex-col gap-3">
                {HELPFUL_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="font-sohne text-[14px] text-white/35 hover:text-white/70 transition-colors tracking-[-0.009em]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact Us */}
            <div>
              <h4 className="font-sohne text-[12px] font-semibold uppercase tracking-widest text-white/80 mb-4">
                Contact Us
              </h4>
              <ul className="flex flex-col gap-3.5">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  
                    <a href="mailto:hello@resumefree.in"
                    className="font-sohne text-[14px] text-white/35 hover:text-white/70 transition-colors tracking-[-0.009em]"
                  >
                    kartikgpt0305@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-sohne text-[14px] text-white/35 tracking-[-0.009em]">
                    +91 90241 06492
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#059669] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-sohne text-[14px] text-white/35 tracking-[-0.009em]">
                    Jaipur, Rajasthan, India
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 my-9" />

          {/* Bottom row — socials + copyright */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ label, href }) => (
                
                  <a key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-150"
                >
                  <SocialIcon name={label} />
                </a>
              ))}
            </div>
            <p className="font-sohne text-[13px] text-white/20 tracking-[-0.009em] shrink-0">
              © {new Date().getFullYear()} ResumeFree. All rights reserved.
            </p>
          </div>
        </div>

        {/* Giant animated trace-outline brand mark — chipka hua, tight spacing */}
        <div className="relative w-full overflow-hidden select-none pointer-events-none -mt-6 sm:-mt-8">
          <svg
            viewBox="0 0 1200 200"
            className="w-full h-auto block"
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="rf-trace-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a1628" stopOpacity="0" />
                <stop offset="55%" stopColor="#0a1628" stopOpacity="0" />
                <stop offset="100%" stopColor="#0a1628" stopOpacity="0.55" />
              </linearGradient>
              <mask id="rf-trace-mask">
                <rect x="0" y="0" width="1200" height="200" fill="white" />
                <rect x="0" y="0" width="1200" height="200" fill="url(#rf-trace-fade)" />
              </mask>
            </defs>

            <g mask="url(#rf-trace-mask)">
              <text
                x="50%"
                y="172"
                textAnchor="middle"
                className="rf-trace-text"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: "168px",
                  letterSpacing: "2px",
                }}
              >
                RESUMEFREE
              </text>
            </g>
          </svg>
        </div>

        <style>{`
          .rf-trace-text {
            fill: transparent;
            stroke: #059669;
            stroke-width: 1.25;
            stroke-dasharray: 2600;
            stroke-dashoffset: 2600;
            opacity: 0.55;
            animation: rf-trace-draw 14s ease-in-out infinite;
          }
          @keyframes rf-trace-draw {
            0%   { stroke-dashoffset: 2600; fill: transparent; opacity: 0.3; }
            45%  { stroke-dashoffset: 0; fill: transparent; opacity: 0.85; }
            70%  { stroke-dashoffset: 0; fill: rgba(5,150,105,0.05); opacity: 0.55; }
            100% { stroke-dashoffset: -2600; fill: transparent; opacity: 0.3; }
          }
          @media (max-width: 640px) {
            .rf-trace-text { font-size: 96px !important; }
          }
        `}</style>
      </div>
    </footer>
  );
}

function SocialIcon({ name }) {
  const common = { className: "w-3.5 h-3.5", fill: "currentColor", viewBox: "0 0 24 24" };
  if (name === "Instagram") {
    return (
      <svg {...common}>
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.25.07 1.62.07 4.81s-.01 3.56-.07 4.81c-.15 3.23-1.66 4.77-4.92 4.92-1.25.06-1.62.07-4.85.07s-3.6-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.16 15.56 2.15 15.2 2.15 12s.01-3.56.07-4.81C2.37 3.96 3.89 2.42 7.15 2.27 8.4 2.21 8.8 2.2 12 2.2zm0 1.8c-3.14 0-3.51.01-4.74.07-2.27.1-3.32 1.18-3.42 3.42-.06 1.23-.07 1.6-.07 4.74s.01 3.51.07 4.74c.1 2.24 1.15 3.32 3.42 3.42 1.23.06 1.6.07 4.74.07s3.51-.01 4.74-.07c2.26-.1 3.32-1.17 3.42-3.42.06-1.23.07-1.6.07-4.74s-.01-3.51-.07-4.74c-.1-2.24-1.16-3.32-3.42-3.42-1.23-.06-1.6-.07-4.74-.07zm0 3.06a4.94 4.94 0 110 9.88 4.94 4.94 0 010-9.88zm0 1.8a3.14 3.14 0 100 6.28 3.14 3.14 0 000-6.28zm5.13-1.99a1.15 1.15 0 11-2.3 0 1.15 1.15 0 012.3 0z" />
      </svg>
    );
  }
  if (name === "Twitter") {
    return (
      <svg {...common}>
        <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.14 12.14 0 013.1 4.9a4.28 4.28 0 001.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 003.43 4.2c-.6.16-1.25.18-1.91.07a4.29 4.29 0 004 2.98A8.6 8.6 0 012 18.57a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2l-.01-.56A8.7 8.7 0 0022.46 6z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18v-7.5H5.67V18h2.67zM7 9.43a1.55 1.55 0 100-3.1 1.55 1.55 0 000 3.1zM18.34 18v-4.13c0-2.21-1.18-3.24-2.76-3.24a2.38 2.38 0 00-2.15 1.19v-1.02H10.7c.03.71 0 7.5 0 7.5h2.66v-4.19c0-.22.02-.45.09-.61.19-.45.61-.93 1.32-.93.93 0 1.31.71 1.31 1.74V18h2.66z" />
    </svg>
  );
}