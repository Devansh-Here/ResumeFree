import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  MagnifyingGlass,
  Palette,
  Swatches,
  EnvelopeSimple,
  Sparkle,
  LockSimple,
  SquaresFour,
  SignOut,
  SignIn,
} from "@phosphor-icons/react";
import { useAuthStore } from "../../store/authStore";
import JDMatcherContent from "../premium/JDMatcherContent";
import ATSContent from "../ATSContent";
import TemplateSwitcherContent from "./TemplateSwitcherContent";
import CustomizationContent from "../premium/CustomizationContent";
import UpgradeModal from "../premium/UpgradeModal";

const NAV_ITEMS = [
  { id: "jd", icon: Target, label: "JD Match" },
  { id: "ats", icon: MagnifyingGlass, label: "ATS Check" },
  { id: "templates", icon: Palette, label: "Templates" },
  { id: "customize", icon: Swatches, label: "Customize" },
  { id: "cover-letter", icon: EnvelopeSimple, label: "Cover Letter", isRoute: true, to: "/cover-letter" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium());
  const hasJDMatcherAccess = useAuthStore((s) => s.hasJDMatcherAccess());
  const signOut = useAuthStore((s) => s.signOut);

  const [activePanel, setActivePanel] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName = user ? (profile?.full_name || profile?.name || user?.email?.split("@")[0] || "User") : "Guest";
  const initial = user ? displayName.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    if (!profileMenuOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") setProfileMenuOpen(false);
    }
    function handlePointerDown(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [profileMenuOpen]);

  function handleItemClick(item) {
    if (item.isRoute) {
      navigate(item.to);
      return;
    }
    if (item.id === "jd" && !hasJDMatcherAccess) {
      setUpgradeOpen(true);
      return;
    }
    // "customize" intentionally NOT gated here — it always opens, same as
    // "ats" and "templates". CustomizationPanel itself renders the locked
    // preview + upsell internally for free users (consistent with how
    // ATSContent gates its "Advanced Tips" section internally rather than
    // blocking the whole panel).
    setActivePanel(item.id);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <>
      <style>{`
        @keyframes rf-sidebar-item-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rf-active-bar-in {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes rf-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .rf-nav-icon-wrap {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
        }
        button:hover .rf-nav-icon-wrap {
          transform: scale(1.14);
        }
        .rf-sidebar-shell {
          transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .rf-premium-ring-spin {
          animation: rf-spin 4s linear infinite;
        }
        .rf-dropdown-in {
          animation: rf-sidebar-item-in 0.15s ease-out;
        }
        .rf-active-bar {
          animation: rf-active-bar-in 0.2s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .rf-nav-icon-wrap,
          .rf-sidebar-shell {
            transition: none !important;
          }
          .rf-premium-ring-spin {
            animation: none !important;
          }
          .rf-dropdown-in,
          .rf-active-bar {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="rf-sidebar-shell group relative h-full flex flex-col bg-soft-snow shrink-0 overflow-hidden
                   rounded-cards border border-mist
                   w-[4.5rem] hover:w-[13.5rem] z-20"
        onMouseLeave={() => setProfileMenuOpen(false)}
      >
        <div className="flex-1 flex flex-col gap-1.5 pt-5 px-2.5">
          {NAV_ITEMS.map((item) => {
            const active = activePanel === item.id;
            const locked = item.id === "jd" && !hasJDMatcherAccess;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                aria-pressed={active}
                className={`group/navitem relative flex items-center h-10 rounded-buttons transition-all duration-150 whitespace-nowrap overflow-hidden
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-soft-snow ${
                  active ? "bg-white" : "hover:bg-white/70"
                }`}
                style={active ? { boxShadow: "inset 0 0 0 1px #e0e0e0" } : undefined}
              >
                {active && (
                  <span
                    className="rf-active-bar absolute left-0 top-2 bottom-2 w-[0.1875rem] rounded-full bg-iris-violet origin-center"
                  />
                )}

                <span className="w-11 shrink-0 flex items-center justify-center relative">
                  <span
                    className={`rf-nav-icon-wrap flex items-center justify-center ${
                      active ? "text-iris-violet" : "text-ash group-hover/navitem:text-iris-violet"
                    }`}
                  >
                    <Icon size={18} weight="duotone" />
                  </span>
                  {locked && (
                    <span className="absolute top-0.5 right-2.5 w-3 h-3 rounded-full bg-soft-snow flex items-center justify-center">
                      <LockSimple size={8} weight="bold" color="#b45309" />
                    </span>
                  )}
                </span>

                <span
                  className={`font-body text-[0.75rem] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 ${
                    active ? "text-graphite-ink" : "text-slate"
                  }`}
                >
                  {item.label}
                  {locked && <span className="sr-only"> (Premium feature — locked)</span>}
                </span>
              </button>
            );
          })}
        </div>

        {!isPremium && (
          <div className="px-2.5 mb-2.5">
            <div className="relative rounded-buttons p-[0.09375rem] overflow-hidden">
              <div
                className="rf-premium-ring-spin absolute inset-[-150%]"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #a78bfa 15%, #7451f2 30%, #5952a1 45%, transparent 60%, transparent 100%)",
                }}
              />
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="relative z-10 flex items-center h-10 w-11 group-hover:w-full rounded-buttons transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden
                           bg-iris-violet hover:bg-deep-iris
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-soft-snow"
              >
                <span className="w-11 shrink-0 flex items-center justify-center">
                  <span className="rf-nav-icon-wrap flex items-center justify-center text-[#fde68a]">
                    <Sparkle size={17} weight="duotone" />
                  </span>
                </span>
                <span
                  className="font-body text-[0.6875rem] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap"
                >
                  Upgrade to Premium
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-mist px-2.5 py-2.5 relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((p) => !p)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            className="w-full flex items-center h-10 rounded-buttons hover:bg-white/70 transition-all duration-150
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-soft-snow"
          >
            <span className="w-11 shrink-0 flex items-center justify-center">
              <span
                className="font-body w-6 h-6 rounded-full flex items-center justify-center text-[0.6875rem] font-bold text-white"
                style={{ background: user ? "#7451f2" : "#a69ea7" }}
              >
                {initial}
              </span>
            </span>
            <span className="font-body text-[0.75rem] font-medium text-graphite-ink opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 truncate">
              {displayName}
            </span>
          </button>

          {profileMenuOpen && (
            <div
              role="menu"
              className="rf-dropdown-in absolute z-30 bottom-[calc(100%+0.5rem)] left-2.5 w-40 bg-paper-white rounded-cards overflow-hidden py-1.5 border border-mist"
            >
              {user ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setProfileMenuOpen(false); navigate("/dashboard"); }}
                    className="font-body w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-slate hover:bg-soft-snow hover:text-graphite-ink transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-inset"
                  >
                    <SquaresFour size={14} weight="duotone" color="#4f4f4f" />
                    Dashboard
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setProfileMenuOpen(false); handleSignOut(); }}
                    className="font-body w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-[#dc2626] hover:bg-[#fef2f2] transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-inset"
                  >
                    <SignOut size={14} weight="duotone" color="#dc2626" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setProfileMenuOpen(false); navigate("/auth"); }}
                  className="font-body w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-slate hover:bg-soft-snow hover:text-graphite-ink transition-colors
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-inset"
                >
                  <SignIn size={14} weight="duotone" color="#4f4f4f" />
                  Log in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* JD Matcher now renders its own centered wide modal directly — no
          SlideOverPanel wrapping, matching how ATSContent and
          TemplateSwitcherContent already render as siblings here. */}
      <JDMatcherContent
        open={activePanel === "jd"}
        onClose={() => setActivePanel(null)}
      />

      <ATSContent
        open={activePanel === "ats"}
        onClose={() => setActivePanel(null)}
        onSwitchTemplate={() => setActivePanel("templates")}
      />

      <TemplateSwitcherContent
        open={activePanel === "templates"}
        onClose={() => setActivePanel(null)}
        onRequestUpgrade={() => { setActivePanel(null); setUpgradeOpen(true); }}
      />

      <CustomizationContent
        open={activePanel === "customize"}
        onClose={() => setActivePanel(null)}
      />

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}