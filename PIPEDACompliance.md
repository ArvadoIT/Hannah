You are a privacy-aware web engineer. Implement the PIPEDA compliance items from `PIPEDA.md` for Lacque&Latte so the site is compliant out of the box, even if SendGrid/Twilio are NOT purchased yet.

### Input Spec
- Use the content from the user-provided `PIPEDA.md`.
- Tech stack: Next.js 14 (App Router), NextAuth + MongoDB Atlas (already scaffolded), SendGrid + Twilio (feature-flagged).

### Deliverables
1) Add/Update files:
- `/docs/PIPEDA.md` ← use the user’s content verbatim (minor formatting ok).
- `/src/app/privacy/page.mdx` – public Privacy Policy page written in plain English, matching the PIPEDA.md structure:
  - What data is collected
  - Why it’s collected
  - Where it’s stored (MongoDB Atlas)
  - Third parties (Vercel, MongoDB Atlas, SendGrid, Twilio)
  - Retention (2 years)
  - Rights: access, correction, deletion (how to contact)
  - Consent statement matching the booking/contact forms
  - Privacy contact: from env `LEGAL_PRIVACY_CONTACT_EMAIL`
  - Last updated date rendered dynamically
- `/src/app/(public)/booking/components/ConsentNotice.tsx` – a small reusable component that renders the consent text with a checkbox. It must:
  - Take props: `checked`, `onChange`, `required`
  - Link to `/privacy`
  - Text pulls `LEGAL_BUSINESS_NAME` and `LEGAL_PRIVACY_CONTACT_EMAIL` from env
- Update `/src/app/(public)/contact/page.tsx` and any booking form to include `ConsentNotice` (required). Persist `consentAccepted` and `consentDate` to Mongo on submission.
- `/src/app/api/privacy/export/route.ts` – Admin-only endpoint:
  - GET: export a client’s data by email (query param). Return CSV or JSON.
  - Must check Auth and role=admin; otherwise 401.
- `/src/app/api/privacy/delete/route.ts` – Admin-only endpoint:
  - POST: `{email}` → soft-delete or hard-delete client record and appointments.
  - Record an audit note (simple log collection: `audits`: {action, email, adminUserId, timestamp})
- `/src/app/api/email/templates.ts` – centralize email bodies for transactional vs promotional:
  - Transactional emails must NOT include marketing; include business name, address (placeholder), and privacy contact.
  - Promotional template contains explicit consent requirement and unsubscribe link placeholder.
- `/src/app/api/email/unsubscribe/route.ts` – simple stub endpoint for unsubscribe actions (writes to a `suppressions` collection; SendGrid integration later).
- `/src/app/api/sms/route.ts` – ensure all SMS include “Reply STOP to unsubscribe” and write STOP requests to `suppressions`.
- Add a small `/src/app/(admin)/privacy-tools/page.tsx` page:
  - Buttons: “Export Client Data”, “Delete Client Data”
  - Admin-only; ties to the endpoints above
  - Show clear warnings before deletion

2) Config & Flags
- Use `.env.example` keys already proposed (no secrets). Ensure app runs with default flags (no providers purchased).
- Add `RETENTION_YEARS="2"` and read it in the Privacy page.

3) Validation & Logging
- Use zod to validate request bodies and query params.
- Log actions to `audits` collection with minimal PII (email + action + adminId + timestamp).

4) Acceptance Criteria
- `/privacy` renders with dynamic “Last Updated”.
- Contact/booking cannot submit unless consent is checked.
- Admin can reach `/admin/privacy-tools` only when authenticated.
- Export/Delete endpoints require admin and function in DRY-RUN if DB lacks records.
- All email/SMS paths operate even when SendGrid/Twilio keys are absent (no crash; DRY-RUN true).

Please implement now without inserting any real secrets or live provider code beyond feature-flagged stubs.




# 🇨🇦 PIPEDA Compliance – Lacque&Latte Nail Studio  
### Personal Information Protection and Electronic Documents Act (PIPEDA) Compliance Guide  
_Last updated: October 2025_  

---

## 🧾 Overview

This document outlines how the **Lacque&latte website** and **booking/admin system** comply with Canada's **Personal Information Protection and Electronic Documents Act (PIPEDA)**.  
It applies to all digital services provided under **Lacque&latte Nail Studio**, developed and maintained by **Arvado IT Solutions**.

---

## 1. 📜 Privacy Policy Requirements

The public website must include a **Privacy Policy** accessible from the footer.  
The policy should explain:

- **What data is collected:**  
  Name, phone number, email, appointment details, messages, and communication preferences.  

- **How data is used:**  
  To process bookings, send reminders, and manage client relations.  

- **How data is stored:**  
  Securely in encrypted MongoDB Atlas databases (encryption at rest and in transit).  

- **Who has access:**  
  Authorized salon administrators and Arvado technical staff for maintenance only.  

- **Third-party service providers:**  
  - Vercel (hosting)  
  - MongoDB Atlas (database)  
  - SendGrid (email delivery)  
  - Twilio (SMS notifications)  

- **Data retention:**  
  Client data is kept only as long as required for operational purposes (maximum 2 years after last interaction).  

- **Client rights:**  
  Clients can request to access, correct, or delete their personal data by contacting  
  `privacy@lacqueandlatte.ca`.

- **Consent:**  
  Clients must check a consent box on the booking form before submitting personal data.  

---

## 2. 🔐 Data Security & Safeguards

| Category | Safeguard | Implementation |
|-----------|------------|----------------|
| **Database** | Encryption at rest & transit | MongoDB Atlas (TLS + AES-256) |
| **Hosting** | Secure HTTPS | Vercel-managed SSL certificates |
| **Access Control** | Role-based permissions | Admin-only access |
| **Authentication** | Secure sessions | NextAuth (JWT, hashed passwords) |
| **Secrets Management** | Encrypted environment variables | Vercel encrypted env store |
| **Email/SMS** | Data minimization | Include only first name + appointment time |
| **Backups** | Encrypted automatic backups | MongoDB Atlas managed backups |

---

## 3. 🧠 User Consent & Control

PIPEDA requires **meaningful consent**. The website and booking system must:

- Include an **explicit consent checkbox** before form submission.  
  _Example:_  
  > "I consent to the collection and use of my personal information for appointment scheduling and communications, in accordance with the Privacy Policy."

- Store the **timestamp of consent** in MongoDB (e.g., `consentAccepted: true`, `consentDate: "2025-10-16"`).  
- Provide a **clear opt-out** option for SMS and email reminders.  
- Provide an **email contact** for data removal or updates.  

---

## 4. 💌 Email & SMS (CASL Alignment)

Because Lacque&latte sends appointment reminders and possibly promotions, compliance with **Canada's Anti-Spam Legislation (CASL)** is required alongside PIPEDA.

| Message Type | Consent Required | Notes |
|---------------|------------------|-------|
| **Transactional (e.g., appointment reminders)** | Implied consent | Allowed after a booking |
| **Promotional (e.g., marketing offers)** | Express consent | Checkbox required |
| **Opt-out** | Mandatory | "Unsubscribe" link or "Reply STOP" message |

All SendGrid email templates and Twilio SMS messages must include a **clear unsubscribe method**.

---

## 5. 🧰 Data Management & Retention

- **Retention period:** 2 years after last appointment.  
- **Deletion requests:** Users can email `privacy@lacqueandlatte.ca` to have their record removed.  
- **Data export:** Provide a simple JSON/CSV export of user data on request.  
- **Audit log:** Record admin access and updates (recommended).  

---

## 6. 🧑‍💼 Administrative Measures

- **Privacy Officer:**  
  Arvado IT Solutions – Data Protection Contact  
  Email: `privacy@arvado.ca`  

- **Responsibilities:**  
  - Ensure staff compliance with privacy policies.  
  - Respond to client privacy requests.  
  - Maintain documentation of third-party service agreements.  

- **Third-party contracts:**  
  Ensure all vendors (Vercel, MongoDB, SendGrid, Twilio) have PIPEDA-aligned data protection agreements (DPAs).  

---

## 7. ⚙️ Technical Implementation Summary

| Area | Requirement | Status |
|------|--------------|--------|
| **HTTPS Encryption** | All pages secured via TLS | ✅ Vercel default |
| **Database Encryption** | Atlas encrypted storage | ✅ Implemented |
| **Access Control** | Auth.js role-based system | ✅ Implemented |
| **Email/SMS Opt-Out** | Required for all campaigns | 🔲 Add to templates |
| **Consent Tracking** | Boolean + timestamp fields in DB | 🔲 Add |
| **Deletion & Export** | Manual API endpoint for admin | 🔲 Build feature |
| **Privacy Policy Page** | Linked in footer | 🔲 Add content |
| **Privacy Officer Contact** | Defined (`privacy@arvado.ca`) | ✅ Done |

---

## 8. 🧾 Required Website Footer Links

Include these links in the site footer:

- [Privacy Policy](#)  
- [Terms of Service](#)  
- [Contact (privacy@lacqueandlatte.ca)](mailto:privacy@lacqueandlatte.ca)

---

## 9. 🧱 Internal Compliance File

Maintain a private file (`privacy-compliance.md`) in your repo containing:

- What personal data is collected  
- Purpose and retention details  
- Who has access  
- How users can exercise their rights  
- Date of last review  

---

## ✅ Summary

| Category | Action | Responsible |
|-----------|---------|-------------|
| Privacy Policy Page | Publish + add consent checkbox | Arvado |
| HTTPS / Encryption | Enabled by default | Arvado |
| User Rights (access, delete) | Implement admin function | Arvado |
| Email/SMS Templates | Include unsubscribe text | Arvado |
| Privacy Officer Contact | Defined and active | Arvado |
| Data Retention Policy | 2-year limit | Lacque&latte / Arvado |
| Staff Training | Brief admins on data handling | Lacque&latte |

---

**By following this framework, Lacque&latte Nail Studio's website and admin system will be compliant with PIPEDA and CASL requirements applicable in Ontario.**
