/**
 * Mobile menu controller for admin dashboard
 * Handles hamburger menu, navigation, and logout
 * Shared between admin.html and calendar.html
 */

export class AdminMobileMenu {
    /**
     * Creates mobile menu instance
     * @param {Object} options - Configuration options
     * @param {string} options.hamburgerSelector - CSS selector for hamburger button
     * @param {string} options.menuSelector - CSS selector for menu
     * @param {Function} options.onLogout - Logout callback
     * @param {boolean} options.debug - Enable debug logging
     */
    constructor(options = {}) {
        this.hamburgerSelector = options.hamburgerSelector || '.admin-hamburger';
        this.menuSelector = options.menuSelector || '#admin-mobile-menu';
        this.onLogout = options.onLogout || this.defaultLogoutHandler.bind(this);
        this.debug = options.debug || false;
        this.handleHamburgerClick = null;
        
        this.init();
    }
    
    init() {
        this.hamburger = document.querySelector(this.hamburgerSelector);
        this.menu = document.querySelector(this.menuSelector);
        
        if (!this.hamburger || !this.menu) {
            if (this.debug) {
                console.warn('Mobile menu elements not found', {
                    hamburger: this.hamburger,
                    menu: this.menu
                });
            }
            return;
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const mobileLogoutBtn = document.getElementById('mobile-admin-logout');
        
        // Hamburger click handler
        this.handleHamburgerClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.debug) console.log('Hamburger menu clicked');
            this.toggle();
        };
        
        this.hamburger.addEventListener('click', this.handleHamburgerClick);
        
        // Additional event listeners for better mobile compatibility
        this.hamburger.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        this.hamburger.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        if (this.debug) {
            console.log('Hamburger event listeners attached');
            console.log('Hamburger styles:', {
                display: getComputedStyle(this.hamburger).display,
                visibility: getComputedStyle(this.hamburger).visibility,
                opacity: getComputedStyle(this.hamburger).opacity,
                pointerEvents: getComputedStyle(this.hamburger).pointerEvents,
                zIndex: getComputedStyle(this.hamburger).zIndex
            });
        }
        
        // Close button
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => this.close());
        }
        
        // Overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => this.close());
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Navigation links
        this.menu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', () => this.close());
        });
        
        // Logout button
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                this.onLogout();
                this.close();
            });
        }
    }
    
    toggle() {
        if (this.debug) {
            console.log('Toggle mobile menu', {
                hamburger: this.hamburger,
                menu: this.menu,
                isOpen: this.isOpen()
            });
        }
        
        if (!this.menu || !this.hamburger) {
            if (this.debug) console.error('Cannot toggle menu - missing elements');
            return;
        }
        
        this.isOpen() ? this.close() : this.open();
    }
    
    open() {
        if (!this.menu || !this.hamburger) {
            if (this.debug) console.error('Cannot open menu - missing elements');
            return;
        }
        
        if (this.debug) console.log('Opening mobile menu');
        
        this.menu.classList.add('active');
        this.hamburger.classList.add('active');
        document.body.classList.add('mobile-menu-open');
        this.hamburger.setAttribute('aria-expanded', 'true');
        
        if (this.debug) {
            console.log('Menu opened - classes:', this.menu.className);
            console.log('Menu display:', getComputedStyle(this.menu).display);
        }
    }
    
    close() {
        if (!this.menu || !this.hamburger) {
            if (this.debug) console.error('Cannot close menu - missing elements');
            return;
        }
        
        if (this.debug) console.log('Closing mobile menu');
        
        this.menu.classList.remove('active');
        this.hamburger.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
        this.hamburger.setAttribute('aria-expanded', 'false');
        
        if (this.debug) {
            console.log('Menu closed - classes:', this.menu.className);
        }
    }
    
    isOpen() {
        return this.menu && this.menu.classList.contains('active');
    }
    
    defaultLogoutHandler() {
        localStorage.removeItem('adminUser');
        window.location.href = 'admin.html';
    }
}

