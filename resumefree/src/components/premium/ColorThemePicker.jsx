// src/components/premium/ColorThemePicker.jsx
//
// Lets PREMIUM users tweak the resume's accent color. Free users see a
// locked preview with an upsell CTA. Selected color is written to
// `resume.theme.accentColor` in the Zustand resumeStore — every template
// (free + the upcoming 20+ premium ones) should read that single value as
// a CSS variable / inline style, so this stays the ONE place color logic lives.
//
// NOTE: this assumes `resumeStore.js` exposes an `updateTheme` action. If it
// doesn't yet, add this to the store (see snippet at the bottom of this file
// in comments) before wiring this component in.

import { useState } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";

const ACCENT_PRESETS = [
  { name: "Emerald", value: "#059669" },
  { name: "Navy", value: "#0a1628" },
  { name: "Slate Blue", value: "#4a6fa5" },
  { name: "Rust", value: "#b45309" },
  { name: "Plum", value: "#6d28d9" },
  { name: "Teal", value: "#0d9488" },
  { name: "Charcoal", value: "#334155" },
  { name: "Crimson", value: "#be123c" },
];

const DEFAULT_ACCENT = "#059669";

export default function ColorThemePicker() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const resume = useResumeStore((s) => s.resume);
  const updateTheme = useResumeStore((s) => s.updateTheme);

  const currentAccent = resume?.theme?.accentColor || DEFAULT_ACCENT;
  const [customColor, setCustomColor] = useState(currentAccent);

  if (!isPremium) {
    return <LockedThemePicker />;
  }

  const handleSelect = (hex) => {
    setCustomColor(hex);
    updateTheme({ accentColor: hex });
  };

  const handleCustomChange = (e) => {
    const hex = e.target.value;
    setCustomColor(hex);
    updateTheme({ accentColor: hex });
  };

  const handleReset = () => handleSelect(DEFAULT_ACCENT);

  return (
    <div className="bg-white border border-[#cbd5e1]/60 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]">
          Resume Accent Color
        </label>
        {currentAccent !== DEFAULT_ACCENT && (
          <button
            onClick={handleReset}
            className="text-[11px] font-medium text-[#4a6fa5] hover:text-[#0a1628] transition-colors duration-150"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-8 gap-3 mb-4">
        {ACCENT_PRESETS.map((preset) => {
          const isActive = currentAccent.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              onClick={() => handleSelect(preset.value)}
              title={preset.name}
              aria-label={preset.name}
              className="relative w-8 h-8 rounded-full transition-transform duration-200"
              style={{
                transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
                transform: isActive ? "scale(1.12)" : "scale(1)",
              }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: preset.value }}
              />
              {isActive && (
                <span
                  className="absolute -inset-1 rounded-full border-2"
                  style={{ borderColor: preset.value }}
                />
              )}
              {isActive && (
                <svg
                  className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-[#cbd5e1]/50">
        <div className="relative w-8 h-8 shrink-0">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomChange}
            className="absolute inset-0 w-full h-full rounded-full overflow-hidden cursor-pointer border border-[#cbd5e1] p-0"
            style={{ appearance: "none" }}
          />
        </div>
        <span className="text-sm text-[#1e3a5f]">Custom color</span>
        <span className="ml-auto text-xs font-mono text-[#4a6fa5] uppercase">
          {customColor}
        </span>
      </div>
    </div>
  );
}

function LockedThemePicker() {
  return (
    <div className="relative bg-white border border-[#cbd5e1]/60 rounded-3xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4 opacity-40 pointer-events-none select-none">
        <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5]">
          Resume Accent Color
        </label>
      </div>

      <div className="grid grid-cols-8 gap-3 mb-2 opacity-40 pointer-events-none select-none blur-[1px]">
        {ACCENT_PRESETS.map((preset) => (
          <span
            key={preset.value}
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: preset.value }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] gap-2 px-4 text-center">
        <svg
          className="w-5 h-5 text-[#4a6fa5]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m-1.5 0h12A1.5 1.5 0 0119.5 12v6a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 014.5 18v-6A1.5 1.5 0 016 10.5z"
          />
        </svg>
        <p className="text-xs text-[#1e3a5f] font-medium">
          Custom accent colors are a premium feature
        </p>
        <a
          href="/pricing"
          className="text-xs font-semibold text-[#059669] hover:underline"
        >
          Unlock with any pass →
        </a>
      </div>
    </div>
  );
}

