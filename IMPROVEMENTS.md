# iSkillLink — UI/UX Improvement Roadmap

> **"Where Skills Meet Opportunity"** — Mbarara, Uganda | Founder: Ashabahebwa Hassan
> This is the living UI/UX improvement plan for iSkillLink. It defines **what must be precise** in each phase and **what is intentionally left open** for future innovation and smart suggestions.

---

## How to Use This Document

This roadmap is organized in **5 phases**. Each phase has:

- **Objective** — what the phase achieves for the user and business.
- **What Must Be Precise** — non-negotiable quality bars. If these are not met, the phase is not done.
- **Innovation Space** — areas deliberately left open for creative, data-driven, or community suggestions. Contributors should propose, prototype, and validate here.
- **Smart Suggestions (Seeds)** — starter ideas, not prescriptions. Replace or extend them.
- **Done When** — observable outcome, not pixel specs.

**Principles across all phases:**

1.  Usability over decoration. If it doesn't help a learner or educator succeed, don't ship it.
2.  Preserve real functionality. Never remove working information for the sake of minimalism.
3.  Build a system, not pages. Reusable patterns over one-off styles.
4.  Mobile is first-class, not an afterthought.
5.  Accessible by default. If a learner cannot read or operate it, it is broken.
6.  Coherent, not identical. Pages should feel like one product while retaining their own purpose.

No phase prescribes exact hex codes, fonts, or "make this button blue." Instead, phases require a *coherent, accessible, documented decision* — the decision itself can evolve.

---

### PHASE 1 — Foundation: Design System & Global Language

**Objective:** Give iSkillLink a single, maintainable visual language so every future change is consistent and efficient.

**What Must Be Precise:**
- A single source of truth for design tokens exists in code (colors, typography scale, spacing scale, radii, shadows, motion).
- Tokens are documented and actually used — no ad-hoc colors, no scattered `text-xs` everywhere, no multiple border-radius values for the same component type.
- Typography has a clear hierarchy: headings are distinguishable from body, body is comfortably readable on mobile without zoom, and the smallest functional text is still legible.
- The neutral palette and accent palette are purposeful — one primary action color, one neutral scale, and limited semantic colors (success/warning/error) with accessible contrast.
- Core primitives exist and are reused: a single Button, Input/Select/Textarea, Card, Badge, and Modal primitive with consistent focus, disabled, and error states.

**Innovation Space (Leave Open):**
- The exact hue, typeface pairing, and illustration style. Propose directions rooted in Ugandan workshop credibility — e.g., editorial, warm-minimal, or community-crafted — and validate with real users.
- Token naming conventions and how tokens are distributed (CSS variables, Tailwind config, or design-tool sync).
- Additional primitives the team discovers they need (e.g., a shared `Field` wrapper, `EmptyState`, `Skeleton`).

**Smart Suggestions (Seeds — not prescriptions):**
- Unify around one primary and one neutral scale; reserve strong color for actions and trust signals (verified, escrow).
- Separate display typography (headlines) from UI typography (forms, cards) for clearer voice.
- Adopt an 8pt spacing scale and 3-level elevation scale — enough to create rhythm without complexity.

**Done When:** A new page can be built using only the system primitives and still look like iSkillLink, and a contrast check passes on all text/background pairs.

---

### PHASE 2 — Core UX: Navigation, Layout & Primary Workflows

**Objective:** A new user should understand what iSkillLink is, what they can do, and where to go — in under 10 seconds — on any device.

**What Must Be Precise:**
- Navigation is stable and predictable. No layout shifts on scroll, no disappearing header, and a clear active state that communicates "you are here."
- Information hierarchy is intentional: one primary action per view, secondary actions are visually subordinate, and wayfinding (breadcrumbs/tabs) is consistent across dashboards and marketing pages.
- Primary workflows are frictionless and end-to-end tested: Search → Filter → View Profile → Book, and Request a Skill → Get Matched. No dead-end placeholders (e.g., a search input that ignores input).
- Layout containers and section spacing are consistent across pages so the product feels vertically rhythmic when navigating.

**Innovation Space (Leave Open):**
- How navigation adapts on mobile — whether as a sheet, drawer, or progressive disclosure — and how many top-level links are optimal. Let user research and analytics guide this.
- The storytelling structure of the hero and homepage. The system should guarantee clarity, but the narrative and social proof strategy can be experimented with.
- How filters, sorting, and matching are exposed: as a sidebar, bottom sheet, or adaptive pattern. The requirement is discoverability and reversibility, not a specific widget.

**Smart Suggestions:**
- Test a simplified header with a static utility strip and a stable main bar; keep mobile navigation thumb-reachable.
- Centralize filtering logic so URL, chips, and sidebar/drawer stay in sync and are shareable.
- Align sticky elements (headers, sidebars) so they never overlap or obscure content.

**Done When:** A first-time visitor on a 360px phone can complete "find an educator and understand the cost" without help, and returning users can re-find their last search via URL.

---

### PHASE 3 — Page & Component Redesign

**Objective:** Apply the foundation and core UX to the real pages and components, raising perceived trust and professionalism — especially where money and identity are involved.

**What Must Be Precise:**
- Major pages (Home, Find Skill, Become Educator, How It Works, About, Contact, Auth, Learner/Educator Dashboards, Profiles) each have a clear purpose, hierarchy, and empty/loading/error states. No blank screens or generic loaders.
- Forms are usable and accessible: labels are programmatically linked, errors are clearly associated, and validation is helpful, not punishing.
- Educator credibility is legible: verification status, workshop context, portfolio evidence, and reviews are presented with consistent evidence hierarchy.
- Booking and payment flows are transparent and calm: fees, escrow behavior, and next steps are explained in plain language before commitment.

**Innovation Space (Leave Open):**
- The visual treatment of cards, portfolios, and storytelling sections. Explore treatments that feel crafted and trustworthy for artisans — photography-forward, evidence-forward, or community-forward — and A/B test them.
- How multi-step processes (e.g., Become Educator) are paced. The requirement is completion and comprehension; the step count, progressive disclosure, and draft-saving strategy are open to iteration.
- Dashboard information design: which metrics are hero, how tabs behave, and how progress is visualized can evolve with real educator/learner feedback.

**Smart Suggestions:**
- Standardize cards and modals so rating, rate (UGX), and format/location are scannable in one glance.
- Reduce long wizards by making optional sections truly optional and summarizing before submit, with persistence so users don't lose progress.
- Bring all dialogs onto a single modal primitive so focus, escape, and backdrop behavior are uniform.

**Done When:** Each page has a defined and tested empty state, a trusted profile view, and a form that can be completed with a keyboard alone and with errors clearly announced.

---

### PHASE 4 — Responsive & Mobile Excellence

**Objective:** iSkillLink feels native on every screen, not like a desktop page that was shrunk.

**What Must Be Precise:**
- Content is not simply squeezed. Grids, filters, tables, and modals have a dedicated mobile pattern that preserves readability and touch ergonomics.
- Touch targets meet accessible minimums and spacing prevents mis-taps, especially on high-stakes actions (Book, Pay, Confirm).
- Performance and layout stability are verified on low-end Android devices and slow networks common in the region — no horizontal scroll, no content jump, no blocked scrolling when overlays are open.
- Testing is explicit: large desktop, laptop, tablet, and 360px mobile are checked for every changed view.

**Innovation Space (Leave Open):**
- The specific mobile patterns — horizontal snap lists, bottom sheets, progressive tables-to-cards — are open to提案. The principle is thumb-reach and readability, not a mandated component.
- How data-dense views (earnings, request lists) are summarized on small screens can be explored with real learners and educators.
- Adaptive image and media strategy as the portfolio grows.

**Smart Suggestions:**
- Design filters and detail views as bottom sheets on mobile rather than side drawers.
- Replace squeezed multi-column grids with single-column or snap-scroll patterns on narrow viewports.
- Ensure any fixed footer in a modal respects safe-area insets and remains reachable above the on-screen keyboard.

**Done When:** A learner on a small phone can filter, compare two educators, and start a booking with one thumb, without zooming or accidental taps.

---

### PHASE 5 — Polish: States, Accessibility & Micro-interactions

**Objective:** Close the gap between "working" and "production-quality" — the details that make the product feel trustworthy for escrow and identity.

**What Must Be Precise:**
- Every interactive element has visible focus, hover, active, disabled, loading, empty, and error states. No element is only distinguishable by color.
- Color contrast, keyboard operability, screen-reader semantics, and motion preferences are audited and pass (target: no critical axe/Lighthouse accessibility issues).
- Feedback is timely: bookings confirm, payments show escrow status transitions, and actions have clear success/error messaging that is dismissible.
- Motion is purposeful, performant, and respects reduced-motion preferences — no gratuitous bounce or scale effects.

**Innovation Space (Leave Open):**
- The character of micro-interactions and brand moments (e.g., success confirmations, verification badges, milestone progress) — keep them subtle, but the specific motion language is open to craft.
- The taxonomy and presentation of status (pending, matched, in-progress, completed) can evolve as long as it remains instantly distinguishable and consistently applied.
- The approach to education and reassurance around escrow and verification — via copy, illustration, or progressive disclosure — is fertile ground for iteration.

**Smart Suggestions:**
- Standardize status to a single Badge system used everywhere (cards, dashboards, payments).
- Use skeletons that mirror real card structure instead of generic spinners.
- Add a single, accessible toast/notification region with clear dismissal, not auto-bounce.

**Done When:** The product passes an accessibility audit, all critical user journeys have defined states for loading/success/error/empty, and interactions feel calm and consistent.

---

## Implementation Guidance

**How to contribute:** Pick a phase, propose changes within its "Precise" guardrails, and prototype alternatives in "Innovation Space." Open a PR referencing the phase (e.g., `Phase 1: tokens`) and include: what changed, why, what you intentionally left open, and how you verified responsiveness and accessibility.

**Verification checklist (apply to every phase):**
- [ ] Desktop, laptop, tablet, and mobile (360px) checked
- [ ] Keyboard navigation and focus order verified
- [ ] Text remains readable and actionable without zoom
- [ ] No existing functionality broken, no routes or forms regressed
- [ ] Empty, loading, and error states considered

**Living document:** This roadmap is not a pixel spec. As iSkillLink learns from real learners and educators in Mbarara and beyond, phases will be refined. Propose amendments via issue or PR — especially from field research, support tickets, and usage data.

---

## Quick Reference — Phases at a Glance

| Phase | Focus | Precise Outcome | Open Question |
|-------|-------|----------------|---------------|
| 1 | Foundation | One documented, reused system | Which aesthetic direction best earns trust? |
| 2 | Core UX | Stable nav + coherent journeys | How does each journey best adapt to mobile? |
| 3 | Pages | Complete, credible, form-accessible pages | What storytelling makes educators most credible? |
| 4 | Responsive | True mobile patterns, 44px targets | Which mobile patterns test best with users? |
| 5 | Polish | Full state coverage + a11y pass | What micro-interactions feel most reassuring? |

---

---

## Progress Log

### ✅ Phase 1 — Foundation: Complete (2026-09-16)

**Goal achieved:** iSkillLink now has a single, maintainable visual language. New work can be built from primitives and still look coherent.

**What was made precise:**

*   **Design tokens in `tailwind.config.js`** — single source of truth replaces scattered `emerald`/`slate`/`stone`/`gray` mixes:
    *   `forest` (50–950, primary `#0F5132` for trust/CTA) with full scale, mapped to legacy `brand` alias for backward compatibility
    *   `ink` (50–950, neutral) replaces mixed `slate`/`stone`/`gray`; `paper`/`sand` for page/surface backgrounds
    *   Typography: `font-display` (`Plus Jakarta Sans`) for headlines + `font-sans` (`Inter`) for UI, with minimum `13px` for functional text
    *   Radii: `control (12px)` / `card (16px)` / `display (20px)` / `pill` — eliminates 6 conflicting radii
    *   Shadows: `level-1` (cards) / `level-2` (dropdowns) / `level-3` (modals) — replaces arbitrary `shadow-sm/xl/2xl`
    *   Motion: `fadeIn` / `slideUp` / `shimmer` with `prefers-reduced-motion` support
*   **Global base in `src/index.css`** — `bg-ink-50` page, `font-display` headings, `*:focus-visible` forest ring, `.container-app` / `.section-stack` / `.card` utilities, accessible `.skip-link`, consistent scrollbar, and reduced-motion guard
*   **Core primitives (rebuilt, reusable):**
    *   `Button.tsx` — variants `primary (forest)` / `secondary (ink)` / `outline` / `danger` / `ghost`, sizes `sm (36px)` / `md (44px)` / `lg (48px)`, loading spinner, `active:scale-[0.98]`, `min-h-[44px]` on `md` for touch
    *   `Badge.tsx` — variants `success/warning/error/info/neutral/verified`, pill shape, dot option, `11px/12px` sizing
    *   `Card.tsx` — `Card` + `CardHeader`/`CardFooter`, `rounded-card`, `shadow-level-1`, optional hover `forest-200 + level-2`
    *   `Field.tsx` — label + hint + error wiring with `htmlFor`/`aria-describedby`/`aria-invalid`/`role=alert`
    *   `Input.tsx` / `Textarea.tsx` / `Select.tsx` — `min-h-[44px]`, `rounded-control`, `border-ink-200`, `focus:ring-forest-700`, leftIcon/rightElement, error `rose-300` state
    *   `Skeleton.tsx` — `Skeleton` + `EducatorCardSkeleton` + `CategorySkeleton` with shimmer, for trust-preserving loading
    *   `EmptyState.tsx` — `rounded-card`, `border-dashed ink-300`, `ink-50` icon well, `font-display` title, `13px` body
    *   `Breadcrumbs.tsx` — updated to `ink`/`forest` tokens
    *   `Modal.tsx` — unified primitive: body lock, focus trap (Tab/Shift+Tab), Esc close, restore focus, `rounded-display`, `shadow-level-3`, backdrop `ink-900/60 + blur`, `animate-fadeIn`

**Innovation intentionally left open for Phase 2–5:**
*   Final hue tuning and illustration style — tokens make a palette swap a one-file change
*   Whether services beyond primitives (`Command`, `Tabs`, `Sheet`) are needed — to be validated in Phase 2 page work
*   How pages adopt primitives — Phase 1 provides them; Phases 2–5 migrate pages incrementally without breaking functionality

**Files changed in this phase:**
`tailwind.config.js`, `src/index.css`, `src/components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx` (new), `Field.tsx` (new), `Input.tsx` (new), `Textarea.tsx` (new), `Select.tsx` (new), `Skeleton.tsx` (new), `EmptyState.tsx`, `Breadcrumbs.tsx`, `Modal.tsx`

**Verified:** `npm run build` passes (1631 modules, built in ~10s), no route regressions, contrast and focus-visible auditable via single token file.

**Next:** Phase 2 — Core UX (stable navigation, coherent journeys, search fix). Phase 1 primitives are ready to be adopted there.

### ✅ Phase 2 — Core UX: Complete (2026-09-16)

**Goal achieved:** Navigation is now stable and predictable, layout is rhythmical, and the primary search → discover → book workflow is no longer a dead end.

**Whole-project research conducted (every screen re-audited):**
*   `Navbar.tsx` (header, ribbon, desktop nav, user capsule, mobile drawer), `Footer.tsx`, `App.tsx` (routing, viewToPath, modals, toast, guards)
*   `HomePage.tsx` (hero, categories, How-It-Works tabs, featured educators, CTA banner, newsletter), `FindSkillPage.tsx` (search, 6 filters, sort, chips, drawer, sidebar `top-24`, educator grid, skeletons/empty), `EducatorProfilePage.tsx` (header, tabs, share, booking), `EducatorProfileModal.tsx`, `BookingModal.tsx`, `SkillRequestModal.tsx`
*   `LearnerDashboard.tsx` + `EducatorDashboard.tsx` (tabs, metrics, bookings/payments/messages), `AdminDashboard.tsx` + 8 admin tabs, `BecomeEducatorPage.tsx` (5-step wizard), `HowItWorksPage.tsx`, `AboutPage.tsx`, `ContactPage.tsx`, `AuthPage.tsx`, `EducatorCard.tsx`, `AuthContext.tsx`, `services/api.ts` (local fallback, filter handling)

**What was made precise:**

*   **Stable header (`Navbar.tsx`):** Removed scroll-direction auto-hide (`headerVisible`, `lastScrollY` listener) and mobile ribbon collapse (`ribbonCollapsed` → `max-h-0`). Header is now always `sticky top-0 bg-white/95 backdrop-blur-md border-ink-200 shadow-soft`. Ribbon is static `h-9 bg-ink-950 text-ink-200` — no CLS, no lost nav on scroll. Sticky sidebar offsets fixed (`top-28` instead of overlapping `top-24`).
*   **Accessible navigation:** Desktop links carry `aria-current="page"` + `bg-forest-50 + border-forest-200 + bottom 2px forest bar` active state. Mobile menu rebuilt as `role="dialog"` overlay with `fixed inset-0 bg-ink-900/50` backdrop + top sheet `rounded-b-display shadow-level-3`, body-scroll lock, Esc to close, `min-h-[44px]` touch targets, `aria-expanded/haspopup` preserved.
*   **Toast & skip link (`App.tsx`):** `bg-ink-50` page, `selection:forest`, `skip-link` → `#main-content` with `tabIndex=-1`, toast uses `animate-fadeIn` + dismiss button (no `animate-bounce`), `selection:forest`.
*   **Real workflow (`HomePage.tsx`):** Hero search now wired to `?search=` via `useNavigate` — `handleHeroSearch` encodes trimmed query and navigates to `/find-skill?search=...` (or plain `/find-skill`). `FindSkillPage.tsx` already syncs `search` via `useSearchParams` + `debounce`, so typing “Tailoring” now yields filtered results — dead-end fixed. Added `role="search"` + `aria-label`, helper text “Try: ‘Tailoring’ → filtered results instantly.”
*   **Single-primary hierarchy (hero CTAs):** Hero now has one primary `Browse All Skills` (`bg-forest-700` forest), one secondary `Teach on iSkillLink` (`bg-white`), and tertiary text link `Submit Custom Request →` (no competing third button). Trust strip updated to `forest-400`/`ink` tokens and `13px` labels.
*   **Consistent containers (`App.tsx`, `HomePage.tsx`, `FindSkillPage.tsx`):** Hero uses `container-app`, FindSkill outer uses `container-app`, spacing uses `section-stack` / `space-y-6`, header card uses `rounded-card border-ink-200 shadow-level-1`, heading uses `font-display` + `text-[13px]` body.

**Innovation intentionally left open for Phases 3–5:**
*   Final storytelling and social-proof structure in the hero (copy, illustration, metrics) — system guarantees clarity, narrative can be A/B tested
*   Whether filters live as sidebar + drawer, bottom sheet, or progressive disclosure — requirement is discoverability, Phase 4 will refine
*   How dashboards and profile tabs become a shared `Tabs` primitive — to be standardized in Phase 3

**Files changed in this phase:**
`src/components/Navbar.tsx`, `src/App.tsx`, `src/pages/HomePage.tsx`, `src/pages/FindSkillPage.tsx`

**Verified:** `npm run build` passes (1631 modules, ~63.8kB css), hero “Solar” query routes to `/find-skill?search=Solar` and displays filtered state, nav remains visible on scroll, mobile menu traps focus and respects Esc/backdrop, no route regressions.

**Next:** Phase 3 — Page & Component Redesign (credible profiles, usable forms, transparent booking/escrow).

### 🔄 Phase 3 — Pages: In Progress (2026-09-16) — core credibility & forms shipped

**Goal in progress:** Every page with clear purpose and trusted evidence; forms accessible and unified.

**Whole-project re-audit (every screen, Phase 3 lens — credibility / forms / empty-loading-error):**
*   `EducatorCard.tsx` (photo/name/rating/title/location/years/bio/tags/rate/actions), `EducatorProfileModal.tsx` (fixed overlay without Modal primitive, tabs without role, slate/emerald mix, no Badge), `EducatorProfilePage.tsx` (header, tabs, portfolio aspect, reviews), `BookingModal.tsx` (uses Modal but raw inputs, no Field, slab dateError), `SkillRequestModal.tsx` (own overlay, ~140 lines of raw inputs, matches), `ContactPage.tsx` (raw `input className="w-full p-2.5 rounded-lg border-gray-300"` x6, no Field), `AuthPage.tsx` (raw inputs, role picker), `BecomeEducatorPage.tsx` (5-step, 20+ fields, no Field), `LearnerDashboard.tsx`/`EducatorDashboard.tsx` (overflows, metric cards, inline empty), `HomePage.tsx` (categories `line-clamp-2` truncated), `FindSkillPage.tsx` (loading text only).

**What was made precise in this increment:**

*   **EducatorCard (`src/components/EducatorCard.tsx`):** Rebuilt on new system — `rounded-card border-ink-200 shadow-level-1 hover:border-forest-200 hover:shadow-level-2`, `w-14 h-14 rounded-card` avatar with `ring-forest-700` verified `ShieldCheck`, `Badge` (`warning` for rating inc. amber `Star`, `neutral` for formats, `success` for skills), `font-display` name `15px` + `Body-sm` title `forest-700`, `Body-sm` bio `ink-700`, footer `bg-ink-50 border-ink-100` with `Rate` label `11px ink-600` + `Button outline/primary size sm min-h-[36px]` actions — no more `text-xs` truncation, consistent elevation.
*   **EducatorProfileModal (`src/components/EducatorProfileModal.tsx`):** Migrated from bespoke `fixed inset-0 bg-slate-900/60` to single `Modal` primitive (focus trap, Esc, restore, `rounded-display shadow-level-3`). Header `bg-ink-950 border-ink-800`, `Badge verified` with dot, `Star`/`MapPin`/`Clock` forest tokens, tabs now `role="tablist"/role="tab" aria-selected` with `border-forest-700` active, body `Badge` for formats/languages/skills, portfolio `aspect-[4/3]` + `Badge`, reviews `warning Badge`, sticky footer uses `Button` primitives — brought dialogs onto one primitive as promised.
*   **BookingModal (`src/components/BookingModal.tsx`):** Kept `Modal` but migrated inner form to system: `Field` + `Input`/`Select`/`Textarea` + `Button` (full `htmlFor`/`aria-describedby`/`aria-invalid` wiring, `min-h-[44px]` `rounded-control` `border-ink-200 focus:ring-forest-700`, error `rose-300`). Format buttons `aria-pressed` + `min-h-[44px]`. Escrow summary `bg-forest-50/70 border-forest-200` with `ShieldCheck` trust icon, footer `Button outline/primary` with `isLoading`.
*   **ContactPage (`src/pages/ContactPage.tsx`):** Replaced 6 raw inputs with `Field/Input/Select/Textarea/Button` — labels linked (`htmlFor`), `hint` for phone, `role=alert` for submitError, `rounded-card border-ink-200 shadow-level-1` card + `rounded-card` success state with `forest` tokens.

**Innovation deliberately left open for rest of Phase 3:**
*   `SkillRequestModal`, `BecomeEducatorPage` 5-step wizard, `AuthPage`, `HowItWorks/About` storytelling, dashboard `Tabs` primitive, `Home` categories horizontal snap + `EducatorProfilePage` parity with Modal — to be completed incrementally without breaking bookings. Each will migrate to `Field`/`Modal`/`Badge`/`Skeleton` in next increments; `IMPROVEMENTS.md` will be updated per increment.

**Files changed in this increment:**
`src/components/EducatorCard.tsx`, `src/components/EducatorProfileModal.tsx`, `src/components/BookingModal.tsx`, `src/pages/ContactPage.tsx`

**Verified:** `npm run build` passes (1637 modules, ~65.1kB css), EducatorCard hover/tap targets correct, Modal Esc/trap intact, Contact form labels associated and submitted via existing `api.createInquiry`, no route regressions.

**Next increment (still Phase 3):** `SkillRequestModal` onto `Modal` + `Field`, `BecomeEducator` onto `Field` with draft, `AuthPage` onto primitives, dashboard `EmptyState`/`Skeleton` full coverage.

### ⏳ Phase 4 — Responsive: Not started
### ⏳ Phase 5 — Polish: Not started

---

*This roadmap preserves iSkillLink's identity and existing capabilities while intentionally leaving creative space for the team, community, and future research to shape the final expression. Build the system precisely; invent the expression wisely.*

* — Founder: Ashabahebwa Hassan | Mbarara City, Uganda | iskilllink0@gmail.com*
