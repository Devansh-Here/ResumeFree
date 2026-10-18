// src/components/premium/CustomizationPanel.jsx
//
// PREMIUM-only resume customization: link/background/text/heading colors,
// heading + body fonts, heading casing, spacing density, and section
// divider style — each independently settable. Free users see a locked
// preview with an upsell CTA.
//
// Data model — written to `resume.theme` in the Zustand resumeStore. See
// resumeStore.js's DEFAULT_RESUME.theme block for the authoritative shape
// + comments on which fields are nullable vs. concrete.
//
// NOTE: this component only WRITES theme values. Making templates actually
// READ and apply all of these (via getFontStack() for fonts, direct hex
// for colors, and CSS logic for density/dividerStyle/headingStyle) is
// separate propagation work — same pattern as the existing accentColor
// rollout (Corporate Elite is the reference implementation, still pending
// on the other templates + entirely pending for every NEW field added
// this session).

import { useState, useEffect } from "react";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import { FONT_OPTIONS, FONT_GROUPS } from "../../utils/fontOptions";

const LINK_COLOR_PRESETS = [
  { name: "Violet", value: "#7451f2" },
  { name: "Navy", value: "#1f2937" },
  { name: "Slate Blue", value: "#4a6fa5" },
  { name: "Rust", value: "#b45309" },
  { name: "Plum", value: "#6d28d9" },
  { name: "Teal", value: "#0d9488" },
  { name: "Charcoal", value: "#334155" },
  { name: "Crimson", value: "#be123c" },
  { name: "Forest", value: "#15803d" },
  { name: "Ocean", value: "#0369a1" },
  { name: "Amber", value: "#d97706" },
  { name: "Coral", value: "#ea580c" },
  { name: "Indigo", value: "#4338ca" },
  { name: "Maroon", value: "#9f1239" },
  { name: "Steel", value: "#475569" },
  { name: "Bronze", value: "#92400e" },
];

const BACKGROUND_PRESETS = [
  { name: "White", value: "#ffffff" },
  { name: "Paper", value: "#fefdfb" },
  { name: "Soft Snow", value: "#f6f6f6" },
  { name: "Ivory", value: "#fdfbf3" },
  { name: "Pale Blue", value: "#f0f4fa" },
  { name: "Pale Green", value: "#f1f8f4" },
  { name: "Pale Pink", value: "#fdf2f4" },
  { name: "Pale Gray", value: "#f5f5f5" },
];

const TEXT_COLOR_PRESETS = [
  { name: "Graphite", value: "#272727" },
  { name: "Charcoal", value: "#1f2937" },
  { name: "Slate", value: "#334155" },
  { name: "Warm Black", value: "#1c1917" },
  { name: "Navy Ink", value: "#0f172a" },
  { name: "Deep Brown", value: "#292524" },
  { name: "Cool Gray", value: "#3f3f46" },
  { name: "Pure Black", value: "#000000" },
];

// Heading color shares the same palette as text color (same "readable
// dark neutrals" logic applies) — kept as one source array so both
// controls stay visually/semantically consistent.
const HEADING_COLOR_PRESETS = TEXT_COLOR_PRESETS;

const HEADING_STYLE_OPTIONS = [
  { key: "normal", label: "Normal" },
  { key: "uppercase", label: "Uppercase" },
];

const DENSITY_OPTIONS = [
  { key: "compact", label: "Compact" },
  { key: "balanced", label: "Balanced" },
  { key: "spacious", label: "Spacious" },
];

const DIVIDER_OPTIONS = [
  { key: "line", label: "Line" },
  { key: "dots", label: "Dots" },
  { key: "none", label: "None" },
];

// Relative-luminance check so we can nudge users if a background pick is
// dark enough to hurt print contrast / ATS-parsed readability.
function isLightEnough(hex) {
  if (!hex) return true;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance >= 0.75;
}

export default function CustomizationPanel() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const resume = useResumeStore((s) => s.resume);
  const updateTheme = useResumeStore((s) => s.updateTheme);
  const resetThemeField = useResumeStore((s) => s.resetThemeField);

  const [activeTab, setActiveTab] = useState("colors"); // 'colors' | 'typography' | 'layout'

  if (!isPremium) {
    return <LockedCustomizationPanel />;
  }

  const theme = resume?.theme || {};
  const setField = (field, value) => updateTheme({ [field]: value });

  return (
    <div className="bg-paper-white border border-mist rounded-cards p-5">
      {/* Tab switcher */}
      <div className="flex items-center gap-6 mb-5 border-b border-mist">
        {[
          { id: "colors", label: "Colors" },
          { id: "typography", label: "Typography" },
          { id: "layout", label: "Layout" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-mono text-[11px] uppercase tracking-widest transition-colors duration-150 border-b-2 -mb-px ${
                isActive
                  ? "text-iris-violet border-iris-violet"
                  : "text-fog border-transparent hover:text-ash"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "colors" && (
        <div className="space-y-6">
          <ColorField
            label="Link Color"
            presets={LINK_COLOR_PRESETS}
            value={theme.linkColor}
            placeholder={theme.accentColor}
            onChange={(v) => setField("linkColor", v)}
            onReset={() => resetThemeField("linkColor")}
          />
          <ColorField
            label="Background Color"
            presets={BACKGROUND_PRESETS}
            value={theme.backgroundColor}
            placeholder="#ffffff"
            onChange={(v) => setField("backgroundColor", v)}
            onReset={() => resetThemeField("backgroundColor")}
          />
          {theme.backgroundColor && !isLightEnough(theme.backgroundColor) && (
            <div className="bg-warning-bg border border-warning-border rounded-cards px-3 py-2">
              <p className="text-xs text-warning-text font-medium">
                This background may reduce print contrast and ATS readability. Light backgrounds are recommended.
              </p>
            </div>
          )}
          <ColorField
            label="Text Color"
            presets={TEXT_COLOR_PRESETS}
            value={theme.textColor}
            placeholder={theme.textColor}
            onChange={(v) => setField("textColor", v)}
            onReset={() => resetThemeField("textColor")}
          />
          <ColorField
            label="Heading Color"
            presets={HEADING_COLOR_PRESETS}
            value={theme.headingColor}
            placeholder={theme.textColor}
            onChange={(v) => setField("headingColor", v)}
            onReset={() => resetThemeField("headingColor")}
          />
        </div>
      )}

      {activeTab === "typography" && (
        <div className="space-y-6">
          <FontField
            label="Heading Font"
            value={theme.fontFamily}
            onChange={(key) => setField("fontFamily", key)}
            onReset={() => resetThemeField("fontFamily")}
          />
          <FontField
            label="Body Font"
            value={theme.bodyFontFamily}
            onChange={(key) => setField("bodyFontFamily", key)}
            onReset={() => resetThemeField("bodyFontFamily")}
          />
          <SegmentedControl
            label="Heading Style"
            options={HEADING_STYLE_OPTIONS}
            value={theme.headingStyle}
            onChange={(key) => setField("headingStyle", key)}
          />
        </div>
      )}

      {activeTab === "layout" && (
        <div className="space-y-6">
          <SegmentedControl
            label="Density"
            options={DENSITY_OPTIONS}
            value={theme.density}
            onChange={(key) => setField("density", key)}
          />
          <SegmentedControl
            label="Section Divider"
            options={DIVIDER_OPTIONS}
            value={theme.dividerStyle}
            onChange={(key) => setField("dividerStyle", key)}
          />
        </div>
      )}
    </div>
  );
}

function FontField({ label, value, onChange, onReset }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="font-mono text-[11px] uppercase tracking-widest text-ash">
          {label}
        </label>
        <button
          onClick={onReset}
          className="text-[11px] font-body font-medium text-ash hover:text-graphite-ink transition-colors duration-150"
        >
          Reset
        </button>
      </div>

      {FONT_GROUPS.map((groupName) => (
        <div key={groupName} className="mb-3 last:mb-0">
          <p className="text-[11px] font-body text-fog mb-2">{groupName}</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FONT_OPTIONS)
              .filter(([, font]) => font.group === groupName)
              .map(([key, font]) => {
                const isActive = value === key;
                return (
                  <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`text-left px-3 py-2.5 rounded-buttons border transition-colors duration-150 ${
                      isActive
                        ? "border-iris-violet bg-iris-violet/5"
                        : "border-mist hover:border-deep-iris/50"
                    }`}
                    style={{ fontFamily: font.stack }}
                  >
                    <span className="text-sm text-graphite-ink">{font.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-widest text-ash block mb-2.5">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`flex-1 text-center px-3 py-2 rounded-buttons border text-sm font-body transition-colors duration-150 ${
                isActive
                  ? "border-iris-violet bg-iris-violet/5 text-graphite-ink"
                  : "border-mist text-slate hover:border-deep-iris/50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorField({ label, presets, value, placeholder, onChange, onReset }) {
  const [customValue, setCustomValue] = useState(value || presets[0].value);

  // Keep the native color-input swatch in sync when `value` changes from
  // OUTSIDE this input (Reset button, or a preset click) — without this,
  // <input type="color"> silently shows a stale color after Reset.
  useEffect(() => {
    setCustomValue(value || presets[0].value);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="font-mono text-[11px] uppercase tracking-widest text-ash">
          {label}
        </label>
        {value && (
          <button
            onClick={onReset}
            className="text-[11px] font-body font-medium text-ash hover:text-graphite-ink transition-colors duration-150"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-2.5">
        {presets.map((preset) => {
          const isActive = value?.toLowerCase() === preset.value.toLowerCase();
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              title={preset.name}
              aria-label={preset.name}
              className={`relative w-8 h-8 rounded-buttons border transition-transform duration-200 ${
                isActive ? "border-graphite-ink" : "border-mist"
              }`}
              style={{
                backgroundColor: preset.value,
                transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
                transform: isActive ? "scale(1.1)" : "scale(1)",
              }}
            >
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

      <div className="flex items-center gap-2.5 pt-2.5 border-t border-mist">
        <input
          type="color"
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          className="w-7 h-7 rounded-buttons overflow-hidden cursor-pointer border border-mist p-0"
        />
        <span className="text-sm text-slate font-body">Custom</span>
        <span className="ml-auto text-xs font-mono text-fog uppercase">
          {value || (placeholder ? `Inherits ${placeholder}` : "Template default")}
        </span>
      </div>
    </div>
  );
}

function LockedCustomizationPanel() {
  return (
    <div className="relative bg-paper-white border border-mist rounded-cards p-5 overflow-hidden">
      <div className="opacity-40 pointer-events-none select-none blur-[1px] space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ash">
          Colors
        </p>
        <div className="flex gap-2 flex-wrap">
          {LINK_COLOR_PRESETS.slice(0, 8).map((preset) => (
            <span
              key={preset.value}
              className="w-8 h-8 rounded-buttons"
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ash pt-2">
          Typography
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 rounded-buttons border border-mist" />
          <div className="h-9 rounded-buttons border border-mist" />
        </div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ash pt-2">
          Layout
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-8 rounded-buttons border border-mist" />
          <div className="h-8 rounded-buttons border border-mist" />
          <div className="h-8 rounded-buttons border border-mist" />
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper-white/80 backdrop-blur-[2px] gap-2 px-4 text-center">
        <svg
          className="w-5 h-5 text-deep-iris"
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
        <p className="text-xs text-graphite-ink font-body font-medium">
          Full resume customization — colors, fonts, and layout — is a premium feature
        </p>
        
          <a href="/pricing"
          className="text-xs font-body font-semibold text-iris-violet hover:underline"
        >
          Unlock with any pass →
        </a>
      </div>
    </div>
  );
}