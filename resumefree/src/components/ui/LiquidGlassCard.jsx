// src/components/ui/LiquidGlassCard.jsx

// Style-matched to the 21st.dev LiquidGlassCard reference (blur/shadow/
// glow layer structure + values), with ONE deliberate deviation:
//
// A pure white tint (or no tint at all) is optically invisible on this
// app's light/off-white background — the reference only "reads" as glass
// because ITS backdrop (a blue sky photo) has strong color/contrast to
// bend and blur. Confirmed via screenshot: exact-copy-with-no-tint
// rendered as flat opaque white, no visible glass character at all.
//
// Fix: a subtle IRIS-VIOLET tint (brand accent, ~6-10% opacity) instead
// of white. This gives the glass a color identity on a light page,
// similar to how the reference gets its identity from the sky behind it,
// while keeping blur/distortion/shadow/glow structure identical to the
// reference.

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const blurClasses = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

// Edge Layer — inner highlight, exact reference values
const shadowStyles = {
  none: "inset 0 0 0 0 rgba(255,255,255,0)",
  xs: "inset 1px 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 1px 0 rgba(255,255,255,0.3)",
  sm: "inset 2px 2px 2px 0 rgba(255,255,255,0.35), inset -2px -2px 2px 0 rgba(255,255,255,0.35)",
  md: "inset 3px 3px 3px 0 rgba(255,255,255,0.45), inset -3px -3px 3px 0 rgba(255,255,255,0.45)",
  lg: "inset 4px 4px 4px 0 rgba(255,255,255,0.5), inset -4px -4px 4px 0 rgba(255,255,255,0.5)",
  xl: "inset 6px 6px 6px 0 rgba(255,255,255,0.55), inset -6px -6px 6px 0 rgba(255,255,255,0.55)",
  "2xl": "inset 8px 8px 8px 0 rgba(255,255,255,0.6), inset -8px -8px 8px 0 rgba(255,255,255,0.6)",
};

// Face Layer — outer glow/shadow, exact reference values
const glowStyles = {
  none: "0 4px 4px rgba(0,0,0,0.05), 0 0 12px rgba(0,0,0,0.05)",
  xs: "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 16px rgba(255,255,255,0.05)",
  sm: "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 24px rgba(255,255,255,0.1)",
  md: "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 32px rgba(255,255,255,0.15)",
  lg: "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 40px rgba(255,255,255,0.2)",
  xl: "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 48px rgba(255,255,255,0.25)",
  "2xl": "0 4px 4px rgba(0,0,0,0.15), 0 0 12px rgba(0,0,0,0.08), 0 0 60px rgba(255,255,255,0.3)",
};

// Violet-tint strength per intensity level — subtle, not paint-like.
// This is the ONLY structural addition vs. the raw reference.
const tintOpacity = {
  none: 0,
  xs: 0.05,
  sm: 0.07,
  md: 0.09,
  lg: 0.11,
  xl: 0.13,
  "2xl": 0.15,
};

export function LiquidGlassCard({
  children,
  className = "",
  blurIntensity = "xl",
  shadowIntensity = "md",
  borderRadius = "32px",
  glowIntensity = "sm",
  tintIntensity, // optional override — defaults to shadowIntensity's key
  style = {},
  ...props
}) {
  const tintKey = tintIntensity ?? shadowIntensity;

  return (
    <div
      className={cn("relative", className)}
      style={{ borderRadius, ...style }}
      {...props}
    >
      {/* Bend Layer — real optical blur (Tailwind class, backdrop-filter)
          PLUS the SVG distortion (inline `filter`). Keep these two
          properties separate — do not merge into one inline backdropFilter
          string. */}
      <div
        className={`absolute inset-0 ${blurClasses[blurIntensity]} z-0`}
        style={{
          borderRadius,
          filter: "url(#glass-distortion-modal)",
        }}
      />

      {/* Tint Layer — subtle iris-violet wash, gives the glass its color
          identity on a light background. This is the deviation from the
          raw reference (which has no tint layer at all). */}
      <div
        className="absolute inset-0 z-[5]"
        style={{
          borderRadius,
          background: `rgba(116,81,242,${tintOpacity[tintKey]})`,
        }}
      />

      {/* Face Layer — outer shadow/glow, exact reference values */}
      <div
        className="absolute inset-0 z-10"
        style={{ borderRadius, boxShadow: glowStyles[glowIntensity] }}
      />

      {/* Edge Layer — inner highlight only, exact reference values (no border) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          borderRadius,
          boxShadow: shadowStyles[shadowIntensity],
        }}
      />

      {/* Content */}
      <div className="relative z-30">{children}</div>
    </div>
  );
}

export default LiquidGlassCard;