# 💅 Lacque & Latte Nail Studio - Next.js Application

Modern, secure, and scalable nail studio management system built with Next.js 14, MongoDB Atlas, and NextAuth.

## 🚀 Features

- ✅ **Full-Stack TypeScript** - Type-safe frontend and backend
- ✅ **MongoDB Integration** - Real database with connection pooling
- ✅ **Authentication** - Secure admin/stylist login with NextAuth
- ✅ **PIPEDA Compliant** - Canadian privacy law compliance
- ✅ **Feature Flags** - Works without external APIs (dry-run mode)
- ✅ **Email & SMS** - MailerSend and Twilio integration with opt-out
- ✅ **API Routes** - RESTful API for appointments, contacts, SMS
- ✅ **Responsive Design** - Mobile-first, accessible UI
- ✅ **Security** - Environment variables, protected routes, input validation

## 📋 Prerequisites

- **Node.js** 18.0.0 or higher
- **MongoDB Atlas** account (free tier works)
- **(Optional)** MailerSend API token for email
- **(Optional)** Twilio credentials for SMS

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd /path/to/project
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

### 3. Configure `.env.local`

**Minimum required** (app will work with just these):

```env
MONGODB_URI="mongodb+srv://Andrew:Zeus20230607@lacquelatte.7cwderu.mongodb.net/lacque-latte?retryWrites=true&w=majority&appName=LacqueLatte"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

**Optional services** (leave blank for dry-run mode):

```env
# Email (optional - works without it)
MAILERSEND_API_KEY="your-mailersend-token"
MAILERSEND_FROM="noreply@lacqueandlatte.ca"
MAILERSEND_FROM_NAME="Lacque & Latte"
FEATURE_EMAIL_ENABLED="false"

# SMS (optional - works without it)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
FEATURE_SMS_ENABLED="false"
```

### 4. Set Up Database

The application will automatically create collections. To create an initial admin user:

```bash
# Run the database setup script (create one or use MongoDB Compass)
# Or manually insert an admin user into the 'users' collection:
{
  "email": "hannah@lacqueandlatte.ca",
  "name": "Hannah",
  "hashedPassword": "<bcrypt-hash-of-password>",
  "role": "admin",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Hash a password with bcrypt:**

```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('your-password', 10);
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```

├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── contact/       # Contact form
│   │   │   ├── appointments/  # Appointments CRUD
│   │   │   ├── sms/           # SMS sending
│   │   │   └── health/        # Health check
│   │   ├── contact/           # Contact page
│   │   ├── login/             # Login page
│   │   ├── dashboard/         # Admin dashboard (protected)
│   │   ├── privacy/           # Privacy policy
│   │   ├── terms/             # Terms of service
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── auth/
│   │   └── config.ts          # NextAuth configuration
│   ├── lib/
│   │   ├── db.ts              # MongoDB connection
│   │   ├── email.ts           # MailerSend integration
│   │   ├── sms.ts             # Twilio integration
│   │   └── validators.ts      # Zod validation schemas
│   ├── types/
│   │   ├── database.ts        # Database type definitions
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   └── middleware.ts          # Route protection
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore (includes .env.local)
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── SECURITY.md                # Security guide
└── README.md                  # This file
```

## 🔒 Security

### Environment Variables

**Never commit `.env.local` to git!** It's in `.gitignore` by default.

- `.env.example` - Template (no real values) ✅ Safe to commit
- `.env.local` - Your actual secrets ❌ Never commit

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

### API Key Management

1. **Local Development:** Store in `.env.local`
2. **Production (Vercel):** Add in Vercel dashboard under Environment Variables
3. **Different Secrets:** Use different `NEXTAUTH_SECRET` for prod vs dev

### Feature Flags (Dry-Run Mode)

The app works **without** external API keys using dry-run mode:

```env
FEATURE_EMAIL_ENABLED="false"  # Emails logged, not sent
FEATURE_SMS_ENABLED="false"    # SMS logged, not sent
```

This allows you to:
- Develop locally without costs
- Test functionality without real services
- Deploy immediately and add services later

## 📡 API Endpoints

### Public Endpoints

- `POST /api/contact` - Submit contact form
- `POST /api/appointments` - Create appointment (public booking)

### Protected Endpoints (Require Authentication)

- `GET /api/appointments` - List appointments
- `PATCH /api/appointments` - Update appointment
- `DELETE /api/appointments?id=<id>` - Cancel appointment
- `POST /api/sms` - Send SMS reminder

### Health Check

- `GET /api/health` - Check database connectivity and service status

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Contact form (should work in dry-run mode)
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message",
    "consentAccepted": true
  }'
```

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial Next.js setup"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `next-app`

### 3. Configure Environment Variables

In Vercel Project Settings > Environment Variables, add:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_URL` - Your production domain (e.g., `https://lacqueandlatte.ca`)
- `NEXTAUTH_SECRET` - Generate a new one for production

**Optional:**
- `MAILERSEND_API_KEY`
- `FEATURE_EMAIL_ENABLED="true"`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `FEATURE_SMS_ENABLED="true"`

### 4. Deploy

Vercel will automatically deploy when you push to `main`.

## 🗄️ Database Schema

### Collections

#### `users`
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  hashedPassword: string,
  role: 'admin' | 'stylist' | 'client',
  createdAt: Date,
  updatedAt: Date
}
```

#### `appointments`
```typescript
{
  _id: ObjectId,
  clientName: string,
  clientEmail: string,
  clientPhone: string?,
  service: string,
  stylist: string?,
  startTime: Date,
  endTime: Date,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes: string?,
  consentAccepted: boolean,
  consentDate: Date,
  reminderSent: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### `messages`
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string?,
  message: string,
  consentAccepted: boolean,
  consentDate: Date,
  status: 'new' | 'read' | 'responded' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Customization

### Branding

Edit environment variables:
```env
LEGAL_BUSINESS_NAME="Your Business Name"
LEGAL_PRIVACY_CONTACT_EMAIL="privacy@yourdomain.com"
```

### Styling

Global styles in `src/app/globals.css` - update CSS variables:
```css
:root {
  --primary-color: #e4b4c2;  /* Change to your brand color */
  --secondary-color: #1a1a1a;
  /* ... */
}
```

## 📞 Support

For questions or issues:

- **Email:** dev@arvado.ca
- **Documentation:** See `docs/` folder in parent directory
- **Security Issues:** See [SECURITY.md](./SECURITY.md)

## 📄 License

© 2025 Lacque & Latte Nail Studio. All rights reserved.  
Developed by Arvado IT Solutions.

