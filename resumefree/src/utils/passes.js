// src/utils/passes.js
// Single source of truth for pass pricing/duration — used by
// PricingSection, PassConfirmModal, UpgradeModal, and ProfilePage so the
// numbers never drift out of sync across files.

export const PASS_DETAILS = {
  sprint: {
    key: "sprint",
    name: "Sprint Pass",
    tagline: "One urgent application to nail",
    price: 79,
    durationDays: 7,
    durationLabel: "7-day access",
    featured: false,
    badge: null,
    isAddon: false,
  },
  placement: {
    key: "placement",
    name: "Placement Pass",
    tagline: "Full placement drive, multiple companies",
    price: 199,
    durationDays: 30,
    durationLabel: "30-day access",
    featured: true,
    badge: "Most Popular",
    isAddon: false,
  },
  season: {
    key: "season",
    name: "Season Pass",
    tagline: "Full Aug–Dec or Jan–Apr cycle",
    price: 399,
    durationDays: 90,
    durationLabel: "90-day access",
    featured: false,
    badge: "Best Value",
    isAddon: false,
  },
  addon_cover_letter: {
    key: "addon_cover_letter",
    name: "Cover Letter Add-on",
    tagline: "One AI-generated cover letter",
    price: 99,
    durationDays: null,
    durationLabel: "One-time unlock",
    featured: false,
    badge: null,
    isAddon: true,
  },
  addon_jd_tailoring: {
    key: "addon_jd_tailoring",
    name: "JD Tailoring Add-on",
    tagline: "Tailor your resume bullets for 1 job",
    price: 49,
    durationDays: null,
    durationLabel: "One-time unlock",
    featured: false,
    badge: null,
    isAddon: true,
  },
  addon_ats: {
    key: "addon_ats",
    name: "Advanced ATS Add-on",
    tagline: "Deep ATS check + keyword gaps, 1 resume",
    price: 99,
    durationDays: null,
    durationLabel: "One-time unlock",
    featured: false,
    badge: null,
    isAddon: true,
  },
};

// Ordered list of the 3 full (non-addon) passes — used by UpgradeModal's
// pass picker so it doesn't need to hardcode its own copy of this array.
export const FULL_PASS_KEYS = ["sprint", "placement", "season"];

export const getPass = (key) => PASS_DETAILS[key] || null;