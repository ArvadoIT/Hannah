/**
 * Root Layout Component
 * Global layout with navigation and footer
 */

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Changed from 'block' to 'swap' for better FOUC prevention
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap', // Changed from 'block' to 'swap' for better FOUC prevention
  preload: true,
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  title: 'Lacque & Latte Nail Studio - Luxury Nail Care in Ottawa',
  description: 'Experience luxury nail care with expert manicures, pedicures, and nail art at Lacque & Latte Nail Studio in Ottawa.',
  keywords: 'nail salon, manicure, pedicure, nail art, Ottawa, luxury nails',
  authors: [{ name: 'Lacque & Latte Nail Studio' }],
  openGraph: {
    title: 'Lacque & Latte Nail Studio',
    description: 'Luxury nail care in Ottawa',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const businessName = process.env.LEGAL_BUSINESS_NAME || 'Lacque & Latte Nail Studio';
  const privacyEmail = process.env.LEGAL_PRIVACY_CONTACT_EMAIL || 'privacy@lacqueandlatte.ca';

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} style={{ backgroundColor: '#faf8f5' }}>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Minimal inline CSS - all styles now in globals.css which loads synchronously */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Only absolutely critical styles that must be inline */
          html, body {
            background-color: #faf8f5 !important;
            margin: 0;
            padding: 0;
          }
        `}} />
      </head>
      <body style={{ backgroundColor: '#faf8f5' }}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navigation />
        <main id="main-content">
          {children}
        </main>
        
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{businessName}</h3>
              <p>Luxury nail care in the heart of Ottawa</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/portfolio">Portfolio</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href={`mailto:${privacyEmail}`}>Privacy Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <p>
                Email: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
              </p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
            <p>Developed by <a href="https://arvado.ca" target="_blank" rel="noopener noreferrer">Arvado IT Solutions</a></p>
            {process.env.NODE_ENV === 'development' && (
              <p style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                <strong>Dev Tools:</strong> <a href="/admin" style={{ color: '#d4af37', textDecoration: 'underline' }}>Admin Page</a>
              </p>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}

