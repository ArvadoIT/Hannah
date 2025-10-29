You are an expert Next.js 14 (App Router) engineer working in a monorepo. Implement the “Final Cost-Effective API & Service Architecture (MongoDB + NextAuth)” for Lacque&Latte based on THIS spec:

- DB: MongoDB Atlas (M0 Free)

   mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/?retryWrites=true&
  w=majority&appName=LacqueLatte

  mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/lacque-latte?retryWrites=true&w=majority&appName=LacqueLatte
  
- Auth: Auth.js (NextAuth) + MongoDB Adapter
- Hosting: Vercel
- Email: MailerSend (but must run without a key via DRY-RUN mode)
- SMS: Twilio (but must run without a key via DRY-RUN mode)
- Contact form: handled in-house via MailerSend API (no Web3Forms)
- Public website + Private admin dashboard in the same Next.js app (separate routes)

### Deliverables
1) Create/Update these files (no secrets hardcoded):
- `/docs/architecture-lacqueandlatte.md` ← include the content provided by the user (don’t edit meaning; minor formatting ok).
- `.env.example` with placeholders:
  - MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
  - NEXTAUTH_URL="https://<your-domain>"
  - NEXTAUTH_SECRET="<generate>"
  - MAILERSEND_API_KEY="<optional-set-later>"
  - MAILERSEND_FROM="noreply@lacqueandlatte.ca"
  - MAILERSEND_FROM_NAME="Lacque & Latte"
  - MAILERSEND_TO="info@lacqueandlatte.ca"
  - TWILIO_ACCOUNT_SID="<optional-set-later>"
  - TWILIO_AUTH_TOKEN="<optional-set-later>"
  - TWILIO_MESSAGING_SERVICE_SID="<optional-set-later>"
  - FEATURE_EMAIL_ENABLED="false"
  - FEATURE_SMS_ENABLED="false"
  - FEATURE_CONSENT_REQUIRED="true"
  - LEGAL_PRIVACY_CONTACT_EMAIL="privacy@lacqueandlatte.ca"
  - LEGAL_BUSINESS_NAME="Lacque&Latte Nail Studio"
- `/src/lib/db.ts` – single MongoDB client (cached for serverless). No connect on import; lazy connect in helper.
- `/src/auth/config.ts` – NextAuth config with:
  - Credentials provider (email+password hash via bcrypt)
  - MongoDBAdapter (sessions persisted in Mongo)
  - Secure cookies; production-ready options
- `/src/app/(public)/contact/page.tsx` – Contact form UI with fields: name, email, phone (optional), message, and **required PIPEDA consent checkbox** (text sourced from env LEGAL_BUSINESS_NAME; link to /privacy).
- `/src/app/api/contact/route.ts` – POST endpoint:
  - Validates body; rejects if consent not checked and FEATURE_CONSENT_REQUIRED=true
  - If FEATURE_EMAIL_ENABLED=false → respond 200 with `{dryRun:true}`
  - If MAILERSEND_API_KEY present and feature enabled → send email via MailerSend API
  - Minimal PII in the email body (name + contact + short message)
  - Return {ok:true}
- `/src/app/(admin)/dashboard/page.tsx` – protected page (requires Auth). Show mock widgets: Today’s Appointments, Upcoming, and a stub for “Export My Data” and “Delete My Data”.
- `/src/middleware.ts` – protect `/dashboard` with Auth.js middleware.
- `/src/app/api/sms/route.ts` – POST endpoint to send SMS reminders:
  - If FEATURE_SMS_ENABLED=false or no Twilio keys → return `{dryRun:true}`
  - If enabled → call Twilio; include CASL-compliant “Reply STOP to unsubscribe” text
- `/src/app/layout.tsx` – Global footer with links: Privacy Policy (/privacy), Terms (/terms), Contact mailto: from env LEGAL_PRIVACY_CONTACT_EMAIL
- `/src/app/privacy/page.md` & `/src/app/terms/page.md` – stub pages (content can be replaced later)

2) Data models (Mongo collections)
- `users` (Auth.js default via adapter)
- `appointments` { _id, clientName, clientEmail, phone?, service, start, end, notes?, consentAccepted:boolean, consentDate:Date, createdAt, updatedAt }
- `messages` (optional) to log contact form submissions with consent fields.

3) Quality & Security
- TypeScript everywhere, strict mode
- Input validation with zod
- No secrets in code or git history
- Minimal PII in logs
- Lint + basic Jest tests for:
  - contact API (dry-run vs real send)
  - auth protection on /dashboard

4) Feature flags behavior (must work NOW without buying APIs):
- If `FEATURE_EMAIL_ENABLED=false` or `MAILERSEND_API_KEY` missing → contact API returns `{dryRun:true}` and logs a friendly message.
- If `FEATURE_SMS_ENABLED=false` or Twilio keys missing → SMS API returns `{dryRun:true}`.
- App should deploy and run fully with only `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.

5) Acceptance Criteria
- `/contact` renders form with “I consent…” required checkbox + link to /privacy.
- Submitting contact with default flags returns `{ok:true, dryRun:true}`.
- `/dashboard` requires login; unauthenticated users are redirected to `/api/auth/signin`.
- Code compiles on Vercel with no runtime secrets; local dev works with `.env.local`.

Implement now. Do NOT include any real keys. Keep everything production-safe by default.



# 💅 Lacque&Latte Nail Studio  
## Final Cost-Effective API & Service Architecture (MongoDB + NextAuth Version)

_All costs in CAD_

---

## 🗄️ Database & Backend

### **MongoDB Atlas (M0 Free Tier)**
- **Storage:** 512 MB (shared CPU/RAM)  
- **Purpose:** Appointments, clients, services, staff data  
- **Highlights:**  
  - Serverless connection to Vercel (`MONGODB_URI`)  
  - Automatic backups  
  - Works directly with NextAuth adapter for user accounts  
- **Cost:** $0 / month  
- **Ownership:** Arvado  
- **Notes:** One Atlas project per client under the Arvado organization  

---

## 🔐 Authentication

### **Auth.js (NextAuth) + MongoDB Adapter**
- **Purpose:** Admin login and secure session management  
- **Highlights:**  
  - Email / Password or Magic-Link login via MailerSend  
  - Secure JWT-based sessions  
  - Session data stored in MongoDB Atlas  
- **Environment Vars:**  
  - `NEXTAUTH_URL`  
  - `NEXTAUTH_SECRET`  
- **Cost:** $0 / month  
- **Ownership:** Arvado  

---

## 🌐 Hosting

### **Vercel**
- **Tier:** Free  
- **Purpose:**  
  - Public website (client-facing)  
  - Private admin dashboard (protected via Auth.js)  
- **Highlights:**  
  - Automatic HTTPS & deployments  
  - Serverless API routes  
  - Per-client project under Arvado team  
- **Cost:** $0 / month  
- **Ownership:** Arvado  

---

## ✉️ Email Delivery

### **MailerSend**
- **Tier:** Free (12,000 emails / month)  
- **Purpose:**  
  - Contact form submissions  
  - Booking confirmations & reminders  
  - Magic-link authentication for admins  
- **Setup:**  
  - Domain authenticated: `lacqueandlatte.ca`  
  - From: `noreply@lacqueandlatte.ca`  
  - To: `info@lacqueandlatte.ca`  
- **Cost:** $0 / month  
- **Ownership:** Arvado (master account, per-client API keys)  

---

## 📱 SMS Notifications

### **Twilio**
- **Purpose:** Appointment confirmations & reminders  
- **Pricing:** ≈ $0.0075 per SMS (~$10–15 / month)  
- **Setup:**  
  - One sub-account per client  
  - Dedicated number / messaging service for Lacque&Latte  
- **Notes:** Optional 10DLC registration (~$20 one-time)  
- **Ownership:** Arvado  

---

## 🌍 Domain & Mailbox

| Item | Provider | Ownership | Cost | Notes |
|------|-----------|------------|------|-------|
| **Domain** | Namecheap / Porkbun | Client | ~$20 / year | Includes WHOIS privacy |
| **Mailbox** | Zoho Mail (free) / ImprovMX | Client | $0–3 / month | For `info@lacqueandlatte.ca` |

---

## 💰 Cost Overview

| Category | Service | Monthly | Yearly | Owner |
|-----------|----------|----------|---------|--------|
| Hosting | Vercel | $0 | $0 | Arvado |
| Database | MongoDB Atlas (M0) | $0 | $0 | Arvado |
| Auth | Auth.js (NextAuth) | $0 | $0 | Arvado |
| Email | MailerSend | $0 | $0 | Arvado |
| SMS | Twilio | ~$10–15 | ~$120–180 | Arvado |
| Domain | Namecheap / Porkbun | — | ~$20 | Client |
| Mailbox | Zoho / ImprovMX | $0–3 | ~$0–36 | Client |
| **Total Estimate** |  | **≈ $10–15 / month** | **≈ $200–250 / year** | — |

---

## 🚀 Implementation Timeline

| Phase | Task | Duration |
|--------|------|-----------|
| 1 | Deploy public website on Vercel | ✅ Done |
| 2 | Integrate MongoDB Atlas + NextAuth | Week 1–2 |
| 3 | Connect MailerSend (email & magic links) | Week 2 |
| 4 | Configure Twilio (SMS) | Week 3 |
| 5 | Build Admin Dashboard (schedule + clients + analytics) | Week 3–5 |

---

## 🧭 Ownership & Security Policy
- All infrastructure (Vercel, Atlas, MailerSend, Twilio) managed under **Arvado organization**.  
- Each client receives **isolated projects / API keys / sub-accounts**.  
- Client owns:  
  - Domain & DNS  
  - Business email mailbox  
  - Payment processor (Stripe / Square if added)  
- Arvado retains infrastructure, integrations, and code ownership.  
- All secrets stored as Vercel Environment Variables (prod + preview).  

---
