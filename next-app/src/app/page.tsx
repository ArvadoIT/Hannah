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
                <h2 className={styles.aboutTitle}>About Us</h2>
                <div className={styles.divider}></div>
                <p className={styles.introText}>
                  At Lacque&Latte, <span className={styles.highlight}>beauty</span> is more than a service — it's an experience. Founded by Hannah, 
                  a Persian artist with a passion for <span className={styles.highlight}>elegance</span> and precision, our studio redefines nail care 
                  through the perfect harmony of <span className={styles.highlight}>artistry</span> and serenity. Inspired by the soft tones of the 
                  Mediterranean and the timeless grace of Persian beauty, every detail of our space is designed 
                  to make you feel at ease and indulged.
                </p>
                <p className={styles.introTextSecondary}>
                  From meticulous Russian manicures to bespoke nail art crafted with professional-grade products, 
                  we bring your vision to life with care, creativity, and unmatched expertise. Step into a world 
                  where luxury meets <span className={styles.highlight}>tranquility</span> — sip your latte, unwind, and let us perfect the finer details.
                </p>
                <div className={styles.signature}>Elegance in every detail. — Hannah</div>
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
