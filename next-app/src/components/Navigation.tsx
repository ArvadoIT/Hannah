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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/portfolio', label: 'Portfolio' },
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

