/**
 * Application configuration and constants
 * Single source of truth for all configurable values
 */

export const CONFIG = {
    // Timing
    TRANSITION_DURATION: 600,
    LOADING_TIMEOUT: 5000,
    
    // Business Hours
    BUSINESS_HOURS: {
        START: 9,
        END: 19,
        INTERVAL_MINUTES: 30
    },
    
    // Calendar
    CALENDAR: {
        FIRST_DAY: 0, // Sunday
        WEEKS_TO_SHOW: 6
    },
    
    // Validation
    VALIDATION: {
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 50,
        PHONE_MIN_LENGTH: 10
    },
    
    // UI
    OBSERVER_THRESHOLD: 0.1,
    OBSERVER_ROOT_MARGIN: '0px 0px -50px 0px',
    
    // API Endpoints (for future backend integration)
    API_ENDPOINTS: {
        BOOKINGS: '/api/bookings',
        AUTH: '/api/auth',
        APPOINTMENTS: '/api/appointments'
    },
    
    // Feature Flags
    FEATURES: {
        DEBUG_MODE: false,
        ENABLE_ANALYTICS: true,
        ENABLE_CALENDLY: true,
        ENABLE_GOOGLE_REVIEWS: false
    },
    
    // External Services
    EXTERNAL: {
        CALENDLY_USERNAME: 'lacque-latte',
        GOOGLE_ANALYTICS_ID: 'GA_MEASUREMENT_ID',
        GOOGLE_PLACES_API_KEY: 'YOUR_API_KEY',
        GOOGLE_PLACE_ID: 'YOUR_PLACE_ID'
    }
};

// Make config immutable in production
if (!CONFIG.FEATURES.DEBUG_MODE) {
    Object.freeze(CONFIG);
}

export default CONFIG;

