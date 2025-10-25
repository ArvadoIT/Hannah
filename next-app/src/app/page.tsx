'use client';

/**
 * Home Page
 * Landing page for Lacque & Latte Nail Studio
 */

import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Lacque&latte</h1>
            <p>Where Elegance Meets Excellence in Nail Care</p>
            <Link href="/services" className={styles.ctaButton}>
              Book Your Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className={styles.services}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Signature Services</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg className={styles.serviceIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3>Manicures</h3>
              <p>From classic to Russian manicure techniques, experience nail care perfection with long-lasting results.</p>
              <span className={styles.price}>From $45</span>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg className={styles.serviceIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3>Pedicures</h3>
              <p>Luxurious foot treatments with gel polish that provide relaxation and beautiful results lasting weeks.</p>
              <span className={styles.price}>From $55</span>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg className={styles.serviceIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3>Nail Art</h3>
              <p>Custom designs and creative artistry to express your unique style for any occasion.</p>
              <span className={styles.price}>From $10</span>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg className={styles.serviceIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3>Extensions</h3>
              <p>Bio gel extensions for natural-looking, strong, and flexible nails that last.</p>
              <span className={styles.price}>From $90</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/services" className={styles.ctaButton}>
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className="container">
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2 className={styles.sectionTitle}>Welcome to Lacque&latte</h2>
              <p>
                Where elegance meets expertise. We specialize in luxury nail care, offering premium manicures, 
                pedicures, and exquisite nail art in a serene, modern environment.
              </p>
              <p>
                Our skilled technicians use only the highest quality products and the latest techniques, 
                including the renowned Russian manicure method, to ensure your nails look flawless and last longer.
              </p>
              <p>
                Experience the perfect blend of artistry and precision in every service we provide.
              </p>
            </div>
            <div className={styles.aboutFeatures}>
              <div className={styles.feature}>
                <h3>Premium Products</h3>
                <p>We use only high-quality, professional-grade nail products for lasting results.</p>
              </div>
              <div className={styles.feature}>
                <h3>Expert Technicians</h3>
                <p>Our team is trained in the latest techniques and committed to excellence.</p>
              </div>
              <div className={styles.feature}>
                <h3>Relaxing Environment</h3>
                <p>Enjoy your nail care experience in our comfortable, modern studio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className={styles.galleryPreview}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Work</h2>
          <p className={styles.sectionSubtitle}>See the artistry and precision in every nail we create</p>
          <div className={styles.galleryGridPreview}>
            <div className={styles.galleryPreviewItem}>
              <Image 
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop" 
                alt="Nail art sample" 
                width={400}
                height={400}
                loading="lazy"
              />
            </div>
            <div className={styles.galleryPreviewItem}>
              <Image 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" 
                alt="Manicure sample" 
                width={400}
                height={400}
                loading="lazy"
              />
            </div>
            <div className={styles.galleryPreviewItem}>
              <Image 
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop" 
                alt="Pedicure sample" 
                width={400}
                height={400}
                loading="lazy"
              />
            </div>
            <div className={styles.galleryPreviewItem}>
              <Image 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop" 
                alt="Extensions sample" 
                width={400}
                height={400}
                loading="lazy"
              />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/portfolio" className={styles.ctaButton}>
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Pamper Yourself?</h2>
          <p>Book your appointment today and experience the Lacque&latte difference</p>
          <Link href="/services" className={styles.ctaButton}>
            Book Now
          </Link>
        </div>
      </section>
    </>
  );
}
