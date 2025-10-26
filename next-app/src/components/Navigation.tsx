'use client';

/**
 * Navigation Component
 * Main navigation header for the site
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Safety check for browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      try {
        setIsScrolled(window.scrollY > 50);
      } catch (error) {
        // Handle scroll errors gracefully
        if (process.env.NODE_ENV === 'development') {
          console.warn('Navigation: Error handling scroll:', error);
        }
      }
    };

    try {
      window.addEventListener('scroll', handleScroll);
      return () => {
        try {
          window.removeEventListener('scroll', handleScroll);
        } catch (error) {
          // Handle cleanup errors gracefully
          if (process.env.NODE_ENV === 'development') {
            console.warn('Navigation: Error removing scroll listener:', error);
          }
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Navigation: Error adding scroll listener:', error);
      }
    }
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Book now' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? 'scrolled' : ''}`}>
      <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Link href="/" aria-label="Lacque&latte Home">
              <h2>Lacque&latte</h2>
            </Link>
          </div>
          
          <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`} role="menubar">
            {navLinks.map((link) => (
              <li key={link.href} role="none">
                <Link
                  href={link.href}
                  role="menuitem"
                  className={pathname === link.href ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <button
            className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </header>
  );
}

