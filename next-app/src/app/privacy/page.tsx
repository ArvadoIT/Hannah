'use client';

/**
 * Privacy Policy Page
 * PIPEDA-compliant privacy policy
 */

export default function PrivacyPage() {
  const businessName = process.env.LEGAL_BUSINESS_NAME || 'Lacque & Latte Nail Studio';
  const privacyEmail = process.env.LEGAL_PRIVACY_CONTACT_EMAIL || 'privacy@lacqueandlatte.ca';

  return (
    <main>
      <section className="legal-section">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="legal-content">
            <h2>1. Introduction</h2>
            <p>
              {businessName} ("we", "us", or "our") is committed to protecting your privacy and
              personal information. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our website and services.
            </p>
            <p>
              We comply with Canada's Personal Information Protection and Electronic Documents
              Act (PIPEDA) and all applicable privacy laws.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Appointment details and preferences</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>

            <h3>Usage Information</h3>
            <p>We may collect non-personal information about your use of our website, including:</p>
            <ul>
              <li>Browser type and version</li>
              <li>IP address</li>
              <li>Pages visited and time spent</li>
              <li>Device information</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul>
              <li>Schedule and manage appointments</li>
              <li>Send appointment confirmations and reminders</li>
              <li>Communicate about our services</li>
              <li>Process payments</li>
              <li>Improve our services and customer experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              Your personal information is stored securely using industry-standard encryption:
            </p>
            <ul>
              <li>Encrypted databases (MongoDB Atlas with AES-256 encryption)</li>
              <li>HTTPS/TLS for all data transmission</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and updates</li>
            </ul>

            <h2>5. Third-Party Service Providers</h2>
            <p>We use the following trusted third-party services:</p>
            <ul>
              <li><strong>Vercel:</strong> Website hosting</li>
              <li><strong>MongoDB Atlas:</strong> Secure database storage</li>
              <li><strong>SendGrid:</strong> Email notifications</li>
              <li><strong>Twilio:</strong> SMS notifications</li>
            </ul>
            <p>
              These providers are contractually obligated to protect your information and use it
              only for the purposes we specify.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information only as long as necessary to fulfill the purposes
              for which it was collected, typically:
            </p>
            <ul>
              <li>Active client data: Duration of business relationship</li>
              <li>Appointment history: Up to 2 years after last appointment</li>
              <li>Contact form submissions: Up to 1 year</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>Under PIPEDA, you have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              <li><strong>Complaint:</strong> File a complaint with the Privacy Commissioner of Canada</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{' '}
              <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
            </p>

            <h2>8. Consent</h2>
            <p>
              By using our services, you consent to the collection and use of your personal
              information as described in this policy. You may withdraw consent at any time by
              contacting us.
            </p>

            <h2>9. Email and SMS Communications</h2>
            <p>
              We comply with Canada's Anti-Spam Legislation (CASL). You can opt out of marketing
              communications at any time by:
            </p>
            <ul>
              <li>Clicking "unsubscribe" in emails</li>
              <li>Replying "STOP" to SMS messages</li>
              <li>Contacting us directly</li>
            </ul>

            <h2>10. Cookies and Analytics</h2>
            <p>
              We may use cookies and analytics tools to improve user experience. You can control
              cookies through your browser settings.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated "Last Updated" date.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or to exercise your privacy rights, contact:
            </p>
            <p>
              <strong>{businessName}</strong><br />
              Email: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a><br />
              Phone: (613) 555-0123
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .legal-section {
          padding: var(--spacing-xxl) 0;
        }

        .updated {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-lg);
        }

        .legal-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .legal-content h2 {
          margin-top: var(--spacing-xl);
        }

        .legal-content h3 {
          margin-top: var(--spacing-lg);
          font-size: 1.25rem;
        }

        .legal-content ul {
          margin-left: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
        }

        .legal-content li {
          margin-bottom: var(--spacing-xs);
        }
      `}</style>
    </main>
  );
}

