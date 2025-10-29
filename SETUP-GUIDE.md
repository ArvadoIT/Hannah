# 🚀 API SETUP GUIDE - Lacque & Latte

This guide will help you configure all the services for your booking site. Follow each section step-by-step.

---

## 📋 Overview

You'll need to set up:
1. **MongoDB Atlas** - Database for appointments and user data
2. **NextAuth** - Authentication/login system  
3. **MailerSend** - Email notifications
4. **Twilio** - SMS text message notifications
5. **Vercel** - Hosting and deployment
6. **GoDaddy** - Domain connection

**Estimated Setup Time:** 60-90 minutes

---

## 🗄️ STEP 1: MongoDB Atlas Setup

MongoDB will store your appointment bookings, user accounts, and all application data.

### 1.1 Get Your Connection String

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Log in to your account
3. Click **"Connect"** on your cluster
4. Choose **"Drivers"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

### 1.2 Prepare Your Connection String

Replace `<password>` with your actual MongoDB password:
```
mongodb+srv://Hannah:YourPassword123@cluster.mongodb.net/?retryWrites=true&w=majority
```

⚠️ **Important:** If your password contains special characters like `@`, `#`, `%`, you need to URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`

### 1.3 Configure Network Access

1. In MongoDB Atlas, click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Enter IP: `0.0.0.0/0`
5. Click **"Confirm"**

This allows Vercel (and your computer) to connect to your database.

### 1.4 Create Admin User Account

You need an admin account to log into the dashboard. We'll create this using a quick script.

**Option A: Using Node.js (Recommended)**

1. Open Terminal in your project folder
2. Run this command to create a password hash:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_CHOSEN_PASSWORD', 10));"
```

Replace `YOUR_CHOSEN_PASSWORD` with your actual password.

3. Copy the output (starts with `$2a$10$...`)

4. Go to MongoDB Atlas → Browse Collections
5. Click **"Insert Document"**
6. Switch to **{} CODE** view and paste:

```json
{
  "email": "hannah@lacqueandlatte.ca",
  "name": "Hannah",
  "hashedPassword": "$2a$10$YOUR_HASH_HERE",
  "role": "admin",
  "createdAt": {"$date": "2025-10-29T00:00:00.000Z"},
  "updatedAt": {"$date": "2025-10-29T00:00:00.000Z"}
}
```

7. Click **"Insert"**

✅ **MongoDB Setup Complete!**

---

## 🔐 STEP 2: NextAuth Setup

NextAuth handles login and authentication.

### 2.1 Generate Secret Key

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**Or use online generator:**
Go to: https://generate-secret.vercel.app/32

Copy the generated string (looks like: `abc123def456...`)

⚠️ **Keep this secret!** Never share it or commit it to git.

✅ **NextAuth Setup Complete!**

---

## ✉️ STEP 3: MailerSend Setup

MailerSend will send appointment confirmations and contact form emails.

### 3.1 Create API Key

1. Go to [mailersend.com](https://www.mailersend.com) and log in
2. Click **"Email"** → **"API Tokens"**
3. Click **"Generate new token"**
4. Name it: `Lacque & Latte Production`
5. Scope: Select **"Full access"** or at minimum **"Email Send"**
6. Click **"Create token"**
7. **Copy the API key immediately** (starts with `mlsn.`)

⚠️ You can only see this key once! Save it now.

### 3.2 Verify Your Domain (Important!)

To send emails from `@lacqueandlatte.ca`, you need to verify your domain:

1. In MailerSend, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter: `lacqueandlatte.ca`
4. MailerSend will show you DNS records to add

### 3.3 Add DNS Records in GoDaddy

1. Log into your GoDaddy account
2. Go to **"My Products"** → **"Domains"** → **"lacqueandlatte.ca"**
3. Click **"DNS"** (or "Manage DNS")
4. Add the DNS records that MailerSend provided:
   - Usually 3-5 CNAME records
   - Copy each **Name** and **Value** exactly

**Example records (your values will differ):**
```
Type: CNAME
Name: mail._domainkey
Value: mail._domainkey.lacqueandlatte.ca.mailersend.net
TTL: 1 hour
```

5. Click **"Save"** after adding each record
6. Wait 10-60 minutes for DNS to propagate
7. Return to MailerSend and click **"Verify"**

### 3.4 Set Email Addresses

- **MAILERSEND_FROM**: `noreply@lacqueandlatte.ca`
- **MAILERSEND_FROM_NAME**: `Lacque & Latte`
- **MAILERSEND_TO**: Your email where you want to receive booking notifications (e.g., `hannah@lacqueandlatte.ca`)

✅ **MailerSend Setup Complete!**

---

## 📱 STEP 4: Twilio SMS Setup

Twilio will send appointment reminder text messages to your clients.

### 4.1 Get Account Credentials

1. Go to [twilio.com/console](https://www.twilio.com/console) and log in
2. On the dashboard, you'll see:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "Show" to reveal)
3. Copy both of these

### 4.2 Get a Phone Number

1. In Twilio Console, click **"Phone Numbers"** → **"Manage"** → **"Buy a number"**
2. Choose **Country: Canada**
3. Check **"SMS"** capability
4. Click **"Search"**
5. Pick a number (usually costs $1-2/month)
6. Click **"Buy"**
7. Copy your new phone number (format: `+12345678901`)

### 4.3 Important: Message Service (Optional but Recommended)

For better deliverability and SMS compliance:

1. Go to **"Messaging"** → **"Services"**
2. Click **"Create Messaging Service"**
3. Name it: `Lacque & Latte Appointments`
4. Use case: **"Notifications"**
5. Add your phone number to the service

### 4.4 SMS Compliance (Canada - CASL)

✅ **Good news:** The codebase already includes CASL-compliant opt-out language ("Reply STOP to unsubscribe") in every SMS!

For high volume (100+ messages/day), you may need to register your business:
1. Complete 10DLC registration (~$20 one-time fee)
2. Register your messaging campaign (~$5/month)

For low volume, you can skip this initially.

✅ **Twilio Setup Complete!**

---

## 🌐 STEP 5: Vercel Deployment

Vercel will host your website and make it accessible on the internet.

### 5.1 Connect GitHub

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and log in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your **LacqueLatteTesting** repository
5. Click **"Import"**

### 5.2 Configure Build Settings

**Framework Preset:** Next.js (should auto-detect)

Leave these as default:
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 5.3 Add Environment Variables

This is the most important part! Click **"Environment Variables"** and add each one:

#### Add These Now:

| Name | Value | Environments |
|------|-------|--------------|
| `MONGODB_URI` | Your MongoDB connection string | Production, Preview, Development |
| `MONGODB_DB_NAME` | `lacque-latte` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://lacqueandlatte.ca` | Production |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Preview |
| `NEXTAUTH_SECRET` | Your generated secret | Production, Preview, Development |
| `MAILERSEND_API_KEY` | Your MailerSend API key | Production, Preview, Development |
| `MAILERSEND_FROM` | `noreply@lacqueandlatte.ca` | Production, Preview, Development |
| `MAILERSEND_FROM_NAME` | `Lacque & Latte` | Production, Preview, Development |
| `MAILERSEND_TO` | Your notification email | Production, Preview, Development |
| `FEATURE_EMAIL_ENABLED` | `true` | Production, Preview |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | Production, Preview, Development |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | Production, Preview, Development |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | Production, Preview, Development |
| `FEATURE_SMS_ENABLED` | `true` | Production, Preview |

**How to add each variable:**
1. Type the **Name** (exactly as shown)
2. Paste the **Value**
3. Check which environments to apply it to
4. Click **"Add"**

### 5.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll see "🎉 Congratulations!" when done

### 5.5 Note Your Preview URL

Vercel will give you a URL like: `https://lacque-latte-testing-abc123.vercel.app`

Copy this! You'll need it for testing before connecting your domain.

✅ **Vercel Deployment Complete!**

---

## 🔗 STEP 6: GoDaddy Domain Connection

Connect your `lacqueandlatte.ca` domain to Vercel.

### 6.1 Add Domain in Vercel

1. In your Vercel project, go to **Settings** → **Domains**
2. Enter: `lacqueandlatte.ca`
3. Click **"Add"**
4. Also add: `www.lacqueandlatte.ca`
5. Vercel will show you DNS records to add

### 6.2 Configure DNS in GoDaddy

1. Log into GoDaddy
2. Go to **"My Products"** → **"Domains"**
3. Click **"DNS"** next to `lacqueandlatte.ca`
4. Add/Update these records:

**For root domain (lacqueandlatte.ca):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 1 hour
```

**For www subdomain:**
```
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 1 hour
```

**If Vercel asks for verification:**
```
Type: TXT
Name: _vercel
Value: (copy from Vercel)
TTL: 1 hour
```

5. Click **"Save"** for each record

### 6.3 Wait for DNS Propagation

- Usually takes **10-60 minutes**
- Can take up to **24 hours** in rare cases
- Check status: `https://www.whatsmydns.net/#A/lacqueandlatte.ca`

### 6.4 Update NEXTAUTH_URL

Once your domain is working:

1. Go to Vercel → Settings → Environment Variables
2. Find `NEXTAUTH_URL` (Production)
3. Change from `https://your-project.vercel.app` to `https://lacqueandlatte.ca`
4. Click **"Save"**
5. Go to **Deployments** → Click **"..."** → **"Redeploy"**

✅ **Domain Connection Complete!**

---

## ✅ STEP 7: Create Your Local .env.local File

Now let's set up your local development environment.

1. Copy the `.env.example` file:
```bash
cp .env.example .env.local
```

2. Open `.env.local` in your editor

3. Fill in all the values you collected:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://Hannah:YourPassword@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=lacque-latte

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# MailerSend
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxx
MAILERSEND_FROM=noreply@lacqueandlatte.ca
MAILERSEND_FROM_NAME=Lacque & Latte
MAILERSEND_TO=hannah@lacqueandlatte.ca
FEATURE_EMAIL_ENABLED=true

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_PHONE_NUMBER=+12345678901
FEATURE_SMS_ENABLED=true

# Legal
LEGAL_BUSINESS_NAME=Lacque&Latte Nail Studio
LEGAL_PRIVACY_CONTACT_EMAIL=privacy@lacqueandlatte.ca
FEATURE_CONSENT_REQUIRED=true
```

4. Save the file

⚠️ **Never commit this file to git!** It's already in `.gitignore`.

---

## 🧪 STEP 8: Test Everything

### 8.1 Test Locally

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

**Test checklist:**
- [ ] Home page loads
- [ ] Contact form submits successfully
- [ ] Login works at `/login`
- [ ] Dashboard accessible after login
- [ ] Booking flow works
- [ ] Check Terminal for email/SMS logs

### 8.2 Test Production

Once your domain is live: https://lacqueandlatte.ca

**Test checklist:**
- [ ] Home page loads
- [ ] All images load
- [ ] Contact form works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] Create a test appointment
- [ ] Check for email notification
- [ ] Check for SMS notification

### 8.3 Check Vercel Logs

If something doesn't work:
1. Go to Vercel Dashboard → Your Project
2. Click **"Logs"**
3. Look for error messages
4. Common issues:
   - ❌ Missing environment variable
   - ❌ Wrong MongoDB connection string
   - ❌ Domain not verified for email
   - ❌ Phone number format wrong

---

## 🎯 Quick Reference: Where to Find Each Value

| Service | What You Need | Where to Find It |
|---------|---------------|------------------|
| **MongoDB** | Connection URI | cloud.mongodb.com → Database → Connect → Drivers |
| **MongoDB** | Database Name | Use: `lacque-latte` |
| **NextAuth** | Secret Key | Generate: `openssl rand -base64 32` |
| **MailerSend** | API Key | mailersend.com → Email → API Tokens |
| **MailerSend** | From Email | Use: `noreply@lacqueandlatte.ca` |
| **MailerSend** | To Email | Your business email |
| **Twilio** | Account SID | twilio.com/console (Dashboard) |
| **Twilio** | Auth Token | twilio.com/console (Click "Show") |
| **Twilio** | Phone Number | Phone Numbers → Manage → Buy a Number |
| **Vercel** | Project URL | Automatically generated after deploy |
| **GoDaddy** | DNS Settings | My Products → Domains → DNS |

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check `MONGODB_URI` is correct
- Check password is URL-encoded
- Check Network Access allows `0.0.0.0/0`
- Test connection: https://lacqueandlatte.ca/api/health

### "Email not sending"
- Check `FEATURE_EMAIL_ENABLED=true`
- Check domain is verified in MailerSend
- Check DNS records are added
- Check Vercel logs for errors

### "SMS not sending"
- Check `FEATURE_SMS_ENABLED=true`
- Check phone number format: `+12345678901`
- Check Twilio account has credits
- Check Vercel logs for errors

### "Cannot login"
- Check admin user exists in MongoDB
- Check password hash was generated correctly
- Check `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

### "Domain not working"
- Wait longer (up to 24 hours)
- Check DNS propagation: whatsmydns.net
- Check DNS records in GoDaddy
- Try clearing browser cache

---

## 📞 Support

If you're still stuck:
1. Check Vercel logs first
2. Check MongoDB Atlas logs
3. Try the same action locally with `npm run dev`
4. Check each service's dashboard for errors

---

## ✨ You're All Set!

Your Lacque & Latte booking site is now fully configured with:
- ✅ Database for storing appointments
- ✅ Authentication for admin access
- ✅ Email notifications for bookings
- ✅ SMS reminders for clients
- ✅ Custom domain
- ✅ Secure hosting on Vercel

**Next steps:**
1. Test booking flow thoroughly
2. Book a real test appointment
3. Share the site with friends for feedback
4. Monitor Vercel logs for first few days
5. Set up MongoDB automated backups (in Atlas)

**Your URLs:**
- 🌐 Website: https://lacqueandlatte.ca
- 🔐 Admin Dashboard: https://lacqueandlatte.ca/login
- 📊 Vercel Dashboard: https://vercel.com/dashboard
- 🗄️ MongoDB Dashboard: https://cloud.mongodb.com

---

**Setup Guide Created by:** Arvado IT Solutions  
**Last Updated:** October 29, 2025


