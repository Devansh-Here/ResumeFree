# AGENTS.md — Rezumo (formerly ResumeFree)

AI-powered, ATS-optimized resume builder for Indian college students (freshers applying to TCS, Infosys, Capgemini, startups). Solo founder: Devansh. Code still runs under the name "ResumeFree" — the Rezumo rename is NOT actioned yet. Do not rename anything unless explicitly asked.

## Project context: read these before any task
- `docs/PROJECT_STATUS.md` — what is done, in progress, and left (read first, update after each task)
- `docs/ResumeFree_DesignSystem_v2.md` — Rezumo UI tokens, rules, and migration checklist (authoritative for UI chrome)
- `docs/AI_HANDOFF_final_8.md` — deep history, past bugs, file structure, Supabase/Razorpay setup. Where it conflicts with `PROJECT_STATUS.md`, trust `PROJECT_STATUS.md` and the actual code.
- Do not read `docs/Action_Plan.md` for current work: it is the original business blueprint (tech choices and day-wise timeline are outdated).

Always verify against the real code before relying on any doc.

## Development scope (READ FIRST)
**No new features.** The product feature set is frozen. Work only falls into these three buckets, in this priority:
1. **Finish what is in progress** (e.g. 9-field theme wiring for the remaining free templates, wiring the already-built resume checker, `src/pages/ResumeCheckerPage.jsx` and related components).
2. **Redesign what already exists** to the Obsidian Violet v2 system and the UI/UX standards below.
3. **Extremely important items only** (security gaps, payment/data-integrity bugs, launch blockers like the server-side premium check on `/api/jd-match`, Razorpay live mode, Rezumo rename).

If a task looks like a new feature or a nice-to-have, stop and ask Devansh before building. Ideas go to a backlog list, not into code.

## Security and code quality (applies to ALL code and files)
Every file you write or edit must follow security best practices. Treat this as non-negotiable:
- **Never trust the client.** Premium/pass checks, payment verification, and usage limits must be enforced server-side (API routes / Supabase RLS), never only in React state or localStorage.
- **Secrets:** only in `.env.local` / Vercel env vars. Never in client bundles, never committed, never logged. Only `VITE_`-prefixed public keys may reach the client.
- **Validate and sanitize all input** on the server (types, length, allowed values), including `/api/*` bodies, AI prompts/JD text, uploaded images, and resume data. Never render user content with `dangerouslySetInnerHTML`; escape anything interpolated into the Puppeteer HTML.
- **Payments:** verify Razorpay signatures server-side with constant-time comparison, treat server-stored amounts as authoritative, make verification idempotent (no double-unlock on replays).
- **Supabase:** RLS on every table, least-privilege policies, service-role key server-side only.
- **API hardening:** rate-limit AI and PDF endpoints, set sensible body-size limits, restrict CORS to known origins, return generic error messages to clients (details go to server logs only), add security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) via `vercel.json` where feasible.
- **Dependencies:** no new dependency without approval. Prefer well-maintained, widely used libraries. Run `npm audit` before suggesting a release.
- **Code quality:** small focused components, no dead code left behind, no `console.log` of user data, handle loading/error/empty states, accessible by default.
- If you find a security issue outside your current task, **flag it to Devansh immediately** and wait for approval before touching it.

## UI/UX standard: it must NOT look AI-generated
The site should feel crafted, alive, and intentional, like a design-led product team built it. Not a generic template.
- **Avoid generic AI-design tells:** default centered hero with gradient blob, purple-to-pink gradient everywhere, emoji used as icons, identical rounded cards in a 3-column grid, vague copy ("Unlock the power of..."), stock-looking spacing and symmetry, glassmorphism for its own sake. Follow the v2 system's sharp, editorial, professional tone instead.
- **Design with hierarchy and rhythm:** strong typographic contrast (Lustria headlines vs DM Sans body vs Martian Mono micro-labels), deliberate whitespace on the 8px scale, asymmetry and varied section layouts where it helps, one clear primary action per screen.
- **Subtle motion that has a purpose:** hover and press feedback, staggered entrances, smooth modal/panel transitions, animated success and loading states, scroll-triggered reveals used sparingly. Keep durations short (150–400ms), use consistent easing, animate `transform` and `opacity` only (no layout-thrashing animations).
- **Always respect `prefers-reduced-motion`.** Provide a reduced or no-motion path for every animation.
- **Performance is part of UX:** lazy-load heavy routes and WASM (e.g. background removal), no layout shift, optimized images, fast first paint on mid-range Android phones over mobile data (the core users are Indian students).
- **Accessibility:** WCAG AA contrast, visible keyboard focus, semantic HTML, proper labels and ARIA on custom controls, focus trapping in modals, 44px minimum touch targets, fully usable on mobile.
- **Complete states:** every screen needs designed loading, empty, error, and success states with helpful, human microcopy.
- **Mascot:** Rezzy (resume-paper character with graduation cap) must be original to Rezumo. Expression matches context: worried/confused where a problem is shown, happy/celebrating where Rezumo solves it. Never copy characters, imagery, or copy from reference sites.
- **Libraries:** use well-established, maintained libraries for the hard parts instead of hand-rolling them. Suggested candidates (each requires Devansh's approval before install): `motion` (Framer Motion) for animation, Radix UI primitives for accessible dialogs/menus/tabs/tooltips, Lucide or Phosphor for a consistent icon set. Do not stack overlapping libraries.
- **Resume template output is exempt** from brand styling (see Two separate design systems), but still must be clean, professional, and ATS-safe.

## How to talk to Devansh
- Reply in **Hinglish** (Hindi + English mix), casual and direct. App UI text and code comments stay in English.
- He works on **Windows with Command Prompt (CMD)**. Never give PowerShell or Unix-only commands (no `rm`, `ls`, `export`, `&&` chains that assume bash). Use `del`, `dir`, `findstr`, `rmdir /s /q`.
- **One task at a time.** Before implementing, show a short plan and wait for approval.
- **Scope discipline:** never mix unrelated changes into a task. If you spot something else worth fixing (especially security), flag it and ask. Do not fix it silently.
- If a change fails, don't keep guessing. Read the actual file, state a hypothesis, verify, then fix. Get it right the first time.
- After finishing a task, list exactly which files changed and how to verify it.

## Stack
React 18 + Vite, Tailwind CSS v3, Zustand (persisted to localStorage, `resumeStore.js` persist version 3), React Router v6, Express proxy (`server.js`, port 3001) for Groq + Razorpay, Supabase (auth + Postgres, Mumbai), Groq `llama-3.3-70b-versatile`, Razorpay (test mode), Vercel hosting. Resume PDF is rendered server-side with Puppeteer (`/api/generate-pdf`).

## Running locally (two CMD windows)
```cmd
node server.js
vercel dev -A vercel-dev.json
```
Plain `npm run dev` works if `/api/generate-pdf` is not needed. After editing `.env.local`, `global.css`, or `tailwind.config.js`, restart servers and hard refresh the browser (`Ctrl+Shift+R`). If Vite export errors persist: `rmdir /s /q node_modules\.vite`.

## Critical rule: PDF bundle
`api/generate-pdf.js` is **AUTO-GENERATED. Never hand-edit it.**
After ANY edit to `src/components/templates/*` or `templateRegistry.js`, run:
```cmd
node scripts/build-api.mjs
findstr "template-id" api\generate-pdf.js
```
A stale bundle silently serves old templates and has caused many wasted debugging rounds.

## Two separate design systems — never mix them
1. **Rezumo's own UI chrome** (navbar, forms, modals, pages) follows `ResumeFree_DesignSystem_v2.md` (Obsidian Violet): iris-violet `#7451f2`, graphite-ink `#272727`, Lustria / DM Sans / Martian Mono, 4px radius (pills 100px), one shadow only (CTA). All values come from CSS variables in `src/global.css` mapped in `tailwind.config.js`. Use Tailwind token classes, no inline hex or `fontFamily`. Builder form sections import shared styles from `src/components/builder/formStyles.js`.
2. **Resume template output** (what appears in the user's PDF) is NOT part of the brand redesign. Templates are driven only by `resume.theme` (user's choices) with safe fallbacks matching `DEFAULT_RESUME.theme` in `resumeStore.js`. Never apply brand violet / Lustria / Martian Mono to templates. Font keys resolve via `getFontStack()` in `src/utils/fontOptions.js` (system-safe fonts only).

Banned legacy Steep values (remove on sight in UI files): `#F6F4EF`, `#DDD6C8`, `#161A2E`, `#E2A33B`, `#0a1628`, `#059669` as brand accent, fonts `IBM Plex Mono`, `Space Grotesk`, `Inter`, `DM Serif Display`.

## Template work (current main workstream)
Wiring the 9-field theme into every template: `accentColor`, `backgroundColor`, `textColor`, `headingColor`, `linkColor`, `fontFamily`, `bodyFontFamily`, `headingStyle`, `density`, `dividerStyle`.
- Reference implementation: `CorporateEliteTemplate.jsx`. Done: Corporate Elite, Startup Bold, Creative Edge, Grid Professional, Technical Pro.
- Remaining free templates: Classic, Modern, Minimal, Compact, Executive.
- Each template gets: color helpers (`hexToRgb`, `rgbToHex`, `blendTowardBase`, `accentAlpha`), a `DENSITY_SCALE` table, a themed `SectionHeading` supporting `dividerStyle` (line / dots / none), and fallbacks.
- Audit every field individually against the actual file. A working `accentColor` does not mean `linkColor` or `fontFamily` are correct.
- Templates are shared with the Puppeteer renderer. Never change template layout or density for preview-only reasons (the preview uses a `zoom` wrapper instead).
- Per-template design exceptions must be documented in a comment (e.g. Startup Bold's `linkColor` falls back to near-white, not `accentColor`, on the accent header band).
- ATS safety: `atsRating` (`safe` or `moderate`) lives in `templateRegistry.js`. Keep new customization axes ATS-safe.

## Payments, auth, security — extra care
- Files: `server.js`, `api/create-order.js`, `api/verify-payment.js`, `api/jd-match.js`, `utils/passes.js`, Supabase RLS.
- Pricing has one source of truth: `utils/passes.js`. Valid `pass_type`: `sprint`, `placement`, `season`, `addon_cover_letter`, `addon_jd_tailoring`, `addon_ats`.
- Never expose secrets or put them in client code. Never commit `.env` / `.env.local`.
- Never touch payment or premium-gating logic as a side effect of another task. Propose changes and wait for approval.
- Supabase URL is the bare project URL only (never append `/rest/v1`).

## Do NOT delete or restructure without asking
- `src/pages/ResumeCheckerPage.jsx` and everything in `src/components/resumeChecker/` (WIP resume-upload ATS scanner, not yet routed — keep it)
- `ATSCheckPanel.jsx` (orphan, unused; real ATS UI is `ATSContent.jsx`)
- Anything related to `AI_HANDOFF_final_*.md` docs

## Known file-confusion traps
- `ATSContent.jsx` (real) vs `ATSCheckPanel.jsx` (orphan).
- Before assuming a change "has no effect", check the file is actually imported: `findstr /s /i "import ComponentName" src\*.jsx`.
- Before working on a file named in conversation, confirm it exists: `dir /s /b FileName.jsx`.
- Trust Devansh's confirmation of file locations over stale path comments inside files.

## Git workflow
- Work on the `codex-work` branch, never directly on `main`.
- Never run `git add .` blindly. Check `git status` first; do not commit scratch/audit `.txt` files.
- Suggest a clear conventional commit message at the end of each task (`feat:`, `fix:`, `refactor:`).
- Remind Devansh to push regularly.

## Current priorities (scope is frozen: finish, redesign, fix critical)
1. **Finish in-progress work:** 9-field theme wiring for the 5 free templates (start with `ClassicTemplate.jsx`); wire the existing resume checker (`src/pages/ResumeCheckerPage.jsx` and related components) into routing.
2. **Critical/security:** server-side premium check on `/api/jd-match`; audit all `/api/*` routes against the security checklist above.
3. **Redesign existing UI** with the v2 system and the UI/UX standard: remaining Phase 3 (modals), Phase 4 (Landing, Pricing, Profile, Auth, CoverLetter, Privacy/Terms), per `ResumeFree_DesignSystem_v2.md` Section 6. Landing page gets the most design effort.
4. **Launch blockers:** Rezumo rename and domain, Razorpay live mode (needs KYC).
5. **Backlog, do NOT build now:** GitHub/LinkedIn autofill, new premium templates beyond the current 10, cloud-saving extras, any new feature idea.