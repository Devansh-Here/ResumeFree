// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";

const LINKS = [
  { label: "How It Works",   href: "#how-it-works", internal: false },
  { label: "Pricing",        href: "#pricing",       internal: false },
  { label: "Privacy Policy", href: "/privacy",       internal: true  },
  { label: "Terms of Use",   href: "/terms",         internal: true  },
];

export default function Footer() {
  return (
    <footer className="relative bg-ink px-5 sm:px-8 py-14 overflow-hidden">

      {/* Emerald glow — bottom left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px]"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 20% 80%, rgba(5,150,105,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Emerald glow — top right subtle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px]"
        style={{
          background: "radial-gradient(ellipse 50% 50% at 80% 20%, rgba(5,150,105,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Top row — logo + links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 w-fit">
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

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map(({ label, href, internal }) =>
              internal ? (
                <Link key={label} to={href}
                  className="font-sohne text-[14px] text-white/35 hover:text-white/70 transition-colors tracking-[-0.009em]">
                  {label}
                </Link>
              ) : (
                <a key={label} href={href}
                  className="font-sohne text-[14px] text-white/35 hover:text-white/70 transition-colors tracking-[-0.009em]">
                  {label}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-sohne text-[13px] text-white/25 tracking-[-0.009em]">
            Free AI Resume Builder for Indian Students — No Sign-Up, Download PDF Instantly
          </p>
          <p className="font-sohne text-[13px] text-white/20 tracking-[-0.009em] shrink-0">
            © {new Date().getFullYear()} ResumeFree
          </p>
        </div>

      </div>
    </footer>
  );
}