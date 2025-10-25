// Import shared utilities
import { requireAuth, updateUserInfoDisplay } from './js/shared/auth.js';
import { AdminMobileMenu } from './js/shared/admin-menu.js';

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

// AdminMobileMenu now imported from shared module

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Calendar page');
    
    // Check authentication using shared auth module
    const user = requireAuth('admin.html');
    if (!user) return;
    
    // Show dashboard and update user info
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Update user info using shared function
    const userInfo = document.getElementById('admin-user-info');
    if (userInfo) {
        userInfo.textContent = `${user.name} (${user.role})`;
    }
    
    // Wait a bit for the DOM to be fully rendered
    setTimeout(() => {
        console.log('Initializing mobile menu after delay');
        
        // Initialize mobile menu using shared module
        window.adminMobileMenu = new AdminMobileMenu({
            onLogout: () => {
                localStorage.removeItem('adminUser');
                window.location.href = 'admin.html';
            },
            debug: true
        });
        
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
