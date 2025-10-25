'use client';

/**
 * Services Page
 * Full booking flow with calendar, time slots, and form
 */

import BookingFlow from '@/components/BookingFlow';
import styles from './page.module.css';

export default function ServicesPage() {
  return (
    <>
      <section className={styles.pageHero}>
        <div className="container">
          <div className={styles.pageHeroContent}>
            <h1>Our Services</h1>
            <p>Experience the finest in nail care with our comprehensive range of services, designed to pamper and beautify your hands and feet.</p>
          </div>
        </div>
      </section>

      <BookingFlow />
    </>
  );
}
