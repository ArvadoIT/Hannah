# 🔒 Security Guide - Lacque & Latte

## Environment Variables Setup

### For Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`
   - This file is in `.gitignore` and will NEVER be committed to git
   - Keep this file secure and never share it

3. **Required for basic functionality:**
   - `MONGODB_URI` - Your MongoDB connection string
   - `NEXTAUTH_URL` - Set to `http://localhost:3000` for local dev
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

4. **Optional services** (app works without these in dry-run mode):
   - MailerSend keys - for email notifications
   - Twilio keys - for SMS notifications
   - Google Analytics - for tracking
   - Google Places API - for reviews

### For Production (Vercel)

1. **Go to your Vercel project settings**
2. **Navigate to:** Settings > Environment Variables
3. **Add each variable** from `.env.example` with your production values
4. **Important production changes:**
   - `NEXTAUTH_URL` should be your actual domain (e.g., `https://lacqueandlatte.ca`)
   - Use different `NEXTAUTH_SECRET` than local
   - Set feature flags (`FEATURE_EMAIL_ENABLED`, etc.) as needed

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Alternative if openssl not available
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## What Gets Committed to Git? ✅❌

### ✅ SAFE to commit:
- `.env.example` (template with NO real values)
- `.gitignore` (ensures sensitive files are excluded)
- Source code files
- Documentation
- Configuration files (without secrets)

### ❌ NEVER commit:
- `.env.local` (contains your real API keys)
- `.env` (any environment files with real values)
- `.env.development.local`
- `.env.production.local`
- Any file containing passwords, API keys, or secrets

## MongoDB Connection String Security

Your MongoDB URI contains your password. Keep it secure:

```
❌ BAD:  mongodb+srv://Andrew:Zeus20230607@lacquelatte...
✅ GOOD: Store in .env.local (gitignored)
```

## API Key Security Checklist

- [ ] All API keys are in `.env.local` (not `.env`)
- [ ] `.env.local` is listed in `.gitignore`
- [ ] `.env.example` only has placeholders (no real keys)
- [ ] Production keys are set in Vercel dashboard
- [ ] Different `NEXTAUTH_SECRET` for dev vs production
- [ ] MongoDB IP whitelist configured (if needed)
- [ ] MailerSend API token has appropriate permissions only
- [ ] Twilio credentials restricted to messaging only

## Feature Flags (Dry-Run Mode)

The app is designed to work WITHOUT external API keys:

```env
FEATURE_EMAIL_ENABLED="false"  # Email APIs return {dryRun: true}
FEATURE_SMS_ENABLED="false"    # SMS APIs return {dryRun: true}
```

This allows you to:
- Develop locally without buying services
- Test functionality without sending real emails/SMS
- Deploy a working site immediately
- Enable features later when ready

## Vercel Deployment Security

1. **Environment Variables in Vercel:**
   - Go to: Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Vercel encrypts these automatically
   - Different values for Production/Preview/Development

2. **Access Control:**
   - Never log sensitive data in production
   - Admin routes protected by NextAuth middleware
   - MongoDB connection pooling handled securely

3. **HTTPS Only:**
   - Vercel provides automatic HTTPS
   - Set secure cookie flags in NextAuth config
   - All API calls use HTTPS in production

## If API Keys Are Exposed 🚨

If you accidentally commit API keys to git:

1. **Immediately rotate/regenerate the exposed keys:**
   - MongoDB: Change password in Atlas
   - MailerSend: Delete and create new API token
   - Twilio: Rotate auth token
   - NextAuth: Generate new secret

2. **Remove from git history:**
   ```bash
   # This is complex - contact your team lead
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Update all environments** with new keys

## Best Practices

1. **Never hardcode secrets** in source code
2. **Use environment variables** for all sensitive data
3. **Different credentials** for dev/staging/production
4. **Minimal permissions** - only grant what's needed
5. **Regular rotation** - change secrets periodically
6. **Monitor usage** - check for unusual API activity
7. **Code reviews** - check for accidentally committed secrets

## Questions?

If you need help with security setup:
1. Check this document first
2. Review Vercel environment variables documentation
3. Contact Arvado IT Solutions

---

**Remember: Security is not optional. When in doubt, don't commit it!**

