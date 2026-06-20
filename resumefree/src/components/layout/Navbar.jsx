// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import UpgradeModal from "../premium/UpgradeModal";

function PremiumButton({ isPremium, mobile, onClick }) {
  if (isPremium) {
    return (
      <span
        className={`text-sm font-medium text-[#1E8E5A] border border-[#1E8E5A]/40 px-3 py-1 rounded-full ${
          mobile ? "text-left w-fit" : ""
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        ✓ Premium
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm font-medium text-[#E2A33B] border border-[#E2A33B]/40 px-3 py-1 rounded-full hover:bg-[#E2A33B]/10 transition-colors ${
        mobile ? "text-left" : ""
      }`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      ✦ Premium — ₹199/mo
    </button>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const location = useLocation();
  const isBuilder = location.pathname === "/builder";
  const isPremium = useAuthStore((s) => s.isPremium());

  const openUpgrade = () => {
    setUpgradeOpen(true);
    setMenuOpen(false);
  };

  // ── Builder Navbar ──────────────────────────────────────
  if (isBuilder) {
    return (
      <>
        <nav className="w-full border-b border-[#DDD6C8] bg-white sticky top-0 z-50">
          <div className="max-w-full px-4 sm:px-6 flex items-center justify-between h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] font-bold tracking-widest text-[#1E8E5A] uppercase border border-[#1E8E5A] px-1.5 py-0.5 rounded-sm"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ATS
              </span>
              <span
                className="text-[#161A2E] font-bold text-lg tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Resume<span className="text-[#1E8E5A]">Free</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E8E5A]" />
                <span
                  className="text-[11px] text-[#161A2E]/40"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Auto-saved
                </span>
              </div>

              <PremiumButton isPremium={isPremium} onClick={openUpgrade} />

              {/* Back to home */}
              <Link
                to="/"
                className="text-sm text-[#161A2E]/50 hover:text-[#161A2E] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </nav>
        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </>
    );
  }

  // ── Landing Navbar ──────────────────────────────────────
  return (
    <>
      <nav className="w-full border-b border-[#DDD6C8] bg-[#F6F4EF] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span
              className="font-mono text-[10px] font-bold tracking-widest text-[#1E8E5A] uppercase border border-[#1E8E5A] px-1.5 py-0.5 rounded-sm"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ATS
            </span>
            <span
              className="text-[#161A2E] font-bold text-lg tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Resume<span className="text-[#1E8E5A]">Free</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works"
              className="text-sm text-[#161A2E]/60 hover:text-[#161A2E] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              How It Works
            </a>
            <a href="#testimonials"
              className="text-sm text-[#161A2E]/60 hover:text-[#161A2E] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Reviews
            </a>
            <PremiumButton isPremium={isPremium} onClick={openUpgrade} />
            <Link
              to="/builder"
              className="bg-[#161A2E] text-[#F6F4EF] text-sm font-semibold px-4 py-2 rounded hover:bg-[#1E8E5A] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              Build My Resume →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[#161A2E] transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#161A2E] transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-[#161A2E] transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#DDD6C8] bg-[#F6F4EF] px-4 py-4 flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm text-[#161A2E]/70" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#testimonials" className="text-sm text-[#161A2E]/70" onClick={() => setMenuOpen(false)}>Reviews</a>
            <PremiumButton isPremium={isPremium} mobile onClick={openUpgrade} />
            <Link
              to="/builder"
              className="bg-[#161A2E] text-[#F6F4EF] text-sm font-semibold px-4 py-2.5 rounded text-center"
              onClick={() => setMenuOpen(false)}>
              Build My Resume →
            </Link>
          </div>
        )}
      </nav>
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}