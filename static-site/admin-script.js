/**
 * Admin Dashboard JavaScript
 * Handles authentication, navigation, and data management for the admin panel
 */

// Import shared utilities
import { requireAuth, getCurrentUser, logout, updateUserInfoDisplay } from './js/shared/auth.js';
import { AdminMobileMenu } from './js/shared/admin-menu.js';

class AdminDashboard {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard';
        this.currentWeek = new Date();
        this.mockData = this.initializeMockData();
        
        this.init();
    }

    /**
     * Initialize the admin dashboard
     */
    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation buttons
        const navButtons = document.querySelectorAll('.admin-nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Schedule navigation
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
        if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));

        // Initialize mobile menu using shared module
        this.mobileMenu = new AdminMobileMenu({
            onLogout: () => this.handleLogout(),
            debug: false
        });
    }

    /**
     * Check if user is already authenticated
     */
    checkAuthentication() {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }
    }

    /**
     * Handle login form submission
     */
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        // Show loading
        this.showLoading();
        
        // Simulate authentication delay
        setTimeout(() => {
            const user = this.authenticateUser(username, password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('adminUser', JSON.stringify(user));
                this.hideLoading();
                this.showDashboard();
                this.loadDashboardData();
            } else {
                this.hideLoading();
                this.showLoginError();
            }
        }, 1000);
    }

    /**
     * Authenticate user credentials
     */
    authenticateUser(username, password) {
        const users = {
            'hannah': { username: 'hannah', password: 'admin123', role: 'master', name: 'Hannah' },
            'stylist1': { username: 'stylist1', password: 'stylist123', role: 'stylist', name: 'Sarah' },
            'stylist2': { username: 'stylist2', password: 'stylist123', role: 'stylist', name: 'Emma' }
        };

        const user = users[username];
        if (user && user.password === password) {
            return user;
        }
        return null;
    }

    /**
     * Handle logout
     */
    handleLogout() {
        localStorage.removeItem('adminUser');
        this.currentUser = null;
        this.showLogin();
        this.clearForm();
    }

    /**
     * Handle navigation between views
     */
    handleNavigation(e) {
        const view = e.target.getAttribute('data-view');
        
        // Check if user has permission for analytics view
        if (view === 'analytics' && this.currentUser.role !== 'master') {
            alert('Access denied. Only master accounts can view analytics.');
            return;
        }
        
        this.switchView(view);
    }

    /**
     * Switch between different admin views
     */
    switchView(view) {
        // Update navigation buttons
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update view content
        document.querySelectorAll('.admin-view').forEach(viewElement => {
            viewElement.classList.remove('active');
        });
        
        const targetView = document.getElementById(`${view}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = view;
        
        // Load view-specific data
        this.loadViewData(view);
    }

    /**
     * Load data for specific view
     */
    loadViewData(view) {
        switch (view) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            // Schedule and Analytics now have their own pages
        }
    }

    /**
     * Show login screen
     */
    showLogin() {
        document.getElementById('admin-login').style.display = 'flex';
        document.getElementById('admin-dashboard').style.display = 'none';
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        
        // Update user info
        const userInfo = document.getElementById('admin-user-info');
        if (userInfo) {
            userInfo.textContent = `${this.currentUser.name} (${this.currentUser.role})`;
        }
        
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = this.currentUser.name;
        }
        
        // Update dashboard description based on role
        const description = document.getElementById('dashboard-description');
        if (description) {
            if (this.currentUser.role === 'master') {
                description.textContent = 'View all stylist schedules, analytics, and business insights.';
            } else {
                description.textContent = 'Manage your appointments and view your schedule.';
            }
        }
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        document.getElementById('admin-loading').style.display = 'flex';
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        document.getElementById('admin-loading').style.display = 'none';
    }

    /**
     * Show login error
     */
    showLoginError() {
        const errorElement = document.getElementById('login-error');
        errorElement.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Clear login form
     */
    clearForm() {
        document.getElementById('admin-login-form').reset();
        document.getElementById('login-error').style.display = 'none';
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        const stats = this.calculateStats();
        
        // Update quick stats
        document.getElementById('today-appointments').textContent = stats.todayAppointments;
        document.getElementById('total-appointments').textContent = stats.weekAppointments;
        document.getElementById('weekly-revenue').textContent = `$${stats.weekRevenue}`;
        document.getElementById('avg-rating').textContent = stats.avgRating;

        // Load upcoming appointments
        this.loadUpcomingAppointments();
    }

    /**
     * Load upcoming appointments
     */
    loadUpcomingAppointments() {
        const upcomingAppointments = this.getUpcomingAppointments();
        const container = document.getElementById('upcoming-appointments');
        
        container.innerHTML = '';
        
        if (upcomingAppointments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No upcoming appointments</p>';
            return;
        }
        
        upcomingAppointments.forEach(appointment => {
            const appointmentElement = this.createAppointmentElement(appointment);
            container.appendChild(appointmentElement);
        });
    }

    /**
     * Create appointment element
     */
    createAppointmentElement(appointment) {
        const div = document.createElement('div');
        div.className = 'appointment-item';
        
        const date = new Date(appointment.date);
        const timeString = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        div.innerHTML = `
            <div class="appointment-info">
                <div class="appointment-client">${appointment.client}</div>
                <div class="appointment-service">${appointment.service}</div>
            </div>
            <div class="appointment-time">
                <div class="appointment-date">${timeString}</div>
                <div class="appointment-duration">${appointment.duration} min</div>
            </div>
        `;
        
        return div;
    }



    /**
     * Initialize mock data
     */
    initializeMockData() {
        return {
            appointments: [
                {
                    id: 1,
                    client: 'Sarah Johnson',
                    service: 'Russian Manicure',
                    date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                    duration: 90,
                    stylist: 'Sarah',
                    price: 85
                },
                {
                    id: 2,
                    client: 'Emma Davis',
                    service: 'Gel Extensions',
                    date: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
                    duration: 120,
                    stylist: 'Emma',
                    price: 120
                },
                {
                    id: 3,
                    client: 'Jessica Smith',
                    service: 'Nail Art',
                    date: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
                    duration: 75,
                    stylist: 'Sarah',
                    price: 95
                }
            ],
            stylists: ['Sarah', 'Emma'],
            services: [
                'Russian Manicure',
                'Gel Extensions',
                'Nail Art',
                'Classic Manicure',
                'Pedicure'
            ]
        };
    }

    /**
     * Calculate dashboard statistics
     */
    calculateStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayAppointments = this.mockData.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate.getTime() === today.getTime();
        }).length;
        
        const weekStart = this.getWeekStart(today);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekAppointments = this.mockData.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
        }).length;
        
        const weekRevenue = this.mockData.appointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= weekStart && aptDate <= weekEnd;
            })
            .reduce((sum, apt) => sum + apt.price, 0);
        
        return {
            todayAppointments,
            weekAppointments,
            weekRevenue,
            avgRating: '5.0'
        };
    }

    /**
     * Get upcoming appointments
     */
    getUpcomingAppointments() {
        const now = new Date();
        return this.mockData.appointments
            .filter(apt => new Date(apt.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5); // Show next 5 appointments
    }

    /**
     * Get week start date
     */
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    /**
     * Get appointments for a specific day
     */
    getAppointmentsForDay(date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        return this.mockData.appointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= dayStart && aptDate <= dayEnd;
            })
            .map(apt => ({
                time: apt.date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                }),
                client: apt.client,
                service: apt.service
            }));
    }

}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

// Prevent right-click and other developer tools (basic security)
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});

