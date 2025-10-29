'use client';

/**
 * Home Page
 * Landing page for Lacque & Latte Nail Studio
 */

import Link from 'next/link';
import Image from 'next/image';
import InstagramSection from '@/components/InstagramSection';
import { AnimatedElement } from '@/components/AnimatedElement';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <AnimatedElement animationType="fadeInUp" delay={200}>
            <div className={styles.heroText}>
              <h1>Lacque&latte</h1>
              <Link href="/services" className={styles.ctaButton}>
                Book Your Appointment
              </Link>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutContentLayout}>
            <AnimatedElement animationType="fadeInLeft" delay={100}>
              <div className={styles.aboutTextContent}>
                <h2 className={styles.aboutTitle}>About Hanna</h2>
                <div className={styles.divider}></div>
                <p className={styles.introText}>
                  Hanna is the owner and nail artist behind Lacque & Latte, a Toronto-based studio focused on quality, care, and modern design. Located at 1519 Bayview Avenue, her salon offers a calm and welcoming space where clients can relax and enjoy professional nail services made with attention to detail.
                </p>
                <p className={styles.introTextSecondary}>
                  Hanna takes pride in her work and strives to make every appointment a comfortable and personalized experience. Her goal is simple — to help clients leave feeling confident, refreshed, and proud of their nails.
                </p>
                <div className={styles.contactInfo}>
                  <p><strong>Address:</strong> 1519 Bayview Ave, Toronto, ON</p>
                  <p><strong>Phone:</strong> (437) 333-7242</p>
                </div>
                <div className={styles.googleReviewsLink}>
                  <a 
                    href="https://share.google/48XHuiGNWbG9DBURg" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.reviewsButton}
                  >
                    ⭐ Read Our Google Reviews
                  </a>
                </div>
              </div>
            </AnimatedElement>
            <AnimatedElement animationType="fadeInRight" delay={300}>
              <div className={styles.aboutImage}>
                <Image 
                  src="/images/pocket.png" 
                  alt="Lacque & Latte Nail Studio" 
                  width={500}
                  height={600}
                  style={{ height: "auto" }}
                  className={styles.aboutImageImg}
                />
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <AnimatedElement animationType="fadeInUp" delay={200}>
        <InstagramSection
          instagramHandle="hanna_nailartist"
          profileUrl="https://www.instagram.com/hanna_nailartist/"
          featuredPhotos={[
            {
              id: "featured-1",
              src: "/images/hand4.png",
              alt: "Featured nail art by Hannah"
            },
            {
              id: "featured-2",
              src: "/images/hand2.png",
              alt: "Elegant nail art design"
            },
            {
              id: "featured-3",
              src: "/images/hand3.png",
              alt: "Professional manicure showcase"
            }
          ]}
          photos={[
            {
              id: "1",
              src: "/images/hand1.png",
              alt: "Elegant nail art design"
            },
            {
              id: "2", 
              src: "/images/hand2.png",
              alt: "Professional manicure"
            },
            {
              id: "3",
              src: "/images/hand3.png",
              alt: "Luxury pedicure"
            },
            {
              id: "4",
              src: "/images/hand1.png",
              alt: "Nail extensions showcase"
            },
            {
              id: "5",
              src: "/images/hand2.png",
              alt: "Artistic nail design"
            },
            {
              id: "6",
              src: "/images/hand3.png",
              alt: "Behind the scenes"
            }
          ]}
        />
      </AnimatedElement>


      {/* CTA Section */}
      <AnimatedElement animationType="scaleIn" delay={100}>
        <section className={styles.ctaSection}>
          <div className="container">
            <h2>Ready to Pamper Yourself?</h2>
            <p>Book your appointment today and experience the Lacque&latte difference</p>
            <Link href="/services" className={styles.ctaButton}>
              Book Now
            </Link>
          </div>
        </section>
      </AnimatedElement>
    </>
  );
}
