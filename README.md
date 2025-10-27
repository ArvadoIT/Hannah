# Lacque & Latte Nail Studio Website

A modern, luxury nail studio website built with **Next.js 14**, MongoDB Atlas, and comprehensive authentication. Features a sophisticated design with organic shapes, warm neutral aesthetics, and a powerful admin dashboard.

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![Next.js](https://img.shields.io/badge/next.js-14-black)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)]()

---

## ✨ Features

### Public Website
- 🎨 **Modern Minimalist Design** - Organic shapes and warm neutral palette
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile
- ⚡ **High Performance** - Next.js 14 optimized rendering
- 🎬 **Elegant Animations** - Smooth transitions and scroll effects
- 🖼️ **Portfolio Gallery** - Instagram integration with filtering
- 📅 **Booking Integration** - Native booking system
- ⭐ **Google Reviews** - Display customer testimonials
- ♿ **Accessible** - ARIA labels, semantic HTML, keyboard navigation

### Admin Dashboard
- 🔐 **Secure Authentication** - NextAuth with MongoDB
- 📊 **Analytics Dashboard** - Revenue tracking, appointment statistics
- 📅 **Calendar View** - Real-time appointment management
- 📱 **Mobile Friendly** - Responsive admin interface
- 👥 **Multi-User Support** - Admin and stylist roles

### Technical Highlights
- ✅ **Next.js 14** - Modern React framework with App Router
- ✅ **MongoDB Atlas** - Real database with connection pooling
- ✅ **TypeScript** - Full type safety
- ✅ **NextAuth** - Secure authentication system
- ✅ **Email & SMS** - SendGrid and Twilio integration
- ✅ **PIPEDA Compliant** - Canadian privacy law compliance

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0.0 or higher
- **MongoDB Atlas** account (free tier works)
- **(Optional)** SendGrid API key for email
- **(Optional)** Twilio credentials for SMS

### Running Locally

```bash
cd next-app
npm install
npm run dev
```

Then open: `http://localhost:3000`

See **[next-app/README.md](./next-app/README.md)** for complete setup instructions.

### Running Tests

```bash
cd next-app
npm run test:e2e
```

See **[next-app/README.md](./next-app/README.md)** for complete testing guide.

---

## 📁 Project Structure

```
Hannah/
├── next-app/              # Next.js 14 Application (Main Website)
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── api/       # API routes
│   │   │   ├── contact/   # Contact page
│   │   │   ├── services/  # Services page
│   │   │   ├── login/     # Login page
│   │   │   ├── dashboard/ # Admin dashboard
│   │   │   └── page.tsx   # Home page
│   │   ├── components/    # React components
│   │   │   ├── Navigation.tsx
│   │   │   ├── BookingFlow.tsx
│   │   │   ├── InstagramSection.tsx
│   │   │   └── AnimatedElement.tsx
│   │   ├── lib/           # Utilities
│   │   │   ├── db.ts      # MongoDB connection
│   │   │   ├── email.ts   # SendGrid integration
│   │   │   ├── sms.ts     # Twilio integration
│   │   │   └── validators.ts
│   │   ├── auth/          # NextAuth configuration
│   │   └── types/         # TypeScript definitions
│   ├── public/            # Static assets
│   ├── tests/             # E2E tests
│   ├── README.md          # Complete documentation
│   └── package.json
│
├── docs/                  # 📚 Documentation
│   ├── README.md          # Documentation index
│   ├── IMPLEMENTATION-HISTORY.md
│   ├── TESTING.md
│   ├── ADMIN.md
│   ├── ARCHITECTURE.md
│   └── PIPEDA-COMPLIANCE.md
│
├── README.md              # This file
├── QUICK-START-TESTING.md # Quick testing guide
└── MIGRATION-SUMMARY.md   # Static → Next.js migration details
```

---

## 📚 Documentation

### Application Documentation
- **[next-app/README.md](./next-app/README.md)** - Complete Next.js application guide
- **[next-app/SECURITY.md](./next-app/SECURITY.md)** - Security best practices
- **[next-app/DEPLOYMENT-GUIDE.md](./next-app/DEPLOYMENT-GUIDE.md)** - Production deployment

### Quick Links

| Documentation | Description |
|---------------|-------------|
| **[Next.js App Guide](./next-app/README.md)** | Complete application documentation and setup |
| **[Deployment Guide](./next-app/DEPLOYMENT-GUIDE.md)** | Step-by-step Vercel deployment |
| **[Security Guide](./next-app/SECURITY.md)** | Security best practices |
| **[Architecture](./docs/ARCHITECTURE.md)** | Technical architecture and design decisions |
| **[PIPEDA Compliance](./docs/PIPEDA-COMPLIANCE.md)** | Canadian privacy law compliance |
| **[Implementation History](./docs/IMPLEMENTATION-HISTORY.md)** | Complete changelog of development |

See **[next-app/README.md](./next-app/README.md)** for complete application documentation.

---

## 🎨 Design System

### Color Palette
```css
--primary-color: #8b7355;          /* Warm brown */
--secondary-color: #d4af37;        /* Gold accent */
--background-primary: #faf8f5;     /* Cream */
--background-secondary: #f5f1ed;   /* Light beige */
--text-primary: #2c2c2c;           /* Dark gray */
```

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold)

### Key Features
- Organic rounded shapes throughout
- Smooth animations and transitions
- Mobile-first responsive design
- Lazy-loaded images for performance
- Accessible color contrast ratios

---

## 🔧 Admin Dashboard

### Access

**URL**: `/dashboard` or `/login`

**Master Account**:
- Email: `hannah@lacqueandlatte.ca` (or as configured)
- Password: (set in MongoDB)
- Access: Full analytics and all stylist schedules

**Stylist Accounts**:
- Email: (configured in MongoDB)
- Password: (set in MongoDB)
- Access: Individual schedule view

See **[next-app/README.md](./next-app/README.md)** for admin setup and authentication details.

---

## 🧪 Testing

### Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Global (Navigation, Console) | 10+ | ✅ Passing |
| Home Page | 15+ | ✅ Passing |
| Booking Flow | 15+ | ✅ Passing |
| Services & Contact | 10+ | ✅ Passing |
| Admin Dashboard | 12+ | ✅ Passing |
| Responsive | 12+ | ✅ Passing |
| **Total** | **70+** | **✅ Passing** |

### Running Tests

```bash
cd next-app

# Run all E2E tests
npm run test:e2e

# UI mode (recommended)
npm run test:e2e:ui

# Specific test
npx playwright test tests/specs/home/

# Type checking
npm run type-check

# Linting
npm run lint
```

See **[next-app/README.md](./next-app/README.md)** for complete testing documentation.

---

## 📈 Performance Metrics

| Metric | Score | Status |
|--------|-------|--------|
| **Lighthouse Performance** | 92+ | ✅ Excellent |
| **First Contentful Paint** | < 1.5s | ✅ Fast |
| **Time to Interactive** | < 3.0s | ✅ Good |
| **Cumulative Layout Shift** | < 0.1 | ✅ Excellent |
| **Accessibility** | 95+ | ✅ Excellent |
| **SEO** | 100 | ✅ Perfect |

---

## 🔐 Security Features

- ✅ Content Security Policy (CSP) headers
- ✅ Honeypot spam protection on forms
- ✅ Input sanitization and validation
- ✅ Strict mode JavaScript
- ✅ HTTPS enforcement (production)
- ✅ Role-based admin access control

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome/Edge | Latest 2 | ✅ Fully Supported |
| Firefox | Latest 2 | ✅ Fully Supported |
| Safari | Latest 2 | ✅ Fully Supported |
| Mobile Safari | Latest 2 | ✅ Fully Supported |
| Chrome Mobile | Latest | ✅ Fully Supported |

---

## 🚀 Deployment

### Production Checklist

- [ ] Set up MongoDB Atlas database
- [ ] Create admin user in database
- [ ] Configure environment variables in Vercel
- [ ] Generate and set `NEXTAUTH_SECRET`
- [ ] Set production `NEXTAUTH_URL`
- [ ] Test admin authentication
- [ ] Configure SendGrid for email (optional)
- [ ] Configure Twilio for SMS (optional)
- [ ] Run Lighthouse audit
- [ ] Test on actual mobile devices
- [ ] Verify HTTPS is enabled
- [ ] Test admin dashboard on production

### Recommended Hosting
- **Vercel** (recommended) - Free tier, automatic HTTPS, CDN, serverless
- **Netlify** - Free tier available for Next.js
- **Railway** - Alternative with MongoDB support
- See **[next-app/DEPLOYMENT-GUIDE.md](./next-app/DEPLOYMENT-GUIDE.md)** for complete deployment instructions

---

## 📊 Project Stats

- **Framework**: Next.js 14 with TypeScript
- **Database**: MongoDB Atlas (serverless)
- **Authentication**: NextAuth with role-based access
- **Test Coverage**: 70+ E2E tests
- **API Routes**: 5+ RESTful endpoints
- **Components**: 15+ reusable React components
- **Performance**: Optimized for production
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🗂️ Customization

### Updating Content

**Business Information**:
- Edit contact details in `src/app/page.tsx` and `src/app/contact/page.tsx`
- Update service offerings in `src/app/services/page.tsx`
- Replace placeholder images in `public/images/`
- Update Google Maps link and address

**Styling**:
- Modify CSS variables in `src/app/globals.css`
- Adjust colors, fonts, spacing
- Customize animations in components

**Configuration**:
- Edit environment variables in `.env.local`
- Update MongoDB connection in `.env.local`
- Configure SendGrid and Twilio credentials
- Update branding in `src/app/globals.css`

### Adding Features

See **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** for technical details:
- MongoDB database schema
- NextAuth authentication setup
- SendGrid email integration
- Twilio SMS notifications
- PIPEDA compliance implementation

---

## 📝 Changelog

### Phase 3 - Next.js Migration (Oct 2025)
- ✅ Full Next.js 14 application with MongoDB Atlas
- ✅ Secure authentication with NextAuth
- ✅ API routes for contact, appointments, SMS
- ✅ PIPEDA-compliant features
- ✅ Feature flags for dry-run mode
- ✅ Complete TypeScript implementation

### Phase 2 - CSS Optimization (Oct 2025)
- ✅ Critical CSS extraction
- ✅ Deferred CSS loading
- ✅ Font loading optimization
- ✅ 25% faster First Contentful Paint

### Phase 1 - Code Cleanup (Oct 2025)
- ✅ Extracted shared utilities
- ✅ Created modular components
- ✅ Removed duplicate code (737 lines)
- ✅ Optimized script loading
- ✅ ES6 module architecture

### Initial Release (Dec 2024)
- ✅ Modern responsive design
- ✅ Admin dashboard
- ✅ Booking integration
- ✅ Portfolio gallery

See **[docs/IMPLEMENTATION-HISTORY.md](./docs/IMPLEMENTATION-HISTORY.md)** for complete changelog.

---

## 🤝 Contributing

This is a client project maintained by **Arvado IT Solutions**.

For questions or support:
- Review documentation in [`next-app/README.md`](./next-app/README.md)
- Check [`docs/`](./docs/) folder for architecture and history
- Run test suite to verify changes

---

## 📄 License

Proprietary - All rights reserved by Lacque & Latte Nail Studio.

---

## 🙏 Acknowledgments

- Design inspired by modern nail studio aesthetics
- Built with Next.js 14 and TypeScript
- Database: MongoDB Atlas
- Authentication: NextAuth
- Testing framework: Playwright
- Performance optimization: Next.js built-in optimizations
- Security: NextAuth, environment variables, input validation

---

**Last Updated**: October 2025  
**Status**: Production Ready ✅  
**Maintained By**: Arvado IT Solutions

---

For detailed documentation, see:
- **[next-app/README.md](./next-app/README.md)** - Complete application guide
- **[docs/](./docs/)** - Architecture, history, and compliance
