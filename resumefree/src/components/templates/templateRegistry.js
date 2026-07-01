// src/components/templates/templateRegistry.js
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import CompactTemplate from "./CompactTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";

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
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}