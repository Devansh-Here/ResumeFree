# ResumeFree — Design System v2 (Codename: "Obsidian Violet")
> Living document. This supersedes the old "Steep" design system. Read this fully before touching any file. Update after every completed step.
 
---
 
## 0. WHY THIS EXISTS
 
The old "Steep" system had a real engineering problem: colors, fonts, radius values, and animation keyframes were **hardcoded inline** (`style={{ fontFamily: "'Inter', sans-serif" }}`, raw hex like `bg-[#0a1628]`) across 30+ files instead of living in one central place. Changing a single brand value meant hunting through the entire codebase.
 
This redesign does two things at once:
1. **Fixes the architecture** — every color/font/radius/animation now lives in `src/global.css` as CSS variables, wired into `tailwind.config.js`. Change a value once, it updates everywhere.
2. **Refreshes the visual direction** — moving from the soft-rounded, navy+emerald "Steep" look to a sharper, more editorial, violet-accented system.
---
 
## 1. REFERENCE & LEGAL BOUNDARY (read this first)
 
**Reference used:** Design tokens (colors, type scale, spacing, radius) were adapted from a publicly-documented design-token extraction of Zams/Obviously.ai's marketing site — a claymation-mascot enterprise AI-hiring product.
 
**What we ARE taking:** color values, font pairing *concept*, spacing scale, radius philosophy, shadow approach. These are generic design primitives — not protectable IP. Thousands of products share similar tokens.
 
**What we are NOT taking, ever:**
- Their mascot illustrations / character designs
- Their logo, wordmark, or exact layout compositions
- Their copywriting or specific component wording
- Any imagery, icons, or illustration style that's specific to their brand identity
**Rule going forward:** wherever ResumeFree needs an illustration, icon set, or character/mascot, it will be **commissioned or AI-generated fresh for ResumeFree** — never copied or lightly-modified from a reference site. If a future task involves imagery, flag this rule before proceeding.
 
**Separate landing-page inspiration (logged, not yet actioned):** Devansh shared a short screen-recording of a different SaaS marketing site (same "Zams" reference) as layout/section inspiration for the eventual Phase 4 (Landing.jsx) work — hero structure, trusted-by logo strip, tabbed feature panels, numbered "how it works" steps, bordered integrations grid, plain testimonial cards, and a CTA-band-fused-to-footer pattern with a giant outlined wordmark at the very bottom. This is purely layout/structure inspiration, captured for later — the same legal boundary above applies (no copied imagery/mascot/copy). Nothing actioned yet; Phase 4 is still far off.
 
---
 
## 2. DECISIONS LOCKED IN (confirmed by Devansh)
 
| Decision | Chosen |
|---|---|
| Shape language | **Sharp** — 4px radius on buttons/cards/inputs, 100px only for pills/badges (was: fully rounded) |
| Typography | **3-font system** — serif headline + sans body + mono labels (was: 2-font) |
| Primary accent | **Iris Violet `#7451f2`** (was: Emerald `#059669`) |
| Architecture | CSS variables in `global.css` → wired to `tailwind.config.js` → components use Tailwind utility classes only, no inline `style={{}}` for anything static |
| **Sidebar/app-chrome background** | **Light** (`soft-snow`/`paper-white`), NOT dark — Devansh explicitly rejected a dark sidebar as feeling more "app-like" than "premium professional tool." Dark is reserved for the Footer/FinalCTA "bookend" sections only. |
 
---
 
## 3. FULL TOKEN SET
 
### 3.1 Colors — Brand & Neutral
 
| Token | Hex | Role |
|---|---|---|
| `--color-iris-violet` | `#7451f2` | Primary accent — filled CTA, active tab/state indicator, links on hover. The ONE chromatic brand color. |
| `--color-deep-iris` | `#5952a1` | Outlined/ghost button border, secondary stroke accent |
| `--color-graphite-ink` | `#272727` | Primary text, headings, CTA button background (dark-filled buttons) |
| `--color-slate` | `#5d5d5d` | Body text, workhorse border tone |
| `--color-ash` | `#4f4f4f` | Secondary text, nav metadata |
| `--color-mauve-dust` | `#a69ea7` | Muted dividers, tertiary borders |
| `--color-fog` | `#858585` | Placeholder text, low-emphasis captions |
| `--color-charcoal-hairline` | `#333333` | Link text, image borders |
| `--color-mist` | `#e0e0e0` | Borders, hairlines, card edges, dividers |
| `--color-soft-snow` | `#f6f6f6` | Card/section surface elevation (one step up from white) |
| `--color-paper-white` | `#ffffff` | Page canvas, dominant background |
| `--color-pure-black` | `#000000` | Max-contrast text/SVG fills only, used sparingly |
 
> **CRITICAL implementation detail (learned the hard way — see Section 7 lesson below):** every color above is stored in `global.css` as **space-separated RGB channels**, e.g. `--color-iris-violet: 116 81 242;` — NOT as a hex string. `tailwind.config.js` maps each one as `'iris-violet': 'rgb(var(--color-iris-violet) / <alpha-value>)'`. This is what makes Tailwind's opacity modifiers (`bg-iris-violet/20`, `border-iris-violet/[0.06]`, etc.) actually work anywhere in the codebase. If a color is ever added to this table, it MUST be added to `global.css` in this same RGB-channel format, or every opacity-modifier usage of it will silently fail (no console error — the utility just won't render).
>
> If you need a raw hex value outside Tailwind (e.g. a literal SVG `stroke` or inline JS style that isn't going through a Tailwind class), either hardcode the hex directly there, or wrap the variable: `rgb(var(--color-iris-violet))`. Never write `var(--color-iris-violet)` directly into a raw CSS property expecting a hex — it will emit invalid CSS now that the variable holds bare numbers.
 
### 3.2 Colors — Semantic / Status (NEW — filling the gap Devansh flagged)
 
> These follow **universal UX convention**, independent of brand accent. Users pattern-match these colors instantly from every major product (banking apps, Gmail, Stripe, etc.) — breaking this convention actively hurts usability, so these are NOT "violet-ified."
 
| Token | Hex | Role |
|---|---|---|
| `--color-success-bg` | `#ecfdf5` | Background wash for success states (payment confirmed, ATS "safe" rating, saved successfully) |
| `--color-success-border` | `#a7f3d0` | Border for success cards/badges |
| `--color-success-text` | `#059669` | Success text/icon color |
| `--color-warning-bg` | `#fffbeb` | Background wash for warnings (ATS "moderate" rating, non-blocking alerts) |
| `--color-warning-border` | `#fde68a` | Border for warning cards/badges |
| `--color-warning-text` | `#b45309` | Warning text/icon color |
| `--color-error-bg` | `#fef2f2` | Background wash for errors (payment failed, validation errors) |
| `--color-error-border` | `#fca5a5` | Border for error cards/badges |
| `--color-error-text` | `#dc2626` | Error text/icon color |
| `--color-info-bg` | `#d6e5ff` | Background wash for neutral info states (tooltips, JD Matcher hints) |
| `--color-info-border` | `#a8c6ff` | Border for info cards |
| `--color-info-text` | `#0072c6` | Info text/icon color |
 
**Rule:** success is always this green, warning always this amber, error always this red — regardless of what the brand accent is. This is the one place where we deliberately do NOT use violet.
 
**Violet-tint surfaces (clarified — no dedicated token needed):** for brand-highlight surfaces that are neither a semantic status nor a neutral card (e.g. the "discovery hint" pattern, §4 and Section 5o carry-forward), use `iris-violet` directly with a Tailwind opacity modifier — e.g. `bg-iris-violet/[0.06] border-iris-violet/25`. This works cleanly now that colors are stored in RGB-channel format (see §3.1). A dedicated `--color-violet-wash` token can be added later if this pattern recurs often enough to warrant it (tracked in §8).
 
### 3.3 Typography
 
| Font | Token | Used For | Google Fonts name |
|---|---|---|---|
| Lustria | `--font-heading` | Headlines, section titles, 20–52px only | `Lustria` |
| DM Sans | `--font-body` | Body text, buttons, nav, forms, labels 9–16px | `DM+Sans:wght@400;500;600;700` |
| Martian Mono | `--font-mono` | Section eyebrows, status pills, uppercase micro-labels ONLY | `Martian+Mono:wght@400;500` |
 
**Type scale** (use these sizes, don't invent new ones):
`9px, 11px, 12px, 14px, 15px, 16px` (body/mono) · `20px, 32px, 36px, 42px, 52px` (headings)
 
**Rule:** Martian Mono is reserved for short, uppercase, tracked-out labels only (e.g. "ATS SAFE", "PREMIUM", "MODERATE ATS") — never body copy, never anything over ~20 characters. This includes builder form section labels (e.g. "FULL NAME", "EDUCATION 1") — these read as micro-labels and correctly take `font-mono`.
 
**Builder form sections specifically:** section headings are **20px** (`sectionHeadingClass`), not 32px — see §4a below on `formStyles.js`. Larger heading sizes (32px+) are reserved for page-level headings outside the builder (landing sections, auth pages, etc.), not per-tab form headers inside the builder.
 
### 3.4 Radius
 
| Element | Value |
|---|---|
| Buttons | `4px` |
| Cards | `4px` |
| Inputs | `4px` |
| Images | `4px` |
| Pills / badges / tags | `100px` (full) |
 
**Exception carried forward from Steep, still valid:** user avatar circles stay `rounded-full` regardless of the sharp shape language — avatars are a universal UX convention exception, same spirit as the semantic status colors in §3.2 not being violet-ified.
 
### 3.5 Spacing (8px base unit)
 
`8, 16, 24, 32, 40, 48, 64, 80, 104` px — use these, avoid arbitrary spacing values.
 
> **Builder form inputs specifically:** use `px-4 py-2` (16px/8px — both clean 8px-scale multiples), not `px-3.5 py-2.5` (14px/10px — off-scale, and this is what caused the Personal Info vs Education field-size mismatch Devansh caught). See §4a.
 
### 3.6 Shadow
 
Only ONE shadow exists in the system, reserved for the primary CTA button:
`--shadow-cta: rgba(0,0,0,0.2) 0px 2px 4px 0px`
No other element gets a shadow. Depth comes from `soft-snow` surface elevation, not shadows.
 
**Confirmed removed this session:** the old Steep-era `boxShadow` on builder form cards (e.g. Education entry cards) has been stripped — those cards now get depth from a `mist` border only, per this rule.
 
---
 
## 4. COMPONENT RULES (carried forward + adapted)
 
- **ONE filled dark (graphite-ink) or violet button per screen** — same "one filled button" rule as before, just new colors.
- Secondary actions = outlined button (`deep-iris` border) or text link — never a second filled button.
- Active tab/state indicator = **iris-violet**, never graphite-ink.
- Form input focus ring = violet, `focus:ring-[#7451f2]/20`.
- **Modal pattern unchanged structurally** — centered wide modal (`rf-modal-in` keyframe) stays the pattern for full panels; `SlideOverPanel` stays for small utility panels. Only the colors/radius inside them change.
- **ATS badge colors** (`safe` / `moderate`) now pull from the new semantic tokens (§3.2), NOT from brand violet — this was already the right instinct in the old system, just re-pointed to new hex values.
- **Toggle/selection pills (e.g. Education Type selector) use `graphite-ink` fill for the active state, NOT violet.** This is a deliberate exception to the "active state = violet" rule above: violet is reserved for navigational/primary active-state indicators (tabs, sidebar nav). A multi-option selector's "currently chosen" state is a different kind of active state, and using violet there would dilute violet's salience as the one primary accent on a screen that may have many such selectors.
### 4a. Shared builder-form style tokens — `src/components/builder/formStyles.js` (NEW)
 
All builder form sections (`PersonalInfoForm.jsx`, `EducationForm.jsx`, and going forward `ExperienceForm.jsx`, `SkillsForm.jsx`, `ProjectsForm.jsx`) must import their heading/label/input/card styles from this single shared file, rather than each defining their own local `inputClass`/`labelClass` constants. This directly prevents the kind of drift Devansh caught (Personal Info's 32px heading vs Education's 22px heading; inconsistent 14px/10px vs other odd padding on inputs).
 
**Exports from `formStyles.js`:**
- `sectionHeadingClass` — 20px, `font-heading`, `text-graphite-ink`
- `sectionSubtextClass` — 12px, `font-body`, `text-ash`
- `labelClass` — 11px, `font-mono`, uppercase, tracked, `text-ash`
- `inputClass` — `px-4 py-2`, 14px, `font-body`, `rounded-inputs`, `border-mist`, violet focus ring
- `cardClass` — `bg-paper-white border border-mist rounded-cards p-4` (no shadow — see §3.6)
- `autoSaveDotClass` / `autoSaveTextClass` — the small "Auto-saved..." footer notice every form section ends with
**Rule going forward:** any NEW builder form section must import from `formStyles.js` from the start, not define local equivalents. If a section genuinely needs a one-off style deviation, that's fine locally, but the shared baseline (headings, labels, standard text inputs, cards) always comes from this file.
 
---
 
## 5. WHAT CHANGES ARCHITECTURALLY (the actual "blunder" fix)
 
Every one of these must move OUT of inline `style={{}}` and INTO either a Tailwind utility class (backed by `tailwind.config.js`) or a shared CSS class in `global.css`:
 
1. `fontFamily` — replace `style={{ fontFamily: "'Inter'..." }}` with `className="font-body"` (or `font-heading` / `font-mono`)
2. Brand hex colors — replace `bg-[#0a1628]`, `text-[#059669]` etc. with `bg-graphite-ink`, `text-iris-violet` etc.
3. Radius — replace `rounded-full` / `rounded-3xl` / `rounded-2xl` with `rounded-buttons` / `rounded-cards` / `rounded-inputs`
4. Duplicated `@keyframes` inline `<style>` tags (`rf-modal-in`, `rf-dot-fall`, `rf-burst`) — delete from `ATSContent.jsx`, `TemplateSwitcherContent.jsx`, `DownloadButton.jsx`, `CoverLetterPage.jsx` — already centralized in `global.css`
5. **NEW — per-section duplicated form-style constants** — replace local `inputClass`/`labelClass` re-definitions in each builder form file with shared imports from `formStyles.js` (§4a)
**What stays inline (this is correct, not a bug):**
- JS-computed dynamic values: `style={{ width: \`${percentage}%\` }}`, `style={{ backgroundColor: accentColor }}` (user-selected), `style={{ animationDelay: '120ms' }}` (staggered lists)
- Conic-gradient `background` values built from multiple literal hex stops (e.g. the sidebar premium-ring animation) — these are decorative multi-stop gradients outside the flat-color token system and are fine as inline `style` objects, re-tinted to the violet family by hand rather than expressed as Tailwind utilities.
---
 
## 6. MIGRATION ORDER
 
Following the existing `ResumeFree_UIUX_Redesign_Plan.md` phase order, but now applying v2 tokens instead of old Steep tokens. Files already "done" under old Steep (Navbar, Footer, ScrollToTop) must be **redone** under v2.
 
**Step 0 — Foundation (do once, blocks everything else):**
- [x] `index.html` — swap font `<link>` tags to Lustria + DM Sans + Martian Mono
- [x] `src/global.css` — replaced with v2 CSS variables + keyframes
- [x] `tailwind.config.js` — replaced with v2 token mapping
- [x] Dev server restarted (`node server.js` + `npm run dev`), confirmed no CSS-related console errors.
- [x] **UPDATE — foundation revised mid-migration:** `global.css` color variables were originally written as hex strings (`#7451f2`), which silently breaks any Tailwind opacity-modifier usage (`bg-x/20`, `border-x/[0.06]`, etc. — no console error, the utility just doesn't render). Converted every color variable to space-separated RGB-channel format (`116 81 242`) and updated every corresponding `tailwind.config.js` color mapping to `rgb(var(--color-x) / <alpha-value>)`. See §3.1's implementation-detail callout and Section 7's lesson below for the full story — this is now the permanent, correct foundation.
**✅ STEP 0 COMPLETE — foundation is live, confirmed stable, and confirmed correct (including the RGB-format fix).**
 
---
 
### SESSION STATUS — read this first in a new session/context
 
**Where we are:** Foundation is done and confirmed correct. Phase 1 (Navbar, Footer, ScrollToTop) is complete. Phase 2 is in progress.
 
**Next immediate step:** Phase 2, next file — `ExperienceForm.jsx`. Must import shared styles from `src/components/builder/formStyles.js` (§4a) rather than defining local `inputClass`/`labelClass` constants, to stay consistent with `PersonalInfoForm.jsx` and `EducationForm.jsx`.
 
**Reminder for whoever picks this up:** at the start of a session, give Devansh the local dev startup commands (`node server.js` in one window, `npm run dev` or `vercel dev -A vercel-dev.json` in another) before starting file work — this is a standing preference, not specific to this redesign. **Also remind: after any change to `global.css` or `tailwind.config.js` specifically, a plain restart may not be enough — a browser hard refresh (`Ctrl+Shift+R`) is part of the standard verify step, escalating to a `node_modules/.vite` cache clear if needed (see Section 7).**
 
**Phase 1 — Shared layout:**
- [x] `Navbar.jsx`
- [x] `Footer.jsx` — background resolved to `graphite-ink` (see §8, item resolved); one follow-up fix applied after the RGB-format foundation change (`stroke: var(--color-iris-violet)` → `stroke: rgb(var(--color-iris-violet))"` in the inline `<style>` block, since the variable no longer holds a bare hex value)
- [x] `ScrollToTop.jsx` *(no changes needed — zero visual/style surface, already v2-compliant as-is)*
**Phase 2 — Builder Core:**
- [x] `Sidebar.jsx` — background flipped from dark (`graphite-ink`) to **light** (`soft-snow` + `mist` border) per Devansh's explicit "clean, elegant, premium — not black" direction (see §2's new locked decision). Premium ring gradient re-tinted from a leftover purple/blue to the violet family. Dropdown shadow removed per §3.6.
- [x] `PersonalInfoForm.jsx` — migrated to v2 tokens; later revised to import from `formStyles.js` (§4a) to fix a heading/input-size mismatch against `EducationForm.jsx`. Discovery-hint card uses a direct `iris-violet` opacity-modifier tint (`bg-iris-violet/[0.06]`) per Devansh's request for a visible purple tint, rather than a neutral surface.
- [x] `EducationForm.jsx` — migrated to v2 tokens; also revised to import from `formStyles.js`. Card `boxShadow` removed per §3.6. "Remove" hover color corrected from a generic Tailwind red to the semantic `error-text` token.
- [ ] `ExperienceForm.jsx`
- [ ] `SkillsForm.jsx`
- [ ] `ProjectsForm.jsx`
- [ ] `ResumePreview.jsx`
**Phase 3 — Premium / Modals:**
- [ ] `TemplateSwitcherContent.jsx` (also: remove duplicated `rf-modal-in` inline `<style>`)
- [ ] `ATSContent.jsx` (also: remove duplicated `rf-modal-in` inline `<style>`; re-point ATS badge colors to §3.2 semantic tokens)
- [ ] `JDMatcherPanel.jsx` / `JDMatcherContent.jsx`
- [ ] `PhotoEditorPanel.jsx`
- [ ] `ColorThemePicker.jsx`
- [ ] `PhotoFeatureShowcaseModal.jsx`
- [ ] `UpgradeModal.jsx` / `PassConfirmModal.jsx`
- [ ] `ATSCheckPanel.jsx` — orphan file, still pending Devansh's delete-or-keep call (unrelated to this redesign, flagged separately)
**Phase 4 — Standalone Pages:**
- [ ] `Landing.jsx` + `landing/` subcomponents (Hero, Features, HowItWorks, Testimonials, FAQ, FinalCTA, PricingSection — **`PricingSection.jsx` needs a full rewrite, not migration, since it barely uses Tailwind classes today**). **Layout/section inspiration logged for this phase — see Section 1's new note on the shared screen-recording reference (hero + trusted-by strip + tabbed feature panels + numbered how-it-works + integrations grid + testimonials + fused CTA/footer with giant outlined wordmark).**
- [ ] `PricingPage.jsx`
- [ ] `ProfilePage.jsx`
- [ ] `AuthPage.jsx` / `AuthCallback.jsx`
- [ ] `CoverLetterPage.jsx` (also: remove duplicated `rf-dot`/`rf-burst` inline `<style>`)
- [ ] `PrivacyPage.jsx` / `TermsPage.jsx`
**Phase 5 — Templates (separate, high caution):**
- Resume templates (`ClassicTemplate.jsx` etc.) are **NOT part of this brand redesign** — they render the user's actual resume output (PDF), not ResumeFree's own UI chrome. Do NOT apply violet/Lustria/Martian Mono to resume templates. Leave template visual design exactly as-is unless Devansh explicitly asks for a template redesign as a separate task.
---
 
## 7. WORKFLOW (unchanged + one new lesson)
 
1. Devansh pastes current file content
2. Claude gives complete file replacement (never a diff), checked against this document's tokens
3. Devansh replaces file, restarts dev server, tests/screenshots
4. Confirm → check off in Section 6 → move to next file
5. If an old Steep value (`#0a1628`, `font-sohne`, `rounded-full` on a card, etc.) is spotted anywhere while working on something else, flag and fix immediately — don't leave it for later
**NEW LESSON (this session) — CSS-variable format changes need a browser cache clear too, not just a dev-server restart.** When `global.css`'s color variables were converted from hex to space-separated RGB channels (required for Tailwind opacity modifiers — see §3.1), a plain dev-server restart alone left a stale, partially-mismatched stylesheet in the browser: the sidebar's premium-button rotating gradient ring rendered as an unclipped blob leaking outside its container, looking exactly like a code bug even though the code was correct. A browser hard refresh (`Ctrl+Shift+R`) resolved it immediately. **Going forward: after any change to `global.css` or `tailwind.config.js` specifically, do a full dev-server restart AND a browser hard refresh as the standard verify step — escalate to clearing `node_modules/.vite` only if that's still not enough.** (This is now also recorded in `AI_HANDOFF_final_4.md` Section 1 and Section 16, since it's a general project lesson, not v2-specific.)
 
---
 
## 8. OPEN ITEMS / NOT YET DECIDED
 
- [ ] Exact violet shade for hover/active states (darker violet on hover — needs a `--color-iris-violet-hover` token, not yet defined). **Interim default in use:** `deep-iris` (`#5952a1`) is being used as the hover-state approximation on filled violet buttons (e.g. Sidebar's "Upgrade to Premium") until this is formally decided — easy single-value swap later.
- [x] ~~Whether resume template thumbnails in Template Switcher should get any v2 chrome treatment around them~~ — not yet reached (Phase 3), still open, leaving unstruck for now.
- [x] **RESOLVED — Footer dark background:** `graphite-ink` (`#272727`) was confirmed as the direct replacement for the old `#0a1628` navy. Footer's decorative glow was re-tinted from emerald to a soft violet (`rgba(116,81,242,0.12)`) to match the new brand accent.
- [ ] **NEW — dedicated violet-wash token:** currently, brand-tinted surfaces (e.g. the Personal Info "photo discovery hint" card) use an inline Tailwind opacity modifier (`bg-iris-violet/[0.06]`) rather than a named token. This works fine and required zero new tokens, but if this pattern recurs across several more components, consider promoting it to a proper `--color-violet-wash` / `--color-violet-wash-border` token pair for a shorter class name and clearer intent. Not urgent — revisit if/when it comes up a third or fourth time.
- [ ] Dark navy `#0a1628` fully retired or kept anywhere intentionally — **now effectively resolved by the Footer decision above**; no remaining intentional use of the old navy is expected anywhere in the v2 system.
---
 
## 9. BACKLOGGED FEATURE IDEAS (raised mid-session, explicitly deferred until v2 design system migration is complete)
 
> Devansh raised these while reviewing the design system plan. Both are good ideas, deliberately NOT bundled into this redesign to keep scope clean (per the project's own established lesson: "don't stack unrelated changes onto an active session"). Sequence: finish design system migration first → then GitHub autofill → then mascot (mascot benefits from a stable, finished visual system to be designed against).
 
### 9a. Social profile autofill (GitHub first, LinkedIn later)
- **Concept:** user enters GitHub username (and eventually LinkedIn) → form auto-populates project descriptions, bio, skills — reduces manual typing friction. Manual entry always remains available; autofill is optional/skippable, never forced.
- **GitHub:** feasible via GitHub's public API (username → public repos, bio, pinned projects) — no paid access needed. Good first candidate.
- **LinkedIn:** ⚠️ known constraint — LinkedIn has heavily restricted third-party profile-data access in recent years. "Sign in with LinkedIn" typically only returns basic name/email, not full experience/education history, unless going through LinkedIn's restricted official-partner program. Needs a dedicated feasibility check before committing to this as a feature — do not assume full data access is possible until verified against LinkedIn's current API docs.
- **Status:** Not started. Do after design system migration (Section 6) is complete.
### 9c. Brand rename — ResumeFree → Rezumo
- **Status:** Logged only, explicitly NOT actioned right now. Devansh's instruction: focus stays 100% on the design system migration; rename must not risk breaking anything mid-migration.
- **Domain:** Devansh wants to acquire a Rezumo-based domain (e.g. `rezumo.in`) — not yet decided/purchased. Current live domain (`resumefree-flame.vercel.app`) stays as-is until this is actioned.
- **Scope (when actioned):** deliberately not yet decided how deep — could mean user-facing text only (navbar, page titles, footer, meta tags) or a full codebase rename (variables, file names, comments). This needs its own explicit decision when the rename is actually picked up — do not assume either scope.
- **Efficiency note for later:** since the rename primarily touches the same files as this design migration (Navbar, Footer, `index.html`, page titles), it may be efficient to fold the rename into the *tail end* of the design migration (Phase 4, once the system is stable and confirmed working) rather than a fully separate pass — but this is a suggestion for later, not a decision made now.
### 9d. Mascot companion during resume building
- **Concept:** an original (non-copied, ResumeFree-owned) mascot character that stays alongside the user while they build their resume — offers contextual suggestions, reacts positively ("appreciates") when the user improves something (e.g. adds a metric to a bullet, fills a weak section), similar in spirit to a friendly build companion.
- **Legal note:** ties directly into Section 1's rule — this mascot must be designed fresh for ResumeFree (commissioned or AI-generated), never adapted from the Zams/Obviously reference, the newer landing-page-inspiration reference (Section 1), or any other existing brand's character.
- **Design dependencies:** needs (1) an original character design, (2) a small set of emotional/reaction states (idle, suggesting, pleased), (3) trigger logic for when it speaks up vs. stays quiet, (4) copy/personality voice consistent with ResumeFree's brand.
- **Status:** Not started. Deliberately sequenced AFTER the v2 design system is fully migrated and stable, so the mascot's visual style can be designed to match the finished look rather than guessing at it mid-migration.
---
 
*Document created to lock in the v2 design system before file-by-file migration begins. Supersedes `ResumeFree_UIUX_Redesign_Plan.md` for token values; that document's phase/file order and workflow rules still apply.*