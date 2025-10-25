'use client';

/**
 * Portfolio Page
 * Displays portfolio gallery with filtering
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

interface PortfolioItem {
  category: string;
  title: string;
  description: string;
  imageUrl: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    category: 'manicures',
    title: 'Pearlescent Nude',
    description: 'Elegant shimmer with perfect finish',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop'
  },
  {
    category: 'manicures',
    title: 'Classic Nude',
    description: 'Timeless elegance with subtle shimmer',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop'
  },
  {
    category: 'pedicures',
    title: 'Natural Pedicure',
    description: 'Clean and elegant foot care',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop'
  },
  {
    category: 'pedicures',
    title: 'Classic Pedicure',
    description: 'Timeless elegance for your feet',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop'
  },
  {
    category: 'extensions',
    title: 'Bio Gel Extensions',
    description: 'Natural shape with elegant nude finish',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop'
  },
  {
    category: 'extensions',
    title: 'Pearlescent Extensions',
    description: 'Medium length with iridescent shimmer',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop'
  },
  {
    category: 'nail-art',
    title: 'Mixed Art Collection',
    description: 'Creative designs with cow print, eyes, and more',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop'
  },
  {
    category: 'nail-art',
    title: 'Valentine\'s Special',
    description: 'Romantic pink with heart details',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop'
  },
];

const categories = [
  { id: 'all', label: 'All Work' },
  { id: 'manicures', label: 'Manicures' },
  { id: 'pedicures', label: 'Pedicures' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'nail-art', label: 'Nail Art' },
];

const testimonials = [
  {
    text: "The Russian manicure at Lacque&latte is absolutely incredible. My nails have never looked so clean and perfect. The attention to detail is unmatched!",
    author: "Sarah M.",
    role: "Regular Client"
  },
  {
    text: "I've been getting bio gel extensions here for over a year. They last so long and look so natural. The staff is professional and the studio is beautiful.",
    author: "Jessica L.",
    role: "Extension Specialist"
  },
  {
    text: "The nail art is absolutely stunning! They brought my vision to life and exceeded my expectations. Perfect for my wedding day!",
    author: "Emily R.",
    role: "Bridal Client"
  },
  {
    text: "Best pedicure I've ever had. The massage was so relaxing and my feet looked amazing for weeks. Highly recommend!",
    author: "Maria G.",
    role: "Pedicure Lover"
  },
];

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <div className={styles.pageHeroContent}>
            <h1>Our Portfolio</h1>
            <p>Discover the artistry and precision behind every nail we create. From elegant classics to bold artistic expressions, see the transformation we bring to your hands.</p>
          </div>
        </div>
      </section>

      <section className={styles.portfolioFilter}>
        <div className="container">
          <div className={styles.filterButtons} role="tablist" aria-label="Portfolio categories">
            {categories.map((category) => (
              <button
                key={category.id}
                role="tab"
                aria-selected={activeFilter === category.id}
                className={`${styles.filterBtn} ${activeFilter === category.id ? styles.active : ''}`}
                onClick={() => handleFilterChange(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.portfolioGallery}>
        <div className="container">
          <div className={styles.portfolioGrid}>
            {filteredItems.map((item, index) => (
              <div key={index} className={styles.portfolioItem}>
                <div className={styles.portfolioCard}>
                  <div className={styles.portfolioImage}>
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title}
                      width={600}
                      height={600}
                      loading="lazy"
                    />
                    <div className={styles.portfolioOverlay}>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.testimonials}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <article key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>"{testimonial.text}"</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <h4>{testimonial.author}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready to Create Your Perfect Look?</h2>
            <p>Book your appointment and let us transform your nails into a work of art.</p>
            <Link href="/services" className={styles.ctaButton}>
              Book Your Appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

