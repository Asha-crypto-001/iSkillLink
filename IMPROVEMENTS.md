# iSkillLink — Platform Improvement & Hardening Tracker

> **Headquarters**: Mbarara City, Western Region, Uganda  
> **Platform Model**: Practical Vocational Apprenticeship & Mobile Money Escrow Marketplace  
> **Document Purpose**: Strategic, step-by-step milestone tracker. Check off (`- [x]`) tasks upon completion of each iteration.

---

## 📋 Iteration Status Summary

| Iteration | Title | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Iteration 1** | Security Hardening & Session Integrity | Auth, Password Hashing, JWT, Server Authorization | 🟢 Completed |
| **Iteration 2** | URL Routing & Navigation Architecture | Declarative Routes, Deep Linking, History Management | 🟢 Completed |
| **Iteration 3** | Mobile Experience & Responsive Layouts | Viewport Overflows, Touch Drawers, Responsive Cards | 🟡 Planned |
| **Iteration 4** | Form Usability & Input Validation | Step Validation, Search Debounce, Date Constraints | 🟡 Planned |
| **Iteration 5** | Accessibility (a11y) & Interaction Design | Focus Traps, ARIA Semantics, WCAG Contrast Ratios | 🟡 Planned |
| **Iteration 6** | Code Modularization & Architecture Cleanup | Component Decomposition, Reusable UI, Schema Migration | 🟢 In Progress |

---

## 🛠️ Detailed Iteration Workflows

### Iteration 1: Security Hardening & Session Integrity
*Eliminate credential vulnerabilities, secure communications, and establish robust authorization guards across all API routes.*

- [x] **1.1 Cryptographic Password Hashing**
  - Replace plaintext password comparisons with industry-standard hashing (`bcryptjs` or `argon2`) on user registration and onboarding.
  - Automatically hash existing seed data passwords on database initialization.
  - Ensure raw passwords and password hashes are stripped from all API responses via sanitization helpers.

- [x] **1.2 Stateless Session & JWT Infrastructure**
  - Implement signed JSON Web Tokens (JWT) issued upon successful authentication.
  - Attach tokens to authenticated requests via `Authorization: Bearer <token>` headers or secure HTTP-only cookies.
  - Validate token signatures and extract claims in an Express authentication middleware.

- [x] **1.3 Role-Based Access Control (RBAC) Enforcement**
  - Implement route guard middleware (`requireRole('admin')`, `requireEducator()`, etc.).
  - Protect verification step mutations, escrow payout releases, and secondary admin assignments so only verified lead or secondary admins can trigger them.
  - Validate that learners and educators can only read and mutate their own bookings, profiles, and payouts.

- [x] **1.4 Server Security Middleware**
  - Integrate `helmet` to set robust HTTP response headers (Content Security Policy, X-Frame-Options, HSTS).
  - Add `express-rate-limit` on `/api/auth/*` and payment endpoints to guard against brute-force attacks.
  - Configure strict CORS origin whitelisting matching production hostnames.

---

### Iteration 2: URL Routing & Navigation Architecture
*Replace in-memory view switching with declarative, bookmarkable, and shareable URL routes.*

- [x] **2.1 Declarative Routing Integration**
  - Integrate a modern routing solution (e.g. `react-router-dom`) with browser history support.
  - Establish clear top-level public paths: `/`, `/find-skill`, `/become-educator`, `/how-it-works`, `/about`, `/contact`, `/auth`.

- [x] **2.2 Deep-Linkable Profile & Catalog Routes**
  - Support parameterized educator profiles (`/educators/:id`) allowing learners to share direct profile links via WhatsApp or social media.
  - Sync catalog filters (category, format, location, price, rating) with URL query parameters (`/find-skill?category=fashion&location=mbarara`).

- [x] **2.3 Dashboard Nested Routes & Active State**
  - Support nested routes for user portals (`/dashboard/learner/bookings`, `/dashboard/educator/earnings`, `/dashboard/admin/verification`).
  - Ensure page refreshes retain the active dashboard tab and prevent unwanted navigation back to the homepage.

- [x] **2.4 Breadcrumbs & History Management**
  - Implement accessible breadcrumb navigation across deep views.
  - Guarantee intuitive browser Back and Forward button behavior.

---

### Iteration 3: Mobile Experience & Responsive Layouts
*Deliver an ergonomic mobile-first experience across smartphone and tablet viewports.*

- [ ] **3.1 Mobile Table Adaptation**
  - Convert multi-column desktop `<table>` elements in Learner, Educator, and Admin dashboards into stacked card views on screens below 768px (`block md:table`).
  - Prevent horizontal viewport clipping and horizontal scrollbars on smaller smartphones.

- [ ] **3.2 Header & Ribbon Optimization**
  - Refactor top heritage ribbon to collapse gracefully on mobile viewports, recovering 30–40px of vertical viewing space.
  - Implement scroll-direction awareness to auto-hide the top bar on scroll down and reveal on scroll up.

- [ ] **3.3 Modal Viewport Fitting**
  - Pin modal headers and footers while granting the modal body an independent scrollable container (`max-h-[90vh] flex flex-col`).
  - Ensure booking and application action buttons remain easily reachable above mobile on-screen keyboards.

- [ ] **3.4 Mobile Filter Drawer Ergonomics**
  - Implement body scroll locking (`overflow: hidden`) when mobile filter drawers are toggled.
  - Add smooth slide-in and slide-out transitions with clear backdrop dimming.

---

### Iteration 4: Form Usability & Input Validation
*Enhance form interactions, prevent invalid submissions, and optimize network efficiency.*

- [ ] **4.1 Per-Step Validation in Educator Onboarding**
  - Prevent applicants from skipping ahead in the 5-step wizard without fulfilling required fields.
  - Add inline validation feedback for phone numbers, hourly rates, and trade certifications.

- [ ] **4.2 Input Debouncing & Rate Throttling**
  - Debounce search inputs in `FindSkillPage` by 300ms to eliminate redundant network requests on every keystroke.
  - Debounce milestone progress sliders in `EducatorDashboard` to prevent PATCH request flooding.

- [ ] **4.3 Date Selection Constraints**
  - Restrict the booking date picker in `BookingModal` to prevent selection of past dates.
  - Add conflict checks against educator availability calendars.

- [ ] **4.4 Functional Contact & Inquiry Ingestion**
  - Connect the contact form on `ContactPage` to a persistent backend endpoint that records inquiries and notifies administrative staff.
  - Replace `mailto:` newsletter submissions with direct database persistence and instant inline confirmation.

---

### Iteration 5: Accessibility (a11y) & Interaction Design
*Ensure WCAG 2.1 AA compliance, inclusive keyboard navigation, and clear feedback loops.*

- [ ] **5.1 Accessible Modal Primitive**
  - Wrap all modals in a reusable dialog container enforcing `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  - Trap keyboard focus inside active modals and restore focus to the triggering element upon dismissal.
  - Support `Escape` key listeners for rapid dismissal.

- [ ] **5.2 Keyboard Dropdown Navigation**
  - Enable keyboard navigation (Arrow Up / Arrow Down, Enter, Escape) for navigation dropdowns and notification panels.
  - Add `aria-expanded` and `aria-haspopup` attributes to trigger buttons.

- [ ] **5.3 Accessible Toast & Live Region System**
  - Replace the single-string toast with a queued notification manager utilizing `role="status"` and `aria-live="polite"`.
  - Distinguish success, error, and informational states through semantic styling and icons.

- [ ] **5.4 Color Contrast & Typography Audit**
  - Audit text-to-background contrast ratios for muted gray text (`text-slate-400`, `text-slate-500`) to guarantee a minimum 4.5:1 ratio.
  - Standardize typographical sizing onto a unified 5-step scale.

- [ ] **5.5 Meaningful Zero-State Screens**
  - Implement illustrated, informative empty states across all dashboard tabs (empty bookings, empty leads, empty verification queue) with immediate call-to-action buttons.

---

### Iteration 6: Code Modularization & Architecture Cleanup
*Decompose monolithic components, introduce reusable UI primitives, and harden data storage.*

- [x] **6.1 Root Archive & Debris Cleanup**
  - Remove leftover compressed archives (`.zip`, `.tar.gz`) from repository root.
  - Ensure `.gitignore` cleanly covers build artifacts and temporary data.

- [x] **6.2 Admin Dashboard Decomposition**
  - Split the 1,170+ line monolithic `AdminDashboard.tsx` into domain-specific tab components:
    - `AdminMetricsTab.tsx`
    - `AdminUsersTab.tsx`
    - `AdminInterestsTab.tsx`
    - `AdminVerificationTab.tsx`
    - `AdminMatchmakerTab.tsx`
    - `AdminEducatorsTab.tsx`
    - `AdminPaymentsTab.tsx`
    - `AdminAuditTab.tsx`

- [x] **6.3 Shared UI Component Primitives**
  - Create standardized primitives in `src/components/ui/`:
    - `Badge.tsx`: Consistent status indicators (Active, In Escrow, Pending, Verified).
    - `Button.tsx`: Consistent button variants (Primary, Secondary, Outline, Danger, Ghost).
    - `EmptyState.tsx`: Reusable zero-data illustration and action component.

- [ ] **6.4 Binary Media Upload Pipeline**
  - Replace canvas-generated Base64 image strings with multipart binary upload handling.
  - Store relative file paths or cloud storage URLs in the database to protect storage quotas.

- [ ] **6.5 Relational Database Migration**
  - Transition runtime storage from `iskilllink_db.json` to an embedded SQLite database (development) or managed PostgreSQL cluster (production) utilizing `database/schema.sql`.

---

## 📌 Maintenance Guidelines
1. When starting an iteration, update its status from `🟡 Planned` to `🔵 In Progress`.
2. As each sub-task is verified, mark its checkbox as `[x]`.
3. Once all sub-tasks in an iteration are complete and verified via automated builds (`npm run build`), update the iteration status to `🟢 Finished`.
