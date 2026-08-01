export const FONT_OPTIONS = [
  { id: "inter",   label: "Inter (Default)", body: "'Inter', sans-serif", heading: "'DM Serif Display', serif" },
  { id: "arial",   label: "Arial",           body: "'Arial', Helvetica, sans-serif", heading: "'Arial', Helvetica, sans-serif" },
  { id: "georgia", label: "Georgia",         body: "'Georgia', serif", heading: "'Georgia', serif" },
  { id: "times",   label: "Times New Roman", body: "'Times New Roman', Times, serif", heading: "'Times New Roman', Times, serif" },
  { id: "calibri", label: "Calibri-style",   body: "'Carlito', 'Calibri', sans-serif", heading: "'Carlito', 'Calibri', sans-serif" },
];

export function getFontOption(id) {
  return FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0];
}