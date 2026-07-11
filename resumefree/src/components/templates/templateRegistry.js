import ClassicTemplate from "./ClassicTemplate.jsx";
import ModernTemplate from "./ModernTemplate.jsx";
import MinimalTemplate from "./MinimalTemplate.jsx";
import CompactTemplate from "./CompactTemplate.jsx";
import ExecutiveTemplate from "./ExecutiveTemplate.jsx";
import CorporateEliteTemplate from "./CorporateEliteTemplate.jsx";
import StartupBoldTemplate from "./StartupBoldTemplate.jsx";
import CreativeEdgeTemplate from "./CreativeEdgeTemplate.jsx";
import TechnicalProTemplate from "./TechnicalProTemplate.jsx";
import GridProfessionalTemplate from "./GridProfessionalTemplate.jsx";

// Single source of truth for every resume template.
// To add a new (premium) template later: build the component,
// import it here, add one entry below with isPremium: true —
// nothing else in the app needs to change.
//
// `supportsPhoto`: whether this template's layout has a spot for a
// profile photo. Free templates intentionally keep this false — it
// doubles as an ATS-safety default (single-column, no-photo layouts
// parse better) AND as a natural reason for free users to try a
// premium template. PhotoEditorPanel checks this flag via
// `templateSupportsPhoto()` before rendering at all.
//
// `atsRating`: 'safe' | 'moderate' — how reliably this layout parses
// in legacy/bulk-hiring ATS systems (TCS/Infosys/Capgemini-style).
// 'safe' = single-column, linear top-to-bottom reading order.
// 'moderate' = has a sidebar, grid, or any side-by-side column block
// that a parser could read out of order. This is a DESIGN TRADEOFF
// indicator shown to the user, not a hard restriction — see Section 5q
// of the handoff doc. Assigned by visually auditing each template's
// actual rendered layout (screenshots), not guessed from the name.
export const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean, centered header. TCS/Infosys-safe.",
    isPremium: false,
    supportsPhoto: false,
    atsRating: "safe",
    component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Left-aligned header with emerald accents.",
    isPremium: false,
    supportsPhoto: false,
    atsRating: "safe",
    component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, generous whitespace.",
    isPremium: false,
    supportsPhoto: false,
    atsRating: "safe",
    component: MinimalTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout, startup/tech-forward.",
    isPremium: false,
    supportsPhoto: false,
    atsRating: "safe",
    component: CompactTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal serif headline. MBA/senior roles.",
    isPremium: false,
    supportsPhoto: false,
    atsRating: "safe",
    component: ExecutiveTemplate,
  },
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    description: "Dark sidebar layout. Consulting/MBA-focused.",
    isPremium: true,
    supportsPhoto: true,
    atsRating: "moderate",
    component: CorporateEliteTemplate,
  },
  {
    id: "startup-bold",
    name: "Startup Bold",
    description: "Emerald header band, chip-style skills.",
    isPremium: true,
    supportsPhoto: true,
    atsRating: "safe",
    component: StartupBoldTemplate,
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    description: "Timeline experience, serif headline, card projects.",
    isPremium: true,
    supportsPhoto: true,
    atsRating: "moderate",
    component: CreativeEdgeTemplate,
  },
  {
    id: "technical-pro",
    name: "Technical Pro",
    description: "Stack-first layout for SDE/dev roles.",
    isPremium: true,
    supportsPhoto: false,
    atsRating: "safe",
    component: TechnicalProTemplate,
  },
  {
    id: "grid-professional",
    name: "Grid Professional",
    description: "Bordered card grid. Formal and structured.",
    isPremium: true,
    supportsPhoto: true,
    atsRating: "moderate",
    component: GridProfessionalTemplate,
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export function templateSupportsPhoto(id) {
  return !!getTemplate(id).supportsPhoto;
}

export function getATSRating(id) {
  return getTemplate(id).atsRating || "safe";
}