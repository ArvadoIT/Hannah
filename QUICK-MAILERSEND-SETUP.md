# 🚀 Quick MailerSend Setup (5 Minutes)

## ✅ Migration is Complete! Just need your API token.

---

## Step 1: Get Your Token (2 min)

1. Go to https://mailersend.com and sign up (FREE)
2. Click **"Domains"** → **"Add Domain"**
3. Enter: `lacqueandlatte.ca`
4. Add the DNS records they show you (TXT & CNAME)
5. Go to **"API Tokens"** → **"Create Token"**
6. Copy the token (starts with `mlsn.`)

---

## Step 2: Add to Your .env.local (1 min)

Create or update `/.env.local`:

```bash
# Paste your MailerSend token here
MAILERSEND_API_KEY="mlsn.paste_your_token_here"
MAILERSEND_FROM="noreply@lacqueandlatte.ca"
MAILERSEND_FROM_NAME="Lacque & Latte"
MAILERSEND_TO="info@lacqueandlatte.ca"
FEATURE_EMAIL_ENABLED="true"
```

---

## Step 3: Test It (2 min)

```bash
# In terminal
cd root
npm run dev

# Visit http://localhost:3000/contact
# Submit the form
# Check your email! 📧
```

---

## Step 4: Deploy to Production

### On Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. **Delete these old ones:**
   - `SENDGRID_API_KEY`
   
3. **Add these new ones:**
   - `MAILERSEND_API_KEY` = `mlsn.your_token`
   - `MAILERSEND_FROM` = `noreply@lacqueandlatte.ca`
   - `MAILERSEND_FROM_NAME` = `Lacque & Latte`
   - `MAILERSEND_TO` = `info@lacqueandlatte.ca`
   - `FEATURE_EMAIL_ENABLED` = `true`

4. Click **Redeploy**

---

## 🎉 Done!

### What You Get:
- ✅ **12,000 free emails/month** (vs SendGrid's 3,000)
- ✅ **Better dashboard** and analytics
- ✅ **Faster delivery** times
- ✅ **Everything works the same** as before

---

## 📚 Need More Details?

- **Full Guide:** `MAILERSEND-MIGRATION-GUIDE.md`
- **Complete Summary:** `MIGRATION-COMPLETE.md`
- **Environment Template:** `ENV-EXAMPLE.md`

---

## ⚡ Pro Tips

1. **Domain not verified yet?** You can still test with the token, but emails might go to spam. Add those DNS records ASAP!

2. **Want to test without sending real emails?** Set `FEATURE_EMAIL_ENABLED="false"` and it will log to console instead.

3. **Check if it's working:** Look in the MailerSend dashboard under "Activity" to see sent emails.

---

**That's it! You're now using MailerSend. Enjoy your 4x more free emails! 🎊**

