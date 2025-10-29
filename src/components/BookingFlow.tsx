'use client';

/**
 * Complete Booking Flow Component
 * Multi-step booking with service selection, calendar, time slots, and form
 */

import { useState, useEffect, useRef } from 'react';
import styles from './BookingFlow.module.css';

interface Service {
  name: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
}

interface BookingData {
  service: Service | null;
  date: Date | null;
  time: string | null;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const services: Record<string, Service[]> = {
  manicures: [
    {
      name: 'Russian Manicure',
      price: 60,
      duration: '60-75 minutes',
      description: 'Our signature Russian manicure technique provides the most precise cuticle work and longest-lasting results.',
      features: [
        'Precision cuticle work with specialized tools',
        'Nail shaping and buffing',
        'Premium gel polish application',
        'Hand massage with luxury lotion',
        'Up to 3 weeks of wear'
      ]
    },
    {
      name: 'Classic Manicure',
      price: 45,
      duration: '45 minutes',
      description: 'Traditional manicure with modern techniques.',
      features: [
        'Cuticle care and trimming',
        'Nail shaping and filing',
        'Hand soak and exfoliation',
        'Regular polish application',
        'Hand massage with moisturizer'
      ]
    }
  ],
  pedicures: [
    {
      name: 'Gel Polish Pedicure',
      price: 65,
      duration: '75-90 minutes',
      description: 'Luxurious foot treatment with long-lasting gel polish.',
      features: [
        'Foot soak with essential oils',
        'Callus removal and exfoliation',
        'Cuticle care and nail shaping',
        'Gel polish application',
        'Foot and leg massage',
        'Up to 4 weeks of wear'
      ]
    },
    {
      name: 'Classic Pedicure',
      price: 55,
      duration: '60 minutes',
      description: 'Traditional pedicure with regular polish.',
      features: [
        'Foot soak and exfoliation',
        'Callus removal',
        'Cuticle care and nail shaping',
        'Regular polish application',
        'Foot massage with lotion'
      ]
    }
  ],
  extensions: [
    {
      name: 'Bio Gel Extensions',
      price: 90,
      duration: '90-120 minutes',
      description: 'Natural-looking nail extensions using bio gel technology.',
      features: [
        'Natural bio gel application',
        'Custom length and shape',
        'Gel polish color of choice',
        'Strong and flexible material',
        'Up to 3 weeks of wear'
      ]
    },
    {
      name: 'Bio Gel Refill',
      price: 75,
      duration: '60-75 minutes',
      description: 'Maintenance service for bio gel extensions.',
      features: [
        'Extension maintenance',
        'Gel polish refresh',
        'Nail bed cleaning',
        'Shape refinement',
        'Cuticle care'
      ]
    }
  ],
  'nail-art': [
    {
      name: 'Custom Nail Art',
      price: 10,
      duration: '30-60 minutes',
      description: 'Express your unique style with custom nail art designs.',
      features: [
        'Custom design consultation',
        'Hand-painted details',
        'Rhinestone and glitter accents',
        'Ombre and gradient effects',
        'Seasonal and themed designs'
      ]
    }
  ]
};

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM'
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('manicures');
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    date: null,
    time: null,
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const timeSectionRef = useRef<HTMLDivElement>(null);

  // Generate calendar days
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];
    
    // Add previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  const handleServiceSelect = (service: Service) => {
    try {
      setBookingData({ ...bookingData, service });
      setCurrentStep(2);
    } catch (error) {
      console.error('Error selecting service:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    try {
      setBookingData({ ...bookingData, date });
      
      // Auto-scroll to time section on mobile devices (iPhone and similar)
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          if (timeSectionRef.current) {
            timeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  const handleTimeSelect = (time: string) => {
    try {
      setBookingData({ ...bookingData, time });
    } catch (error) {
      console.error('Error selecting time:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: API call will be added later
      console.log('Booking submitted:', bookingData);
      
      // Show success
      setCurrentStep(4);
    } catch (error) {
      console.error('Error submitting booking:', error);
      // You could add error state here to show an error message to the user
    }
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className={styles.bookingFlowContainer}>
      {/* Step Indicator */}
      <div className={styles.bookingStepsIndicator}>
        <div className={`${styles.stepItem} ${currentStep >= 1 ? styles.active : ''} ${currentStep > 1 ? styles.completed : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepLabel}>Choose Service</div>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.stepItem} ${currentStep >= 2 ? styles.active : ''} ${currentStep > 2 ? styles.completed : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepLabel}>Select Date & Time</div>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.stepItem} ${currentStep >= 3 ? styles.active : ''} ${currentStep > 3 ? styles.completed : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepLabel}>Your Information</div>
        </div>
      </div>

      {/* Step 1: Service Selection */}
      {currentStep === 1 && (
        <div className={styles.bookingStep}>
          <h2 className={styles.sectionTitle}>Choose Your Service</h2>
          <p className={styles.servicesIntro}>Select from our comprehensive range of nail services.</p>
          
          <div className={styles.categoryTabs}>
            <button
              className={`${styles.tabButton} ${activeCategory === 'manicures' ? styles.active : ''}`}
              onClick={() => setActiveCategory('manicures')}
            >
              Manicures
            </button>
            <button
              className={`${styles.tabButton} ${activeCategory === 'pedicures' ? styles.active : ''}`}
              onClick={() => setActiveCategory('pedicures')}
            >
              Pedicures
            </button>
            <button
              className={`${styles.tabButton} ${activeCategory === 'extensions' ? styles.active : ''}`}
              onClick={() => setActiveCategory('extensions')}
            >
              Extensions
            </button>
            <button
              className={`${styles.tabButton} ${activeCategory === 'nail-art' ? styles.active : ''}`}
              onClick={() => setActiveCategory('nail-art')}
            >
              Nail Art
            </button>
          </div>

          <div className={styles.serviceDetailsGrid}>
            {services[activeCategory]?.map((service, index) => (
              <article key={index} className={`${styles.serviceDetailCard} ${styles.selectable}`} onClick={() => handleServiceSelect(service)}>
                <div className={styles.serviceHeader}>
                  <h3>{service.name}</h3>
                  <span className={styles.servicePrice}>${service.price}</span>
                </div>
                <div className={styles.serviceDescription}>
                  <p>{service.description}</p>
                  <ul className={styles.serviceFeatures}>
                    {service.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <div className={styles.serviceDuration}>Duration: {service.duration}</div>
                </div>
                <div className={styles.serviceSelectOverlay}>
                  <span className={styles.selectCheckmark}>✓</span>
                  <span className={styles.selectText}>Select This Service</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {currentStep === 2 && bookingData.service && (
        <div className={styles.bookingStep}>
          <h2 className={styles.sectionTitle}>Select Date & Time</h2>
          <div className={styles.selectedServiceSummary}>
            <p><strong>Selected Service:</strong> {bookingData.service.name}</p>
            <p><strong>Duration:</strong> {bookingData.service.duration}</p>
            <p><strong>Price:</strong> ${bookingData.service.price}</p>
          </div>

          <div className={styles.datetimeContainer}>
            <div className={styles.calendarSection}>
              <h3>Choose a Date</h3>
              <div className={styles.calendarHeader}>
                <button 
                  className={styles.calendarNav} 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <span className={styles.calendarMonthYear}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  className={styles.calendarNav} 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
              <div className={styles.calendarWeekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={styles.calendarWeekday}>{day}</div>
                ))}
              </div>
              <div className={styles.calendarGrid}>
                {calendarDays.map((date, index) => (
                  <button
                    key={index}
                    className={`${styles.calendarDay} ${!isDateInCurrentMonth(date) ? styles.otherMonth : ''} ${isToday(date) ? styles.today : ''} ${isPastDate(date) ? styles.past : ''} ${bookingData.date?.toDateString() === date.toDateString() ? styles.selected : ''}`}
                    onClick={() => !isPastDate(date) && handleDateSelect(date)}
                    disabled={isPastDate(date)}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            <div ref={timeSectionRef} className={styles.timeSection}>
              <h3>Choose a Time</h3>
              {bookingData.date ? (
                <div className={styles.timeSlots}>
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`${styles.timeSlot} ${bookingData.time === time ? styles.selected : ''}`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.selectDatePrompt}>Please select a date first</p>
              )}
            </div>
          </div>

          <div className={styles.bookingNavigation}>
            <button className={`${styles.bookingBtn} ${styles.secondary}`} onClick={() => setCurrentStep(1)}>
              Back to Services
            </button>
            <button 
              className={`${styles.bookingBtn} ${styles.primary}`} 
              onClick={() => setCurrentStep(3)}
              disabled={!bookingData.date || !bookingData.time}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {currentStep === 3 && (
        <div className={styles.bookingStep}>
          <h2 className={styles.sectionTitle}>Your Information</h2>
          <div className={styles.selectedServiceSummary}>
            <p><strong>Service:</strong> {bookingData.service?.name}</p>
            <p><strong>Date & Time:</strong> {bookingData.date?.toLocaleDateString()} at {bookingData.time}</p>
            <p><strong>Price:</strong> ${bookingData.service?.price}</p>
          </div>

          <form className={styles.contactInfoForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="customer-name">Full Name *</label>
                <input
                  type="text"
                  id="customer-name"
                  name="name"
                  required
                  placeholder="Jane Doe"
                  value={bookingData.name}
                  onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="customer-email">Email Address *</label>
                <input
                  type="email"
                  id="customer-email"
                  name="email"
                  required
                  placeholder="jane@example.com"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="customer-phone">Phone Number *</label>
                <input
                  type="tel"
                  id="customer-phone"
                  name="phone"
                  required
                  placeholder="(555) 123-4567"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="customer-notes">Special Requests (Optional)</label>
              <textarea
                id="customer-notes"
                name="notes"
                rows={4}
                placeholder="Any special requests or preferences?"
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              ></textarea>
            </div>

            <div className={styles.bookingNavigation}>
              <button type="button" className={`${styles.bookingBtn} ${styles.secondary}`} onClick={() => setCurrentStep(2)}>
                Back to Date & Time
              </button>
              <button type="submit" className={`${styles.bookingBtn} ${styles.primary}`}>
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Success */}
      {currentStep === 4 && (
        <div className={styles.bookingStep}>
          <div className={styles.successAnimation}>
            <div className={styles.successCheckmark}>
              <svg viewBox="0 0 52 52">
                <circle className={styles.successCircle} cx="26" cy="26" r="25" fill="none"/>
                <path className={styles.successCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2>Booking Confirmed!</h2>
            <p className={styles.successMessage}>Thank you for booking with Lacque&latte. We've sent a confirmation email with all the details.</p>
            <div className={styles.bookingSummaryFinal}>
              <h3>Appointment Details</h3>
              <p><strong>Service:</strong> {bookingData.service?.name}</p>
              <p><strong>Date & Time:</strong> {bookingData.date?.toLocaleDateString()} at {bookingData.time}</p>
              <p><strong>Duration:</strong> {bookingData.service?.duration}</p>
              <p><strong>Price:</strong> ${bookingData.service?.price}</p>
              <p><strong>Contact:</strong> {bookingData.email}</p>
            </div>
            <button className={`${styles.bookingBtn} ${styles.primary}`} onClick={() => {
              setCurrentStep(1);
              setBookingData({
                service: null,
                date: null,
                time: null,
                name: '',
                email: '',
                phone: '',
                notes: ''
              });
            }}>
              Book Another Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


