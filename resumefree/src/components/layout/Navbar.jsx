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
        fontSize: "0.75rem",
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
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
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
    <span className="relative inline-flex items-center rounded-full p-[0.09375rem] overflow-hidden">
      <span
        className="absolute inset-[-150%] rf-badge-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #059669 70deg, #34d399 130deg, #a7f3d0 165deg, transparent 210deg, transparent 360deg)",
        }}
      />
      <span className="relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-apricot-wash font-sohne text-[0.75rem] text-rust tracking-[-0.009em] whitespace-nowrap">
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
      className="rf-home-btn flex items-center justify-center w-7 h-7 rounded-full border border-dove text-graphite transition-all duration-300"
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="rf-home-icon">
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

/* ── Dropdown menu icons (small line icons, same stroke language as HomeIconButton) ── */
const MenuIcons = {
  dashboard: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  resumes: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M4 1.8h5.4L12.2 4.6V14a.7.7 0 01-.7.7H4a.7.7 0 01-.7-.7V2.5a.7.7 0 01.7-.7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.4 1.8V4.6h2.8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.3 8.2h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.3 10.6h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  premium: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  logout: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M6.4 14H2.7a.7.7 0 01-.7-.7V2.7a.7.7 0 01.7-.7h3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.6 11.2L14 8l-3.4-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  coverletter: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 3.5h11a.7.7 0 01.7.7v7.6a.7.7 0 01-.7.7h-11a.7.7 0 01-.7-.7V4.2a.7.7 0 01.7-.7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2.8 4.3L8 8.4l5.2-4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ── Profile avatar — initials circle that opens an animated dropdown
   menu instead of navigating directly. The avatar itself reacts on
   click (squash + tilt bounce, reusing the same overshoot easing as
   the Home icon door-hinge), and grows a pulsing emerald ring while
   the menu is open. Menu items cascade in with a small stagger.

   ASSUMPTION: authStore exposes a `signOut` action with this name —
   not yet verified against the real authStore.js file. If it's named
   differently, only the `useAuthStore((s) => s.signOut)` line below
   needs updating. */
function ProfileAvatar({ email, dark = true, isPremium = false, onUpgradeClick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const initial = (email || "?").trim().charAt(0).toUpperCase();

  // click-outside + escape to close
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleAvatarClick = () => {
    // replay the click-bounce animation even on rapid repeat clicks
    const el = btnRef.current;
    if (el) {
      el.classList.remove("rf-avatar-clicked");
      void el.offsetWidth;
      el.classList.add("rf-avatar-clicked");
    }
    setOpen((v) => !v);
  };

  const closeAnd = (fn) => () => {
    setOpen(false);
    fn();
  };

  const handleSignOut = async () => {
    try {
      await signOut?.();
    } finally {
      navigate("/");
    }
  };

  const items = [
    { key: "dashboard", icon: MenuIcons.dashboard, label: "Dashboard", onClick: closeAnd(() => navigate("/dashboard")) },
    { key: "resumes",   icon: MenuIcons.resumes,   label: "My Resumes", onClick: closeAnd(() => navigate("/dashboard")) },
    { key: "coverletter", icon: MenuIcons.coverletter, label: "Cover Letter", onClick: closeAnd(() => navigate("/cover-letter")) },
    {
      key: "premium",
      icon: MenuIcons.premium,
      label: isPremium ? "Manage Plan" : "Upgrade to Premium",
      onClick: closeAnd(() => (isPremium ? navigate("/dashboard") : onUpgradeClick?.())),
    },
    { key: "logout", icon: MenuIcons.logout, label: "Sign out", danger: true, onClick: closeAnd(handleSignOut) },
  ];

  return (
    <div ref={wrapRef} className="relative">
      {/* pulsing ring — only visible while menu is open */}
      <span
        aria-hidden="true"
        className="absolute -inset-[0.1875rem] rounded-full pointer-events-none transition-opacity duration-200"
        style={{
          opacity: open ? 1 : 0,
          animation: open ? "rf-avatar-ring-pulse 1.6s cubic-bezier(0.4,0,0.2,1) infinite" : "none",
        }}
      />

      <button
        ref={btnRef}
        type="button"
        onClick={handleAvatarClick}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="rf-avatar-btn relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all duration-200"
        style={{
          background: dark ? "rgba(255,255,255,0.1)" : "#0a1628",
          border: dark ? "1.5px solid rgba(255,255,255,0.2)" : "1.5px solid #0a1628",
          boxShadow: open ? "0 0 0 3px rgba(5,150,105,0.18)" : "none",
        }}
      >
        <span
          className="font-sohne text-[0.75rem]"
          style={{ fontWeight: 600, color: "#ffffff" }}
        >
          {initial}
        </span>
      </button>

      {/* dropdown — always mounted so close can animate too, just
          transitions opacity/scale/pointer-events based on `open` */}
      <div
        className="absolute right-0 top-[calc(100%+0.625rem)] w-[13.25rem] origin-top-right rounded-2xl overflow-hidden z-[80] transition-all"
        style={{
          background: "rgba(10,22,40,0.96)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          transitionDuration: open ? "280ms" : "160ms",
          transitionTimingFunction: open
            ? "cubic-bezier(.34,1.56,.64,1)"
            : "cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="px-3 py-2.5 border-b border-white/8">
          <p className="font-sohne text-[0.6875rem] text-white/45 truncate" style={{ fontWeight: 500 }}>
            Signed in as
          </p>
          <p className="font-sohne text-[0.75rem] text-white truncate" style={{ fontWeight: 600 }}>
            {email || "—"}
          </p>
        </div>

        <div className="p-1.5 flex flex-col">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-sohne text-[0.75rem] transition-all duration-150 text-left ${
                item.danger
                  ? "text-white/55 hover:text-[#f87171] hover:bg-[#f87171]/10"
                  : "text-white/70 hover:text-white hover:bg-white/8"
              }`}
              style={{
                fontWeight: 500,
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(-3px)",
                transitionDelay: open ? `${70 + i * 35}ms` : "0ms",
              }}
            >
              <span className="shrink-0 opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Login link — shown only when signed OUT.
   Subtle text link (not a button) so it doesn't compete visually with
   "Start Building", but gives returning premium users on a new device
   a way back into their account instead of typing /auth manually. */
function LoginLink({ dark = true }) {
  return (
    <Link
      to="/auth"
      className={`font-sohne text-[0.75rem] tracking-[-0.009em] transition-colors duration-200 whitespace-nowrap px-1 ${
        dark ? "text-white/55 hover:text-white" : "text-graphite hover:text-ink"
      }`}
    >
      Log in
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

  const className = "relative px-3.5 py-1.5 font-sohne text-[0.75rem] text-white/55 hover:text-white transition-colors duration-200 rounded-buttons group tracking-[-0.009em]";

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
      className="relative inline-flex items-center gap-2 px-4 py-1.5 font-sohne text-[0.75rem] text-white rounded-buttons overflow-hidden group"
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
      <span className="relative z-10 text-white/90 text-[0.6875rem]">⚡</span>
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
  const user      = useAuthStore((s) => s.user);

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

  /* ── Builder Navbar (unchanged, + profile avatar if signed in) ── */
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
          .rf-avatar-btn:hover {
            transform: translateY(-1px) scale(1.05);
          }
          @keyframes rf-avatar-click-bounce {
            0%   { transform: scale(1)    rotate(0deg); }
            40%  { transform: scale(0.86) rotate(-7deg); }
            70%  { transform: scale(1.14) rotate(5deg); }
            100% { transform: scale(1)    rotate(0deg); }
          }
          .rf-avatar-clicked {
            animation: rf-avatar-click-bounce 0.45s cubic-bezier(.34,1.56,.64,1);
          }
          @keyframes rf-avatar-ring-pulse {
            0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.55); }
            100% { box-shadow: 0 0 0 8px rgba(5,150,105,0); }
          }
        `}</style>

        <nav className="w-full border-b border-dove/20 bg-white sticky top-0 z-50 ">
          <div className="w-full px-6 sm:px-10 h-[3.125rem] flex items-center justify-between">

            <Link to="/" className="flex items-center gap-2">
              <span
                className="border border-ink/50 px-1.5 py-0.5 font-sohne text-[0.5625rem] font-semibold text-ink tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[0.9375rem] text-ink" style={{ letterSpacing: "-0.2px" }}>
                ResumeFree
              </span>
            </Link>

            <div className="flex items-center gap-5">
              <AutoSaveIndicator />
              {isPremium && <PremiumBadge />}
              {user ? (
                <ProfileAvatar
                  email={user.email}
                  dark={false}
                  isPremium={isPremium}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              ) : (
                <LoginLink dark={false} />
              )}
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

     If signed in, a profile avatar (initials circle) sits before the
     "Start Building" button and opens an animated dropdown menu. If
     signed out, a subtle "Log in" text link takes its place — this is
     how a returning premium user on a new/different device gets back
     into their account, since there's otherwise no way to reach /auth. */
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
        .rf-avatar-btn:hover {
          transform: translateY(-1px) scale(1.05);
          background: rgba(255,255,255,0.18) !important;
        }
        @keyframes rf-avatar-click-bounce {
          0%   { transform: scale(1)    rotate(0deg); }
          40%  { transform: scale(0.86) rotate(-7deg); }
          70%  { transform: scale(1.14) rotate(5deg); }
          100% { transform: scale(1)    rotate(0deg); }
        }
        .rf-avatar-clicked {
          animation: rf-avatar-click-bounce 0.45s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes rf-avatar-ring-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.55); }
          100% { box-shadow: 0 0 0 8px rgba(5,150,105,0); }
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 px-2 sm:px-3 pt-2"
        style={{ zIndex: 1000, pointerEvents: "none" }}
      >
        <nav
          className="rf-glassnav mx-auto w-full"
          style={{
            maxWidth: "90rem",
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
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center w-full pl-6 pr-2.5 h-[3.5rem]">

            <Link to="/" className="flex items-center gap-2">
              <span
                className="border border-white/25 px-1.5 py-0.5 font-sohne text-[0.5625rem] font-semibold text-white/80 tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[1rem] text-white leading-none" style={{ letterSpacing: "-0.23px" }}>
                ResumeFree
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <GlassLink key={label} href={href}>{label}</GlassLink>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3.5">
              {user ? (
                <ProfileAvatar
                  email={user.email}
                  dark={true}
                  isPremium={isPremium}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              ) : (
                <LoginLink dark={true} />
              )}
              <Link
                to="/builder"
                className="group relative inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-buttons overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ border: "1.5px solid rgba(10,22,40,0.15)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#0a1628"}
                onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
              >
                <span className="relative flex items-center justify-center w-4 h-4">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-0 group-hover:scale-0" />
                  <span className="absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-white">
                      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span className="font-sohne text-[0.75rem] text-ink group-hover:text-white transition-colors duration-500 tracking-[-0.009em]" style={{ fontWeight: 500 }}>
                  Start Building
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center justify-between pl-4 pr-2.5 h-[3.125rem]">
            <Link to="/" className="flex items-center gap-2">
              <span
                className="border border-white/25 px-1.5 py-0.5 font-sohne text-[0.5625rem] font-semibold text-white/80 tracking-widest"
                style={{ borderRadius: "3px" }}
              >
                ATS
              </span>
              <span className="font-signifier text-[0.875rem] text-white" style={{ letterSpacing: "-0.2px" }}>
                ResumeFree
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              {user && (
                <ProfileAvatar
                  email={user.email}
                  dark={true}
                  isPremium={isPremium}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              )}
              <button
                className="flex flex-col gap-[0.3125rem] p-2.5"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`block w-[1.125rem] h-px bg-white/70 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[0.375rem]" : ""}`} />
                <span className={`block w-[1.125rem] h-px bg-white/70 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-[1.125rem] h-px bg-white/70 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[0.375rem]" : ""}`} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden mx-auto mt-2 overflow-hidden"
            style={{
              maxWidth: "90rem",
              borderRadius: "20px",
              background: "rgba(10,22,40,0.9)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              pointerEvents: "auto",
            }}
          >
            <div className="px-3.5 py-2.5 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label}
                  href={href}
                  className="px-3.5 py-2.5 font-sohne text-[0.8125rem] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em]"
                  onClick={handleMobileHashClick(href)}
                >
                  {label}
                </a>
              ))}
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-3.5 py-2.5 font-sohne text-[0.8125rem] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em]"
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-3.5 py-2.5 font-sohne text-[0.8125rem] text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all tracking-[-0.009em]"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </div>
            <div className="px-3.5 pb-3.5 border-t border-white/8 pt-2.5">
              <ShimmerButton to="/builder">Start Building</ShimmerButton>
            </div>
          </div>
        )}
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}