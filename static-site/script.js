"use strict";

// Import shared utilities
import { VALIDATION_PATTERNS, sanitizeInput, validateField } from './js/shared/validation.js';
import CONFIG from './js/core/config.js';

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', !isExpanded);
    });
}

// Close mobile menu when clicking on a link
if (navMenu) {
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            navMenu.classList.remove('active');
        });
    });
}

// Close mobile menu when clicking outside
if (hamburger && navMenu) {
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});


// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(250, 248, 245, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(250, 248, 245, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Form validation patterns
// Validation patterns and functions now imported from shared module

// Form submission with enhanced validation
const contactForm = document.querySelector('#booking-form');
if (contactForm) {
    // Real-time validation
    const nameField = contactForm.querySelector('#name');
    const emailField = contactForm.querySelector('#email');
    const phoneField = contactForm.querySelector('#phone');
    const serviceField = contactForm.querySelector('#service');
    
    nameField.addEventListener('blur', () => {
        validateField(nameField, VALIDATION_PATTERNS.name, 'Please enter a valid name (2-50 characters, letters only)');
    });
    
    emailField.addEventListener('blur', () => {
        validateField(emailField, VALIDATION_PATTERNS.email, 'Please enter a valid email address');
    });
    
    phoneField.addEventListener('blur', () => {
        validateField(phoneField, VALIDATION_PATTERNS.phone, 'Please enter a valid phone number');
    });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const phone = phoneField.value.trim();
        const service = serviceField.value;
        const notes = contactForm.querySelector('#notes').value.trim();
        
        // Validate all fields
        const isNameValid = validateField(nameField, validationPatterns.name, 'Please enter a valid name (2-50 characters, letters only)');
        const isEmailValid = validateField(emailField, validationPatterns.email, 'Please enter a valid email address');
        const isPhoneValid = validateField(phoneField, validationPatterns.phone, 'Please enter a valid phone number');
        
        // Check required fields
        if (!name || !email || !phone || !service) {
            alert('Please fill in all required fields.');
            return;
        }
        
        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            alert('Please correct the errors in the form before submitting.');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Booking...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            alert('Thank you! We\'ll contact you soon to confirm your appointment.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Track conversion (for analytics)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'conversion', {
                    'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
                    'value': 1.0,
                    'currency': 'USD'
                });
            }
        }, 2000);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .gallery-card, .about-text, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add some interactive hover effects
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Gallery card hover effects (updated for editorial design)
document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 12px 30px rgba(0,0,0,0.10)';
        this.style.borderColor = 'rgba(0,0,0,0.10)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
        this.style.borderColor = 'rgba(0,0,0,0.06)';
    });
});

// Calendly Integration
document.addEventListener('DOMContentLoaded', function() {
    const calendlyTrigger = document.getElementById('calendly-trigger');
    
    if (calendlyTrigger) {
        calendlyTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Replace 'YOUR_CALENDLY_USERNAME' with actual Calendly username
            Calendly.initPopupWidget({
                url: 'https://calendly.com/YOUR_CALENDLY_USERNAME'
            });
            
            // Track Calendly click event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'calendly_click', {
                    'event_category': 'engagement',
                    'event_label': 'booking_calendly'
                });
            }
        });
    }
});
