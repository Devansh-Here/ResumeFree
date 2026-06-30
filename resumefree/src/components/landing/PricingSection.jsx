// src/components/landing/PricingSection.jsx
// Pass-based pricing — no auto-renewal, no subscription trap
// 3 tiles: Sprint (₹79/7d) | Placement (₹199/30d) ⭐ | Season (₹399/90d)
// + Add-on chips below
//
// REDESIGN GOAL: everything (header + 3 cards + add-ons) visible on a
// standard laptop viewport without scrolling. Achieved by: much tighter
// vertical rhythm (header, card padding, gaps all compressed), smaller
// type scale for price/heading, denser feature lists, and a slimmer
// single-row add-ons strip instead of a tall bordered panel.

import { useState } from "react";

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

// Animated gradient ring — same trick as Navbar Premium badge
const GradientRing = ({ children }) => (
  <div style={{ position: "relative", display: "inline-block", borderRadius: "9999px", padding: "1.5px", overflow: "hidden" }}>
    <div style={{
      position: "absolute",
      inset: "-150%",
      background: "conic-gradient(from 0deg, #059669, #34d399, #6ee7b7, #059669)",
      animation: "spin-ring 3s linear infinite",
      borderRadius: "9999px",
    }} />
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
    // fallback: scroll to builder or show auth modal — parent handles
  };

  return (
    <section
      id="pricing"
      style={{
        background: "#f8fafc",
        padding: "20px 24px 28px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes badge-pop {
          0%   { transform: scale(0.85); opacity: 0; }
          70%  { transform: scale(1.05); }
          100% { transform: scale(1);    opacity: 1; }
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
        .addon-chip {
          transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
          cursor: pointer;
        }
        .addon-chip:hover {
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header — compressed: smaller badge/heading/subtext, tight margins */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#d1fae5",
            color: "#059669",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "9999px",
            marginBottom: "10px",
          }}>
            <span style={{ width: "5px", height: "5px", background: "#059669", borderRadius: "50%", display: "inline-block" }} />
            No subscription. No auto-renewal.
          </div>

          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(24px, 3vw, 32px)",
            color: "#0a1628",
            fontWeight: 400,
            lineHeight: 1.15,
            margin: "0 0 6px",
          }}>
            Pay once. Use it.{" "}
            <em style={{ fontStyle: "italic", color: "#059669" }}>No surprises.</em>
          </h2>

          <p style={{
            fontSize: "13.5px",
            color: "#4a6fa5",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.5,
          }}>
            Unlike Other platform's hidden charges — you pick a pass, pay once, and it simply expires. That's it.
          </p>
        </div>

        {/* 3 Pass Cards — denser padding, smaller price type, tighter feature gaps */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          alignItems: "stretch",
          marginBottom: "16px",
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
                    background: "#0a1628",
                    borderRadius: "20px",
                    padding: "20px 22px 22px",
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
                  <div style={{ marginBottom: "12px" }}>
                    <GradientRing>
                      <span style={{
                        display: "inline-block",
                        background: "#0a1628",
                        color: "#6ee7b7",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        animation: "badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) both",
                      }}>
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
                    marginBottom: "3px",
                  }}>
                    {pass.name}
                  </div>

                  <p style={{
                    fontSize: "12.5px",
                    color: "rgba(203,213,225,0.7)",
                    marginBottom: "14px",
                    lineHeight: 1.4,
                  }}>
                    {pass.tagline}
                  </p>

                  {/* Price */}
                  <div style={{ marginBottom: "5px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "36px",
                      color: "#ffffff",
                      lineHeight: 1,
                      fontWeight: 400,
                    }}>
                      ₹{pass.price}
                    </span>
                  </div>

                  {/* Duration pill */}
                  <div style={{ marginBottom: "16px" }}>
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
                      <span style={{ width: "5px", height: "5px", background: "#059669", borderRadius: "50%", display: "inline-block" }} />
                      {pass.durationShort}
                    </span>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {pass.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: i === 0 ? "rgba(203,213,225,0.5)" : "#cbd5e1", lineHeight: 1.35, fontStyle: i === 0 ? "italic" : "normal" }}>
                        {i !== 0 && (
                          <span style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }}>✓</span>
                        )}
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className="pass-cta"
                    onClick={() => handleSelect(pass.key)}
                    style={{
                      marginTop: "16px",
                      width: "100%",
                      background: "#059669",
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
                  padding: "20px 22px 22px",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #cbd5e1",
                  boxShadow: isHovered
                    ? "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.12) 0px 16px 28px -8px"
                    : "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 6px 14px -4px",
                }}
              >
                {/* Badge or spacer */}
                <div style={{ marginBottom: "12px", minHeight: "22px" }}>
                  {pass.badge && (
                    <span style={{
                      display: "inline-block",
                      background: "#d1fae5",
                      color: "#059669",
                      fontSize: "10px",
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
                  color: "#4a6fa5",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                }}>
                  {pass.name}
                </div>

                <p style={{
                  fontSize: "12.5px",
                  color: "#4a6fa5",
                  marginBottom: "14px",
                  lineHeight: 1.4,
                }}>
                  {pass.tagline}
                </p>

                {/* Price */}
                <div style={{ marginBottom: "5px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "36px",
                    color: "#0a1628",
                    lineHeight: 1,
                    fontWeight: 400,
                  }}>
                    ₹{pass.price}
                  </span>
                </div>

                {/* Duration pill */}
                <div style={{ marginBottom: "16px" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#ecfdf5",
                    border: "1px solid #d1fae5",
                    color: "#059669",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}>
                    <span style={{ width: "5px", height: "5px", background: "#059669", borderRadius: "50%", display: "inline-block" }} />
                    {pass.durationShort}
                  </span>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {pass.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: i === 0 ? "#4a6fa5" : "#1e3a5f", lineHeight: 1.35, fontStyle: i === 0 ? "italic" : "normal" }}>
                      {i !== 0 && (
                        <span style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }}>✓</span>
                      )}
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="pass-cta"
                  onClick={() => handleSelect(pass.key)}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    background: "transparent",
                    color: "#0a1628",
                    border: "1.5px solid #cbd5e1",
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
          color: "#4a6fa5",
          marginBottom: "16px",
        }}>
          🔒 One-time payment. Pass expires quietly — no auto-charge, ever.&nbsp; Free tier stays free forever.
        </p>

        {/* Add-ons — slim single-row strip instead of a tall bordered panel */}
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          background: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.05) 0px 4px 10px -2px",
        }}>
          <div style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#4a6fa5",
            whiteSpace: "nowrap",
            paddingRight: "4px",
          }}>
            Add-ons
          </div>

          {ADDONS.map((addon) => {
            const isAddonHovered = hoveredAddon === addon.key;
            return (
              <div
                key={addon.key}
                className="addon-chip"
                onMouseEnter={() => setHoveredAddon(addon.key)}
                onMouseLeave={() => setHoveredAddon(null)}
                onClick={() => handleSelect(addon.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: isAddonHovered ? "#ecfdf5" : "#f8fafc",
                  border: `1.5px solid ${isAddonHovered ? "#059669" : "#cbd5e1"}`,
                  borderRadius: "12px",
                  padding: "7px 12px",
                  boxShadow: isAddonHovered ? "0 3px 10px rgba(5,150,105,0.12)" : "none",
                }}
              >
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#0a1628", whiteSpace: "nowrap" }}>
                  {addon.label}
                </span>
                <span style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "14px",
                  color: "#059669",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                }}>
                  {addon.price}
                </span>
              </div>
            );
          })}

          <span style={{ fontSize: "11.5px", color: "#4a6fa5", marginLeft: "auto", whiteSpace: "nowrap" }}>
            Free PDF always included · UPI / Cards via Razorpay
          </span>
        </div>

      </div>
    </section>
  );
}