# MailerSend Migration Guide

## ✅ Migration Complete

The email service has been successfully migrated from **SendGrid** to **MailerSend**.

---

## 📦 What Changed

### 1. **Package Dependencies**
- ✅ Removed: `@sendgrid/mail`
- ✅ Added: `mailersend` v2.3.0
- ✅ Installed via `npm install`

### 2. **Email Service Implementation**
**File:** `/src/lib/email.ts`

- Updated to use MailerSend SDK
- Changed from SendGrid's mail format to MailerSend's EmailParams
- All existing email functions work the same way:
  - `sendEmail()` - Core email sending
  - `sendContactFormEmail()` - Contact form submissions
  - `sendAppointmentConfirmation()` - Booking confirmations
  - `sendAppointmentReminder()` - Appointment reminders

### 3. **Environment Variables**
Updated from SendGrid variables to MailerSend variables:

| Old (SendGrid) | New (MailerSend) | Example Value |
|----------------|------------------|---------------|
| `SENDGRID_API_KEY` | `MAILERSEND_API_KEY` | `mlsn.xxxxxx...` |
| `SENDGRID_FROM` | `MAILERSEND_FROM` | `noreply@lacqueandlatte.ca` |
| `SENDGRID_TO` | `MAILERSEND_TO` | `info@lacqueandlatte.ca` |
| *(not used)* | `MAILERSEND_FROM_NAME` | `Lacque & Latte` |
| `FEATURE_EMAIL_ENABLED` | `FEATURE_EMAIL_ENABLED` | `true` or `false` |

### 4. **Documentation Updated**
All documentation files have been updated to reference MailerSend:

- ✅ `/docs/README.md`
- ✅ `/docs/ARCHITECTURE.md`
- ✅ `/docs/QUICK-START.md`
- ✅ `/docs/DEPLOYMENT-GUIDE.md`
- ✅ `/docs/COMPLETION-SUMMARY.md`
- ✅ `/docs/MIGRATION-SUMMARY.md`
- ✅ `/docs/PIPEDA-COMPLIANCE.md`
- ✅ `/docs/SECURITY.md`
- ✅ `/src/app/privacy/page.tsx` - Privacy policy updated

---

## 🚀 Setup Instructions

### Step 1: Create MailerSend Account

1. Sign up for free at [mailersend.com](https://mailersend.com)
2. Free tier includes **12,000 emails per month** (vs SendGrid's 100/day)

### Step 2: Verify Your Domain

1. Go to **Domains** → **Add Domain**
2. Add your domain: `lacqueandlatte.ca`
3. Add the DNS records provided by MailerSend:
   - TXT records (for SPF and DKIM)
   - CNAME records
4. Wait for verification (usually 24-48 hours)

### Step 3: Create API Token

1. Go to **API Tokens** → **Create Token**
2. Name it: "Lacque & Latte Production"
3. Permissions: Select "Email" (full access to sending)
4. Copy the token (starts with `mlsn.`)

### Step 4: Update Environment Variables

#### For Local Development (`.env.local`):

```bash
# Email Configuration - MailerSend
MAILERSEND_API_KEY="mlsn.your_token_here"
MAILERSEND_FROM="noreply@lacqueandlatte.ca"
MAILERSEND_FROM_NAME="Lacque & Latte"
MAILERSEND_TO="info@lacqueandlatte.ca"
FEATURE_EMAIL_ENABLED="true"
```

#### For Production (Vercel Dashboard):

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Remove old SendGrid variables:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM` *(if different)*
   - `SENDGRID_TO` *(if different)*
4. Add new MailerSend variables:
   - `MAILERSEND_API_KEY` = `mlsn.your_token_here`
   - `MAILERSEND_FROM` = `noreply@lacqueandlatte.ca`
   - `MAILERSEND_FROM_NAME` = `Lacque & Latte`
   - `MAILERSEND_TO` = `info@lacqueandlatte.ca`
   - `FEATURE_EMAIL_ENABLED` = `true`
5. Redeploy your application

### Step 5: Test Email Sending

After setting up, test the email functionality:

1. **Contact Form Test:**
   - Visit `/contact` page
   - Fill out and submit the form
   - Check `info@lacqueandlatte.ca` for the email

2. **Check Logs:**
   ```bash
   # In development
   npm run dev
   # Look for: "✅ Email sent successfully"
   ```

3. **Check MailerSend Dashboard:**
   - View sent emails in the MailerSend dashboard
   - Monitor delivery rates and opens

---

## 🎯 Benefits of MailerSend

### Compared to SendGrid:

| Feature | SendGrid Free | MailerSend Free |
|---------|---------------|-----------------|
| **Emails/Month** | ~3,000 (100/day) | **12,000** |
| **Setup Complexity** | Moderate | Simple |
| **Dashboard** | Complex | Clean & Modern |
| **API** | Robust but complex | Simple & intuitive |
| **Cost to Upgrade** | $19.95/mo (40k emails) | $25/mo (50k emails) |

### Key Advantages:
- ✅ **4x more free emails** per month
- ✅ **Better free tier limits**
- ✅ Modern, user-friendly dashboard
- ✅ Excellent documentation
- ✅ Fast email delivery
- ✅ Built-in email templates (optional)
- ✅ Real-time analytics

---

## 🔧 Technical Details

### Email Sending Flow

1. **Dry-Run Mode** (no API key or feature disabled):
   ```typescript
   // Logs email details to console, returns success
   { success: true, dryRun: true }
   ```

2. **Production Mode** (API key present and feature enabled):
   ```typescript
   // Sends via MailerSend API
   { success: true, dryRun: false, messageId: "..." }
   ```

### Error Handling

The implementation includes robust error handling:
- Invalid API tokens → logged error, graceful failure
- Network errors → logged error with details
- All errors return: `{ success: false, error: "message" }`

### Code Example

```typescript
import { sendEmail } from '@/lib/email';

const result = await sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome to Lacque & Latte',
  text: 'Thank you for booking...',
  html: '<p>Thank you for booking...</p>',
});

if (result.success) {
  console.log('Email sent!', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

---

## 📋 Verification Checklist

After migration, verify:

- [ ] MailerSend account created
- [ ] Domain verified (DNS records added)
- [ ] API token generated
- [ ] Environment variables updated locally
- [ ] Environment variables updated on Vercel
- [ ] Application redeployed
- [ ] Contact form email test passed
- [ ] MailerSend dashboard shows sent email
- [ ] No errors in application logs
- [ ] Old SendGrid keys removed from Vercel

---

## 🆘 Troubleshooting

### "MailerSend client not initialized"
- **Cause:** `MAILERSEND_API_KEY` is not set or invalid
- **Fix:** Double-check the API key in environment variables

### Emails not sending (but no errors)
- **Cause:** `FEATURE_EMAIL_ENABLED` is set to `"false"`
- **Fix:** Set to `"true"` in environment variables

### "Domain not verified" error
- **Cause:** DNS records not added or not propagated
- **Fix:** 
  1. Verify DNS records in MailerSend dashboard
  2. Wait up to 48 hours for propagation
  3. Use a verified test domain temporarily

### Email goes to spam
- **Fix:**
  1. Ensure SPF and DKIM records are set up correctly
  2. Use your verified domain for the "from" address
  3. Add proper unsubscribe links
  4. Avoid spam trigger words

---

## 🔒 Security Notes

1. **Never commit API tokens** to git
2. **Use different tokens** for development and production
3. **Rotate tokens** if they're ever exposed
4. **Monitor usage** in MailerSend dashboard to detect anomalies
5. **Set up alerts** for failed deliveries

---

## 📚 Additional Resources

- [MailerSend Documentation](https://developers.mailersend.com/)
- [MailerSend Node.js SDK](https://github.com/mailersend/mailersend-nodejs)
- [Email Best Practices](https://www.mailersend.com/blog/email-best-practices)
- [SPF & DKIM Setup Guide](https://www.mailersend.com/help/how-to-set-up-spf-and-dkim)

---

## ✨ Next Steps

1. **Set up email templates** (optional):
   - MailerSend offers visual email template builder
   - Can replace inline HTML with template IDs

2. **Enable email tracking** (optional):
   - Track opens and clicks
   - Monitor engagement rates

3. **Set up webhooks** (optional):
   - Get notified of bounces and complaints
   - Update user records automatically

---

**Migration completed by:** AI Assistant  
**Date:** October 29, 2025  
**Status:** ✅ Ready for production

