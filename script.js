"use strict";

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

// Handle internal navigation to home page
document.querySelectorAll('a[href="index.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        // Set a flag that we're navigating back to home
        sessionStorage.setItem('navigatingToHome', 'true');
        // Add a parameter to indicate this is internal navigation
        const url = new URL(this.href, window.location.origin);
        url.searchParams.set('internal', 'true');
        this.href = url.toString();
    });
});

// Handle navigation during splash screen
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        // If we're currently showing splash screen, mark to skip splash on next page load
        if (document.body.classList.contains('splash-active')) {
            console.log('🚀 Navigation clicked during splash - will skip splash for next page');
            // Set the flag so next page load skips splash
            sessionStorage.setItem('splashShown', 'true');
        }
    });
});

// Set flag when navigating away from home page
document.querySelectorAll('a[href="services.html"], a[href="portfolio.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        // Set a flag that we're navigating away from home
        sessionStorage.setItem('navigatedAwayFromHome', 'true');
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
const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/
};

// Utility function to sanitize input
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}

// Form validation functions
function validateField(field, pattern, errorMessage) {
    const value = field.value.trim();
    const isValid = pattern.test(value);
    
    // Remove existing error styling
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (!isValid && value !== '') {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errorMessage;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
        return false;
    }
    
    return isValid;
}

// Form submission with enhanced validation
const contactForm = document.querySelector('#booking-form');
if (contactForm) {
    // Real-time validation
    const nameField = contactForm.querySelector('#name');
    const emailField = contactForm.querySelector('#email');
    const phoneField = contactForm.querySelector('#phone');
    const serviceField = contactForm.querySelector('#service');
    
    nameField.addEventListener('blur', () => {
        validateField(nameField, validationPatterns.name, 'Please enter a valid name (2-50 characters, letters only)');
    });
    
    emailField.addEventListener('blur', () => {
        validateField(emailField, validationPatterns.email, 'Please enter a valid email address');
    });
    
    phoneField.addEventListener('blur', () => {
        validateField(phoneField, validationPatterns.phone, 'Please enter a valid phone number');
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

// Enhanced Splash Screen with Smooth Transitions
class SplashScreenManager {
    constructor() {
        this.splashScreen = document.getElementById('splash-screen');
        this.mainContent = document.querySelector('main');
        this.footer = document.querySelector('footer');
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (!this.splashScreen) {
            // No splash screen element - this is normal for non-home pages
            console.log('ℹ️ No splash screen element on this page');
            return;
        }
        
        this.setupInitialState();
        this.startTransitionSequence();
    }
    
    shouldSkipSplash() {
        // This method is no longer needed since we handle skip logic at the top level
        return false;
    }
    
    skipSplash() {
        // Hide splash screen immediately
        if (this.splashScreen) {
            this.splashScreen.style.display = 'none';
        }
        
        // Show main content immediately
        if (this.mainContent) {
            this.mainContent.style.opacity = '1';
            this.mainContent.style.transform = 'translateY(0)';
            this.mainContent.classList.add('visible');
        }
        
        if (this.footer) {
            this.footer.style.opacity = '1';
            this.footer.style.transform = 'translateY(0)';
            this.footer.classList.add('visible');
        }
        
        // Remove splash screen from DOM (don't set sessionStorage here)
        setTimeout(() => {
            if (this.splashScreen && this.splashScreen.parentNode) {
                this.splashScreen.remove();
            }
        }, 100);
    }
    
    setupInitialState() {
        // Add splash-active class to body
        document.body.classList.add('splash-active');
        
        // Ensure splash screen is visible and on top
        this.splashScreen.style.setProperty('display', 'flex', 'important');
        this.splashScreen.style.setProperty('opacity', '1', 'important');
        this.splashScreen.style.setProperty('visibility', 'visible', 'important');
        this.splashScreen.style.setProperty('z-index', '10000', 'important');
        this.splashScreen.classList.remove('fade-out');
        
        // Make main content visible underneath splash (but with opacity 0 for fade effect)
        // This prevents white flash - content is there, just not visible yet
        if (this.mainContent) {
            this.mainContent.classList.add('main-content-fade-in');
            this.mainContent.style.visibility = 'visible';
            this.mainContent.style.display = 'block';
            this.mainContent.style.opacity = '0'; // Hidden but rendered
            this.mainContent.style.transform = 'translateY(0)'; // Don't shift, just fade
            this.mainContent.style.backgroundColor = 'var(--background-primary)';
        }
        
        if (this.footer) {
            this.footer.classList.add('main-content-fade-in');
            this.footer.style.visibility = 'visible';
            this.footer.style.display = 'block';
            this.footer.style.opacity = '0'; // Hidden but rendered
            this.footer.style.transform = 'translateY(0)'; // Don't shift, just fade
        }
        
        // Prevent body scroll during splash
        document.body.style.overflow = 'hidden';
    }
    
    startTransitionSequence() {
        // Listen for the splash logo animation end
        const logo = this.splashScreen.querySelector('.splash-logo h1');
        if (logo) {
            logo.addEventListener('animationend', () => {
                this.startFadeOut();
            }, { once: true });
        } else {
            // Fallback to timing if logo not found
            setTimeout(() => {
                this.startFadeOut();
            }, 2100);
        }
    }
    
    startFadeOut() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Add fade-out class to splash screen
        this.splashScreen.classList.add('fade-out');
        
        // Listen for the splash's transform transition to end (this is what actually fires)
        const handleTransitionEnd = (e) => {
            // Respond to transform transition on the splash screen (opacity doesn't fire due to !important conflict)
            if (e.propertyName === 'transform' && e.target === this.splashScreen) {
                this.splashScreen.removeEventListener('transitionend', handleTransitionEnd);
                // Remove splash-active class so header background is restored
                document.body.classList.remove('splash-active');
                // Reveal main content
                this.revealMainContent();
                // Cleanup after revealing
                setTimeout(() => {
                    this.cleanup();
                }, 100);
            }
        };
        
        this.splashScreen.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback timeout in case transitionend doesn't fire
        setTimeout(() => {
            this.splashScreen.removeEventListener('transitionend', handleTransitionEnd);
            if (this.isTransitioning) {
                document.body.classList.remove('splash-active');
                this.revealMainContent();
                this.cleanup();
            }
        }, 2500);
    }
    
    revealMainContent() {
        // Re-enable body scroll
        document.body.style.overflow = '';
        
        // Fade in main content smoothly using requestAnimationFrame for smooth opacity transition
        const elements = [
            { element: this.mainContent, delay: 0 },
            { element: this.footer, delay: 100 }
        ].filter(item => item.element);
        
        elements.forEach(({ element, delay }) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        element.style.opacity = '1';
                    });
                });
                element.classList.add('visible');
            }, delay);
        });
        
        // Add a subtle entrance animation to key sections
        setTimeout(() => {
            this.animateHeroSection();
        }, 300); // Reduced delay for faster appearance
    }
    
    animateHeroSection() {
        const heroSection = document.querySelector('.hero');
        const heroText = document.querySelector('.hero-text');
        const heroShapes = document.querySelector('.hero-shapes');
        const heroLeaves = document.querySelector('.hero-leaves');
        
        if (heroSection) {
            heroSection.style.opacity = '1';
        }
        
        if (heroText) {
            heroText.style.animation = 'heroTextEntrance 1s ease-out forwards';
        }
        
        if (heroShapes) {
            heroShapes.style.animation = 'heroShapesEntrance 1.5s ease-out forwards';
        }
        
        // Animate leaves entrance with a slight delay
        if (heroLeaves) {
            setTimeout(() => {
                heroLeaves.classList.add('visible');
            }, 800); // Show leaves 0.8s after main content appears
        }
    }
    
    cleanup() {
        // Note: splash-active class is already removed in handleTransitionEnd
        
        if (this.splashScreen && this.splashScreen.parentNode) {
            // Ensure splash screen is completely hidden before removal
            this.splashScreen.style.display = 'none';
            this.splashScreen.style.visibility = 'hidden';
            this.splashScreen.style.opacity = '0';
            this.splashScreen.style.pointerEvents = 'none';
            
            // Remove from DOM after a brief delay
            setTimeout(() => {
                if (this.splashScreen && this.splashScreen.parentNode) {
                    this.splashScreen.remove();
                }
                // ONLY set sessionStorage AFTER splash animation fully completes and element is removed
                sessionStorage.setItem('splashShown', 'true');
                console.log('✅ Splash animation complete - sessionStorage set');
            }, 100);
        }
        this.isTransitioning = false;
    }
}

// Check if splash should be skipped - use the flag set by head script
function shouldSkipSplash() {
    // Use the flag set by the head script (single source of truth)
    return window.__skipSplash === true;
}

// Debug function to clear sessionStorage (for testing)
function clearSplashSession() {
    sessionStorage.removeItem('splashShown');
    console.log('🧹 Cleared splash session - refresh page to see splash screen');
}

// Make it available globally for debugging
window.clearSplashSession = clearSplashSession;

// Single, simple initialization - no double execution
if (document.readyState === 'loading') {
    // DOM hasn't loaded yet, wait for it
    document.addEventListener('DOMContentLoaded', initializeSplashScreen);
} else {
    // DOM already loaded, initialize immediately
    initializeSplashScreen();
}

function initializeSplashScreen() {
    // Check the flag set by head script
    if (shouldSkipSplash()) {
        console.log('⏭️ Skipping splash screen');
        // Ensure skip-splash class is applied
        document.body.classList.add('skip-splash');
        document.body.style.overflow = '';
        
        // Ensure main content is visible
        const main = document.querySelector('main');
        const footer = document.querySelector('footer');
        const splashScreen = document.getElementById('splash-screen');
        
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        
        if (main) {
            main.style.opacity = '1';
            main.style.visibility = 'visible';
            main.classList.add('visible');
        }
        
        if (footer) {
            footer.style.opacity = '1';
            footer.style.visibility = 'visible';
            footer.classList.add('visible');
        }
    } else {
        console.log('🎬 Starting splash screen animation');
        // Show splash screen
        new SplashScreenManager();
    }
}

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
