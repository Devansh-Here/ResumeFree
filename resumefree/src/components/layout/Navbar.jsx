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

/* ── Custom eased scroll ── */
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

function pulseSection(el) {
  if (!el) return;
  el.classList.remove("rf-section-pulse");
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
    setTimeout(() => pulseSection(el), 870);
  }
}

/* ── Liquid glass pointer tracking ── */
function useGlassPointer(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    const handleEnter = () => el.classList.add("rf-glass-hover");
    const handleLeave = () => el.classList.remove("rf-glass-hover");
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref]);
}

/* ── Scroll-spy — tracks which hash-section is currently in view
   on the landing page, so the matching nav link can stay permanently
   "active" (purple text + glow) instead of only lighting up on hover. */
function useActiveHash(location) {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveHash("");
      return;
    }

    const sectionIds = ["how-it-works", "testimonials", "faq"];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveHash(visible[0].target.id);
        } else if (window.scrollY < 200) {
          setActiveHash("");
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [location.pathname]);

  return activeHash;
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
      className={`hidden sm:flex items-center gap-1.5 select-none font-body text-[12px] font-medium ${
        state === "saved" ? "text-success-text" : "text-ash"
      }`}
      style={{
        animation: state === "saving"
          ? "fadeSlideIn 0.2s ease-out forwards"
          : "wholePop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      {state === "saving" ? (
        <>
          <div className="w-3 h-3 rounded-full border-2 animate-spin shrink-0 border-mist border-t-ash" />
          <span>Saving…</span>
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6.5" className="fill-success-bg stroke-success-text" strokeWidth="1"/>
            <path d="M4.5 7l2 2 3-3" className="stroke-success-text" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Saved</span>
        </>
      )}
    </div>
  );
}

/* ── Animated Premium Badge ── */
function PremiumBadge() {
  return (
    <span className="relative inline-flex items-center rounded-full p-[0.09375rem] overflow-hidden">
      <span
        className="absolute inset-[-150%] rf-badge-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #7451f2 70deg, #9b7ff5 130deg, #d4c8fb 165deg, transparent 210deg, transparent 360deg)",
        }}
      />
      <span
        className="rf-glass relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap font-body text-[12px]"
        style={{
          background: "rgba(116,81,242,0.16)",
          color: "#7451f2",
          letterSpacing: "-0.009em",
        }}
      >
        ✦ Premium
      </span>
    </span>
  );
}

/* ── Home icon button ── */
function HomeIconButton() {
  return (
    <Link
      to="/"
      aria-label="Back to home"
      className="rf-home-btn rf-glass rf-liquid-press flex items-center justify-center w-7 h-7 rounded-full border border-mist text-ash transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.35)" }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="rf-home-icon relative z-10">
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

/* ── Dropdown menu icons ── */
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

/* ── Profile avatar dropdown ── */
function ProfileAvatar({ email, dark = true, isPremium = false, onUpgradeClick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const initial = (email || "?").trim().charAt(0).toUpperCase();

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
        className="rf-avatar-btn rf-liquid-press relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all duration-200"
        style={{
          background: dark ? "rgba(255,255,255,0.16)" : "#272727",
          backdropFilter: dark ? "blur(6px)" : "none",
          WebkitBackdropFilter: dark ? "blur(6px)" : "none",
          border: dark ? "1.5px solid rgba(255,255,255,0.3)" : "1.5px solid #272727",
          boxShadow: open ? "0 0 0 3px rgba(116,81,242,0.18)" : "none",
        }}
      >
        <span className="font-body text-[12px] font-semibold text-paper-white">
          {initial}
        </span>
      </button>

      <div
        className="rf-glass absolute right-0 top-[calc(100%+0.625rem)] w-[13.25rem] origin-top-right rounded-3xl overflow-hidden z-[80] transition-all"
        style={{
          background: "rgba(255,255,255,0.14)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(-4px)",
          pointerEvents: open ? "auto" : "none",
          transitionDuration: open ? "280ms" : "160ms",
          transitionTimingFunction: open
            ? "cubic-bezier(.34,1.56,.64,1)"
            : "cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="relative z-10 px-3 py-2.5 border-b border-white/10">
          <p className="truncate font-body text-[11px] font-medium text-white/45">
            Signed in as
          </p>
          <p className="truncate font-body text-[12px] font-semibold text-paper-white">
            {email || "—"}
          </p>
        </div>

        <div className="relative z-10 p-1.5 flex flex-col">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-inputs transition-all duration-150 text-left font-body text-[12px] font-medium ${
                item.danger
                  ? "text-white/55 hover:text-[#f87171] hover:bg-[#f87171]/10"
                  : "text-white/70 hover:text-[#c3b2fa] hover:bg-[#7451f2]/12"
              }`}
              style={{
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

/* ── Login link ── */
function LoginLink({ dark = true }) {
  return (
    <Link
      to="/auth"
      className={`font-body text-[12px] transition-colors duration-200 whitespace-nowrap px-1 ${
        dark ? "text-white/55 hover:text-[#b9a4f8]" : "text-slate hover:text-[#7451f2]"
      }`}
      style={{ letterSpacing: "-0.009em" }}
    >
      Log in
    </Link>
  );
}

/* ── Glass Nav Link ── */
function GlassLink({ href, children, onClick, isActive }) {
  const isRoute = href.startsWith("/");
  const navigate = useNavigate();
  const location = useLocation();

  const inner = (
    <>
      <span
        className={`rf-navlink-glow absolute inset-0 rounded-buttons transition-all duration-200 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      <span className="relative z-10">{children}</span>
    </>
  );

  const className = `relative px-3.5 py-1.5 transition-colors duration-200 rounded-buttons group font-body text-[12px] ${
    isActive ? "text-[#c3b2fa]" : "text-white/55 hover:text-[#c3b2fa]"
  }`;
  const style = { letterSpacing: "-0.009em" };

  const handleHashClick = (e) => {
    e.preventDefault();
    const [path, hash] = href.split("#");
    const targetPath = path || "/";

    const scrollToHash = () => magicScrollToHash(hash, 90);

    if (location.pathname !== targetPath) {
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

/* ── CTA Button (mobile menu) ── */
function CtaButton({ to, children }) {
  return (
    <Link
      to={to}
      className="rf-cta-btn rf-liquid-press relative inline-flex items-center gap-2 px-4 py-2 rounded-buttons overflow-hidden"
      style={{
        background: "#7451f2",
        boxShadow: "var(--shadow-cta)",
        transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)" }}
      />
      <span className="relative z-10 font-body text-[12px] font-medium text-paper-white" style={{ letterSpacing: "-0.009em" }}>
        {children}
      </span>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="rf-cta-arrow relative z-10">
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
  const desktopNavRef = useRef(null);
  const activeHash = useActiveHash(location);

  useGlassPointer(desktopNavRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLinkActive = ({ href }) => {
    if (href === "/pricing") return location.pathname === "/pricing";
    if (location.pathname !== "/") return false;
    const hash = href.split("#")[1] || "";
    if (hash === "") return activeHash === "" && window.scrollY < 200;
    return activeHash === hash;
  };

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

  // NOTE: relies on the shared <GlassFilters /> mounted once in App.jsx
  // (id="glass-distortion-nav") — do NOT re-declare a local filter here,
  // that was the old duplicate/weaker version.
  const liquidGlassStyles = `
    .rf-glass {
      position: relative;
      isolation: isolate;
      backdrop-filter: blur(28px) url(#glass-distortion-nav) saturate(190%) brightness(1.12);
      -webkit-backdrop-filter: blur(28px) saturate(190%) brightness(1.12);
      border: 1px solid rgba(255,255,255,0.4);
    }
    .rf-glass::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(120deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.32) 55%, rgba(255,255,255,0.04) 100%);
      background-size: 220% 220%;
      animation: rf-glass-drift 9s ease-in-out infinite;
      mix-blend-mode: screen;
      opacity: 0.55;
      pointer-events: none;
      z-index: 0;
    }
    .rf-glass::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow:
        inset 0 1.5px 0 rgba(255,255,255,0.85),
        inset 0 -1px 0 rgba(116,81,242,0.14),
        inset 1.5px 0 0 rgba(255,255,255,0.25),
        inset -1.5px 0 0 rgba(116,81,242,0.1),
        0 20px 44px -18px rgba(0,0,0,0.4);
      pointer-events: none;
      z-index: 1;
    }
    @keyframes rf-glass-drift {
      0%, 100% { background-position: 0% 0%; }
      50%      { background-position: 100% 100%; }
    }
    .rf-glass-highlight {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      z-index: 0;
      opacity: 0;
      transition: opacity 0.35s ease;
      background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.5), rgba(116,81,242,0.12) 35%, transparent 60%);
    }
    .rf-glass-hover .rf-glass-highlight {
      opacity: 1;
    }
    .rf-liquid-press {
      transition: transform 0.18s cubic-bezier(.34,1.56,.64,1);
    }
    .rf-liquid-press:active {
      transform: scale(0.93);
    }
    .rf-navlink-glow {
      background: rgba(116,81,242,0.28);
      box-shadow: 0 0 0 1px rgba(116,81,242,0.4), 0 4px 20px 2px rgba(116,81,242,0.55);
    }
  `;

  /* ── Builder Navbar (full-width sticky bar — no floating radius) ── */
  if (isBuilder) {
    return (
      <>
        <style>{`
          ${liquidGlassStyles}
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
            background: #7451f2 !important;
            border-color: #7451f2;
            color: #ffffff;
            box-shadow: 0 4px 20px 2px rgba(116,81,242,0.55);
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
            0%   { box-shadow: 0 0 0 0 rgba(116,81,242,0.55); }
            100% { box-shadow: 0 0 0 8px rgba(116,81,242,0); }
          }
        `}</style>

        <nav
          className="rf-glass w-full sticky top-0 z-50"
          style={{ background: "rgba(255,255,255,0.42)" }}
        >
          <div className="relative z-10 w-full px-6 sm:px-10 h-[3.125rem] flex items-center justify-between">

            <Link to="/" className="flex items-center gap-2">
              <span className="border border-graphite-ink/50 px-2 py-0.5 rounded-full font-body text-[9px] font-semibold text-graphite-ink" style={{ letterSpacing: "0.05em" }}>
                ATS
              </span>
              <span className="font-heading text-[15px] text-graphite-ink" style={{ letterSpacing: "-0.2px" }}>
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

  /* ── Standard Navbar (Landing, Pricing, every other page) ── */
  return (
    <>
      <style>{`
        ${liquidGlassStyles}
        .rf-glassnav {
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        .rf-section-pulse {
          animation: rf-section-pulse-kf 0.9s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes rf-section-pulse-kf {
          0%   { box-shadow: 0 0 0 0 rgba(116,81,242,0); }
          25%  { box-shadow: 0 0 0 0 rgba(116,81,242,0.22); }
          100% { box-shadow: 0 0 0 60px rgba(116,81,242,0); }
        }
        .rf-avatar-btn:hover {
          transform: translateY(-1px) scale(1.05);
          background: rgba(116,81,242,0.3) !important;
          box-shadow: 0 4px 20px 2px rgba(116,81,242,0.5);
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
          0%   { box-shadow: 0 0 0 0 rgba(116,81,242,0.55); }
          100% { box-shadow: 0 0 0 8px rgba(116,81,242,0); }
        }
        .rf-cta-btn:hover {
          background: #8a6ef5 !important;
          box-shadow: 0 6px 26px 2px rgba(116,81,242,0.6) !important;
        }
        .rf-cta-btn:hover .rf-cta-arrow {
          animation: rf-cta-arrow-shift 0.45s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes rf-cta-arrow-shift {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        .rf-start-building {
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .rf-start-building:hover {
          background: #7451f2 !important;
          border-color: #7451f2 !important;
          box-shadow: 0 8px 30px 2px rgba(116,81,242,0.6);
        }
      `}</style>

      <div
        className="fixed top-0 left-0 right-0 px-2 sm:px-3 pt-2"
        style={{ zIndex: 1000, pointerEvents: "none" }}
      >
        <nav
          ref={desktopNavRef}
          className="rf-glass rf-glassnav mx-auto w-full rounded-3xl"
          style={{
            maxWidth: "90rem",
            background: scrolled
              ? "linear-gradient(rgba(20,20,26,0.38), rgba(20,20,26,0.38)), rgba(255,255,255,0.06)"
              : "linear-gradient(rgba(20,20,26,0.26), rgba(20,20,26,0.26)), rgba(255,255,255,0.06)",
            boxShadow: scrolled
              ? "0 16px 40px -10px rgba(0,0,0,0.45)"
              : "0 10px 28px -12px rgba(0,0,0,0.3)",
            pointerEvents: "auto",
          }}
        >
          <span className="rf-glass-highlight" aria-hidden="true" />

          {/* Desktop */}
          <div className="relative z-10 hidden md:grid grid-cols-[1fr_auto_1fr] items-center w-full pl-6 pr-2.5 h-[3.5rem]">

            <Link to="/" className="flex items-center gap-2">
              <span className="border border-white/25 px-2 py-0.5 rounded-full font-body text-[9px] font-semibold text-white/80" style={{ letterSpacing: "0.05em" }}>
                ATS
              </span>
              <span className="font-heading text-[16px] text-paper-white" style={{ letterSpacing: "-0.23px", lineHeight: 1 }}>
                ResumeFree
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <GlassLink key={link.label} href={link.href} isActive={isLinkActive(link)}>
                  {link.label}
                </GlassLink>
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
                className="rf-start-building rf-liquid-press group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-buttons overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  border: "1.5px solid rgba(39,39,39,0.15)",
                }}
              >
                <span className="relative flex items-center justify-center w-4 h-4">
                  <span className="absolute w-1.5 h-1.5 rounded-full bg-graphite-ink group-hover:bg-paper-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-0 group-hover:scale-0" />
                  <span className="absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-paper-white">
                      <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </span>
                <span
                  className="text-graphite-ink group-hover:text-paper-white transition-colors duration-500 font-body text-[12px] font-medium"
                  style={{ letterSpacing: "-0.009em" }}
                >
                  Start Building
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="relative z-10 md:hidden flex items-center justify-between pl-4 pr-2.5 h-[3.125rem]">
            <Link to="/" className="flex items-center gap-2">
              <span className="border border-white/25 px-2 py-0.5 rounded-full font-body text-[9px] font-semibold text-white/80" style={{ letterSpacing: "0.05em" }}>
                ATS
              </span>
              <span className="font-heading text-[14px] text-paper-white" style={{ letterSpacing: "-0.2px" }}>
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
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="rf-glass md:hidden mx-auto mt-2 overflow-hidden rounded-3xl"
            style={{
              maxWidth: "90rem",
              background: "linear-gradient(rgba(20,20,26,0.4), rgba(20,20,26,0.4)), rgba(255,255,255,0.06)",
              pointerEvents: "auto",
            }}
          >
            <div className="relative z-10 px-3.5 py-2.5 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link);
                return (
                  <a key={link.label}
                    href={link.href}
                    className={`px-3.5 py-3.5 rounded-inputs transition-all font-body text-[14px] ${
                      active
                        ? "text-[#c3b2fa] bg-[#7451f2]/16"
                        : "text-white/60 hover:text-[#c3b2fa] hover:bg-[#7451f2]/12"
                    }`}
                    style={{
                      letterSpacing: "-0.009em",
                      boxShadow: active ? "0 4px 20px 2px rgba(116,81,242,0.4)" : "none",
                    }}
                    onClick={handleMobileHashClick(link.href)}
                  >
                    {link.label}
                  </a>
                );
              })}
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-3.5 py-3.5 text-white/60 hover:text-[#c3b2fa] hover:bg-[#7451f2]/12 rounded-inputs transition-all font-body text-[14px]"
                  style={{ letterSpacing: "-0.009em" }}
                  onClick={() => setMenuOpen(false)}
                >
                  My Profile
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="px-3.5 py-3.5 text-white/60 hover:text-[#c3b2fa] hover:bg-[#7451f2]/12 rounded-inputs transition-all font-body text-[14px]"
                  style={{ letterSpacing: "-0.009em" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
              )}
            </div>
            <div className="relative z-10 px-3.5 pb-3.5 border-t border-white/10 pt-2.5">
              <CtaButton to="/builder">Start Building</CtaButton>
            </div>
          </div>
        )}
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}