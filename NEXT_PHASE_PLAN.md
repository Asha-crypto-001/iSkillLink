# iSkillLink — Next Phase Plan (Post Sync to `iSkillLink-`)

> **Date**: 2026-09-16  
> **Repo**: `https://github.com/Asha-crypto-001/iSkillLink-.git` (migrated from `arena_ai`)  
> **Current Head**: `d360780` — Security hardening (Iteration 1) + Admin modularization (Iteration 6 partial) synced  
> **Plan Owner**: Ashabahebwa Hassan — Founder & Platform Administrator, Mbarara City

---

## 0. Sync Summary (Completed 2026-09-16)

| Action | Detail | Status |
|---|---|---|
| `git remote set-url origin` | `https://github.com/Asha-crypto-001/iSkillLink-.git` | ✅ Done |
| `git fetch` / divergence detection | Remote had 3 forward commits (`f55766f`, `bbc5a77`, `a0cb456`) not in local `17664c7` | ✅ Detected |
| `git reset --hard origin/main` | Preserved Iteration 1 security work (bcrypt, JWT, RBAC, helmet, rate-limit) + Iteration 6 modularization | ✅ Done |
| README clone URL | `arena_ai` → `iSkillLink-` (`git clone https://github.com/Asha-crypto-001/iSkillLink-.git` + `cd iSkillLink-`) | ✅ Committed `d360780` |
| Deployment docs cleanup | Honored intentional removals of `NETLIFY_DEPLOYMENT_GUIDE.md`, `.github/workflows/deploy.yml`, `netlify.toml` per `bbc5a77` — not re-added | ✅ Intentional |
| Push | `d360780` pushed to `origin/main` (`a0cb456..d360780`) | ✅ Done |

No further sync actions required. Local `main` is now `origin/main`.

---

## 1. Strategic Sequencing: Why Iteration 2 Is Next

### Current Tracker State (`IMPROVEMENTS.md:12-18`)

| Iteration | Title | Status |
|---|---|---|
| **1** | Security Hardening & Session Integrity | 🟢 Completed |
| **2** | URL Routing & Navigation Architecture | 🟡 Planned → **Proposed 🔵 In Progress** |
| **3** | Mobile Experience & Responsive Layouts | 🟡 Planned |
| **4** | Form Usability & Input Validation | 🟡 Planned |
| **5** | Accessibility (a11y) & Interaction Design | 🟡 Planned |
| **6** | Code Modularization & Architecture Cleanup | 🟢 In Progress (6.1-6.3 ✅, 6.4-6.5 ⬜ remaining) |

**Decision:** Advance **Iteration 2** as the immediate next phase, deferring **6.4 (Binary Media Upload)** and **6.5 (Relational DB Migration)** to Phase 6b.

**Rationale:**

1. **User Value / Uganda Context** — `src/App.tsx:23` uses in-memory `useState<string>('home')` for navigation. This breaks:
   - WhatsApp sharing of educator profiles (`/educators/:id` deep links are impossible — mentorship referrals are WhatsApp-first in Uganda)
   - Browser Back/Forward, page refresh (resets to `home`), bookmarks, SEO indexing
   - Catalog filter sharing (`/find-skill?category=fashion&location=mbarara`)

2. **Low Risk, High Leverage** — Iteration 2 is frontend-only (no DB migration risk), unlocks Iteration 3 (mobile drawers need route-aware scroll lock) and Iteration 5 (a11y breadcrumbs need routes).

3. **Infrastructure Stability** — Iteration 1 + 6.1-6.3 just landed (12 files, JWT, RBAC). Stabilizing navigation before touching storage (6.4/6.5) avoids compounding DB + routing regressions.

**Proposed Order:**
```
Phase 2 (Iteration 2) → Phase 3 (Iteration 3 Mobile) → Phase 4 (Iteration 4 Forms) →
Phase 5 (Iteration 5 a11y) → Phase 6b (Iteration 6.4/6.5 Storage)
```

---

## 2. Iteration 2 — Scope & Goals

**Title:** URL Routing & Navigation Architecture  
**Focus:** Replace `currentView` state switching with declarative, bookmarkable URL routes.

### Success Metrics (Acceptance Criteria)

- [ ] Direct navigation to `/educators/:id` renders profile without prior client state (shareable via WhatsApp)
- [ ] `/find-skill?category=...&location=...&format=...&search=...` restores filters on load + on share
- [ ] Refresh on any dashboard tab (`/dashboard/learner/bookings`, `/dashboard/admin/verification`) retains tab (no redirect to `home`)
- [ ] Browser Back/Forward traverses navigation history correctly (no duplicate stack entries)
- [ ] Breadcrumbs render on deep views (`Home > Explore Skills > Educator Profile`)
- [ ] All existing `setCurrentView` call sites migrated — zero remaining `currentView ===` conditionals in `App.tsx`
- [ ] `npm run build` exits 0; no new router-related TypeScript errors; existing JWT/RBAC flows unaffected
- [ ] IMPROVEMENTS.md 2.1-2.4 checkboxes marked `[x]`, Iteration 2 status → `🟢 Completed`

---

## 3. Detailed Work Breakdown

### 3.1 — Task 2.1: Declarative Routing Integration

**Goal:** Introduce `react-router-dom@6` with browser history.

**Files:**
- `package.json:13` — add `react-router-dom@^6.26`
- `src/main.tsx` — wrap `<App />` with `<BrowserRouter>`
- `src/App.tsx` — **major refactor** (235 lines → router declarative):
  - Remove `useState<string>('home')` (`App.tsx:23`), `selectedCategoryId` (`App.tsx:24`)
  - Replace main view conditional block (`App.tsx:92-190`) with `<Routes>`:
    ```
    /                         → <HomePage />
    /find-skill               → <FindSkillPage />
    /become-educator          → <BecomeEducatorPage />
    /how-it-works             → <HowItWorksPage />
    /about                    → <AboutPage />
    /contact                  → <ContactPage />
    /auth                     → <AuthPage />
    /educators/:id            → <EducatorProfilePage /> (new wrapper around EducatorProfileModal or dedicated page)
    /dashboard/learner/*      → <LearnerDashboard /> (nested)
    /dashboard/educator/*     → <EducatorDashboard />
    /dashboard/admin/*        → <AdminDashboard /> (guarded: admin|secondary_admin)
    *                         → Navigate to / (404 fallback)
    ```
  - Replace `setCurrentView(view)` prop drilling with `useNavigate()` + `<Link>` / `<NavLink>`
  - Preserve `showToast`, `selectedEducatorForModal`, `selectedEducatorForBooking`, `showSkillRequestModal` as route-independent overlay state (modals remain global, but also sync to `/educators/:id` param via `useParams`)
- `src/components/Navbar.tsx` — replace `navLinks` `id` + `setCurrentView` with `to` paths, use `NavLink` `isActive` for active state, update `getDashboardTarget()` to return path strings
- `src/components/Footer.tsx` — same `Link` migration
- `vite.config.ts` — verify `base: './'` still correct for SPA fallback; document need for `404.html` redirect or `_redirects` if deploying to static host

**Verification:**
- `npm install && npm run build` passes
- Manual: click every Navbar/Footer link, confirm URL bar updates, refresh retains page

---

### 3.2 — Task 2.2: Deep-Linkable Profile & Catalog Routes

**Goal:** Make educator profiles and filtered catalog shareable.

**Files:**
- **New** `src/pages/EducatorProfilePage.tsx` — reads `useParams<{id}>`, calls `api.getEducatorById`, renders full profile + booking CTA; fallback to modal for backward compat if needed
- `src/pages/FindSkillPage.tsx` — currently `initialCategoryId` prop (`App.tsx:108`). Refactor to:
  - `const [searchParams, setSearchParams] = useSearchParams()`
  - Sync `category`, `format`, `location`, `minPrice`, `maxPrice`, `rating`, `search`, `sort` between component state ↔ URL `?` params
  - Debounce will be Iteration 4, but ensure `setSearchParams` doesn't cause infinite loop (use `useEffect` + stable deps)
- `src/pages/HomePage.tsx:35-36`, `src/components/EducatorCard.tsx` — replace `onViewEducator` callback with `<Link to={`/educators/${educator.id}`}>`; keep `onRequestBooking` as modal trigger or `navigate` with state
- `src/services/api.ts` — no change needed; ensure `getEducators` already supports query params (it does via `db.ts` filters)

**UG Context:** Learner copies `/educators/edu-...` link → pastes into WhatsApp group → recipient opens and sees verified artisan with UGX rate instantly (no login required).

---

### 3.3 — Task 2.3: Dashboard Nested Routes & Active State

**Goal:** Dashboards retain tab on refresh and support direct linking.

**Files:**
- `src/pages/LearnerDashboard.tsx`, `EducatorDashboard.tsx`, `AdminDashboard.tsx` + `src/pages/admin/*.tsx` (8 tabs) — introduce nested routing:
  ```tsx
  // inside AdminDashboard
  <Routes>
    <Route index element={<AdminMetricsTab />} />
    <Route path="users" element={<AdminUsersTab />} />
    <Route path="verification" element={<AdminVerificationTab />} />
    <Route path="matchmaker" element={<AdminMatchmakerTab />} />
    // ...etc
  </Routes>
  ```
  - Replace internal `useState(activeTab)` with `useParams`/`useLocation` + `<NavLink>`
  - Use `Outlet` pattern for shared dashboard shell (header + sidebar nav)
- `src/context/AuthContext.tsx` — add route guard component `<RequireRole role="admin">` wrapper for `/dashboard/admin/*` using `useAuth().user.role` check, redirect to `/auth` if not authorized (preserve `location.state.from`)
- `src/App.tsx` — define parent routes `/dashboard/learner/*` etc with `element={<RequireAuth><LearnerDashboard /></RequireAuth>}`

**Edge:** Ensure JWT token (`localStorage.getItem('iskilllink_token')` via `src/services/api.ts:getAuthToken`) is validated before rendering dashboard outlet; show loading skeleton while `api.getMe()` resolves.

---

### 3.4 — Task 2.4: Breadcrumbs & History Management

**Goal:** Intuitive navigation depth + correct history stack.

**Files:**
- **New** `src/components/ui/Breadcrumbs.tsx` — reusable component:
  - Props: `items: { label, to? }[]`
  - Renders `nav[aria-label="Breadcrumb"] > ol > li` with `ChevronRight` separators, `aria-current="page"` on last item
  - Auto-generates crumbs from `useMatches()` or manual mapping: `Home > Explore Skills > Fashion & Tailoring > Educator Name`
- Integrate into:
  - `src/pages/FindSkillPage.tsx` — `Home / Explore Skills`
  - `src/pages/EducatorProfilePage.tsx` — `Home / Explore Skills / {educator.name}`
  - `src/pages/admin/*` — `Dashboard / Admin / Verification`
- History polish:
  - Use `navigate(to, { replace: false })` for user-initiated navigation (push)
  - Use `replace: true` for filter query param updates that shouldn't pollute history (optional)
  - Verify `window.scrollTo({ top: 0 })` still fires on route change via `useEffect(() => scrollTo(0), [location.pathname])` in `AppContent`

**a11y:** Breadcrumbs use `nav` + `aria-label`, ensure keyboard focus moves to `main` `h1` on route change (Iteration 5 will add focus management, but scaffold now).

---

## 4. Dependencies & Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Prop drilling removal breaks `onSelectCategory`, `onViewEducator` callbacks in `HomePage.tsx:22-27` | Compile errors, dead navigation | Codemod search: `grep -rn setCurrentView\|currentView` must return 0 after migration; keep `onOpenSkillRequest` global state |
| Static host SPA fallback (GitHub Pages / Netlify) returns 404 on direct `/educators/:id` | Deep links broken in production | Add `public/404.html` SPA redirect hack or `_redirects` (`/* /index.html 200`); document in README |
| Filter query param ↔ state sync loop in `FindSkillPage` | Infinite re-render | Use `useSearchParams` as source of truth, derive local state via `useMemo`, guard `setSearchParams` with `isEqual` check |
| Dashboard nested routes conflict with existing modal state (`selectedEducatorForModal`) | Duplicate profile views | Decide: modal remains for quick preview, page is canonical; modal can `navigate('/educators/:id')` on "View Full Profile" |
| Bundle size increase (`react-router-dom` ~50kB gz) | Load time in low-bandwidth Mbarara | Tree-shake via `import { createBrowserRouter }`, code-split dashboards with `React.lazy(() => import('./pages/AdminDashboard'))` |

**Dependencies:**
- No backend changes required (API already supports `GET /api/educators/:id`, `GET /api/categories`)
- Requires `npm install react-router-dom` — pin to `^6.26` (stable, no breaking `v7` yet)
- Iteration 1 JWT guard (`server/middleware/auth.ts:authenticateToken`) must be tested against new `RequireAuth` frontend guard — ensure 401 redirects to `/auth?from=...`

---

## 5. Implementation Steps (Execution Order)

1. **Install & Scaffold** (est. 0.5 day)
   - `npm install react-router-dom`
   - Add `BrowserRouter` in `src/main.tsx`
   - Create `src/routes/index.tsx` (optional central route config) + `src/components/ui/Breadcrumbs.tsx` scaffold

2. **Migrate App.tsx Shell** (est. 1 day)
   - Convert `currentView` conditionals to `<Routes>`
   - Update `Navbar.tsx`, `Footer.tsx` to `<Link>/<NavLink>`
   - Verify `npm run build` + manual Navbar smoke test

3. **Deep Links & Catalog Sync** (est. 1 day)
   - Build `EducatorProfilePage.tsx`
   - Refactor `FindSkillPage` to `useSearchParams`
   - Test WhatsApp share flow: copy URL → incognito open → filters/profile render

4. **Dashboard Nesting & Guards** (est. 1 day)
   - Nest dashboard routes with `Outlet`, replace `activeTab` state
   - Add `RequireRole` guard, test learner→admin redirect, educator→admin block

5. **Breadcrumbs & History Polish** (est. 0.5 day)
   - Integrate `Breadcrumbs` across deep views
   - Add scroll-to-top on `location.pathname` change, verify Back/Forward

6. **Verification & Docs** (est. 0.5 day)
   - Run `npm run build`, fix TS errors
   - QA checklist (see §6)
   - Update `IMPROVEMENTS.md`: set Iteration 2 to `🔵 In Progress` at start, `🟢 Completed` + check `[x]` 2.1-2.4 at end
   - Update `README.md` "Running Locally" with note about SPA fallback

---

## 6. Verification Checklist (Must Pass Before Merge)

- [ ] `npm install` clean (no peer dep warnings for `react-router-dom`)
- [ ] `npm run build` exits 0 (`tsc -b` + `vite build` — same as Iteration 1 verification)
- [ ] Manual QA matrix:
  - [ ] `/` → click "Explore Skills" → URL `/find-skill` → refresh → stays on catalog (not home)
  - [ ] `/find-skill?category=cat-fashion&location=mbarara` → filters pre-selected → change filter → URL updates → copy URL → new tab → same filtered results
  - [ ] Click educator card "View Profile" → URL `/educators/edu-...` → refresh → profile still renders → Back → returns to filtered catalog with filters intact
  - [ ] Share `/educators/edu-...` via WhatsApp Web → recipient opens → profile renders without login
  - [ ] `/dashboard/admin/verification` → refresh → stays on Verification tab (not Metrics)
  - [ ] Non-admin user → `/dashboard/admin/users` → redirect to `/auth` → after login as admin → redirect back to `/dashboard/admin/users`
  - [ ] Browser Back 3x → Forward 3x → history stack consistent, no blank screens
  - [ ] Breadcrumbs visible on `/find-skill` and `/educators/:id`, clickable, `aria-current` on last item
- [ ] No regressions: login/logout, booking flow, escrow simulation, educator onboarding still work (JWT headers via `src/services/api.ts:getAuthHeaders` unchanged)
- [ ] Update `IMPROVEMENTS.md:13` row: `Iteration 2 | ... | 🟢 Completed`

---

## 7. Timeline & Effort

| Phase | Duration | Owner |
|---|---|---|
| Iteration 2 (2.1-2.4) | **4–5 working days** (0.5+1+1+1+0.5+0.5) | Frontend lead |
| Iteration 3 (Mobile) | 3–4 days next |  |
| Iteration 4 (Forms) | 2–3 days |  |
| Iteration 5 (a11y) | 3 days |  |
| Phase 6b (6.4/6.5 Storage) | 5–7 days (DB migration + upload pipeline) — schedule after 2-5 | Backend lead |

Total to green all 6 iterations: **~17–22 days** if sequential; 2 parallel tracks can compress to **~12–14 days**.

---

## 8. What Comes After Iteration 2

- **Immediate Next:** Iteration 3 — Mobile Experience (table→card, ribbon collapse, modal viewport, drawer scroll lock). Depends on Iteration 2's route-aware layout (mobile menu must close on `navigate`).
- **Deferred but Ready:** Iteration 6.4/6.5 — spec binary upload endpoint `POST /api/uploads` (multipart, store to `public/uploads/` or S3) + SQLite/Postgres migration using `database/schema.sql`. Keep `iskilllink_db.json` as fallback during transition.
- **Long-term:** Consider Iteration 7+ (not in current tracker): UGX MTN MoMo/Airtel real webhook integration, PWA offline support, admin analytics.

---

## 9. Appendix — Current Architecture References

- Routing today: `src/App.tsx:21-23` (`useState` + `currentView` switch) — to be removed
- Auth today: `src/context/AuthContext.tsx` + `src/services/api.ts:getAuthToken` — to be wrapped with `RequireAuth` guard
- Nav today: `src/components/Navbar.tsx:38-55` (`currentView` prop drilling) — to become `NavLink`-based
- Categories today: `server/data/iskilllink_db.json` + `src/pages/HomePage.tsx:58-73` icon switch — unchanged
- Security baseline: `server/utils/security.ts` (hash, JWT), `server/middleware/auth.ts` (RBAC) — Iteration 1, Do Not Regress

---

*Plan authored 2026-09-16 after sync to `Asha-crypto-001/iSkillLink-`. Next action: `npm install react-router-dom` and set `IMPROVEMENTS.md:13` to `🔵 In Progress`.*

