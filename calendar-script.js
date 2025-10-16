// Calendar Page Script
class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.appointments = this.loadAppointments();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCalendar();
        this.updateMonthYear();
    }

    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.generateCalendar();
            this.updateMonthYear();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.generateCalendar();
            this.updateMonthYear();
        });

        document.getElementById('today-btn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.generateCalendar();
            this.updateMonthYear();
        });

        // Add appointment button
        document.getElementById('add-appointment-btn').addEventListener('click', () => {
            this.showAddAppointmentModal();
        });

        // Close sidebar
        document.getElementById('close-sidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        // Calendar view buttons
        document.querySelectorAll('.calendar-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.calendar-view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // TODO: Implement different view modes
            });
        });

        // Mobile menu functionality is now handled by AdminMobileMenu class
    }


    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Today's date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.innerHTML = `<div class="calendar-day-number">${daysInPrevMonth - i}</div>`;
            calendarGrid.appendChild(day);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const dayDate = new Date(year, month, day);
            
            dayElement.className = 'calendar-day';
            
            // Add today class
            if (dayDate.getTime() === today.getTime()) {
                dayElement.classList.add('today');
            }
            
            // Add selected class
            if (this.selectedDate && dayDate.getTime() === this.selectedDate.getTime()) {
                dayElement.classList.add('selected');
            }
            
            dayElement.innerHTML = `<div class="calendar-day-number">${day}</div>`;
            
            // Add appointments for this day
            const dayAppointments = this.getAppointmentsForDate(dayDate);
            if (dayAppointments.length > 0) {
                dayAppointments.forEach(appointment => {
                    const indicator = document.createElement('div');
                    indicator.className = `appointment-indicator ${appointment.status}`;
                    indicator.textContent = `${appointment.time} - ${appointment.client}`;
                    indicator.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showAppointmentDetails(appointment);
                    });
                    dayElement.appendChild(indicator);
                });
            }
            
            // Add click event to select date
            dayElement.addEventListener('click', () => {
                this.selectDate(dayDate);
            });
            
            calendarGrid.appendChild(dayElement);
        }
        
        // Add next month's leading days to fill grid
        const totalCells = calendarGrid.children.length - 7; // Subtract headers
        const remainingCells = 42 - totalCells; // 6 rows * 7 days = 42 cells
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.innerHTML = `<div class="calendar-day-number">${day}</div>`;
            calendarGrid.appendChild(dayElement);
        }
    }

    updateMonthYear() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const monthYearElement = document.getElementById('current-month-year');
        monthYearElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    selectDate(date) {
        this.selectedDate = date;
        this.generateCalendar(); // Regenerate to update selected class
        this.showSidebar();
        this.loadAppointmentsForDate(date);
    }

    showSidebar() {
        const sidebar = document.getElementById('appointment-sidebar');
        sidebar.style.display = 'block';
    }

    closeSidebar() {
        this.selectedDate = null;
        this.generateCalendar(); // Regenerate to remove selected class
        const sidebar = document.getElementById('appointment-sidebar');
        sidebar.style.display = 'none';
    }

    loadAppointmentsForDate(date) {
        const sidebarContent = document.getElementById('sidebar-content');
        const appointments = this.getAppointmentsForDate(date);
        
        if (appointments.length === 0) {
            sidebarContent.innerHTML = '<p class="no-selection">No appointments scheduled for this date</p>';
            return;
        }
        
        const dateString = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let html = `<h4>${dateString}</h4>`;
        
        appointments.forEach(appointment => {
            html += `
                <div class="appointment-card">
                    <div class="appointment-card-header">
                        <div class="appointment-time">${appointment.time}</div>
                        <div class="appointment-status ${appointment.status}">${appointment.status}</div>
                    </div>
                    <div class="appointment-client">${appointment.client}</div>
                    <div class="appointment-service">${appointment.service}</div>
                    <div class="appointment-actions">
                        <button class="appointment-action-btn edit" onclick="calendarManager.editAppointment('${appointment.id}')">Edit</button>
                        <button class="appointment-action-btn delete" onclick="calendarManager.deleteAppointment('${appointment.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        sidebarContent.innerHTML = html;
    }

    getAppointmentsForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.appointments.filter(appointment => appointment.date === dateString);
    }

    showAppointmentDetails(appointment) {
        // TODO: Implement appointment details modal
        console.log('Show appointment details:', appointment);
    }

    showAddAppointmentModal() {
        // TODO: Implement add appointment modal
        console.log('Show add appointment modal');
    }

    editAppointment(appointmentId) {
        // TODO: Implement edit appointment functionality
        console.log('Edit appointment:', appointmentId);
    }

    deleteAppointment(appointmentId) {
        if (confirm('Are you sure you want to delete this appointment?')) {
            this.appointments = this.appointments.filter(apt => apt.id !== appointmentId);
            this.saveAppointments();
            this.generateCalendar();
            if (this.selectedDate) {
                this.loadAppointmentsForDate(this.selectedDate);
            }
        }
    }

    loadAppointments() {
        // Load from localStorage or API
        const saved = localStorage.getItem('lacque-latte-appointments');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Return sample data
        return [
            {
                id: '1',
                date: '2024-12-16',
                time: '10:00 AM',
                client: 'Sarah Johnson',
                service: 'Russian Manicure',
                duration: '90 min',
                price: '$85',
                status: 'confirmed'
            },
            {
                id: '2',
                date: '2024-12-16',
                time: '2:00 PM',
                client: 'Emily Chen',
                service: 'Gel Pedicure',
                duration: '60 min',
                price: '$65',
                status: 'confirmed'
            },
            {
                id: '3',
                date: '2024-12-17',
                time: '11:00 AM',
                client: 'Jessica Martinez',
                service: 'Nail Art Design',
                duration: '120 min',
                price: '$120',
                status: 'pending'
            },
            {
                id: '4',
                date: '2024-12-18',
                time: '3:00 PM',
                client: 'Amanda Wilson',
                service: 'French Manicure',
                duration: '75 min',
                price: '$70',
                status: 'confirmed'
            },
            {
                id: '5',
                date: '2024-12-19',
                time: '1:00 PM',
                client: 'Lisa Thompson',
                service: 'Gel Extensions',
                duration: '150 min',
                price: '$150',
                status: 'pending'
            }
        ];
    }

    saveAppointments() {
        localStorage.setItem('lacque-latte-appointments', JSON.stringify(this.appointments));
    }
}

// Initialize mobile menu functionality for all admin pages
class AdminMobileMenu {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        const mobileLogoutBtn = document.getElementById('mobile-admin-logout');

        console.log('Calendar mobile menu setup - hamburger found:', hamburger);

        // Hamburger menu toggle
        if (hamburger) {
            // Remove any existing event listeners
            hamburger.removeEventListener('click', this.handleHamburgerClick);
            
            // Add new event listener
            this.handleHamburgerClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Calendar hamburger menu clicked');
                this.toggleMobileMenu();
            };
            
            hamburger.addEventListener('click', this.handleHamburgerClick);
            
            // Add additional event listeners for better compatibility
            hamburger.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
            
            hamburger.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
            
            console.log('Hamburger event listeners attached successfully');
            console.log('Hamburger element:', hamburger);
            console.log('Hamburger computed styles:', {
                display: getComputedStyle(hamburger).display,
                visibility: getComputedStyle(hamburger).visibility,
                opacity: getComputedStyle(hamburger).opacity,
                pointerEvents: getComputedStyle(hamburger).pointerEvents,
                zIndex: getComputedStyle(hamburger).zIndex
            });
        } else {
            console.error('Hamburger element not found!');
        }

        // Close menu button
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close menu on overlay click
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Mobile logout button
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', () => {
                this.handleLogout();
                this.closeMobileMenu();
            });
        }

        // Close mobile menu when clicking on navigation links
        document.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        
        console.log('Toggle mobile menu called', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            const isActive = mobileMenu.classList.contains('active');
            console.log('Menu is currently active:', isActive);
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        } else {
            console.error('Cannot toggle menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    openMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        
        console.log('Opening mobile menu:', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            mobileMenu.classList.add('active');
            hamburger.classList.add('active');
            document.body.classList.add('mobile-menu-open');
            hamburger.setAttribute('aria-expanded', 'true');
            
            console.log('Mobile menu classes after opening:', mobileMenu.className);
            console.log('Mobile menu display after opening:', getComputedStyle(mobileMenu).display);
        } else {
            console.error('Cannot open mobile menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    closeMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        
        console.log('Closing mobile menu:', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
            
            console.log('Mobile menu classes after closing:', mobileMenu.className);
        } else {
            console.error('Cannot close mobile menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    handleLogout() {
        localStorage.removeItem('adminUser');
        window.location.href = 'admin.html';
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Calendar page');
    
    // Check authentication first
    const storedUser = localStorage.getItem('adminUser');
    if (!storedUser) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Show dashboard and update user info
    const user = JSON.parse(storedUser);
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Update user info
    const userInfo = document.getElementById('admin-user-info');
    if (userInfo) {
        userInfo.textContent = `${user.name} (${user.role})`;
    }
    
    // Wait a bit for the DOM to be fully rendered
    setTimeout(() => {
        console.log('Initializing mobile menu after delay');
        
        // Always initialize mobile menu functionality
        window.adminMobileMenu = new AdminMobileMenu();
        
        // Test hamburger menu functionality
        const hamburger = document.querySelector('.admin-hamburger');
        if (hamburger) {
            console.log('✅ Hamburger menu found and should be visible');
            console.log('Hamburger element:', hamburger);
            console.log('Hamburger styles:', {
                display: getComputedStyle(hamburger).display,
                visibility: getComputedStyle(hamburger).visibility,
                opacity: getComputedStyle(hamburger).opacity,
                pointerEvents: getComputedStyle(hamburger).pointerEvents
            });
            
            // Add a test click handler
            hamburger.addEventListener('click', () => {
                console.log('🎉 Hamburger menu clicked successfully!');
            });
        } else {
            console.error('❌ Hamburger menu not found!');
        }
        
    }, 100);
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminUser');
            window.location.href = 'admin.html';
        });
    }
    
    // Only initialize calendar functionality if we're on the calendar page
    if (document.getElementById('calendar-grid')) {
        window.calendarManager = new CalendarManager();
    }
});
