/**
 * Authentication utilities
 * Handles user authentication, session management, and authorization
 */

/**
 * Checks if a user is authenticated
 * @returns {boolean} True if user is logged in
 */
export function isAuthenticated() {
    const user = localStorage.getItem('adminUser');
    return user !== null;
}

/**
 * Gets the current authenticated user
 * @returns {Object|null} User object or null if not authenticated
 */
export function getCurrentUser() {
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) return null;
    
    try {
        return JSON.parse(storedUser);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

/**
 * Checks authentication and redirects if not authenticated
 * @param {string} redirectUrl - URL to redirect to if not authenticated (default: 'admin.html')
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export function requireAuth(redirectUrl = 'admin.html') {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = redirectUrl;
        return null;
    }
    return user;
}

/**
 * Logs out the current user
 * @param {string} redirectUrl - URL to redirect to after logout (default: 'admin.html')
 */
export function logout(redirectUrl = 'admin.html') {
    localStorage.removeItem('adminUser');
    window.location.href = redirectUrl;
}

/**
 * Stores user session data
 * @param {Object} userData - User data to store
 */
export function setUser(userData) {
    localStorage.setItem('adminUser', JSON.stringify(userData));
}

/**
 * Updates the user info display in the UI
 * @param {Object} user - User object with name and role
 */
export function updateUserInfoDisplay(user) {
    // Update username display
    const usernameElement = document.getElementById('admin-username');
    if (usernameElement && user.name) {
        usernameElement.textContent = user.name;
    }
    
    // Update role display
    const roleElement = document.getElementById('admin-role');
    if (roleElement && user.role) {
        roleElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
}

