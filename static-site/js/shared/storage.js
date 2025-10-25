/**
 * LocalStorage wrapper utilities
 * Provides safe and consistent access to localStorage
 */

/**
 * Safely gets an item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default value
 */
export function getItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
    } catch (e) {
        console.error(`Error reading from localStorage (${key}):`, e);
        return defaultValue;
    }
}

/**
 * Safely sets an item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} True if successful
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`Error writing to localStorage (${key}):`, e);
        return false;
    }
}

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error(`Error removing from localStorage (${key}):`, e);
        return false;
    }
}

/**
 * Checks if a key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
export function hasItem(key) {
    return localStorage.getItem(key) !== null;
}

/**
 * Clears all items from localStorage
 * @returns {boolean} True if successful
 */
export function clear() {
    try {
        localStorage.clear();
        return true;
    } catch (e) {
        console.error('Error clearing localStorage:', e);
        return false;
    }
}

