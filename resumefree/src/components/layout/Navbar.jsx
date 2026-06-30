// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useResumeStore } from "../../store/resumeStore";
import UpgradeModal from "../premium/UpgradeModal";

const NAV_LINKS = [
  { label: "Home",         href: "/#"             },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Reviews",      href: "/#testimonials" },
  { label: "Pricing",      href: "/pricing"      },
  { label: "FAQ",          href: "/#faq"          },
];

/* ── Custom eased scroll (matches the sliding-indicator easing family) ──
   Native scrollTo({behavior:"smooth"}) uses the browser's own easing,
   which feels inconsistent across browsers. This uses the same
   cubic-bezier(0.4,0,0.2,1) curve as the rest of the "alive" UI so a
   nav click feels like part of the same motion language. */
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function magicScrollTo(targetY, duration = 850) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutQuart(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

/* ── Glow pulse on the section we just landed on ── */
function pulseSection(el) {
  if (!el) return;
  el.classList.remove("rf-section-pulse");
  // force reflow so the animation can re-trigger on repeat clicks
  void el.offsetWidth;
  el.classList.add("rf-section-pulse");
  setTimeout(() => el.classList.remove("rf-section-pulse"), 900);
}

function magicScrollToHash(hash, navOffset = 90) {
  if (!hash) {
    magicScrollTo(0);
    return;
  }
  const el = document.getElementById(hash);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
    magicScrollTo(top);
    // pulse slightly after the scroll lands
    setTimeout(() => pulseSection(el), 870);
  }
}

// ── Auto-save pop indicator ──
function AutoSaveIndicator() {
  const resume = useResumeStore((s) => s.resume);
  const [state, setState] = useState("idle");
  const prevResumeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const curr = JSON.stringify(resume);
    if (prevResumeRef.current === null) {
      prevResumeRef.current = curr;
      return;
    }
    if (prevResumeRef.current === curr) return;
    prevResumeRef.current = curr;

    setState("saving");
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setState("saved");
      timerRef.current = setTimeout(() => {
        setState("idle");
      }, 2000);
    }, 600);

    return () => clearTimeout(timerRef.current);
  }, [resume]);

  if (state === "idle") return null;

  return (
    <div
      key={state}
      className="hidden sm:flex items-center gap-1.5 select-none"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "12px",
        fontWeight: 500,
        color: state === "saved" ? "#059669" : "#4a6fa5",
        animation: state === "saving"
          ? "fadeSlideIn 0.2s ease-out forwards"
          : "wholePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      {state === "saving" ? (
        <>
          <div
            className="w-3 h-3 rounded-full border-2 animate-spin shrink-0"
            style={{ borderColor: "#cbd5e1", borderTopColor: "#4a6fa5" }}
          />
          <span>Saving…</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6.5" fill="#d1fae5" stroke="#059669" strokeWidth="1"/>
            <path d="M4.5 7l2 2 3-3" stroke="#059669" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Saved</span>
        </>
      )}
    </div>
  );
}

/* ── Animated Premium Badge (rotating gradient ring) ── */
function PremiumBadge() {
  return (
    <span className="relative inline-flex items-center rounded-full p-[1.5px] overflow-hidden">
      <span
        className="absolute inset-[-150%] rf-badge-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #059669 70deg, #34d399 130deg, #a7f3d0 165deg, transparent 210deg, transparent 360deg)",
        }}
      />
      <span className="relative z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-apricot-wash font-sohne text-[12px] text-rust tracking-[-0.009em] whitespace-nowrap">
        ✦ Premium
      </span>
    </span>
  );
}

/* ── Home icon button — door swings open on hover ── */
function HomeIconButton() {
  return (
    <Link
      to="/"
      aria-label="Back to home"
      className="rf-home-btn flex items-center justify-center w-8 h-8 rounded-full border border-dove text-graphite transition-all duration-300"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="rf-home-icon">
        <path
          d="M2 7.3L8 2.2l6 5.1"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
          className="rf-home-roof"
        />
        <path
          d="M3.4 6.4V13a.7.7 0 00.7.7h7.8a.7.7 0 00.7-.7V6.4"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        />
        <rect
          x="6.6" y="9.2" width="2.8" height="4.5" rx="0.3"
          fill="currentColor" stroke="none"
          className="rf-home-door"
          style={{ transformOrigin: "6.6px 13.7px" }}
        />
      </svg>
    </Link>
  );
}

/* ── Glass Nav Link ──
   Plain <a> with manual click handler so hash links (e.g. "/#how-it-works")
   reliably scroll to the target section even though it's an SPA route —
   React Router's <Link> does NOT auto-scroll to hash targets on its own.
   Scroll itself now goes through magicScrollToHash (custom eased curve +
   landing glow pulse) instead of the native smooth scroll. */
function GlassLink({ href, children, onClick }) {
  const isRoute = href.startsWith("/");
  const navigate = useNavigate();
  const location = useLocation();

  const inner = (
    <>
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
    </>
  );

  const className = "relative px-4 py-2 font-sohne text-[13px] text-white/55 hover:text-white transition-colors duration-200 rounded-buttons group tracking-[-0.009em]";

  const handleHashClick = (e) => {
    e.preventDefault();
    const [path, hash] = href.split("#");
    const targetPath = path || "/";

    const scrollToHash = () => magicScrollToHash(hash, 90);

    if (location.pathname !== targetPath) {
      // navigate to landing first, then scroll once it's rendered
      navigate(targetPath);
      setTimeout(scrollToHash, 100);
    } else {
      scrollToHash();
    }
  };

  if (isRoute) {
    return (
      <a href={href} onClick={handleHashClick} className={className}>
        {inner}
      </a>
    );
  }

  return (
    <a href={href} onClick={onClick} className={className}>
      {inner}
    </a>
  );
}

/* ── Shimmer Button ── */
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
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)" }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[45%] rounded-t-buttons pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }}
      />
      <span className="relative z-10 tracking-[-0.009em]">{children}</span>
      <span className="relative z-10 text-white/90 text-[11px]">⚡</span>
    </Link>
  );
}

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const isBuilder = location.pathname === "/builder";
  const isPremium = useAuthStore((s) => s.isPremium());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Same hash-scroll logic, reused for the mobile dropdown links
  const handleMobileHashClick = (href) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const [path, hash] = href.split("#");
    const targetPath = path || "/";

    const scrollToHash = () => magicScrollToHash(hash, 90);

    if (location.pathname !== targetPath) {
      navigate(targetPath);
      setTimeout(scrollToHash, 150);
    } else {
      scrollToHash();
    }
  };

  /* ── Builder Navbar (unchanged) ── */
  if (isBuilder) {
    return (
      <>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(3px); }
            to   { opacity: 1; transform: translateY(0);   }
          }
          @keyframes wholePop {
            0%   { opacity: 0; transform: scale(0.6) translateY(4px); }
            55%  { opacity: 1; transform: scale(1.18) translateY(-2px); }
            75%  { transform: scale(0.95) translateY(0); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes rf-badge-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .rf-badge-spin {
            animation: rf-badge-spin 3.5s linear infinite;
          }
          .rf-home-btn:hover {
            background: #0a1628;
            border-color: #0a1628;
            color: #ffffff;
            transform: translateY(-1px);
          }
          .rf-home-btn:hover .rf-home-icon {
            animation: rf-home-bounce 0.45s cubic-bezier(.34,1.56,.64,1);
          }
          @keyframes rf-home-bounce {
            0%   { transform: scale(1)    translateY(0); }
            35%  { transform: scale(1.12) translateY(-1.5px); }
            100% { transform: scale(1)    translateY(0); }
          }
          .rf-home-door {
            transition: transform 0.35s cubic-bezier(.34,1.56,.64,1);
          }
          .rf-home-btn:hover .rf-home-door {
            transform: skewY(-28deg) translateX(0.3px);
          }
        `}</style>

        <nav className="w-full border-b border-dove/20 bg-white sticky top-0 z-50 ">
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

            <div className="flex items-center gap-7">
              <AutoSaveIndicator />
              {isPremium && <PremiumBadge />}
              <HomeIconButton />
            </div>

          </div>
        </nav>
        {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
      </>
    );
  }

  /* ── Standard Navbar (Landing, Pricing, every other page) ──
     Fixed to viewport. Wide rectangular glass bar with soft rounded
     corners (not a pill) — covers the full top width. Outer wrapper
     has pointer-events:none so it never blocks clicks on the page
     below it; only the actual <nav> bar re-enables pointer-events.

     NOTE: the "✦ Premium" / "✦ Upgrade" nav link has been removed
     (was redundant with "Pricing"). isPremium + setUpgradeOpen +
     <UpgradeModal> are intentionally KEPT — to be repurposed later
     into a conditional "My Pass" / active-pass link once pass-expiry
     tracking is built (see handoff doc Section 15/14). */
  return (
    <>
      <style>{`
        .rf-glassnav {
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        /* Magic landing glow — pulses on whatever section a nav click scrolls to */
        .rf-section-pulse {
          animation: rf-section-pulse-kf 0.9s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes rf-section-pulse-kf {
          0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0); }
          25%  { box-shadow: 0 0 0 0 rgba(5,150,105,0.22); }
          100% { box-shadow: 0 0 0 60px rgba(5,150,105,0); }
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 px-2 sm:px-3 pt-2"
        style={{ zIndex: 1000, pointerEvents: "none" }}
      >
        <nav
          className="rf-glassnav mx-auto w-full"
          style={{
            maxWidth: "1440px",
            borderRadius: "24px",
            background: "rgba(10,22,40,0.72)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: scrolled
              ? "0 12px 32px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 8px 24px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            pointerEvents: "auto",
          }}
        >
          {/* Desktop */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center w-full pl-8 pr-3 h-16">

            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="border border-white/25 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-white/80 tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[18px] text-white leading-none" style={{ letterSpacing: "-0.23px" }}>
                ResumeFree
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              {NAV_LINKS.map(({ label, href }) => (
                <GlassLink key={label} href={href}>{label}</GlassLink>
              ))}
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/builder"
                className="group relative inline-flex items-center gap-2.5 px-5 py-2 bg-white rounded-buttons overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ border: "1.5px solid rgba(10,22,40,0.15)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0a1628"}
                onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
              >
                <span className="relative flex items-center justify-center w-5 h-5">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-0 group-hover:scale-0" />
                  <span className="absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span className="font-sohne text-[13px] text-ink group-hover:text-white transition-colors duration-500 tracking-[-0.009em]" style={{ fontWeight: 500 }}>
                  Start Building
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center justify-between pl-5 pr-3 h-14">
            <Link to="/" className="flex items-center gap-2.5">
              <span
                className="border border-white/25 px-1.5 py-0.5 font-sohne text-[9px] font-semibold text-white/80 tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[16px] text-white" style={{ letterSpacing: "-0.2px" }}>
                ResumeFree
              </span>
            </Link>
            <button
              className="flex flex-col gap-[5px] p-3"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden mx-auto mt-2 overflow-hidden"
            style={{
              maxWidth: "1440px",
              borderRadius: "20px",
              background: "rgba(10,22,40,0.9)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              pointerEvents: "auto",
            }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label}
                  href={href}
                  className="px-4 py-3 font-sohne text-[14px] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em]"
                  onClick={handleMobileHashClick(href)}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="px-4 pb-4 border-t border-white/8 pt-3">
              <ShimmerButton to="/builder">Start Building</ShimmerButton>
            </div>
          </div>
        )}
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}