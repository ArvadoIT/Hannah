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
  - Email / Password or Magic-Link login via SendGrid  
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

### **SendGrid**
- **Tier:** Free (100 emails / day)  
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
| Email | SendGrid | $0 | $0 | Arvado |
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
| 3 | Connect SendGrid (email & magic links) | Week 2 |
| 4 | Configure Twilio (SMS) | Week 3 |
| 5 | Build Admin Dashboard (schedule + clients + analytics) | Week 3–5 |

---

## 🧭 Ownership & Security Policy
- All infrastructure (Vercel, Atlas, SendGrid, Twilio) managed under **Arvado organization**.  
- Each client receives **isolated projects / API keys / sub-accounts**.  
- Client owns:  
  - Domain & DNS  
  - Business email mailbox  
  - Payment processor (Stripe / Square if added)  
- Arvado retains infrastructure, integrations, and code ownership.  
- All secrets stored as Vercel Environment Variables (prod + preview).  

---
