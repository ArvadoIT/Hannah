/**
 * Calendar Page
 * Booking calendar interface
 */

import Link from 'next/link';

export default function CalendarPage() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1>Booking Calendar</h1>
      <p>Our booking system is currently being upgraded.</p>
      <p>Please <Link href="/contact">contact us</Link> to schedule your appointment.</p>
    </div>
  );
}

