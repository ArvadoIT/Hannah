# ⚡ Quick Start Guide

Get Hannah's database-powered Next.js app running in 5 minutes!

## 🎯 Goal

You'll have a working Next.js app connected to MongoDB that handles:
- Contact forms → saved to database
- Appointments → real data storage
- Admin login → secure authentication
- Email/SMS → dry-run mode (no keys needed initially)

## 📝 Steps

### 1. Install Dependencies (1 minute)

```bash
cd /path/to/project
npm install
```

### 2. Set Up Environment (2 minutes)

**Copy the template:**
```bash
cp .env.example .env.local
```

**Edit `.env.local` and add these 3 required variables:**

```env
# Your MongoDB connection string (already set up)
MONGODB_URI="mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/lacque-latte?retryWrites=true&w=majority&appName=LacqueLatte"

# Local development URL
NEXTAUTH_URL="http://localhost:3000"

# Generate a secret (run this command and paste the output)
NEXTAUTH_SECRET="<paste-output-of-command-below>"
```

**Generate secret:**
```bash
openssl rand -base64 32
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Leave email/SMS settings as false for now** (dry-run mode works without API keys):
```env
FEATURE_EMAIL_ENABLED="false"
FEATURE_SMS_ENABLED="false"
```

### 3. Create Admin User (1 minute)

**Option A: Using MongoDB Compass (Recommended)**

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your URI
3. Navigate to `lacque-latte` database → `users` collection
4. Insert document:

```json
{
  "email": "hannah@lacqueandlatte.ca",
  "name": "Hannah",
  "hashedPassword": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "role": "admin",
  "createdAt": {"$date": "2025-10-21T00:00:00.000Z"},
  "updatedAt": {"$date": "2025-10-21T00:00:00.000Z"}
}
```

**Note:** Password for this user is `admin123` - **change it later!**

**Option B: Using MongoDB Atlas Dashboard**

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Database: `lacque-latte` → Collection: `users` → Insert Document
4. Paste the JSON above

**Option C: Generate Your Own Password**

```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('your-chosen-password', 10);
# Copy the output and use as hashedPassword
```

### 4. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Test Everything

### 1. Home Page
- Go to http://localhost:3000
- Should see Lacque & Latte landing page

### 2. Contact Form (Dry-Run)
- Go to http://localhost:3000/contact
- Fill out form with test data
- Check consent checkbox
- Submit → Should see "Message received! (Dry-run mode)"
- Check console logs → Should see `[DRY-RUN] Email would be sent`

### 3. Admin Login
- Go to http://localhost:3000/login
- Email: `hannah@lacqueandlatte.ca`
- Password: `admin123`
- Should redirect to dashboard

### 4. Health Check
Open in browser or curl:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "services": {
    "database": true,
    "email": false,
    "sms": false
  }
}
```

## 🎉 Success!

You now have:
- ✅ Next.js app running with MongoDB
- ✅ Contact forms saving to database
- ✅ Admin authentication working
- ✅ Email/SMS in dry-run mode (no external APIs needed)

## 🚀 Next Steps

### Enable Email (Optional)

1. Get MailerSend API token (free tier: 12,000 emails/month)
2. Add to `.env.local`:
   ```env
   MAILERSEND_API_KEY="mlsn.xxxxxx"
   MAILERSEND_FROM="noreply@lacqueandlatte.ca"
   MAILERSEND_FROM_NAME="Lacque & Latte"
   FEATURE_EMAIL_ENABLED="true"
   ```
3. Restart dev server

### Enable SMS (Optional)

1. Get Twilio credentials
2. Add to `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxxx"
   TWILIO_AUTH_TOKEN="xxxxxx"
   TWILIO_PHONE_NUMBER="+1234567890"
   FEATURE_SMS_ENABLED="true"
   ```
3. Restart dev server

### View Database Data

**MongoDB Compass:**
1. Connect to your database
2. Navigate to collections:
   - `users` - Admin/stylist accounts
   - `appointments` - Booking data
   - `messages` - Contact form submissions

**MongoDB Atlas Dashboard:**
1. Go to "Browse Collections"
2. View data in each collection

### Deploy to Production

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for complete Vercel deployment instructions.

## 🆘 Troubleshooting

### "Cannot connect to database"

**Check:**
1. Is MongoDB URI correct in `.env.local`?
2. Is MongoDB Atlas cluster running?
3. Is network access configured to allow your IP?

**Fix:**
- Go to MongoDB Atlas → Network Access
- Add your IP or use `0.0.0.0/0` for testing

### "NextAuth configuration error"

**Check:**
1. Is `NEXTAUTH_SECRET` set?
2. Is `NEXTAUTH_URL` set to `http://localhost:3000`?

**Fix:**
- Regenerate secret: `openssl rand -base64 32`
- Make sure no quotes or spaces in the value

### "Cannot login"

**Check:**
1. Does the user exist in the database?
2. Is the password hash correct?
3. Check browser console for errors

**Fix:**
- Verify user exists in MongoDB Compass
- Try the default password: `admin123`
- Check that email exactly matches

### Port 3000 already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

## 📞 Need Help?

1. Check [README.md](./README.md) for full documentation
2. Check [SECURITY.md](./SECURITY.md) for security guidelines
3. Email: dev@arvado.ca

---

**That's it!** You should be up and running in ~5 minutes. 🎊

