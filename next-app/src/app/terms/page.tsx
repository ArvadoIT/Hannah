'use client';

/**
 * Terms of Service Page
 */

export default function TermsPage() {
  const businessName = process.env.LEGAL_BUSINESS_NAME || 'Lacque & Latte Nail Studio';

  return (
    <main>
      <section className="legal-section">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="legal-content">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the {businessName} website and services, you accept and
              agree to be bound by these Terms of Service.
            </p>

            <h2>2. Services</h2>
            <p>
              {businessName} provides nail care services including manicures, pedicures,
              nail art, and related beauty services.
            </p>

            <h2>3. Appointments and Bookings</h2>
            <h3>Booking</h3>
            <ul>
              <li>Appointments can be made through our website or by contacting us directly</li>
              <li>All appointments are subject to availability</li>
              <li>You will receive a confirmation email or SMS for your appointment</li>
            </ul>

            <h3>Cancellations</h3>
            <ul>
              <li>Please provide at least 24 hours notice for cancellations</li>
              <li>Late cancellations or no-shows may be subject to a cancellation fee</li>
              <li>We reserve the right to cancel appointments due to unforeseen circumstances</li>
            </ul>

            <h2>4. Payment</h2>
            <ul>
              <li>Payment is due at the time of service</li>
              <li>We accept cash, debit, and major credit cards</li>
              <li>Prices are subject to change without notice</li>
              <li>Gratuities are appreciated but not required</li>
            </ul>

            <h2>5. Client Conduct</h2>
            <p>Clients are expected to:</p>
            <ul>
              <li>Arrive on time for appointments</li>
              <li>Treat staff and other clients with respect</li>
              <li>Follow health and safety guidelines</li>
              <li>Inform staff of any allergies or health concerns</li>
            </ul>

            <h2>6. Health and Safety</h2>
            <ul>
              <li>We maintain strict hygiene and sanitation standards</li>
              <li>Please inform us of any allergies, sensitivities, or health conditions</li>
              <li>We may refuse service if we believe it could cause harm</li>
              <li>Clients are responsible for disclosing relevant health information</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p>
              {businessName} is not liable for any damages resulting from:
            </p>
            <ul>
              <li>Allergic reactions (when proper disclosure was not made)</li>
              <li>Damage to artificial nails or nail enhancements</li>
              <li>Results that do not meet expectations</li>
              <li>Any indirect or consequential damages</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on this website, including images, text, and designs, is the property
              of {businessName} and protected by copyright laws.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your use of our services is also governed by our Privacy Policy. Please review
              our Privacy Policy to understand our practices.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will
              be effective immediately upon posting to this page.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <p>
              <strong>{businessName}</strong><br />
              Email: info@lacqueandlatte.ca<br />
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

