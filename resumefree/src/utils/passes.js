// src/utils/passes.js
// Single source of truth for pass pricing/duration — used by
// PricingSection, PassConfirmModal, and ProfilePage so the numbers
// never drift out of sync across files.

export const PASS_DETAILS = {
  sprint: {
    key: "sprint",
    name: "Sprint Pass",
    tagline: "One urgent application to nail",
    price: 79,
    durationDays: 7,
    durationLabel: "7-day access",
    featured: false,
  },
  placement: {
    key: "placement",
    name: "Placement Pass",
    tagline: "Full placement drive, multiple companies",
    price: 199,
    durationDays: 30,
    durationLabel: "30-day access",
    featured: true,
  },
  season: {
    key: "season",
    name: "Season Pass",
    tagline: "Full Aug–Dec or Jan–Apr cycle",
    price: 399,
    durationDays: 90,
    durationLabel: "90-day access",
    featured: false,
  },
};

export const getPass = (key) => PASS_DETAILS[key] || null;