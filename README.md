# iSkillLink ("Where Skills Meet Opportunity")
**Headquarters: Mbarara City, Western Region, Uganda**  
**Founder & Platform Administrator: Ashabahebwa Hassan**  
**Official Contacts:** WhatsApp: `+256 744 024 529` | Phone: `+256 772 233 621` | Email: `ashabahebwahassan665@gmail.com`

---

## 🌟 Overview
**iSkillLink** is a production-grade practical skills marketplace built for Uganda. It connects experienced local artisans, master technicians, and vocational instructors with motivated learners for direct hands-on apprenticeships.

Unlike passive video courses, iSkillLink focuses on **direct 1-on-1 and small group practical mentorship**, workshop safety inspections, transparent rule-based matching, and **Mobile Money Escrow (MTN MoMo & Airtel Money)** that protects both learners and educators.

> **Status — Production Ready:** Design system unified, responsive excellence delivered, states & accessibility polished. Built for real hands-on apprenticeships in Mbarara & across Uganda.

---

## 🚀 Key Features

### 1. Separate Real User Roles & Portals
- **Founder / Platform Admin (Ashabahebwa Hassan)**:
  - Multi-step verification queue (NIN validation with Ugandan records, trade background checks, screening interviews, workshop bench inspections).
  - Rule-based matching engine oversight (35% skill fit, 20% format, 15% proximity, 15% budget, 15% rating).
  - Platform escrow ledger managing 10% platform facilitation fee and 90% net educator payouts.
  - Comprehensive immutable audit trail.
- **Learners / Students**:
  - Browse verified educators across 20+ practical trades or post custom skill requests.
  - Book hands-on sessions with explicit UGX pricing.
  - Deposit funds into Mobile Money Escrow (MTN / Airtel).
  - Track milestone progression (0% to 100%) and release verified multi-criteria reviews.
- **Educators / Artisans**:
  - 5-step comprehensive onboarding application (trade credentials, workshop tools, portfolio samples).
  - Set hourly and course package rates in UGX.
  - Accept or decline learner bookings.
  - Update practical milestones and reply publicly to student reviews.
  - View real-time gross volume and net 90% Mobile Money payouts.

### 2. Transparent Rule-Based Matchmaking
- Explicit weighted scoring criteria:
  - **Skill Relevance**: 35%
  - **Format Match (In-person workshop / Hybrid / Online)**: 20%
  - **Location Proximity (Mbarara City divisions & Ugandan regions)**: 15%
  - **Budget Alignment**: 15%
  - **Educator Experience & Rating**: 15%

### 3. Ugandan Mobile Money Escrow Protection
- Fully localized for MTN MoMo and Airtel Money networks.
- 10% transparent platform fee retained; 90% disbursed directly upon completion.
- Zero storage of private PINs or bank credentials.

---

## 🔒 Security & User Accounts

For security, credentials are managed securely via environment variables:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your custom administrative credentials in `.env`:
   ```env
   ADMIN_EMAIL=ashabahebwahassan665@gmail.com
   ADMIN_PASSWORD=your_secure_password_here
   ```
   `ADMIN_PASSWORD` is applied only when the API seeds a fresh database. Without it, the seeded admin account gets a random password and cannot sign in with a password.
3. New students, educators, and mentors can register directly in the application using the **Create New Account** form on the Sign In page.

Runtime API data lives in `server/data/iskilllink_db.json` during local development (or in PostgreSQL when `DATABASE_URL` is set). That file is generated from `server/seedData.ts` on first run and is not committed.

### Google Sign-In configuration

Google Sign-In uses Google Identity Services in the browser and verifies the returned ID token on the API server. Configure the same OAuth 2.0 Web client ID in both variables:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Register every production frontend origin in Google Cloud Console. The API must never accept profile fields such as email or name as proof of Google authentication. Public Google registration creates learner accounts only; an existing password account must be explicitly linked after the user signs in.

### Production deployment with Vercel and Supabase

Vercel hosts the frontend and the Express API in one project: [vercel.json](./vercel.json) builds the Vite site, runs the API as a single function at `/api` ([api/index.ts](./api/index.ts)), and sends every other path to the app. Supabase provides PostgreSQL and the email/password accounts.

1. **Database:** in Supabase, open **Connect** and copy the **Transaction pooler** connection string (port `6543`). Use the pooler rather than the direct `db.<project>.supabase.co:5432` address: every Vercel function instance opens its own connections. The API creates its `app_state` table and seeds it on the first request.
2. **Project:** in Vercel, import this repository. No build settings are needed.
3. **Environment variables** (Production and Preview):
   - `DATABASE_URL`: the pooler connection string from step 1
   - `JWT_SECRET`: a long random value
   - `ADMIN_PASSWORD`: the lead admin's password, applied only when the database is first seeded (at least 8 characters)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: from Supabase **Project Settings → API**

   `VITE_API_URL` and `CLIENT_ORIGIN` are not needed: on Vercel the site calls its own `/api`, and same-origin requests are always allowed.
4. **Photo uploads:** in Vercel, open **Storage**, create a **Blob** store and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`. Without it, uploads answer "Photo uploads are not set up on this server yet" (the filesystem is read-only on Vercel).
5. **Auth redirects:** in Supabase **Auth → URL Configuration**, add the Vercel domain.
6. Every push to `main` deploys to production, and every pull request gets a preview. Previews use the production database unless you give Preview its own `DATABASE_URL`.

Things to know:

- All application data is one JSON row in `app_state`. Each function instance reloads it when another instance has written, and saves before it responds. Two simultaneous writes on different instances are last-write-wins, which is fine at this scale but not beyond it.
- Vercel's free Hobby plan is for non-commercial use. A site that takes payments needs the Pro plan.

### Production deployment with Netlify and Supabase

Netlify hosts the static frontend. Supabase provides the existing email/password accounts, Google authentication, PostgreSQL, and the `auth` Edge Function:

1. In Netlify, import this repository. Netlify will use [netlify.toml](./netlify.toml) automatically.
2. Set these Netlify environment variables:
   - `VITE_SUPABASE_URL`: the existing Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: the existing Supabase anon/public key
   - `VITE_GOOGLE_CLIENT_ID`: the Google Web client ID, if Google login is enabled
   - `VITE_API_URL`: the Express API base URL ending in `/api`. Without it the site runs as a browser-only demo whenever no API answers, and bookings, requests, and payments are not saved to a server.
3. The frontend uses the existing Supabase Auth email/password users directly. Do not run the included profile migration unless your project does not already have an equivalent profile table.
4. Run the Express API (`npm run server`) with `SUPABASE_URL` and `SUPABASE_ANON_KEY` set, plus `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and `CLIENT_ORIGIN` (the Netlify site URL). The API verifies each Supabase session with Supabase and maps it to an API account:
   - On first sign-in, a new learner or educator account is created from the Supabase user.
   - An existing API account with the same email is linked only if the Supabase email is confirmed. Keep **Confirm email** enabled in Supabase Auth so nobody can claim another person's account.
   - Roles come from the API account, never from Supabase user metadata.
5. The included Edge Function is optional and is not required for the current direct Supabase Auth login path.
6. In Supabase Auth URL Configuration, add the Netlify site URL to the allowed redirect URLs.
7. In Google Cloud Console, add the exact Netlify site URL to authorized JavaScript origins.
8. Netlify will redeploy automatically after changes to `main`.

Verify the API before testing the frontend:

```bash
curl -i -X POST https://your-project.supabase.co/functions/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"user@example.com","password":"password"}'
```

The response should be a JSON authentication result or a clear validation error, not a static Netlify page.

---



## 💻 Running Locally on Your Computer

```bash
# 1. Clone your repository from GitHub
git clone https://github.com/Asha-crypto-001/iSkillLink-.git
cd iSkillLink-

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000 for Web, Port 3001 for API)
npm run dev

# 4. Open in your browser:
# http://localhost:3000
```

---

## 📍 Company & Operational Office
- **Location**: Mbarara City, Western Region, Uganda
- **Founder & Administrator**: Ashabahebwa Hassan
- **Support**: `ashabahebwahassan665@gmail.com` | WhatsApp: `+256 744 024 529` | Phone: `+256 772 233 621`
