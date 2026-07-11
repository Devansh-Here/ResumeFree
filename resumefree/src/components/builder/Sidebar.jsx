import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Target,
  MagnifyingGlass,
  Palette,
  EnvelopeSimple,
  Sparkle,
  LockSimple,
  SquaresFour,
  SignOut,
  SignIn,
} from "@phosphor-icons/react";
import { useAuthStore } from "../../store/authStore";
import SlideOverPanel from "../ui/SlideOverPanel";
import JDMatcherContent from "../premium/JDMatcherContent";
import ATSContent from "../ATSContent";
import TemplateSwitcherContent from "./TemplateSwitcherContent";
import UpgradeModal from "../premium/UpgradeModal";

// Matches the sidebar's actual collapsed rendered width: w-[4.5rem] × 14px
// root font-size (global.css's 87.5% scale) = 63px. If the density scale
// (global.css html{font-size}) or the sidebar's w-[...] class ever changes,
// this number must be recalculated to match — it's raw px math, not
// automatically synced.
const SIDEBAR_COLLAPSED = 63;

const NAV_ITEMS = [
  { id: "jd", icon: Target, label: "JD Match" },
  { id: "ats", icon: MagnifyingGlass, label: "ATS Check" },
  { id: "templates", icon: Palette, label: "Templates" },
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

  const displayName = user ? (profile?.full_name || profile?.name || user?.email?.split("@")[0] || "User") : "Guest";
  const initial = user ? displayName.charAt(0).toUpperCase() : "?";

  function handleItemClick(item) {
    if (item.isRoute) {
      navigate(item.to);
      return;
    }
    if (item.id === "jd" && !hasJDMatcherAccess) {
      setUpgradeOpen(true);
      return;
    }
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
        .rf-nav-icon-wrap {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease;
        }
        button:hover .rf-nav-icon-wrap {
          transform: scale(1.14);
        }
      `}</style>

      <div
        className="group relative h-full flex flex-col bg-[#0a1628] shrink-0 overflow-hidden
                   rounded-3xl border border-white/5
                   shadow-[0_4px_16px_-4px_rgba(10,22,40,0.25),0_1px_3px_rgba(10,22,40,0.15)]
                   transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                   w-[4.5rem] hover:w-[13.5rem] z-20"
        onMouseLeave={() => setProfileMenuOpen(false)}
      >
        {/* Nav items */}
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
                className={`group/navitem relative flex items-center h-10 rounded-2xl transition-all duration-150 whitespace-nowrap overflow-hidden ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[0.1875rem] rounded-full bg-[#059669] origin-center"
                    style={{ animation: "rf-active-bar-in 0.2s ease-out" }}
                  />
                )}

                {/* Icon column — matches the button's actual collapsed
                    width so the icon is truly centered in the visible pill. */}
                <span className="w-11 shrink-0 flex items-center justify-center relative">
                  <span
                    className={`rf-nav-icon-wrap flex items-center justify-center ${
                      active ? "text-[#059669]" : "text-white/55 group-hover/navitem:text-[#059669]"
                    }`}
                  >
                    <Icon size={18} weight="duotone" />
                  </span>
                  {locked && (
                    <span className="absolute top-0.5 right-2.5 w-3 h-3 rounded-full bg-[#0a1628] flex items-center justify-center">
                      <LockSimple size={8} weight="bold" color="#f59e0b" />
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={`text-[0.75rem] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 ${
                    active ? "text-white" : "text-white/90"
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Premium upsell — rotating purple/blue gradient ring around the border,
          continuous, to make it read as the one "premium" surface in the sidebar */}
        {!isPremium && (
          <div className="px-2.5 mb-2.5">
            <div className="relative rounded-2xl p-[0.09375rem] overflow-hidden">
              {/* Oversized rotating conic-gradient layer — only the ~1.5px edge peeks out
                  as a border since the button sits on top with its own solid background */}
              <div
                className="absolute inset-[-150%] animate-[spin_4s_linear_infinite]"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, #818cf8 15%, #a78bfa 30%, #60a5fa 45%, transparent 60%, transparent 100%)",
                }}
              />
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="relative z-10 flex items-center h-10 w-11 group-hover:w-full rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
                style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)" }}
              >
                <span className="w-11 shrink-0 flex items-center justify-center">
                  <span className="rf-nav-icon-wrap flex items-center justify-center text-[#fde68a]">
                    <Sparkle size={17} weight="duotone" />
                  </span>
                </span>
                <span
                  className="text-[0.6875rem] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 whitespace-nowrap"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Upgrade to Premium
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="border-t border-white/10 px-2.5 py-2.5 relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((p) => !p)}
            className="w-full flex items-center h-10 rounded-2xl hover:bg-white/5 transition-all duration-150"
          >
            <span className="w-11 shrink-0 flex items-center justify-center">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.6875rem] font-bold text-white"
                style={{ background: user ? "#059669" : "#4a6fa5", fontFamily: "'Inter', sans-serif" }}
              >
                {initial}
              </span>
            </span>
            <span
              className="text-[0.75rem] font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 truncate"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {displayName}
            </span>
          </button>

          {profileMenuOpen && (
            <div
              className="absolute bottom-[calc(100%+0.5rem)] left-2.5 w-40 bg-white rounded-2xl overflow-hidden py-1.5"
              style={{
                border: "1px solid #e2e8f0",
                boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.14) 0px 12px 24px -6px",
                animation: "rf-sidebar-item-in 0.15s ease-out",
              }}
            >
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-[#1e3a5f] hover:bg-[#f8fafc] hover:text-[#0a1628] transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <SquaresFour size={14} weight="duotone" color="#4a6fa5" />
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-[#dc2626] hover:bg-red-50 transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <SignOut size={14} weight="duotone" color="#dc2626" />
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="w-full flex items-center gap-2.5 text-left px-3.5 py-2 text-[0.75rem] text-[#1e3a5f] hover:bg-[#f8fafc] hover:text-[#0a1628] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <SignIn size={14} weight="duotone" color="#4a6fa5" />
                  Log in
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide-in panels */}
      <SlideOverPanel open={activePanel === "jd"} onClose={() => setActivePanel(null)} sidebarWidth={SIDEBAR_COLLAPSED}>
        <JDMatcherContent onClose={() => setActivePanel(null)} />
      </SlideOverPanel>

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

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </>
  );
}