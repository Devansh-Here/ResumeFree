// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useResumeStore } from "../../store/resumeStore";
import UpgradeModal from "../premium/UpgradeModal";

const UI_FONT = "'Inter', sans-serif";
const DISPLAY_FONT = "'DM Serif Display', serif";

const NAV_LINKS = [
  { label: "Home",         href: "/#"             },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Reviews",      href: "/#testimonials" },
  { label: "Check Resume", href: "/resume-checker" },
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
        fontFamily: UI_FONT,
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

/* ── Animated Premium Badge (rotating gradient ring) ──
   The conic-gradient ring is an explicitly established "alive" pattern
   (Section 1.5 of the redesign rulebook) — kept as-is. It's a motion
   accent, not a decorative background gradient. */
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
      <span
        className="relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: "#d1fae5", color: "#059669", fontFamily: UI_FONT, fontSize: "0.75rem", letterSpacing: "-0.009em" }}
      >
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

   Sign-out uses a red text state on hover — this is a deliberate,
   documented exception to the Steep palette (Section 1.1): the palette
   has no destructive/danger color, and red is the standard semantic
   for a destructive action. Scoped to this one state only, not used
   as a general accent anywhere else. */
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
        <span style={{ fontFamily: UI_FONT, fontSize: "0.75rem", fontWeight: 600, color: "#ffffff" }}>
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
          <p style={{ fontFamily: UI_FONT, fontSize: "0.6875rem", fontWeight: 500, color: "rgba(255,255,255,0.45)" }} className="truncate">
            Signed in as
          </p>
          <p style={{ fontFamily: UI_FONT, fontSize: "0.75rem", fontWeight: 600, color: "#ffffff" }} className="truncate">
            {email || "—"}
          </p>
        </div>

        <div className="p-1.5 flex flex-col">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 text-left ${
                item.danger
                  ? "text-white/55 hover:text-[#f87171] hover:bg-[#f87171]/10"
                  : "text-white/70 hover:text-white hover:bg-white/8"
              }`}
              style={{
                fontFamily: UI_FONT,
                fontSize: "0.75rem",
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
      className={`transition-colors duration-200 whitespace-nowrap px-1 ${
        dark ? "text-white/55 hover:text-white" : "text-graphite hover:text-ink"
      }`}
      style={{ fontFamily: UI_FONT, fontSize: "0.75rem", letterSpacing: "-0.009em" }}
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
   landing glow pulse) instead of the native smooth scroll.

   The frosted-glass hover fill (translucent gradient + blur) is the
   glassmorphism aesthetic Devansh chose — kept intentionally. This is
   distinct from the banned decorative button gradients: it's a structural
   glass-panel effect providing depth, not a branded fill color. */
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

  const className = "relative px-3.5 py-1.5 text-white/55 hover:text-white transition-colors duration-200 rounded-buttons group";
  const style = { fontFamily: UI_FONT, fontSize: "0.75rem", letterSpacing: "-0.009em" };

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
      <a href={href} onClick={handleHashClick} className={className} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <a href={href} onClick={onClick} className={className} style={style}>
      {inner}
    </a>
  );
}

/* ── CTA Button (mobile menu) ──
   Solid emerald fill, no gradient, no shine-sweep — the decorative
   gradient + shimmer this used to have read as a dated "SaaS button"
   trend and is explicitly banned by the Steep rules (Section 1.1).
   Motion comes from a clean lift + icon-transform on hover instead,
   reusing the same overshoot easing as the rest of the "alive" system. */
function CtaButton({ to, children }) {
  return (
    <Link
      to={to}
      className="rf-cta-btn relative inline-flex items-center gap-2 px-4 py-2 rounded-buttons"
      style={{
        background: "#059669",
        transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s ease",
      }}
    >
      <span style={{ fontFamily: UI_FONT, fontSize: "0.75rem", fontWeight: 500, color: "#ffffff", letterSpacing: "-0.009em" }}>
        {children}
      </span>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="rf-cta-arrow">
        <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
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
                className="border border-ink/50 px-2 py-0.5 rounded-full"
                style={{ fontFamily: UI_FONT, fontSize: "0.5625rem", fontWeight: 600, color: "#0a1628", letterSpacing: "0.05em" }}
              >
                ATS
              </span>
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: "0.9375rem", color: "#0a1628", letterSpacing: "-0.2px" }}>
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
              <Link
                to="/resume-checker"
                className="inline-flex items-center px-2 py-1 text-[0.6875rem] font-medium text-ink hover:text-emerald-700 transition-colors"
                style={{ fontFamily: UI_FONT }}
              >
                Check Resume
              </Link>
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

     ── P0 FIX (UI/UX audit — ghost text bleed-through) ──
     Previously this bar sat at a flat rgba(10,22,40,0.72) regardless of
     scroll position. At 72% opacity, backdrop-blur alone wasn't enough
     to fully occlude page content scrolling underneath — bright/light
     sections showed through as visible "ghosting" behind the nav's own
     text and links, breaking Gestalt Figure/Ground separation and
     reducing effective contrast below WCAG 2.2 AA in places. Fix: the
     background now steps up to a near-opaque 0.95 once the page is
     scrolled (matching the already-solid-feeling ProfileAvatar dropdown
     at 0.96), with a slightly higher 0.85 baseline even at the top of
     the page. White nav text against this near-solid ink background
     sits well above AA/AAA contrast at every scroll position. The
     transition itself is already handled by .rf-glassnav's existing
     `background 0.3s ease`, so this is a value-only change.

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
        .rf-cta-btn:hover {
          background: #047857 !important;
          transform: translateY(-1px) scale(1.03);
        }
        .rf-cta-btn:hover .rf-cta-arrow {
          animation: rf-cta-arrow-shift 0.45s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes rf-cta-arrow-shift {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        .rf-start-building:hover {
          background: #0a1628 !important;
        }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 px-2 sm:px-3 pt-2 rf-glassnav mx-auto w-full rounded-3xl"
        style={{
          zIndex: 1000,
          pointerEvents: "auto",
          isolation: "isolate",
          maxWidth: "90rem",
          /* P0 fix: opacity now scroll-aware — near-opaque once scrolled,
             and higher even at rest, so page content never bleeds through
             the nav's own text (see comment block above). */
          background: scrolled
            ? "rgba(10,22,40,0.95)"
            : "rgba(10,22,40,0.85)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: scrolled
            ? "0 12px 32px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 8px 24px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
          {/* Desktop */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center w-full pl-6 pr-2.5 h-[3.5rem]">

            <Link to="/" className="flex items-center gap-2">
              <span
                className="border border-white/25 px-2 py-0.5 rounded-full"
                style={{ fontFamily: UI_FONT, fontSize: "0.5625rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}
              >
                ATS
              </span>
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: "1rem", color: "#ffffff", letterSpacing: "-0.23px", lineHeight: 1 }}>
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
                className="rf-start-building group relative inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-buttons overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ border: "1.5px solid rgba(10,22,40,0.15)" }}
              >
                <span className="relative flex items-center justify-center w-4 h-4">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-ink transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-0 group-hover:scale-0" />
                  <span className="absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-white">
                      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span
                  className="text-ink group-hover:text-white transition-colors duration-500"
                  style={{ fontFamily: UI_FONT, fontSize: "0.75rem", fontWeight: 500, letterSpacing: "-0.009em" }}
                >
                  Start Building
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center justify-between pl-4 pr-2.5 h-[3.125rem]">
            <Link to="/" className="flex items-center gap-2">
              <span
                className="border border-white/25 px-2 py-0.5 rounded-full"
                style={{ fontFamily: UI_FONT, fontSize: "0.5625rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}
              >
                ATS
              </span>
              <span style={{ fontFamily: DISPLAY_FONT, fontSize: "0.875rem", color: "#ffffff", letterSpacing: "-0.2px" }}>
                ResumeFree
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <Link
                to="/resume-checker"
                className="inline-flex items-center px-1.5 py-1 text-[0.625rem] font-medium text-ink hover:text-emerald-700 transition-colors"
                style={{ fontFamily: UI_FONT }}
              >
                Check Resume
              </Link>
              {user && (
                <ProfileAvatar
                  email={user.email}
                  dark={true}
                  isPremium={isPremium}
                  onUpgradeClick={() => setUpgradeOpen(true)}
                />
              )}
              {/* Fitts's Law fix: hamburger hit-area bumped to an exact
                  44x44px tap target (was ~38x38px via p-2.5 padding
                  alone). Visual bar size/spacing unchanged. */}
              <button
                className="flex flex-col items-center justify-center gap-[0.3125rem] w-11 h-11 shrink-0"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[0.375rem]" : ""}`} />
                <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-px bg-white/70 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[0.375rem]" : ""}`} />
              </button>
            </div>
          </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="md:hidden mx-auto mt-2 overflow-hidden rounded-3xl"
            style={{
              maxWidth: "90rem",
              background: "rgba(10,22,40,0.95)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              pointerEvents: "auto",
            }}
          >
            <div className="px-3.5 py-2.5 flex flex-col gap-1">
              {/* Fitts's Law fix: vertical padding bumped from py-2.5 to
                  py-3.5 on every mobile menu link so each row's tap
                  target lands at ~44px tall instead of ~36px. */}
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label}
                  href={href}
                  className="px-3.5 py-3.5 text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all"
                  style={{ fontFamily: UI_FONT, fontSize: "0.8125rem", letterSpacing: "-0.009em" }}
                  onClick={handleMobileHashClick(href)}
                >
                  {label}
                </a>
              ))}
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-3.5 py-3.5 text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all"
                  style={{ fontFamily: UI_FONT, fontSize: "0.8125rem", letterSpacing: "-0.009em" }}
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-3.5 py-3.5 text-white/60 hover:text-white hover:bg-white/5 rounded-inputs transition-all"
                  style={{ fontFamily: UI_FONT, fontSize: "0.8125rem", letterSpacing: "-0.009em" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </div>
            <div className="px-3.5 pb-3.5 border-t border-white/8 pt-2.5">
              <CtaButton to="/builder">Start Building</CtaButton>
            </div>
          </div>
        )}
      </nav>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}