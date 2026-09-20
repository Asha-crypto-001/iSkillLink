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
3. New students, educators, and mentors can register directly in the application using the **Create New Account** form on the Sign In page.

### Google Sign-In configuration

Google Sign-In uses Google Identity Services in the browser and verifies the returned ID token on the API server. Configure the same OAuth 2.0 Web client ID in both variables:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Register every production frontend origin in Google Cloud Console. The API must never accept profile fields such as email or name as proof of Google authentication. Public Google registration creates learner accounts only; an existing password account must be explicitly linked after the user signs in.

### Production deployment

The GitHub Pages site is a static frontend. Authentication requires the Express API to run separately. The API now supports Vercel Functions with Supabase PostgreSQL:

1. Create a Supabase project and copy its PostgreSQL connection string into the Vercel `DATABASE_URL` environment variable.
2. Import this repository into Vercel. The included [vercel.json](./vercel.json) exposes the Express API under `/api`.
3. Set `CLIENT_ORIGIN` to `https://asha-crypto-001.github.io`.
4. Set `GOOGLE_CLIENT_ID` to the same Google Web client ID used by the frontend.
5. Set a long random `JWT_SECRET` and keep it private.
6. Add these GitHub repository Actions secrets:
   - `VITE_API_URL`: the Vercel API URL ending in `/api`, for example `https://iskilllink.vercel.app/api`
   - `VITE_GOOGLE_CLIENT_ID`: the Google Web client ID
7. Replace `VITE_API_URL` with the deployed Vercel API URL ending in `/api`.
8. In Google Cloud Console, add `https://asha-crypto-001.github.io` to the authorized JavaScript origins.
9. Push to `main` to rebuild GitHub Pages with the API URL.

Verify the API before testing the frontend:

```bash
curl https://your-vercel-project.vercel.app/api/health
```

It should return `{"status":"ok"}`.

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
