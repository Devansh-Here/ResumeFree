# ResumeFree — Complete AI Handoff Document
> Paste this entire document to any AI assistant to get full project context instantly.
> Supersedes `AI_HANDOFF_final_7.md`. Design-system details are superseded by
> `ResumeFree_DesignSystem_v2.md` (Obsidian Violet) — that document is
> authoritative for colors/fonts/radius on ResumeFree's OWN UI chrome. This
> document stays authoritative for features, file structure, Supabase,
> Razorpay, and workflow rules.
 
---
 
## 1. WHO IS DEVANSH?
 
- Solo founder, Indian college student, building ResumeFree
- Location: Jaipur, Rajasthan, India
- GitHub: github.com/Devansh-Here
- Communication style: **Hinglish** (Hindi + English mixed) — always respond in Hinglish
- Preferred guidance: Step-by-step, confirm at each stage before proceeding
- File delivery: Always give **complete file replacements**, never diffs or patches
- Provide **full folder structure** before starting any new feature
- Environment: **Windows + Command Prompt** (NOT PowerShell) — never give Unix-only commands
- Editor: VS Code
- Frustration trigger: Multiple failed fix attempts — get it right the first time
- Remind to push to GitHub regularly (contribution graph active rehna chahiye)
- **Wants the AI Handoff doc itself updated after every completed task/session** — not just at the end of a long multi-bug session.
- Likes: small "alive" UI touches — hover micro-interactions, playful loading/success states, animated accents. Always suggest these where it fits.
- **Nav-placement lesson:** before adding a link/entry point for a premium-gated feature, think about WHO sees that nav slot.
- **Security-first instinct** on payment-adjacent code.
- **Devansh will sometimes decide NOT to ship something Claude built** — don't push back, record as deferred/skipped.
- **"Fix it now, don't defer" instinct for anything already exposed.**
- **Guess-then-verify discipline:** ask for the exact file(s) first, state a hypothesis explicitly, only write the fix once actual code confirms it.
- **Copy-paste file mixups are a real, RECURRING failure mode** — this project has multiple pairs of similarly-named files that look interchangeable but are NOT (see Section 12).
- **"Fully hidden" premium features need a discovery fallback.**
- **Auto-generated `api/generate-pdf.js` staleness is a CONFIRMED recurring bug** — any edit to `templateRegistry.js` or `src/components/templates/*` must be followed by `node scripts/build-api.mjs` before testing PDF output.
- **Don't stack unrelated environment/tooling changes on top of an active debugging or migration session.**
- **NEW (this session) — Devansh proactively questions defaults for visual consistency.** When a new global default (e.g. accentColor defaulting to brand violet) is introduced, he'll notice inconsistency across templates that haven't been updated yet and flag it as "looking odd" — this is usually a signal that a propagation/rollout is incomplete, not a new bug. Good instinct to validate explicitly rather than dismiss.
- **NEW (this session) — Devansh distinguishes ResumeFree's own brand identity from the user's resume output, but wants that boundary explained, not just asserted.** When told "templates don't use v2 brand tokens on purpose," he wanted the actual reasoning (avoids his resume looking like OUR brand instead of his own choice) — worth walking through the "why" rather than just citing the rule from `ResumeFree_DesignSystem_v2.md` §6 Phase 5.
- **Devansh will sometimes build a whole file himself in a separate session/context and forget he never actually created/saved it** — see Section 12's new lesson this session (`ColorThemePicker.jsx` was discussed at length as if it existed, but never actually existed on disk; the REAL wired file was `CustomizationPanel.jsx` + `CustomizationContent.jsx`, discovered only via `findstr`).
---
 
## 2. PROJECT: ResumeFree
 
**What it is:** AI-powered, ATS-optimized resume builder for Indian college students.
 
**Live URL:** https://resumefree-flame.vercel.app
**GitHub:** github.com/Devansh-Here/ResumeFree (code lives in `/resumefree/` subfolder)
**Local dev:** Two CMD windows required:
- Window 1: `node server.js` (port 3001 — Express proxy for Groq + Razorpay only)
- Window 2: `npm run dev` (or `vercel dev -A vercel-dev.json` if `/api/generate-pdf` needs local testing)
**Tagline:** "Free AI Resume Builder for Indian Students — No Sign-Up, Download PDF Instantly"
 
**Core USP (unchanged):** Zero sign-up, truly free PDF (Puppeteer server-rendered), Indian ATS-optimized templates, JD Matcher, AI Cover Letter Generator, 10 resume templates (5 free/5 premium), ATS-Safety Transparency System (`atsRating` badges), Photo Personalization + Accent Color Theme, pass-based pricing.
 
**NEW THIS SESSION — Full Resume Customization System (in progress):**
Expanded from a single accent-color picker into a genuine multi-axis
customization suite: independent **Link Color, Background Color, Text
Color, Heading Color** (Colors tab); **Heading Font, Body Font, Heading
Style** — uppercase/normal (Typography tab); **Density** —
compact/balanced/spacious, **Section Divider Style** — line/dots/none
(Layout tab). Panel opens as a `SlideOverPanel` from the left (NOT the
centered-wide-modal pattern used by ATS/Templates) — deliberate choice so
the live resume preview stays visible while tweaking. See Section 5s for
full detail.
 
> **Design system note:** ResumeFree is mid-migration from the old "Steep"
> (navy/emerald) look to **Obsidian Violet v2** (iris-violet `#7451f2`,
> sharp 4px radius, Lustria/DM Sans/Martian Mono fonts) — see
> `ResumeFree_DesignSystem_v2.md`, the authoritative source for that
> migration's token values, phase order, and checklist. **Resume templates
> (`ClassicTemplate.jsx` etc.) are explicitly OUT OF SCOPE for that
> migration** — they render the user's own resume output, not ResumeFree's
> UI chrome, and must stay driven by `resume.theme` (the user's choices),
> never by ResumeFree's own brand tokens. This distinction matters a lot
> for the Customization System (Section 5s) — don't conflate the two.
 
> **Navbar philosophy (settled):** No prominent "Sign Up" button. "Start
> Building" is the primary CTA for everyone; premium-only features live
> inside the signed-in ProfileAvatar dropdown, not the public top nav.
 
---
 
## 3. TECH STACK
 
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 — **two separate token systems in play, see note above:** ResumeFree's own UI chrome is mid-migration to Obsidian Violet v2 tokens (`ResumeFree_DesignSystem_v2.md`); resume template output stays on raw hex driven by `resume.theme`, deliberately NOT migrated. |
| State | Zustand + localStorage persistence (custom `merge` function for safe schema migrations — **now on persist `version: 3`**, see Section 5s) |
| Routing | React Router DOM v6 |
| **PDF Generation (resume)** | Server-side Puppeteer. `POST /api/generate-pdf` → `api/generate-pdf.js` (auto-generated, esbuild-bundled from `src/server/generate-pdf.entry.js`). **⚠️ Must be rebuilt (`node scripts/build-api.mjs`) after ANY edit to template files or `templateRegistry.js`.** |
| **PDF Generation (cover letter)** | Client-side `pdf-lib` via `generateCoverLetterPDF.js`. |
| **Photo background removal** | `@imgly/background-removal` — free, client-side (WASM). |
| AI | Groq API — model: `llama-3.3-70b-versatile` |
| AI Proxy | Express server (port 3001) — Groq + Razorpay only |
| Auth | Supabase Magic Link + Google OAuth + Email/Password |
| Database | Supabase (Mumbai region, PostgreSQL) |
| Payments | Razorpay (test mode — live mode pending KYC) |
| Hosting | Vercel (Root Directory set to `resumefree/` subfolder) |
| **Local dev tooling** | `vercel-dev.json` (empty `{}`) at project root — used via `vercel dev -A vercel-dev.json`. |
 
**Important paths:**
- `supabaseClient` import path: `../utils/supabaseClient`
- Groq/Razorpay calls go through `server.js` proxy — specific routes only.
- PDF generation: `/api/generate-pdf` — auto-generated from `src/server/generate-pdf.entry.js` — **must be rebuilt after source changes.**
- **NEW:** Font lookups for BOTH ResumeFree's own UI (n/a — that uses CSS `font-heading`/`font-body`/`font-mono` classes) AND resume template output (`getFontStack(key)`) go through `src/utils/fontOptions.js` — the single source of truth for resume-output font keys → CSS stacks. System/print-safe fonts only, deliberately no Google Fonts here (ATS-safety + Puppeteer render-path reasons).
---
 
## 4. DESIGN SYSTEM
 
**ResumeFree's own UI chrome:** see `ResumeFree_DesignSystem_v2.md` (Obsidian Violet) — authoritative, actively being migrated file-by-file. Do not duplicate its token tables here; refer to it directly.
 
**Resume template output (what actually renders in the user's downloaded PDF):** NOT governed by the v2 design system. Driven entirely by `resume.theme` (see Section 5s) with safe hardcoded fallbacks matching `resumeStore.js`'s `DEFAULT_RESUME.theme`. Each template keeps its own local color-blending helpers (`hexToRgb`, `blendTowardBase`, `accentAlpha` — see `CorporateEliteTemplate.jsx`) rather than importing brand tokens.
 
---
 
## 5. FILE STRUCTURE (delta from `AI_HANDOFF_final_7.md` — full tree otherwise unchanged)
 
```
resumefree/
└── src/
    ├── utils/
    │   └── fontOptions.js          ✅ NEW THIS SESSION — FONT_OPTIONS map
    │                                    (key → {label, group, stack}) +
    │                                    FONT_GROUPS + getFontStack(key).
    │                                    System/print-safe fonts only.
    ├── store/
    │   └── resumeStore.js          ✅ UPDATED THIS SESSION — persist
    │                                    version 1 → 3. theme object
    │                                    expanded (see Section 5s). New
    │                                    resetThemeField(field) action.
    └── components/
        └── premium/
            ├── CustomizationPanel.jsx    ✅ NEW THIS SESSION — the actual
            │                                 3-tab (Colors/Typography/
            │                                 Layout) customization UI.
            │                                 Was MISSING from disk despite
            │                                 being imported — see Section
            │                                 5s and Section 12's new lesson.
            └── CustomizationContent.jsx  ✅ ALREADY EXISTED, confirmed
                                              correct, v2-token-compliant,
                                              NOT modified this session —
                                              wraps CustomizationPanel in
                                              SlideOverPanel (deliberately,
                                              not the centered-modal
                                              pattern — see Section 5s).
```
 
**Confirmed via `findstr` this session — do NOT recreate:**
- `ColorThemePicker.jsx` — **does not exist anywhere in the project.** Was discussed at length in a prior session/context as if it were the live component, but it was never actually created/saved. The real, already-wired chain is `Sidebar.jsx` → `CustomizationContent.jsx` → `CustomizationPanel.jsx`.
---
 
## 5a–5r. (Prior sessions — unchanged, preserved for continuity)
 
Covers: Footer status, Navbar/ProfileAvatar, FinalCTA copy, UpgradeModal
fixes, Cover Letter Generator + cloud save, payment security rewrite,
addon purchase flow audits, Template Switcher build, server-side PDF
Puppeteer migration, addon unlock parity, payments amount consistency,
`returnTo` fixes, local dev tooling fixes, legacy column drops, Photo
Personalization Engine + Accent Color Theme (single-color version, now
superseded/expanded by Section 5s), the ATS-Safety Transparency System
(`atsRating` field, Template Switcher badge, ATS Checker contextual
warning — fully shipped), and the ATS-Checker UI-uniformity pass (wide
centered 2-column modal). Full detail preserved in `AI_HANDOFF_final_3.md`
through `AI_HANDOFF_final_7.md`. Nothing in these sections changed this
session.
 
---
 
## 5s. FULL RESUME CUSTOMIZATION SYSTEM — **BUILT THIS SESSION, IN PROGRESS**
 
**Context:** The old `theme` shape only exposed `accentColor` as a
user-customizable field (via a single-color picker). Devansh asked for a
genuinely rich customization suite — separate controls for link color,
background color, text color, heading color, heading font, body font,
heading casing, spacing density, and section-divider style — organized as
its own dedicated tab/panel rather than one color swatch row.
 
### Part 1 — `src/utils/fontOptions.js` (new file)
 
Single source of truth for resume-output font choices. Exports:
- `FONT_OPTIONS` — object keyed by short id (`"georgia"`, `"arial"`, etc.),
  each entry `{ label, group: 'Serif'|'Sans-Serif', stack: <CSS font stack> }`.
  8 fonts total: Georgia, Cambria, Garamond, Times New Roman (serif);
  Arial, Helvetica, Calibri, Verdana (sans-serif).
- `FONT_GROUPS` — `["Serif", "Sans-Serif"]`, ordered list for rendering.
- `getFontStack(key)` — returns the CSS stack for a key, falls back to
  Georgia's stack if the key is unrecognized.
**Deliberately system/print-safe only, no Google Fonts** — two reasons:
(1) resumes render server-side via Puppeteer for PDF export, so any web
font would need to be loaded in that render path too; (2) unusual fonts
can hurt ATS text-extraction reliability. `theme.fontFamily` and
`theme.bodyFontFamily` in the store hold KEYS into this map, never raw CSS
strings — keeps persisted data small/stable and lets the underlying CSS
stack change later without touching persisted user data.
 
### Part 2 — `resumeStore.js` theme shape expansion (persist version 2 → 3)
 
`DEFAULT_RESUME.theme` grew from `{ accentColor, linkColor, textColor,
fontFamily, photoBorder }` to:
 
```js
theme: {
  accentColor: "#7451f2",      // concrete, v2 violet default (was emerald #059669)
  linkColor: null,             // nullable — null = inherit accentColor
  backgroundColor: null,       // nullable — null = template's own default bg
  textColor: "#272727",        // concrete, graphite-ink v2 default (was navy #0a1628)
  headingColor: null,          // NEW — nullable, null = inherit textColor
  fontFamily: "georgia",       // KEY into FONT_OPTIONS — heading font
  bodyFontFamily: "arial",     // NEW — KEY into FONT_OPTIONS — body font
  headingStyle: "normal",      // NEW — 'normal' | 'uppercase'
  density: "balanced",         // NEW — 'compact' | 'balanced' | 'spacious'
  dividerStyle: "line",        // NEW — 'line' | 'dots' | 'none'
  photoBorder: { style: "circle", color: null, width: 2 }, // unchanged
}
```
 
New action: **`resetThemeField(field)`** — resets exactly one theme field
back to its `DEFAULT_RESUME.theme` value. Exists specifically so
`CustomizationPanel.jsx` never has to hardcode or guess which fields are
nullable (`linkColor`/`backgroundColor`/`headingColor` → `null`) vs.
concrete (everything else → a real default value) — the store owns that
knowledge in one place.
 
**Persist `version: 3`**, `merge()` unchanged in structure (still a
field-by-field deep merge with `currentState.resume.theme` spread FIRST,
then `persistedTheme` on top) — this pattern automatically gives every
NEW field a safe default for pre-v3 localStorage data with zero extra
migration code, because the spread order means "missing in persisted data"
naturally falls through to the current default.
 
### Part 3 — `CustomizationPanel.jsx` (new file — was missing from disk)
 
**Important debugging note:** `Sidebar.jsx` already imported
`CustomizationContent.jsx`, which already imported `CustomizationPanel`
from `"./CustomizationPanel"` — but `CustomizationPanel.jsx` did not
actually exist on disk. A different, never-saved file called
`ColorThemePicker.jsx` had been discussed at length as if it were the live
component in an earlier session/context, but `findstr /s /i
"ColorThemePicker" src\*.js src\*.jsx` and `dir /s /b ColorThemePicker.jsx`
both confirmed it never existed. Root cause: Devansh had drafted/discussed
it but never actually created/saved the file. This is a NEW variant of the
project's established "similarly-named/assumed file" failure mode (see
Section 12) — this time the missing file wasn't even a real orphan, it was
a phantom that only existed in conversation.
 
**Final panel structure — 3 tabs:**
- **Colors:** Link Color, Background Color (with an `isLightEnough()`
  print-contrast/ATS-readability warning card, reusing the same semantic
  `warning-bg`/`warning-border`/`warning-text` pattern as the ATS-safety
  system), Text Color, Heading Color. Each is a `ColorField` — a row of
  16 curated presets (expanded from the original 8 per Devansh's explicit
  request this session — "jitne bhi options ho sake") + a native
  `<input type="color">` custom picker, with a Reset button that calls
  `resetThemeField`.
- **Typography:** Heading Font + Body Font (both `FontField` — same
  `FONT_OPTIONS`/`FONT_GROUPS` list, rendered as a 2-column grid of
  font-preview buttons, each button's own `style={{ fontFamily: font.stack
  }}` so the button text previews in its own font), Heading Style
  (`SegmentedControl` — Normal / Uppercase).
- **Layout:** Density (`SegmentedControl` — Compact / Balanced /
  Spacious), Section Divider (`SegmentedControl` — Line / Dots / None).
Free users see `LockedCustomizationPanel` — blurred preview of all three
sections + upsell CTA to `/pricing`, matching the existing
`LockedThemePicker` visual pattern from the single-color-picker era.
 
**A `<a>` tag typo (`< a href=...` with stray whitespace) was caught and
fixed during this build** — would have broken JSX compilation.
 
### Part 4 — `CustomizationContent.jsx` (already existed, confirmed correct, unmodified)
 
Wraps `CustomizationPanel` in `SlideOverPanel` (`sidebarWidth={72}`,
`dim={false}`, `widthPercent={50}`) — **NOT** the centered-wide-modal
pattern that ATS Checker/Template Switcher use. This is a **deliberate,
documented exception** to that pattern, explained directly in the file's
own header comment: Customize is a "tweak and watch it change" feature —
a full centered modal would cover the live preview panel entirely, so the
user couldn't see the effect of a color/font change while picking it.
SlideOverPanel opens from the left (next to Sidebar), leaving the
right-side ResumePreview panel unblurred and visible throughout. ATS
Check / JD Match / Templates stay centered modals because those are
"look at a result" panels, not "watch a live change" panels. Already used
v2 tokens correctly (`font-heading`, `text-graphite-ink`, `text-ash`,
`rounded-buttons`, `bg-soft-snow`) — did not need migration.
 
### Part 5 — Template propagation (in progress — Corporate Elite done, 9 remaining)
 
**Corporate Elite is the reference implementation** (same role it already
played for the earlier single-color accentColor + photo rollout). Full
propagation done this session:
 
| Theme field | How Corporate Elite applies it |
|---|---|
| `accentColor` | Sidebar background blend, accent strip, section-heading dot/line, bullet markers, project tech-stack text — unchanged from before |
| `linkColor` | **NEWLY WIRED** — LinkedIn/GitHub/Portfolio link text color in the sidebar. **Was previously hardcoded to a fixed green (`#6ee7b7`)** — this was the literal bug Devansh reported ("sirf background color change karne pe change ho raha hai"), found by reading the actual file rather than guessing |
| `backgroundColor` | Page background — was already wired correctly |
| `textColor` | Primary ink for the light/main content column, with `blendTowardBase()`-derived lighter tints for secondary (`textSecondary`) and body (`textBody`) text — was already wired correctly |
| `headingColor` | **NEWLY WIRED** — section heading text color, light/main-content zone ONLY. Dark sidebar section headings deliberately stay white regardless (same "sidebar is a separate fixed dark-mode zone" rule already applied to `textColor`) |
| `fontFamily` (heading) | **BUG FIXED** — was being used directly as a raw CSS `fontFamily` value assuming `theme.fontFamily` held a full CSS stack string; since the store now stores a KEY (`"georgia"`), this silently produced an invalid font name and was never visibly working. Fixed via `getFontStack(headingFontKey)`, applied to the sidebar `<h1>` name and (via `SectionHeading`) is available for headings generally |
| `bodyFontFamily` | **NEWLY WIRED** — via `getFontStack(bodyFontKey)`, applied as the whole template's base `fontFamily` (was previously reusing the same broken heading-font logic for everything) |
| `headingStyle` | **NEWLY WIRED** — `text-transform: uppercase` on `SectionHeading` when set, via inline style (previously always used a hardcoded `uppercase` Tailwind class regardless of theme) |
| `density` | **NEWLY WIRED** — new local `DENSITY_SCALE` lookup table (`compact`/`balanced`/`spacious` → `{lineHeight, padding, sectionGap, itemGap}`), replacing several previously-hardcoded spacing values (root `lineHeight: "1.5"`, sidebar/main `padding: "30px 28px"`, experience/project list `space-y-3` gap) |
| `dividerStyle` | **NEWLY WIRED** — `SectionHeading` now conditionally renders a short accent line (`'line'`, was the only prior behavior), a 3-dot row (`'dots'`, new), or nothing (`'none'`, new) beneath each section title |
| `photoBorder` | Unchanged, was already wired correctly |
 
**Root-cause pattern for this session's live bug report:** Devansh
reported "sirf background color change karne pe change ho raha hai" (only
background color changes had a visible effect). Rather than guessing, the
actual `CorporateEliteTemplate.jsx` file was requested and read fully —
confirmed `linkColor` was never read at all (hardcoded green), `fontFamily`
was being fed a key where a raw CSS stack was expected (silently
no-op'd), and 5 of the 9 new theme fields (`headingColor`,
`bodyFontFamily`, `headingStyle`, `density`, `dividerStyle`) simply didn't
exist anywhere in the component yet. This matches the project's
established rule (Section 16 #8): ask for the exact file before guessing.
 
**ATS-safety check for the new fields (Devansh asked explicitly this
session):** confirmed none of the new customization axes affect ATS
parsing — colors are visual-only, `dividerStyle`/`density` are
spacing/decoration-only, and `fontOptions.js` deliberately only offers
system/print-safe fonts. `headingStyle: 'uppercase'` uses CSS
`text-transform` (visual only, underlying text content is unchanged, and
most ATS keyword-matching is case-insensitive regardless) — flagged as
low-risk but not zero-risk; `'normal'` remains the safe default if
Devansh wants to be maximally conservative.
 
**Reminder captured for this rollout specifically:** `node
scripts/build-api.mjs` must be run after every template file edit in this
propagation pass, same as any other template-file change — this rollout
touches template files directly, so the rebuild step applies every single
time, not just once at the end.
 
---
 
## 6. FEATURES — WHAT'S BUILT
 
### ✅ Fully Working
*(All items from `AI_HANDOFF_final_7.md` Section 6 remain accurate and are
not re-listed here for brevity — full resume builder, AI bullet
improvement, ATS Checker with ATS-safety warning, PDF download, 10
templates, Cover Letter Generator, Payments, Cloud save/Dashboard/Auth,
Photo Personalization + single-color Accent Theme, local dev tooling.)*
 
- **NEW — Full Resume Customization System (Section 5s), partially
  propagated:** `fontOptions.js`, expanded `resumeStore.js` theme shape
  (persist v3) + `resetThemeField`, `CustomizationPanel.jsx` (3-tab UI:
  Colors/Typography/Layout, 16 presets per color field), confirmed-correct
  `CustomizationContent.jsx` wiring via `SlideOverPanel`. **Corporate
  Elite template fully propagated** — all 9 theme-driven fields wired
  and confirmed working, including 2 real bugs fixed along the way
  (`linkColor` was hardcoded, `fontFamily` was being fed a store key where
  a raw CSS stack was expected).
### ⏳ Pending / In Progress
- **NEW — Propagate the full Customization theme (all 9 fields, not just
  accentColor) to the remaining 9 templates** — Startup Bold is next
  (session in progress), then Creative Edge, then Grid Professional, then
  the other 6. Corporate Elite is the reference implementation; expect
  each template's existing single-field `accentColor`-only wiring to need
  the same audit-and-fix treatment (don't assume `linkColor`/`fontFamily`
  etc. are correctly wired just because `accentColor` is — Corporate Elite
  had 2 real bugs hiding under a working `accentColor`).
- Negative-test screenshot confirmation for ATS-safety warning on a
  `safe`-rated template (carried over, unrelated to this session).
- Decide whether to delete orphaned `ATSCheckPanel.jsx` (carried over).
- Add `accentColor`-only consumption to the 6 templates that don't yet
  have ANY theme wiring at all (i.e. templates behind even the OLD
  single-color rollout) — now effectively folded into the broader
  9-field Customization propagation task above, so these two backlog
  items should be treated as one combined task going forward.
- Razorpay Live Mode (KYC pending).
- Domain purchase (`resumefree.in`).
- Node v24.16.0 → Node v20 LTS downgrade.
- Vercel CLI update.
- **Obsidian Violet v2 design-system migration** — see
  `ResumeFree_DesignSystem_v2.md` Section 6 for the authoritative, current
  phase-by-phase checklist (separate from this Customization feature work;
  do not conflate the two — v2 migration is ResumeFree's OWN UI chrome,
  Customization is the USER'S resume-output theme).
---
 
## 7. SUPABASE SETUP
 
*(Unchanged from `AI_HANDOFF_final_7.md` Section 7.)* `resume.theme`
(including all new Section 5s fields) lives entirely inside the existing
`resumes.data JSONB` column — no new Supabase migration was needed this
session, same reasoning as the earlier `atsRating` addition (client-side
resume data, not a new relational column).
 
---
 
## 8. GROQ AI SETUP
 
Unchanged — `llama-3.3-70b-versatile` via `server.js` proxy, 10K calls/month free.
 
---
 
## 9. RAZORPAY SETUP
 
Unchanged — test mode, pass-based (`sprint`, `placement`, `season`,
`addon_cover_letter`, `addon_jd_tailoring`, `addon_ats`).
 
---
 
## 10. INDEX.HTML — FONT IMPORTS
 
Currently still on Steep-era font imports (DM Serif Display + Inter) per
`AI_HANDOFF_final_7.md` — **v2 migration Step 0 has already swapped this to
Lustria + DM Sans + Martian Mono per `ResumeFree_DesignSystem_v2.md`**;
that document is authoritative for the current actual state of
`index.html`, not the snippet in prior handoff docs.
 
---
 
## 11. BUILDER PAGE LAYOUT
 
Unchanged structurally from `AI_HANDOFF_final_7.md` Section 11 — colors
referenced there are Steep-era and are being superseded file-by-file by
the v2 migration tracked in `ResumeFree_DesignSystem_v2.md`.
 
---
 
## 12. KEY BUGS ALREADY FIXED (don't re-introduce these)
 
*(Full historical list preserved from `AI_HANDOFF_final_3.md` through
`_7.md` — Vercel casing, Supabase URL, modal stacking, `.env` security, ATS
word boundary, JD Matcher hallucination, Footer gap, scroll position,
UpgradeModal pass_type, Cover Letter PDF param bugs, dead dashboard
button, PassConfirmModal payment bypass, the addon chain, the PDF
migration chain, the addon-parity chain, the `payments.amount`
inconsistency, the `returnTo` chain, the stale Vite export cache, the
legacy `payments.plan` column, the UpgradeModal post-login redirect bug,
the stale `api/generate-pdf.js` bundle, the PDF A4 page-height fill bug,
and the `ATSCheckPanel.jsx` vs `ATSContent.jsx` orphan-file confusion.)*
 
### NEW THIS SESSION — `ColorThemePicker.jsx` was discussed as if it existed but never did
A prior session/context discussed and iterated on a file called
`ColorThemePicker.jsx` at length, as if it were the live, wired component.
It was never actually created/saved to disk. This was only caught when
`Sidebar.jsx` → `CustomizationContent.jsx` → `CustomizationPanel.jsx`'s
import chain was traced via `findstr`, and `CustomizationPanel.jsx` turned
out to be missing entirely (not merely unused — genuinely absent from the
filesystem). **Rule going forward: before continuing extensive work on a
named file across a session boundary, do a quick `dir /s /b
<Filename>.jsx` or `findstr` existence check** — this project has now had
two distinct variants of the "wrong/assumed file" failure mode: (1) a real
orphan file that exists but is unused (`ATSCheckPanel.jsx`), and (2) a
phantom file that was discussed/drafted but never actually saved
(`ColorThemePicker.jsx`, this session). Both waste rounds; both are
caught the same way — verify actual filesystem/import-graph state before
trusting conversational memory of "what's already built."
 
### NEW THIS SESSION — Corporate Elite's `accentColor` working masked 2 real bugs in adjacent fields
Because `theme.accentColor` was already correctly wired in
`CorporateEliteTemplate.jsx` from an earlier session, it was reasonable to
assume the broader theme-wiring pattern was sound. It wasn't:
`theme.linkColor` was never read at all (profile links were hardcoded to a
fixed green), and `theme.fontFamily` was being passed directly into CSS
`fontFamily` as if it were a raw stack string — but the store now supplies
a short KEY (e.g. `"georgia"`) meant to be resolved via
`getFontStack()`, so the font silently never applied. **Rule: when
propagating an expanded set of theme/config fields to a component that
already correctly handles a SUBSET of them, audit every field
individually against the actual current file — don't assume "one field
working" implies "the pattern is sound for all fields," especially across
a schema change (raw string → key) that happened after the original
wiring was written.**
 
---
 
## 13. LANDING PAGE ARCHITECTURE
 
Unchanged — see `AI_HANDOFF_final_3.md` Section 13.
 
---
 
## 14. CURRENT TASK STATUS
 
**Two sessions ago:** Shipped the ATS-Safety Transparency System
end-to-end (registry field, Template Switcher badge, ATS Checker
contextual warning, UI-uniformity pass to a wide centered 2-column modal).
 
**Prior session (per `ResumeFree_DesignSystem_v2.md`):** Locked in the
Obsidian Violet v2 design system decisions and completed Step 0
(foundation: `index.html`, `global.css`, `tailwind.config.js`), then began
file-by-file migration — Phase 1 (Navbar/Footer/ScrollToTop) and Phase 2
(Sidebar + all builder forms + ResumePreview) confirmed complete by
Devansh; Phase 3 in progress (TemplateSwitcherContent, ATSContent,
JDMatcher, PhotoEditorPanel confirmed done; ColorThemePicker,
PhotoFeatureShowcaseModal, UpgradeModal, PassConfirmModal still pending
per that document's checklist — note `ColorThemePicker.jsx` entry there
should now be read as referring to the actual customization feature,
i.e. `CustomizationPanel.jsx`/`CustomizationContent.jsx`, since the
originally-named file never existed; `CustomizationContent.jsx` is
already confirmed v2-token-compliant as of this session and can be
checked off).
 
**This session's focus:** Devansh asked for the single-color accent
picker to become a full multi-axis resume Customization System (Colors /
Typography / Layout, 9 theme fields total). Built `fontOptions.js`,
expanded `resumeStore.js`'s theme shape (persist v2 → v3) with a new
`resetThemeField` action, discovered the intended `CustomizationPanel.jsx`
component didn't actually exist on disk (see Section 12's new lesson) and
built it fresh as a 3-tab panel with 16 color presets per field. Confirmed
the already-existing `CustomizationContent.jsx` wiring (SlideOverPanel,
not centered modal — deliberate, documented choice) was correct and
needed no changes. Began template propagation with Corporate Elite as the
reference implementation, found and fixed 2 real bugs
(`linkColor` hardcoded, `fontFamily` fed a key instead of a resolved CSS
stack) while wiring all 9 theme fields, including 3 entirely new pieces
of template logic (a `DENSITY_SCALE` lookup table, a `headingStyle`
uppercase toggle, and a 3-way `dividerStyle` line/dots/none renderer in
`SectionHeading`). Confirmed with Devansh that none of the new
customization axes compromise ATS-safety, and clarified the intentional
boundary between ResumeFree's own v2 brand tokens (UI chrome only) and
`resume.theme` (user's resume output only) when Devansh questioned visual
inconsistency across templates with different default accent colors —
diagnosed as expected/temporary due to incomplete propagation, not a
brand-conflict problem.
 
**Completed this session:**
- **Shipped:** `src/utils/fontOptions.js` — 8 system-safe fonts, 2 groups,
  `getFontStack()` helper.
- **Shipped:** `resumeStore.js` theme shape expansion (5 new fields:
  `headingColor`, `bodyFontFamily`, `headingStyle`, `density`,
  `dividerStyle`) + `resetThemeField` action + persist version 3 with a
  safe deep-merge migration path.
- **Shipped:** `CustomizationPanel.jsx` built from scratch (3 tabs, 16
  presets/color field, font-preview buttons, segmented controls for
  Heading Style/Density/Divider, locked-state upsell for free users).
- **Confirmed correct, unmodified:** `CustomizationContent.jsx` (already
  existed, already v2-token-compliant, deliberate SlideOverPanel choice
  documented in its own header comment).
- **Debugged and fixed (Corporate Elite):** `linkColor` was hardcoded to
  a fixed green — now reads `theme.linkColor` with `accentColor` fallback.
  `fontFamily` was being used as a raw CSS string but the store now
  supplies a key — now resolved via `getFontStack()`, split into separate
  heading-font and body-font resolution.
- **Shipped (Corporate Elite):** `headingColor`, `headingStyle`,
  `density` (new `DENSITY_SCALE` table), and `dividerStyle` (new 3-way
  `SectionHeading` renderer) all newly wired — full 9-field theme
  propagation confirmed working end-to-end on this one template.
**Not done yet (explicitly flagged, in progress):**
- Full 9-field theme propagation to the other 9 templates — **Startup
  Bold is next, session in progress at time of writing this handoff.**
  Creative Edge and Grid Professional after that, per the original
  photo/accentColor rollout order; the remaining 6 templates after those.
- Carried-over items unrelated to this session: ATS-safety negative-test
  screenshot, `ATSCheckPanel.jsx` delete-or-keep decision, Razorpay Live
  Mode, domain purchase, Node/Vercel CLI updates, remaining v2
  design-system migration phases (see `ResumeFree_DesignSystem_v2.md`).
**Next priority (in order):**
1. Propagate all 9 `resume.theme` fields to `StartupBoldTemplate.jsx`
   (in progress) — audit every field individually against the actual file
   content rather than assuming the existing `accentColor` wiring
   generalizes cleanly (per this session's new Section 12 lesson).
   Remember `node scripts/build-api.mjs` after saving.
2. Same for `CreativeEdgeTemplate.jsx`.
3. Same for `GridProfessionalTemplate.jsx`.
4. Same for the remaining 6 templates.
5. Once all 10 templates are propagated, do a full visual pass switching
   between all templates with a few different `theme` configurations to
   confirm no template-specific default-color inconsistency remains (this
   was the concern Devansh raised mid-session — expected to resolve once
   propagation is complete everywhere, but worth an explicit confirmation
   pass rather than assuming).
6. Resume the Obsidian Violet v2 migration checklist from
   `ResumeFree_DesignSystem_v2.md` Section 6 (Phase 3 remainder:
   PhotoFeatureShowcaseModal, UpgradeModal, PassConfirmModal — note
   `CustomizationContent.jsx` can now be checked off, confirmed
   v2-compliant this session).
7. Carried-over items: ATS-safety negative-test screenshot,
   `ATSCheckPanel.jsx` delete-or-keep call, Razorpay Live Mode, domain
   purchase, Node/Vercel CLI updates.
**Workflow:** Devansh pastes the current file → AI redesigns/enhances it
→ Devansh replaces file → screenshots result/tests it → confirm → next
file/feature. This handoff document is updated after every completed
task.
 
---
 
## 15. MONETIZATION
 
Unchanged from `AI_HANDOFF_final_7.md` Section 15 — pass-based pricing,
`utils/passes.js` single source of truth, premium-check patterns.
Customization System follows the SAME `isPremium()` gating pattern as the
original single-color theme picker did — no new gating logic was needed,
`CustomizationPanel.jsx` reuses the existing `isPremium` check.
 
---
 
## 16. HOW TO WORK WITH DEVANSH
 
*(Rules 1–33 unchanged from `AI_HANDOFF_final_7.md` — see that document.
New rules from this session:)*
 
34. **NEW: before continuing substantial work on a named file across a
    session/context boundary, verify it actually exists on disk
    (`dir /s /b <name>` or `findstr`) rather than trusting that prior
    conversation implies it was saved** — this project has now had a
    "discussed but never saved" phantom-file incident (`ColorThemePicker.jsx`,
    this session), distinct from but similar in cost to the earlier
    confirmed-orphan-file incident (`ATSCheckPanel.jsx`).
35. **NEW: when propagating an expanded set of theme/config fields to a
    component where a SUBSET of those fields already worked correctly,
    audit every individual field against the actual current file —
    don't assume one working field implies the whole pattern is sound**,
    especially across a schema change (e.g. a field that used to hold a
    raw value now holding a lookup key) that happened after the original
    wiring was written.
36. **NEW: when a new global default value is introduced (e.g. a new
    default accent color) and Devansh flags visual inconsistency across
    different parts of the app, check whether it's an incomplete-rollout
    symptom before treating it as a new bug** — but always explain the
    actual reasoning rather than just asserting "that's expected."
37. **NEW: ResumeFree's own v2 brand tokens (`ResumeFree_DesignSystem_v2.md`)
    and the user's resume-output theme (`resume.theme`, Section 5s of this
    document) are two deliberately separate systems — never suggest
    applying brand violet/Lustria/etc. to resume template output, and be
    ready to explain WHY (the resume must reflect the student's own
    choices, not ResumeFree's brand) rather than just citing the rule.**
---
 
## 17. QUICK REFERENCE — COMMANDS
 
```cmd
:: Start development (two CMD windows)
node server.js
npm run dev
:: (use `vercel dev -A vercel-dev.json` instead of `npm run dev` if you
::  need to test /api/generate-pdf locally)
 
:: ALWAYS run this after editing templateRegistry.js or ANY file
:: under src/components/templates/ — otherwise /api/generate-pdf keeps
:: silently serving stale bundled code:
node scripts/build-api.mjs
 
:: Verify a component is actually used/imported somewhere before
:: assuming a change "isn't working":
findstr /s /i "import ComponentName" src\*.jsx
 
:: NEW THIS SESSION — verify a file actually EXISTS on disk before
:: continuing work on it across a session/context boundary:
dir /s /b FileName.jsx
findstr /s /i "FileName" src\*.js src\*.jsx
 
:: Git workflow
git add .
git commit -m "your message"
git push origin main
 
:: THIS SESSION's commit message (once Corporate Elite propagation + panel build is fully tested)
git add .
git commit -m "feat: full resume Customization System — expanded theme shape (headingColor, bodyFontFamily, headingStyle, density, dividerStyle), new fontOptions.js + resetThemeField action, rebuilt CustomizationPanel.jsx (3-tab UI, 16 presets/field), fixed 2 real bugs in CorporateEliteTemplate.jsx (hardcoded linkColor, fontFamily fed a key instead of resolved CSS stack), full 9-field theme propagation confirmed on Corporate Elite (reference implementation)"
git push origin main
 
:: Supabase migrations — none needed this session (resume.theme lives in
:: the existing resumes.data JSONB column)
```
 
---
 
*Document generated from active project sessions. Last updated: this
session (Customization System build). Supersedes `AI_HANDOFF_final_7.md`
for feature/file-structure/workflow content; `ResumeFree_DesignSystem_v2.md`
remains separately authoritative for ResumeFree's own UI brand-token
migration. Full historical detail for all prior sessions preserved in
`AI_HANDOFF_final_3.md` through `AI_HANDOFF_final_7.md`.*
*Project by Devansh Gupta — github.com/Devansh-Here*