# 🚀 Deployment Guide - Lacque & Latte Next.js App

Complete guide for deploying the Lacque & Latte application to Vercel with MongoDB Atlas.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster is set up and accessible
- [ ] Database collections exist (or will be auto-created)
- [ ] At least one admin user exists in the `users` collection
- [ ] `.env.local` works locally with all required variables
- [ ] Application runs successfully in development (`npm run dev`)
- [ ] GitHub repository is created and code is pushed

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

### 1.1 Verify Connection String

Your MongoDB URI should look like:
```
mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/lacque-latte?retryWrites=true&w=majority&appName=LacqueLatte
```

### 1.2 Network Access

1. Go to MongoDB Atlas → Network Access
2. Add IP Address: **0.0.0.0/0** (Allow access from anywhere)
   - Note: This is required for Vercel's dynamic IPs
   - MongoDB has additional security layers (authentication)

### 1.3 Create Admin User

Using MongoDB Compass or the Atlas dashboard:

```javascript
// Connect to your database
use lacque-latte

// Insert admin user
db.users.insertOne({
  email: "hannah@lacqueandlatte.ca",
  name: "Hannah",
  hashedPassword: "$2a$10$your.hashed.password.here",  // See below for how to generate
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Generate Password Hash:**

```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('your-chosen-password', 10);
# Copy the output and use it as hashedPassword
```

## 🌐 Step 2: Vercel Deployment

### 2.1 Import Project

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click **"Add New..." → "Project"**
3. **Import Git Repository**
   - Select your GitHub repository
   - Authorize Vercel if needed

### 2.2 Configure Project

**Root Directory:** (leave as default - root level)

**Framework Preset:** Next.js (auto-detected)

**Build Settings:** (leave as default)
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2.3 Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://Andrew:Zeus20230607@...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://lacqueandlatte.ca` | Production |
| `NEXTAUTH_URL` | `https://your-preview-url.vercel.app` | Preview |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `NEXTAUTH_SECRET` | **(Generate new one)** | Production, Preview, Development |

**Generate Production NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Or online: https://generate-secret.vercel.app/32
```

#### Optional Variables (For Full Features)

| Name | Value | Environment |
|------|-------|-------------|
| `MAILERSEND_API_KEY` | Your MailerSend API token | Production |
| `MAILERSEND_FROM` | `noreply@lacqueandlatte.ca` | Production |
| `MAILERSEND_FROM_NAME` | `Lacque & Latte` | Production |
| `MAILERSEND_TO` | `info@lacqueandlatte.ca` | Production |
| `FEATURE_EMAIL_ENABLED` | `true` | Production |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID | Production |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | Production |
| `TWILIO_PHONE_NUMBER` | `+1XXXXXXXXXX` | Production |
| `FEATURE_SMS_ENABLED` | `true` | Production |

#### Legal & Compliance

| Name | Value |
|------|-------|
| `LEGAL_BUSINESS_NAME` | `Lacque&Latte Nail Studio` |
| `LEGAL_PRIVACY_CONTACT_EMAIL` | `privacy@lacqueandlatte.ca` |
| `FEATURE_CONSENT_REQUIRED` | `true` |

### 2.4 Deploy

Click **"Deploy"**

Vercel will:
1. Install dependencies
2. Build the application
3. Deploy to production
4. Provide a `.vercel.app` URL

## 🔗 Step 3: Custom Domain Setup

### 3.1 Add Domain in Vercel

1. Go to Project Settings → **Domains**
2. Add domain: `lacqueandlatte.ca`
3. Add domain: `www.lacqueandlatte.ca`

### 3.2 Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

**For root domain (lacqueandlatte.ca):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Verification (if required):**
Vercel may provide a TXT record for verification - add it temporarily.

### 3.3 Wait for DNS Propagation

- Usually takes 10-60 minutes
- Can take up to 24 hours
- Check status: `dig lacqueandlatte.ca`

### 3.4 Update NEXTAUTH_URL

Once domain is live, update environment variable:
```
NEXTAUTH_URL=https://lacqueandlatte.ca
```

Redeploy after changing this variable.

## ✉️ Step 4: Email Setup (Optional)

### 4.1 MailerSend Account

1. Sign up at [mailersend.com](https://mailersend.com)
2. **Verify your domain:**
   - Domains → Add Domain
   - Add your domain (e.g., lacqueandlatte.ca)
   - Email: `noreply@lacqueandlatte.ca`
   - Or domain authentication (recommended for production)

### 4.2 Create API Key

1. Settings → API Keys
2. Create API Key with **"Mail Send"** permissions only
3. **Copy the key immediately** (you can't see it again)

### 4.3 Domain Authentication (Recommended)

1. Settings → Sender Authentication → Authenticate Your Domain
2. Select your DNS provider
3. Add the provided DNS records to your domain
4. Wait for verification (usually 24-48 hours)

**DNS Records to Add:**
- CNAME records (3-5 of them)
- These prove you own the domain

### 4.4 Update Vercel Environment Variables

```
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxx
MAILERSEND_FROM=noreply@lacqueandlatte.ca
MAILERSEND_FROM_NAME=Lacque & Latte
MAILERSEND_TO=info@lacqueandlatte.ca
FEATURE_EMAIL_ENABLED=true
```

Redeploy after adding these.

## 📱 Step 5: SMS Setup (Optional)

### 5.1 Twilio Account

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get a phone number
   - Phone Numbers → Buy a Number
   - Choose a Canadian number (+1)
   - $1-$2 per month

### 5.2 Get Credentials

1. **Account SID:** Found on dashboard
2. **Auth Token:** Found on dashboard (click "Show")
3. **Phone Number:** Your Twilio number

### 5.3 10DLC Registration (For Volume)

If sending more than a few SMS per day:
1. Complete 10DLC registration
2. Register your business
3. Register your campaign
4. Cost: ~$20 one-time + $5/month

For low volume, skip this initially.

### 5.4 Update Vercel Environment Variables

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
FEATURE_SMS_ENABLED=true
```

Redeploy after adding these.

## 🧪 Step 6: Post-Deployment Testing

### 6.1 Test Public Pages

- [ ] Home page loads: `https://lacqueandlatte.ca`
- [ ] Contact form works
- [ ] Services page loads
- [ ] Privacy policy visible

### 6.2 Test Authentication

1. Go to `/login`
2. Login with admin credentials
3. Should redirect to `/dashboard`

### 6.3 Test API Endpoints

```bash
# Health check
curl https://lacqueandlatte.ca/api/health

# Contact form
curl -X POST https://lacqueandlatte.ca/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "message": "Test message",
    "consentAccepted": true
  }'
```

### 6.4 Test Email (if enabled)

Submit contact form and check:
- Email received at `info@lacqueandlatte.ca`
- No errors in Vercel logs

### 6.5 Test SMS (if enabled)

In dashboard, send a test SMS reminder:
- SMS received on test phone
- No errors in Vercel logs

## 🔍 Step 7: Monitoring & Logs

### 7.1 View Logs

Vercel Dashboard → Your Project → Logs

Filter by:
- **Errors only** to see issues
- **Function** to see API route logs

### 7.2 Error Tracking

If you see errors:
1. Check environment variables are set correctly
2. Check MongoDB network access allows Vercel IPs
3. Check Vercel logs for specific error messages

### 7.3 Performance Monitoring

Vercel Dashboard → Analytics

Monitor:
- Page load times
- API response times
- Error rates

## 🔒 Step 8: Security Hardening

### 8.1 Verify .gitignore

Ensure `.env.local` is NOT committed:
```bash
git status
# Should NOT show .env.local
```

### 8.2 Rotate Secrets

After deployment, generate new secrets:
- New `NEXTAUTH_SECRET` for production
- Different from local development

### 8.3 MongoDB Security

1. Ensure authentication is enabled (it is by default)
2. Use strong password
3. Limit database user permissions if possible

### 8.4 API Key Permissions

- MailerSend: Only "Email" permission (full access to email sending)
- Twilio: Only "Messaging" permission
- MongoDB: Only app database access

## 🆘 Troubleshooting

### Build Fails

**Error:** `Module not found`
- Check `package.json` has all dependencies
- Run `npm install` locally first

**Error:** `Type error`
- Run `npm run type-check` locally
- Fix TypeScript errors before deploying

### Runtime Errors

**"Cannot connect to database"**
- Check `MONGODB_URI` is set in Vercel
- Check MongoDB network access allows 0.0.0.0/0
- Test connection using health endpoint

**"NextAuth configuration error"**
- Check `NEXTAUTH_URL` matches your actual domain
- Check `NEXTAUTH_SECRET` is set
- Try regenerating secret

**"Email/SMS not sending"**
- Check feature flags are set to `"true"`
- Check API keys are correct
- Check Vercel logs for specific errors
- Dry-run mode works without keys

### DNS Issues

**Domain not resolving**
- Wait longer (up to 24 hours)
- Check DNS with: `dig lacqueandlatte.ca`
- Verify DNS records in your registrar

**SSL certificate error**
- Wait for Vercel to issue certificate (automatic)
- Usually takes 5-10 minutes after DNS propagates

## 📞 Support

If you encounter issues:

1. Check Vercel logs first
2. Check MongoDB Atlas logs
3. Test locally with same environment variables
4. Contact: dev@arvado.ca

## ✅ Deployment Complete!

Your application is now live at:
- **Production:** https://lacqueandlatte.ca
- **Dashboard:** https://lacqueandlatte.ca/login

Next steps:
1. Test all functionality
2. Monitor logs for first few days
3. Set up automated backups (MongoDB Atlas)
4. Plan for ongoing maintenance

---

**Deployed by:** Arvado IT Solutions  
**Date:** October 2025

