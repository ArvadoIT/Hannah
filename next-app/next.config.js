/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['lacqueandlatte.ca', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables that should be available on client-side
  // (These are prefixed with NEXT_PUBLIC_)
  env: {
    SITE_NAME: 'Lacque & Latte Nail Studio',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redirect old static files to new Next.js routes
      {
        source: '/admin.html',
        destination: '/admin',
        permanent: true,
      },
      // Redirect dashboard to admin (admin is the main page)
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

