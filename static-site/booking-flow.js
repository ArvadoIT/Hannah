"use strict";

// Import shared utilities
import { VALIDATION_PATTERNS, validateEmail } from './js/shared/validation.js';
import CONFIG from './js/core/config.js';

// Booking Flow JavaScript
// Multi-step booking system for Lacque&latte services

document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const bookingState = {
        currentStep: 1,
        selectedService: null,
        selectedPrice: null,
        selectedDuration: null,
        selectedDate: null,
        selectedTime: null,
        customerInfo: null
    };

    // ============================================
    // TAB FUNCTIONALITY FOR SERVICE CATEGORIES
    // ============================================
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPanel = this.getAttribute('aria-controls');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            document.getElementById(targetPanel).classList.add('active');
        });
    });

    // ============================================
    // SERVICE SELECTION
    // ============================================
    const serviceCards = document.querySelectorAll('.service-detail-card.selectable');

    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected state from all cards
            serviceCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected state to clicked card
            this.classList.add('selected');
            
            // Store service information
            bookingState.selectedService = this.dataset.service;
            bookingState.selectedPrice = this.dataset.price;
            bookingState.selectedDuration = this.dataset.duration;
            
            // Wait for animation, then move to next step
            setTimeout(() => {
                goToStep(2);
            }, 800);
        });
    });

    // ============================================
    // STEP NAVIGATION
    // ============================================
    function goToStep(stepNumber) {
        // Update step indicator
        const stepItems = document.querySelectorAll('.step-item');
        const bookingSteps = document.querySelectorAll('.booking-step');
        
        stepItems.forEach((item, index) => {
            const step = index + 1;
            item.classList.remove('active', 'completed');
            
            if (step < stepNumber) {
                item.classList.add('completed');
            } else if (step === stepNumber) {
                item.classList.add('active');
            }
        });
        
        // Update content
        bookingSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // Update state
        bookingState.currentStep = stepNumber;
        
        // Populate data based on step
        if (stepNumber === 2) {
            populateStep2();
        } else if (stepNumber === 3) {
            populateStep3();
        }
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // STEP 2: DATE & TIME SELECTION
    // ============================================
    let currentCalendarDate = new Date();
    let selectedDateElement = null;
    let selectedTimeElement = null;

    function populateStep2() {
        // Populate service summary
        document.getElementById('summary-service').textContent = bookingState.selectedService;
        document.getElementById('summary-duration').textContent = bookingState.selectedDuration;
        document.getElementById('summary-price').textContent = bookingState.selectedPrice;
        
        // Generate calendar
        generateCalendar(currentCalendarDate);
    }

    function generateCalendar(date) {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYear = document.getElementById('calendar-month-year');
        
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Month names
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        monthYear.textContent = `${monthNames[month]} ${year}`;
        
        // Clear calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });
        
        // Get first day of month
        const firstDay = new Date(year, month, 1).getDay();
        
        // Get number of days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get number of days in previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = daysInPrevMonth - i;
            calendarGrid.appendChild(day);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const dayDate = new Date(year, month, day);
            dayDate.setHours(0, 0, 0, 0);
            
            // Mark today
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Disable past dates
            if (dayDate < today) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', function() {
                    selectDate(dayDate, this);
                });
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        // Add next month's days to fill grid
        const totalCells = calendarGrid.children.length - 7; // Subtract headers
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = i;
            calendarGrid.appendChild(day);
        }
    }

    function selectDate(date, element) {
        // Remove previous selection
        if (selectedDateElement) {
            selectedDateElement.classList.remove('selected');
        }
        
        // Add new selection
        element.classList.add('selected');
        selectedDateElement = element;
        
        // Store date
        bookingState.selectedDate = date;
        
        // Generate time slots
        generateTimeSlots(date);
        
        // Reset time selection
        selectedTimeElement = null;
        document.getElementById('continue-to-contact').disabled = true;
        
        // Auto-scroll to time section on mobile devices (iPhone and similar)
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const timeSection = document.getElementById('time-section');
                if (timeSection) {
                    timeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    function generateTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots');
        timeSlotsContainer.innerHTML = '';
        
        // Business hours from config
        const startHour = CONFIG.BUSINESS_HOURS.START;
        const endHour = CONFIG.BUSINESS_HOURS.END;
        
        // Get current time
        const now = new Date();
        const selectedDate = new Date(date);
        const isToday = selectedDate.toDateString() === now.toDateString();
        
        // Generate time slots (30-minute intervals)
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                // Format time
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour;
                const displayMinute = minute === 0 ? '00' : minute;
                const timeString = `${displayHour}:${displayMinute} ${period}`;
                
                timeSlot.textContent = timeString;
                
                // Disable past times for today
                if (isToday) {
                    const slotTime = new Date(selectedDate);
                    slotTime.setHours(hour, minute, 0, 0);
                    
                    if (slotTime <= now) {
                        timeSlot.classList.add('disabled');
                    }
                }
                
                // Add click event if not disabled
                if (!timeSlot.classList.contains('disabled')) {
                    timeSlot.addEventListener('click', function() {
                        selectTime(timeString, this);
                    });
                }
                
                timeSlotsContainer.appendChild(timeSlot);
            }
        }
    }

    function selectTime(time, element) {
        // Remove previous selection
        if (selectedTimeElement) {
            selectedTimeElement.classList.remove('selected');
        }
        
        // Add new selection
        element.classList.add('selected');
        selectedTimeElement = element;
        
        // Store time
        bookingState.selectedTime = time;
        
        // Enable continue button
        document.getElementById('continue-to-contact').disabled = false;
    }

    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        generateCalendar(currentCalendarDate);
    });

    document.getElementById('next-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        generateCalendar(currentCalendarDate);
    });

    // Navigation buttons for Step 2
    document.getElementById('back-to-service').addEventListener('click', function() {
        goToStep(1);
    });

    document.getElementById('continue-to-contact').addEventListener('click', function() {
        goToStep(3);
    });

    // ============================================
    // STEP 3: CONTACT INFORMATION
    // ============================================
    function populateStep3() {
        // Populate final service summary
        document.getElementById('final-service').textContent = bookingState.selectedService;
        document.getElementById('final-price').textContent = bookingState.selectedPrice;
        
        // Format date and time
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const date = bookingState.selectedDate;
        const dateString = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        const dateTime = `${dateString} at ${bookingState.selectedTime}`;
        
        document.getElementById('final-datetime').textContent = dateTime;
    }

    // Navigation button for Step 3
    document.getElementById('back-to-datetime').addEventListener('click', function() {
        goToStep(2);
    });

    // Form submission
    const contactForm = document.getElementById('booking-contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Honeypot validation - if filled, it's likely spam
        const honeypot = document.getElementById('website-url');
        if (honeypot && honeypot.value.trim() !== '') {
            console.log('Spam detected - honeypot field filled');
            return; // Silently reject
        }
        
        // Validate form
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const notes = document.getElementById('customer-notes').value.trim();
        
        let isValid = true;
        
        // Name validation
        if (name === '') {
            document.getElementById('customer-name').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('customer-name').classList.remove('error');
        }
        
        // Email validation
        if (!validateEmail(email)) {
            document.getElementById('customer-email').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('customer-email').classList.remove('error');
        }
        
        // Phone validation
        if (phone === '') {
            document.getElementById('customer-phone').classList.add('error');
            isValid = false;
        } else {
            document.getElementById('customer-phone').classList.remove('error');
        }
        
        if (!isValid) {
            return;
        }
        
        // Store customer info
        bookingState.customerInfo = {
            name: name,
            email: email,
            phone: phone,
            notes: notes
        };
        
        // Show success
        showSuccess();
    });

    // ============================================
    // SUCCESS CONFIRMATION
    // ============================================
    function showSuccess() {
        // Populate success details
        document.getElementById('confirmed-service').textContent = bookingState.selectedService;
        document.getElementById('confirmed-price').textContent = bookingState.selectedPrice;
        document.getElementById('confirmed-duration').textContent = bookingState.selectedDuration;
        document.getElementById('confirmed-email').textContent = bookingState.customerInfo.email;
        
        // Format date and time
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const date = bookingState.selectedDate;
        const dateString = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        const dateTime = `${dateString} at ${bookingState.selectedTime}`;
        
        document.getElementById('confirmed-datetime').textContent = dateTime;
        
        // Hide step 3, show success
        document.getElementById('step-3').classList.remove('active');
        document.getElementById('step-success').classList.add('active');
        
        // Update step indicator to show completion
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach(item => {
            item.classList.remove('active');
            item.classList.add('completed');
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Here you would typically send the booking data to your backend
        console.log('Booking submitted:', bookingState);
        
        // You could also integrate with an email service or booking system
        // sendBookingToBackend(bookingState);
    }

    // Optional: Send booking data to backend
    // function sendBookingToBackend(data) {
    //     fetch('/api/bookings', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data)
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log('Booking confirmed:', data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    // }
});


