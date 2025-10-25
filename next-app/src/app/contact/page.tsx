/**
 * Contact Page
 * Contact form with PIPEDA-compliant consent
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consentAccepted: false,
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [loading, setLoading] = useState(false);

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Lacque & Latte Nail Studio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.dryRun
            ? 'Message received! (Dry-run mode - no email sent)'
            : 'Thank you! We\'ll get back to you soon.',
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          consentAccepted: false,
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send message. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <main>
      <section className={styles.contactSection}>
        <div className="container">
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>
            Have a question or ready to book? We'd love to hear from you!
          </p>

          <div className={styles.contactContent}>
            <div className={styles.contactInfo}>
              <h2>Get in Touch</h2>
              <p>
                <strong>Email:</strong> info@lacqueandlatte.ca
              </p>
              <p>
                <strong>Phone:</strong> (613) 555-0123
              </p>
              <p>
                <strong>Address:</strong> 123 Nail Street, Ottawa, ON
              </p>
              <p className="mt-md">
                <strong>Hours:</strong><br />
                Monday - Friday: 9:00 AM - 7:00 PM<br />
                Saturday: 10:00 AM - 6:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.contactForm}>
              {status.type && (
                <div className={`${styles.alert} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                  {status.message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  required
                  minLength={10}
                  maxLength={1000}
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    name="consentAccepted"
                    checked={formData.consentAccepted}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I consent to {businessName} collecting and using my personal
                    information as described in the{' '}
                    <Link href="/privacy" target="_blank">
                      Privacy Policy
                    </Link>
                    . *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

