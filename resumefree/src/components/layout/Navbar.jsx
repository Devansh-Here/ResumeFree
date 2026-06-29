// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import UpgradeModal from "../premium/UpgradeModal";
import { GlassButton } from '../ui/GlassButton'

const NAV_LINKS = [
  { label: "Home",         href: "#"             },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Reviews",      href: "#testimonials" },
  { label: "Pricing",      href: "#pricing"      },
  { label: "FAQ",          href: "#faq"          },
];

/* ── Liquid Glass Nav Link ── */
function GlassLink({ href, children, onClick }) {
  return (
    
      <a href={href}
      onClick={onClick}
      className="relative px-4 py-2 font-sohne text-[13px] text-white/55 hover:text-white transition-colors duration-200 rounded-buttons group tracking-[-0.009em]"
    >
      {/* Glass pill — shows on hover */}
      <span
        className="absolute inset-0 rounded-buttons opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

/* ── Shimmer Glow CTA Button ── */
function ShimmerButton({ to, children }) {
  return (
    <Link
      to={to}
      className="relative inline-flex items-center gap-2 px-5 py-2 font-sohne text-[13px] text-white rounded-buttons overflow-hidden group"
      style={{
        fontWeight: 500,
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        boxShadow: "0 0 0 1px rgba(5,150,105,0.5), 0 4px 16px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(5,150,105,0.8), 0 6px 24px rgba(5,150,105,0.5), inset 0 1px 0 rgba(255,255,255,0.25)"
        e.currentTarget.style.transform = "scale(1.03)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(5,150,105,0.5), 0 4px 16px rgba(5,150,105,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
        e.currentTarget.style.transform = "scale(1)"
      }}
    >
      {/* Shimmer sweep */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
        }}
      />
      {/* Top highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[45%] rounded-t-buttons pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
        }}
      />
      <span className="relative z-10 tracking-[-0.009em]">{children}</span>
      <span className="relative z-10 text-white/90 text-[11px]">⚡</span>
    </Link>
  );
}

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location  = useLocation();
  const isBuilder = location.pathname === "/builder";
  const isPremium = useAuthStore((s) => s.isPremium());

  /* ── Builder Navbar ── */
  if (isBuilder) {
    return (
      <>
        <nav className="w-full border-b border-dove/20 bg-white sticky top-0 z-50">
          <div className="w-full px-8 sm:px-12 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="border border-ink/50 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-ink tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[17px] text-ink" style={{ letterSpacing: "-0.2px" }}>
                ResumeFree
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rust" />
                <span className="font-sohne text-[13px] text-graphite tracking-[-0.009em]">Auto-saved</span>
              </div>
              {isPremium && (
                <span className="px-3 py-1 rounded-tags bg-apricot-wash font-sohne text-[12px] text-rust tracking-[-0.009em]">
                  ✦ Premium
                </span>
              )}
              <Link to="/" className="font-sohne text-[13px] text-graphite hover:text-ink transition-colors tracking-[-0.009em]">
                &larr; Home
              </Link>
            </div>
          </div>
        </nav>
        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </>
    );
  }

  /* ── Landing Navbar ── */
  return (
    <>
      <nav className="w-full sticky top-0 z-50">

        {/* Desktop — 3 col grid */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center w-full px-10 lg:px-16 h-16">

          {/* LEFT — Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="border border-white/25 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-white/80 tracking-widest"
              style={{ borderRadius: "3px" }}
            >
              ATS
            </span>
            <span
              className="font-signifier text-[19px] text-white leading-none"
              style={{ letterSpacing: "-0.23px" }}
            >
              ResumeFree
            </span>
          </Link>

          {/* CENTER — Glass nav links */}
          <div className="flex items-center gap-2.5">
            {NAV_LINKS.map(({ label, href }) => (
              <GlassLink key={label} href={href}>{label}</GlassLink>
            ))}
            {isPremium ? (
              <GlassLink href="#">✦ Premium</GlassLink>
            ) : (
              <GlassLink href="#" onClick={(e) => { e.preventDefault(); setUpgradeOpen(true); }}>
                ✦ Upgrade
              </GlassLink>
            )}
          </div>

          {/* RIGHT — Shimmer CTA */}
          {/* RIGHT — Animated CTA Button */}
<div className="flex items-center justify-end">
  <Link
    to="/builder"
    className="group relative inline-flex items-center gap-2.5 px-5 py-2 bg-white rounded-buttons overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
    style={{
      border: "1.5px solid rgba(10,22,40,0.15)",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "#0a1628"}
    onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
  >
    {/* Animated dot → arrow */}
    <span className="relative flex items-center justify-center w-5 h-5">
      {/* Dot */}
      <span
        className="absolute w-1.5 h-1.5 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-0 group-hover:scale-0"
      />
      {/* Arrow — fades in on hover */}
      <span
        className="absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        <svg
          width="14" height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="text-white"
        >
          <path
            d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>

    {/* Text */}
    <span
      className="font-sohne text-[13px] text-ink group-hover:text-white transition-colors duration-500 tracking-[-0.009em]"
      style={{ fontWeight: 500 }}
    >
      Start Building
    </span>
  </Link>
</div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between px-5 h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="border border-white/25 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-white/80 tracking-widest"
              style={{ borderRadius: "3px" }}
            >
              ATS
            </span>
            <span className="font-signifier text-[17px] text-white" style={{ letterSpacing: "-0.2px" }}>
              ResumeFree
            </span>
          </Link>

          <button
            className="flex flex-col gap-[5px] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden absolute top-14 left-3 right-3 z-50 rounded-cards overflow-hidden"
            style={{
              background: "rgba(10,22,40,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                
                  <a key={label}
                  href={href}
                  className="px-4 py-3 font-sohne text-[14px] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em]"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              {!isPremium && (
                <button
                  onClick={() => { setUpgradeOpen(true); setMenuOpen(false); }}
                  className="px-4 py-3 font-sohne text-[14px] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em] text-left"
                >
                  ✦ Upgrade
                </button>
              )}
            </div>
            <div className="px-4 pb-4 border-t border-white/8 pt-3">
              <ShimmerButton to="/builder">Start Building</ShimmerButton>
            </div>
          </div>
        )}
      </nav>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}