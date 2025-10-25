/**
 * Form validation patterns and utilities
 * Shared across all forms in the application
 */

export const VALIDATION_PATTERNS = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/
};

/**
 * Sanitizes user input by trimming and removing dangerous characters
 * @param {string} input - Raw input string
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Validates a form field against a pattern
 * @param {HTMLElement} field - Form field element
 * @param {RegExp} pattern - Validation regex pattern
 * @param {string} errorMessage - Error message to display
 * @returns {boolean} True if valid
 */
export function validateField(field, pattern, errorMessage) {
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

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
    return VALIDATION_PATTERNS.email.test(email);
}

/**
 * Validates a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
    return VALIDATION_PATTERNS.phone.test(phone);
}

/**
 * Validates a name
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
export function validateName(name) {
    return VALIDATION_PATTERNS.name.test(name);
}

