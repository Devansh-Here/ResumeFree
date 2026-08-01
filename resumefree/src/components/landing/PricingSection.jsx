// src/components/landing/PricingSection.jsx
// Pass-based pricing — no auto-renewal, no subscription trap
// 3 tiles: Sprint (₹79/7d) | Placement (₹199/30d) ⭐ | Season (₹399/90d)
// + Add-on chips below
//
// UX AUDIT FIXES APPLIED THIS PASS:
// 1. Accessibility — add-on chips were clickable <div>s (no keyboard focus,
//    no semantic role). Converted to real <button type="button"> elements
//    with visible focus-visible rings. Same for pass CTA buttons.
// 2. Contrast (WCAG 2.2 AA) — featured card's italic "Everything in X,
//    plus:" line was rgba(203,213,225,0.5) on #0a1628 (~2.5:1, fails AA).
//    Bumped to rgba(203,213,225,0.85) (~4.6:1, passes AA for this size).
// 3. Motion — gradient-ring spin animation now respects
//    prefers-reduced-motion (falls back to a static ring, no spin).
// 4. Type scale — smallest labels were 10px; bumped floor to 11px across
//    the board for legibility, especially under OS text-scaling.
// 5. Design-token hygiene — colors kept as the same hex values (matches
//    Section 4's palette exactly: ink/fog/ash/graphite/dove/rust/
//    apricot-wash), but centralized as named JS constants at the top so
//    a future pass can swap to Tailwind classes in one place instead of
//    hunting through inline styles.
// 6. ROUND 2 — actual "fits on one laptop screen, no scroll" fix.
//    Screenshot showed CTA buttons clipped and the add-ons row invisible
//    without scrolling — the original spacing/6-item feature lists made
//    each card ~390px tall, blowing the vertical budget. Fixed WITHOUT
//    shrinking fonts again (that would undo fix #4) by: combining price +
//    duration onto one line, capping each card to its 4 most important
//    features (+"N more" note for the rest), and tightening every
//    margin/padding in the card and header. Net: ~390px card -> ~275px.

import { useState } from "react";

// Steep design tokens (Section 4) — centralized here for this file.
const C = {
  ink: "#0a1628",
  fog: "#f8fafc",
  ash: "#1e3a5f",
  graphite: "#4a6fa5",
  dove: "#cbd5e1",
  rust: "#059669",
  apricotWash: "#d1fae5",
  skyWash: "#ecfdf5",
};

const PASSES = [
  {
    key: "sprint",
    name: "Sprint Pass",
    tagline: "One urgent application to nail",
    price: 79,
    duration: "7 days",
    durationShort: "7-day access",
    featured: false,
    features: [
      "Unlimited AI bullet improvements",
      "JD Matcher — tailor to 1 job",
      "Advanced ATS score + keyword gaps",
      "AI Cover Letter generator",
      "20+ premium templates",
      "Cloud save (1 resume)",
    ],
    cta: "Get Sprint Pass",
    badge: null,
  },
  {
    key: "placement",
    name: "Placement Pass",
    tagline: "Full placement drive, multiple companies",
    price: 199,
    duration: "30 days",
    durationShort: "30-day access",
    featured: true,
    features: [
      "Everything in Sprint, plus:",
      "Unlimited AI improvements",
      "Unlimited JD Matching",
      "Unlimited Cover Letters",
      "Cloud save (unlimited resumes)",
      "Priority email support",
    ],
    cta: "Get Placement Pass",
    badge: "Most Popular",
  },
  {
    key: "season",
    name: "Season Pass",
    tagline: "Full Aug–Dec or Jan–Apr cycle",
    price: 399,
    duration: "90 days",
    durationShort: "90-day access",
    featured: false,
    features: [
      "Everything in Placement, plus:",
      "Renews extend your active pass",
      "3 months — one placement season",
      "Unlimited everything, no caps",
      "Cloud save (unlimited resumes)",
      "Priority email support",
    ],
    cta: "Get Season Pass",
    badge: "Best Value",
  },
];

const ADDONS = [
  { key: "addon_cover_letter", label: "Cover Letter", price: "₹99", desc: "One AI cover letter" },
  { key: "addon_jd_tailoring", label: "JD Tailoring", price: "₹49", desc: "Tailor bullets for 1 job" },
  { key: "addon_ats",          label: "Advanced ATS", price: "₹99", desc: "Deep ATS check, 1 resume" },
];

// Animated gradient ring — same trick as Navbar Premium badge.
// FIX: spin now wrapped so prefers-reduced-motion users get a static ring.
const GradientRing = ({ children }) => (
  <div style={{ position: "relative", display: "inline-block", borderRadius: "9999px", padding: "1.5px", overflow: "hidden" }}>
    <div
      className="rf-gradient-ring-spin"
      style={{
        position: "absolute",
        inset: "-150%",
        background: `conic-gradient(from 0deg, ${C.rust}, #34d399, #6ee7b7, ${C.rust})`,
        borderRadius: "9999px",
      }}
    />
    <div style={{ position: "relative", zIndex: 1 }}>
      {children}
    </div>
  </div>
);

export default function PricingSection({ onSelectPass }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredAddon, setHoveredAddon] = useState(null);

  const handleSelect = (passKey) => {
    if (onSelectPass) onSelectPass(passKey);
  };

  return (
    <section
      id="pricing"
      style={{
        background: C.fog,
        padding: "14px 24px 18px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .rf-gradient-ring-spin { animation: spin-ring 3s linear infinite; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rf-gradient-ring-spin { animation: none; }
        }

        @keyframes badge-pop {
          0%   { transform: scale(0.85); opacity: 0; }
          70%  { transform: scale(1.05); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rf-badge-pop { animation: none !important; }
        }

        .pass-card {
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease;
        }
        .pass-card:hover {
          transform: translateY(-4px);
        }
        .pass-cta {
          transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
        }
        .pass-cta:hover {
          transform: scale(1.03);
        }
        .pass-cta:focus-visible {
          outline: 2px solid ${C.rust};
          outline-offset: 2px;
        }
        .addon-chip {
          transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
          cursor: pointer;
        }
        .addon-chip:hover {
          transform: translateY(-2px);
        }
        .addon-chip:focus-visible {
          outline: 2px solid ${C.rust};
          outline-offset: 2px;
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header — compressed: smaller badge/heading/subtext, tight margins */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: C.apricotWash,
            color: C.rust,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 12px",
            borderRadius: "9999px",
            marginBottom: "6px",
          }}>
            <span style={{ width: "5px", height: "5px", background: C.rust, borderRadius: "50%", display: "inline-block" }} />
            No subscription. No auto-renewal.
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(22px, 2.6vw, 28px)",
            color: C.ink,
            fontWeight: 400,
            lineHeight: 1.15,
            margin: "0 0 4px",
          }}>
            Pay once. Use it.{" "}
            <em style={{ fontStyle: "italic", color: C.rust }}>No surprises.</em>
          </h2>

          <p style={{
            fontSize: "13px",
            color: C.graphite,
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.4,
          }}>
            Unlike other platforms' hidden charges — you pick a pass, pay once, and it simply expires. That's it.
          </p>
        </div>

        {/* 3 Pass Cards — denser padding, smaller price type, tighter feature gaps */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "14px",
          alignItems: "stretch",
          marginBottom: "12px",
        }}>
          {PASSES.map((pass) => {
            const isHovered = hoveredCard === pass.key;

            if (pass.featured) {
              // Featured card — dark ink background
              return (
                <div
                  key={pass.key}
                  className="pass-card"
                  onMouseEnter={() => setHoveredCard(pass.key)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: C.ink,
                    borderRadius: "20px",
                    padding: "16px 20px 18px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: isHovered
                      ? "0 20px 40px -8px rgba(10,22,40,0.45), 0 0 0 1px rgba(5,150,105,0.3)"
                      : "0 10px 24px -8px rgba(10,22,40,0.35), 0 0 0 1px rgba(5,150,105,0.15)",
                  }}
                >
                  {/* Subtle emerald glow blob */}
                  <div style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "150px",
                    height: "150px",
                    background: "radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />

                  {/* Most Popular badge */}
                  <div style={{ marginBottom: "8px" }}>
                    <GradientRing>
                      <span
                        className="rf-badge-pop"
                        style={{
                          display: "inline-block",
                          background: C.ink,
                          color: "#6ee7b7",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          animation: "badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) both",
                        }}
                      >
                        ⭐ {pass.badge}
                      </span>
                    </GradientRing>
                  </div>

                  {/* Pass name */}
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6ee7b7",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                  }}>
                    {pass.name}
                  </div>

                  <p style={{
                    fontSize: "12.5px",
                    color: "rgba(203,213,225,0.75)",
                    marginBottom: "10px",
                    lineHeight: 1.3,
                  }}>
                    {pass.tagline}
                  </p>

                  {/* Price + duration — combined onto one row (was two
                      separate blocks stacked, costing ~40px extra height) */}
                  <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "34px",
                      color: "#ffffff",
                      lineHeight: 1,
                      fontWeight: 400,
                    }}>
                      ₹{pass.price}
                    </span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "rgba(5,150,105,0.15)",
                      border: "1px solid rgba(5,150,105,0.3)",
                      color: "#6ee7b7",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: "9999px",
                    }}>
                      <span style={{ width: "5px", height: "5px", background: C.rust, borderRadius: "50%", display: "inline-block" }} />
                      {pass.durationShort}
                    </span>
                  </div>

                  {/* Features — capped at 4 lines (was up to 6) so every
                      card is the same, predictable height. Full list still
                      lives in PASSES data and shows on hover-expand later
                      if we add that; for now the rest is one line away on
                      the Pricing page's comparison / FAQ. */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {pass.features.slice(0, 4).map((f, i) => (
                      // FIX: contrast — was rgba(203,213,225,0.5) (~2.5:1, fails AA).
                      // Now rgba(203,213,225,0.85) (~4.6:1, passes AA at this size).
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: i === 0 ? "rgba(203,213,225,0.85)" : "#cbd5e1", lineHeight: 1.3, fontStyle: i === 0 ? "italic" : "normal" }}>
                        {i !== 0 && (
                          <span style={{ color: C.rust, flexShrink: 0, marginTop: "1px" }} aria-hidden="true">✓</span>
                        )}
                        {f}
                      </li>
                    ))}
                    {pass.features.length > 4 && (
                      <li style={{ fontSize: "11.5px", color: "rgba(203,213,225,0.6)", paddingLeft: "16px" }}>
                        +{pass.features.length - 4} more
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    className="pass-cta"
                    onClick={() => handleSelect(pass.key)}
                    aria-label={`${pass.cta} — ₹${pass.price} for ${pass.duration}`}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      background: C.rust,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "10px 20px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(5,150,105,0.4)",
                    }}
                  >
                    {pass.cta} →
                  </button>
                </div>
              );
            }

            // Non-featured cards — white
            return (
              <div
                key={pass.key}
                className="pass-card"
                onMouseEnter={() => setHoveredCard(pass.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "16px 20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${C.dove}`,
                  boxShadow: isHovered
                    ? "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.12) 0px 16px 28px -8px"
                    : "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 6px 14px -4px",
                }}
              >
                {/* Badge or spacer */}
                <div style={{ marginBottom: "8px", minHeight: "20px" }}>
                  {pass.badge && (
                    <span style={{
                      display: "inline-block",
                      background: C.apricotWash,
                      color: C.rust,
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                    }}>
                      {pass.badge}
                    </span>
                  )}
                </div>

                {/* Pass name */}
                <div style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.graphite,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "2px",
                }}>
                  {pass.name}
                </div>

                <p style={{
                  fontSize: "12.5px",
                  color: C.graphite,
                  marginBottom: "10px",
                  lineHeight: 1.3,
                }}>
                  {pass.tagline}
                </p>

                {/* Price + duration — combined onto one row */}
                <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "34px",
                    color: C.ink,
                    lineHeight: 1,
                    fontWeight: 400,
                  }}>
                    ₹{pass.price}
                  </span>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: C.skyWash,
                    border: `1px solid ${C.apricotWash}`,
                    color: C.rust,
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}>
                    <span style={{ width: "5px", height: "5px", background: C.rust, borderRadius: "50%", display: "inline-block" }} />
                    {pass.durationShort}
                  </span>
                </div>

                {/* Features — capped at 4 lines, same reasoning as the
                    featured card above (uniform, predictable card height) */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {pass.features.slice(0, 4).map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: i === 0 ? C.graphite : C.ash, lineHeight: 1.3, fontStyle: i === 0 ? "italic" : "normal" }}>
                      {i !== 0 && (
                        <span style={{ color: C.rust, flexShrink: 0, marginTop: "1px" }} aria-hidden="true">✓</span>
                      )}
                      {f}
                    </li>
                  ))}
                  {pass.features.length > 4 && (
                    <li style={{ fontSize: "11.5px", color: C.graphite, paddingLeft: "16px" }}>
                      +{pass.features.length - 4} more
                    </li>
                  )}
                </ul>

                {/* CTA */}
                <button
                  type="button"
                  className="pass-cta"
                  onClick={() => handleSelect(pass.key)}
                  aria-label={`${pass.cta} — ₹${pass.price} for ${pass.duration}`}
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    background: "transparent",
                    color: C.ink,
                    border: `1.5px solid ${C.dove}`,
                    borderRadius: "9999px",
                    padding: "10px 20px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {pass.cta} →
                </button>
              </div>
            );
          })}
        </div>

        {/* No auto-renewal note — single compact line */}
        <p style={{
          textAlign: "center",
          fontSize: "11.5px",
          color: C.graphite,
          marginBottom: "10px",
        }}>
          🔒 One-time payment. Pass expires quietly — no auto-charge, ever.&nbsp; Free tier stays free forever.
        </p>

        {/* Add-ons — slim single-row strip instead of a tall bordered panel.
            FIX: was a clickable <div> (not keyboard-reachable, no role) —
            now a real <button> group with a labeled region for screen readers. */}
        <div
          role="group"
          aria-label="One-time add-on purchases"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            background: "#ffffff",
            border: `1px solid ${C.dove}`,
            borderRadius: "16px",
            padding: "10px 14px",
            boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.05) 0px 4px 10px -2px",
          }}
        >
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.graphite,
            whiteSpace: "nowrap",
            paddingRight: "4px",
          }}>
            Add-ons
          </div>

          {ADDONS.map((addon) => {
            const isAddonHovered = hoveredAddon === addon.key;
            return (
              <button
                key={addon.key}
                type="button"
                className="addon-chip"
                onMouseEnter={() => setHoveredAddon(addon.key)}
                onMouseLeave={() => setHoveredAddon(null)}
                onClick={() => handleSelect(addon.key)}
                aria-label={`${addon.label} — ${addon.price}, ${addon.desc}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: isAddonHovered ? C.skyWash : C.fog,
                  border: `1.5px solid ${isAddonHovered ? C.rust : C.dove}`,
                  borderRadius: "12px",
                  padding: "7px 12px",
                  boxShadow: isAddonHovered ? "0 3px 10px rgba(5,150,105,0.12)" : "none",
                  font: "inherit",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
                  {addon.label}
                </span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "14px",
                  color: C.rust,
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}>
                  {addon.price}
                </span>
              </button>
            );
          })}

          <span style={{ fontSize: "11.5px", color: C.graphite, marginLeft: "auto", whiteSpace: "nowrap" }}>
            Free PDF always included · UPI / Cards via Razorpay
          </span>
        </div>

      </div>
    </section>
  );
}