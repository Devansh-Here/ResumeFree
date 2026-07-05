// src/components/templates/templateRegistry.js
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
export const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean, centered header. TCS/Infosys-safe.",
    isPremium: false,
    component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Left-aligned header with emerald accents.",
    isPremium: false,
    component: ModernTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean, generous whitespace.",
    isPremium: false,
    component: MinimalTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense layout, startup/tech-forward.",
    isPremium: false,
    component: CompactTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Formal serif headline. MBA/senior roles.",
    isPremium: false,
    component: ExecutiveTemplate,
  },
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    description: "Dark sidebar layout. Consulting/MBA-focused.",
    isPremium: true,
    component: CorporateEliteTemplate,
  },
  {
    id: "startup-bold",
    name: "Startup Bold",
    description: "Emerald header band, chip-style skills.",
    isPremium: true,
    component: StartupBoldTemplate,
  },
  {
    id: "creative-edge",
    name: "Creative Edge",
    description: "Timeline experience, serif headline, card projects.",
    isPremium: true,
    component: CreativeEdgeTemplate,
  },
  {
    id: "technical-pro",
    name: "Technical Pro",
    description: "Stack-first layout for SDE/dev roles.",
    isPremium: true,
    component: TechnicalProTemplate,
  },
  {
    id: "grid-professional",
    name: "Grid Professional",
    description: "Bordered card grid. Formal and structured.",
    isPremium: true,
    component: GridProfessionalTemplate,
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}