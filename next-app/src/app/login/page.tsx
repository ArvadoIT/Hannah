/**
 * Login Page
 * Admin/Stylist authentication
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Redirect to admin on success
        router.push('/admin');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main>
      <section className="login-section">
        <div className="container">
          <div className="login-card">
            <h1>Admin Login</h1>
            <p className="subtitle">Sign in to access your dashboard</p>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <Link href="/">← Back to Home</Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .login-section {
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl) 0;
        }

        .login-card {
          max-width: 450px;
          width: 100%;
          background-color: var(--background);
          padding: var(--spacing-xl);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
        }

        .subtitle {
          text-align: center;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }

        .login-form {
          margin-top: var(--spacing-lg);
        }

        .alert {
          padding: var(--spacing-md);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-md);
        }

        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .full-width {
          width: 100%;
        }

        .login-footer {
          margin-top: var(--spacing-lg);
          text-align: center;
        }

        @media (max-width: 768px) {
          .login-card {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </main>
  );
}

