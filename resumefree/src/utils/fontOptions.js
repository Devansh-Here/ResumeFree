// src/utils/fontOptions.js
//
// Single source of truth for resume heading-font choices. `theme.fontFamily`
// in resumeStore.js stores ONE OF THE KEYS below (e.g. "georgia"), never a
// raw CSS font-family string — this keeps the store data small/stable and
// lets us safely change the underlying CSS stack later without touching
// any persisted user data.
//
// Deliberately system/print-safe fonts only — no Google Fonts import here.
// This matters twice over: (1) resumes render server-side via Puppeteer for
// PDF export, so any web-font would need to be loaded in that render path
// too, and (2) unusual fonts can hurt ATS text-extraction reliability.

export const FONT_OPTIONS = {
  // ── Serif ──────────────────────────────────────────────
  georgia: {
    label: "Georgia",
    group: "Serif",
    stack: "Georgia, 'Times New Roman', serif",
  },
  cambria: {
    label: "Cambria",
    group: "Serif",
    stack: "Cambria, Georgia, serif",
  },
  garamond: {
    label: "Garamond",
    group: "Serif",
    stack: "Garamond, 'Times New Roman', serif",
  },
  times: {
    label: "Times New Roman",
    group: "Serif",
    stack: "'Times New Roman', Times, serif",
  },

  // ── Sans-Serif ─────────────────────────────────────────
  arial: {
    label: "Arial",
    group: "Sans-Serif",
    stack: "Arial, Helvetica, sans-serif",
  },
  helvetica: {
    label: "Helvetica",
    group: "Sans-Serif",
    stack: "Helvetica, Arial, sans-serif",
  },
  calibri: {
    label: "Calibri",
    group: "Sans-Serif",
    stack: "Calibri, Candara, sans-serif",
  },
  verdana: {
    label: "Verdana",
    group: "Sans-Serif",
    stack: "Verdana, Geneva, sans-serif",
  },

  // NOTE: the store's DEFAULT_RESUME currently has fontFamily: "inter" as
  // its default key, but "inter" isn't in this list (Inter is a Google Font,
  // not system-safe/print-safe for resume body text the way it's fine for
  // ResumeFree's own UI chrome). Flagging this — resumeStore.js's default
  // should change to a valid key here, e.g. "georgia" or "arial", when we
  // update the store next.
};

// Ordered list for rendering grouped pickers (object key order isn't
// guaranteed stable enough to rely on for UI).
export const FONT_GROUPS = ["Serif", "Sans-Serif"];

export function getFontStack(key) {
  return FONT_OPTIONS[key]?.stack || FONT_OPTIONS.georgia.stack;
}