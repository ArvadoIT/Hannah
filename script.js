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
            console.error('Splash screen element not found!');
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
        
        // Remove splash screen from DOM
        setTimeout(() => {
            this.cleanup();
        }, 100);
    }
    
    setupInitialState() {
        // Add splash-active class to body
        document.body.classList.add('splash-active');
        
        // Ensure splash screen is visible
        this.splashScreen.style.setProperty('display', 'flex', 'important');
        this.splashScreen.style.setProperty('opacity', '1', 'important');
        this.splashScreen.style.setProperty('visibility', 'visible', 'important');
        this.splashScreen.style.setProperty('z-index', '99999', 'important');
        this.splashScreen.classList.remove('fade-out');
        
        // Hide main content initially with enhanced styling
        if (this.mainContent) {
            this.mainContent.classList.add('main-content-fade-in');
            this.mainContent.style.transform = 'translateY(50px)';
            this.mainContent.style.opacity = '0';
        }
        
        if (this.footer) {
            this.footer.classList.add('main-content-fade-in');
            this.footer.style.transform = 'translateY(30px)';
            this.footer.style.opacity = '0';
        }
        
        // Prevent body scroll during splash
        document.body.style.overflow = 'hidden';
    }
    
    startTransitionSequence() {
        // Mark splash as shown in session storage
        sessionStorage.setItem('splashShown', 'true');
        
        // Start fade out earlier so content appears when text fades
        setTimeout(() => {
            this.startFadeOut();
        }, 2100); // Start fade out when text starts fading (70% of 3s)
    }
    
    startFadeOut() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Add fade-out class to splash screen
        this.splashScreen.classList.add('fade-out');
        
        // Reveal main content immediately (no delay)
        this.revealMainContent();
        
        // Remove splash screen after transition completes
        setTimeout(() => {
            this.cleanup();
        }, 1800); // Match the CSS transition duration
    }
    
    revealMainContent() {
        // Re-enable body scroll
        document.body.style.overflow = '';
        
        // Enhanced staggered reveal with different animations
        const elements = [
            { element: this.mainContent, delay: 200, transform: 'translateY(50px)' },
            { element: this.footer, delay: 400, transform: 'translateY(30px)' }
        ].filter(item => item.element);
        
        elements.forEach(({ element, delay, transform }) => {
            setTimeout(() => {
                element.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
                element.classList.add('visible');
            }, delay);
        });
        
        // Add a subtle entrance animation to key sections
        setTimeout(() => {
            this.animateHeroSection();
        }, 600);
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
        // Remove splash-active class from body
        document.body.classList.remove('splash-active');
        
        if (this.splashScreen && this.splashScreen.parentNode) {
            // Ensure splash screen is completely hidden before removal
            this.splashScreen.style.display = 'none';
            this.splashScreen.style.visibility = 'hidden';
            this.splashScreen.style.opacity = '0';
            this.splashScreen.style.pointerEvents = 'none';
            
            // Remove from DOM after a brief delay
            setTimeout(() => {
                this.splashScreen.remove();
            }, 100);
        }
        this.isTransitioning = false;
    }
}

// Check if splash should be skipped (ultra-simple logic)
function shouldSkipSplash() {
    console.log('🔍 Checking if splash should be skipped...');
    
    // Check if this is internal navigation (from URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('internal') === 'true') {
        console.log('⏭️ Skipping splash: internal navigation detected');
        // Clean up the URL parameter
        const url = new URL(window.location);
        url.searchParams.delete('internal');
        window.history.replaceState({}, '', url);
        return true;
    }
    
    // Check if we've already shown splash screen in this session
    const splashShown = sessionStorage.getItem('splashShown');
    console.log('📝 SessionStorage splashShown:', splashShown);
    if (splashShown === 'true') {
        console.log('⏭️ Skipping splash: already shown in this session');
        return true;
    }
    
    // Check if we're navigating back to home after being away
    const navigatingToHome = sessionStorage.getItem('navigatingToHome');
    const navigatedAwayFromHome = sessionStorage.getItem('navigatedAwayFromHome');
    console.log('🏠 Navigating to home:', navigatingToHome, 'Navigated away:', navigatedAwayFromHome);
    
    if (navigatingToHome === 'true' && navigatedAwayFromHome === 'true') {
        console.log('⏭️ Skipping splash: returning to home after navigation');
        // Clean up the flags
        sessionStorage.removeItem('navigatingToHome');
        sessionStorage.removeItem('navigatedAwayFromHome');
        return true;
    }
    
    // Check if user is coming from another page on the same site
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    console.log('🔗 Referrer:', referrer, 'Current domain:', currentDomain);
    
    // If referrer exists and is from the same domain, skip splash
    if (referrer && referrer.startsWith(currentDomain)) {
        console.log('⏭️ Skipping splash: coming from same domain');
        return true;
    }
    
    console.log('✅ Splash screen should be shown');
    return false;
}

// Debug function to clear sessionStorage (for testing)
function clearSplashSession() {
    sessionStorage.removeItem('splashShown');
    console.log('🧹 Cleared splash session - refresh page to see splash screen');
}

// Make it available globally for debugging
window.clearSplashSession = clearSplashSession;

// Initialize splash screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing splash screen...');
    
    // Check if splash screen was already handled by head script
    if (document.body.classList.contains('skip-splash')) {
        console.log('✅ Splash screen already handled by head script');
        return;
    }
    
    // Add a small delay to ensure navigation flags are processed
    setTimeout(() => {
        // Check if splash should be skipped
        if (shouldSkipSplash()) {
            console.log('❌ Hiding splash screen immediately');
            // Use CSS-only approach by adding body class
            document.body.classList.add('skip-splash');
            document.body.classList.remove('splash-active');
            document.body.style.overflow = '';
            
            // Ensure main content is visible
            const main = document.querySelector('main');
            const footer = document.querySelector('footer');
            if (main) {
                main.style.opacity = '1';
                main.style.transform = 'translateY(0)';
                main.style.visibility = 'visible';
                main.classList.add('visible');
            }
            if (footer) {
                footer.style.opacity = '1';
                footer.style.transform = 'translateY(0)';
                footer.style.visibility = 'visible';
                footer.classList.add('visible');
            }
            console.log('✅ Splash screen hidden via CSS');
        } else {
            console.log('🎬 Starting splash screen animation');
            // Show splash screen
            new SplashScreenManager();
        }
    }, 50); // Increased delay to ensure head script completes first
});

// Fallback for immediate execution if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('⚡ DOM already loaded - Using fallback initialization...');
    // DOM is already loaded
    // Add a small delay to ensure navigation flags are processed
    setTimeout(() => {
        if (shouldSkipSplash()) {
            console.log('❌ Fallback: Hiding splash screen immediately');
            // Hide splash screen immediately and show main content
            const splashScreen = document.getElementById('splash-screen');
            const main = document.querySelector('main');
            const footer = document.querySelector('footer');
            
            // Add skip-splash class and remove splash-active
            document.body.classList.add('skip-splash');
            document.body.classList.remove('splash-active');
            
            if (splashScreen) {
                splashScreen.style.display = 'none';
                splashScreen.style.visibility = 'hidden';
                splashScreen.style.opacity = '0';
                splashScreen.style.pointerEvents = 'none';
                console.log('✅ Fallback: Splash screen hidden');
            }
            
            if (main) {
                main.style.opacity = '1';
                main.style.transform = 'translateY(0)';
                main.style.visibility = 'visible';
                main.style.display = 'block';
                main.classList.add('visible');
                console.log('✅ Fallback: Main content shown');
            }
            
            if (footer) {
                footer.style.opacity = '1';
                footer.style.transform = 'translateY(0)';
                footer.style.visibility = 'visible';
                footer.style.display = 'block';
                footer.classList.add('visible');
                console.log('✅ Fallback: Footer shown');
            }
            
            // Re-enable body scroll
            document.body.style.overflow = '';
        } else {
            console.log('🎬 Fallback: Starting splash screen animation');
            // Show splash screen
            new SplashScreenManager();
        }
    }, 10); // Small delay to ensure flags are processed
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
