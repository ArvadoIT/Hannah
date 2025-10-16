// Analytics Page Script
class AnalyticsManager {
    constructor() {
        this.currentPeriod = 'month';
        this.charts = {};
        this.data = this.loadAnalyticsData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMetrics();
        this.initializeCharts();
        this.loadTables();
        this.loadStylistPerformance();
        this.loadInsights();
    }

    setupEventListeners() {
        // Period navigation
        document.querySelectorAll('.analytics-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.analytics-nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.refreshAllData();
            });
        });

        // Chart type changes
        document.getElementById('revenue-chart-type').addEventListener('change', (e) => {
            this.updateChartType('revenue', e.target.value);
        });

        document.getElementById('distribution-chart-type').addEventListener('change', (e) => {
            this.updateChartType('distribution', e.target.value);
        });

        document.getElementById('services-chart-type').addEventListener('change', (e) => {
            this.updateChartType('services', e.target.value);
        });

        document.getElementById('growth-chart-type').addEventListener('change', (e) => {
            this.updateChartType('growth', e.target.value);
        });

        // Stylist filters
        document.getElementById('stylist-filter').addEventListener('change', () => {
            this.loadStylistPerformance();
        });

        document.getElementById('performance-metric').addEventListener('change', () => {
            this.loadStylistPerformance();
        });

        // Mobile menu functionality is now handled by AdminMobileMenu class
    }


    loadMetrics() {
        const periodData = this.getPeriodData();
        
        // Update metric values
        document.getElementById('total-revenue').textContent = this.formatCurrency(periodData.revenue);
        document.getElementById('total-appointments').textContent = periodData.appointments;
        document.getElementById('total-clients').textContent = periodData.clients;
        document.getElementById('avg-rating').textContent = periodData.avgRating;
        document.getElementById('conversion-rate').textContent = periodData.conversionRate + '%';
        document.getElementById('retention-rate').textContent = periodData.retentionRate + '%';

        // Update metric changes
        this.updateMetricChange('revenue-change', periodData.revenueChange);
        this.updateMetricChange('appointments-change', periodData.appointmentsChange);
        this.updateMetricChange('clients-change', periodData.clientsChange);
        this.updateMetricChange('rating-change', periodData.ratingChange);
        this.updateMetricChange('conversion-change', periodData.conversionChange);
        this.updateMetricChange('retention-change', periodData.retentionChange);
    }

    updateMetricChange(elementId, change) {
        const element = document.getElementById(elementId);
        element.textContent = (change > 0 ? '+' : '') + change + '%';
        element.className = 'metric-change ' + (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral');
    }

    initializeCharts() {
        this.createRevenueChart();
        this.createDistributionChart();
        this.createServicesChart();
        this.createGrowthChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        const periodData = this.getPeriodData();
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: periodData.revenueLabels,
                datasets: [{
                    label: 'Revenue',
                    data: periodData.revenueData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createDistributionChart() {
        const ctx = document.getElementById('distribution-chart').getContext('2d');
        const periodData = this.getPeriodData();
        
        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: periodData.appointmentDistribution,
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createServicesChart() {
        const ctx = document.getElementById('services-chart').getContext('2d');
        const periodData = this.getPeriodData();
        
        this.charts.services = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: periodData.servicesLabels,
                datasets: [{
                    label: 'Bookings',
                    data: periodData.servicesData,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createGrowthChart() {
        const ctx = document.getElementById('growth-chart').getContext('2d');
        const periodData = this.getPeriodData();
        
        this.charts.growth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: periodData.growthLabels,
                datasets: [{
                    label: 'New Clients',
                    data: periodData.growthData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateChartType(chartName, type) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
        }
        
        switch (chartName) {
            case 'revenue':
                if (type === 'bar') {
                    this.createRevenueBarChart();
                } else {
                    this.createRevenueChart();
                }
                break;
            case 'distribution':
                if (type === 'pie') {
                    this.createDistributionPieChart();
                } else {
                    this.createDistributionChart();
                }
                break;
            case 'services':
                if (type === 'horizontal') {
                    this.createServicesHorizontalChart();
                } else {
                    this.createServicesChart();
                }
                break;
            case 'growth':
                if (type === 'area') {
                    this.createGrowthAreaChart();
                } else {
                    this.createGrowthChart();
                }
                break;
        }
    }

    loadTables() {
        this.loadServicesTable();
        this.loadClientsTable();
    }

    loadServicesTable() {
        const tbody = document.getElementById('services-table-body');
        const periodData = this.getPeriodData();
        
        let html = '';
        periodData.topServices.forEach(service => {
            html += `
                <tr>
                    <td>${service.name}</td>
                    <td>${service.bookings}</td>
                    <td>${this.formatCurrency(service.revenue)}</td>
                    <td>${service.duration}</td>
                    <td>${service.rating} ⭐</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    loadClientsTable() {
        const tbody = document.getElementById('clients-table-body');
        const periodData = this.getPeriodData();
        
        let html = '';
        periodData.topClients.forEach(client => {
            const statusClass = client.status === 'Active' ? 'positive' : 'neutral';
            html += `
                <tr>
                    <td>${client.name}</td>
                    <td>${client.visits}</td>
                    <td>${client.lastVisit}</td>
                    <td>${this.formatCurrency(client.totalSpent)}</td>
                    <td><span class="metric-change ${statusClass}">${client.status}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }

    loadStylistPerformance() {
        const container = document.getElementById('stylist-cards');
        const stylistFilter = document.getElementById('stylist-filter').value;
        const metricFilter = document.getElementById('performance-metric').value;
        
        let stylists = this.data.stylists;
        if (stylistFilter !== 'all') {
            stylists = stylists.filter(s => s.id === stylistFilter);
        }
        
        // Sort by selected metric
        stylists.sort((a, b) => b.metrics[metricFilter] - a.metrics[metricFilter]);
        
        let html = '';
        stylists.forEach(stylist => {
            html += `
                <div class="stylist-card">
                    <div class="stylist-card-header">
                        <div class="stylist-avatar">${stylist.name.charAt(0)}</div>
                        <div class="stylist-info">
                            <h4>${stylist.name}</h4>
                            <p>Senior Stylist</p>
                        </div>
                    </div>
                    <div class="stylist-metrics">
                        <div class="stylist-metric">
                            <div class="stylist-metric-value">${this.formatCurrency(stylist.metrics.revenue)}</div>
                            <div class="stylist-metric-label">Revenue</div>
                        </div>
                        <div class="stylist-metric">
                            <div class="stylist-metric-value">${stylist.metrics.appointments}</div>
                            <div class="stylist-metric-label">Appointments</div>
                        </div>
                        <div class="stylist-metric">
                            <div class="stylist-metric-value">${stylist.metrics.rating}</div>
                            <div class="stylist-metric-label">Rating</div>
                        </div>
                        <div class="stylist-metric">
                            <div class="stylist-metric-value">${stylist.metrics.satisfaction}%</div>
                            <div class="stylist-metric-label">Satisfaction</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    loadInsights() {
        const container = document.getElementById('insights-grid');
        const periodData = this.getPeriodData();
        
        let html = '';
        periodData.insights.forEach(insight => {
            html += `
                <div class="insight-card">
                    <div class="insight-card-header">
                        <div class="insight-icon ${insight.type}">${insight.icon}</div>
                        <h4 class="insight-title">${insight.title}</h4>
                    </div>
                    <p class="insight-description">${insight.description}</p>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    refreshAllData() {
        this.loadMetrics();
        this.initializeCharts();
        this.loadTables();
        this.loadStylistPerformance();
        this.loadInsights();
    }

    refreshInsights() {
        this.loadInsights();
    }

    exportData(type) {
        // TODO: Implement data export functionality
        console.log(`Exporting ${type} data...`);
    }

    getPeriodData() {
        // Return sample data based on current period
        const baseData = {
            week: {
                revenue: 2850,
                appointments: 24,
                clients: 18,
                avgRating: 4.9,
                conversionRate: 78,
                retentionRate: 85,
                revenueChange: 12,
                appointmentsChange: 8,
                clientsChange: 15,
                ratingChange: 2,
                conversionChange: 5,
                retentionChange: 3,
                revenueLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                revenueData: [420, 380, 520, 480, 650, 720, 680],
                appointmentDistribution: [18, 4, 2],
                servicesLabels: ['Russian Manicure', 'Gel Pedicure', 'Nail Art', 'French Manicure', 'Gel Extensions'],
                servicesData: [8, 6, 5, 3, 2],
                growthLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                growthData: [12, 15, 18, 21],
                topServices: [
                    { name: 'Russian Manicure', bookings: 8, revenue: 680, duration: '90 min', rating: 4.9 },
                    { name: 'Gel Pedicure', bookings: 6, revenue: 390, duration: '60 min', rating: 4.8 },
                    { name: 'Nail Art Design', bookings: 5, revenue: 600, duration: '120 min', rating: 5.0 },
                    { name: 'French Manicure', bookings: 3, revenue: 210, duration: '75 min', rating: 4.7 },
                    { name: 'Gel Extensions', bookings: 2, revenue: 300, duration: '150 min', rating: 4.9 }
                ],
                topClients: [
                    { name: 'Sarah Johnson', visits: 12, lastVisit: '2 days ago', totalSpent: 1020, status: 'Active' },
                    { name: 'Emily Chen', visits: 8, lastVisit: '1 week ago', totalSpent: 680, status: 'Active' },
                    { name: 'Jessica Martinez', visits: 6, lastVisit: '3 days ago', totalSpent: 720, status: 'Active' },
                    { name: 'Amanda Wilson', visits: 4, lastVisit: '2 weeks ago', totalSpent: 280, status: 'Active' },
                    { name: 'Lisa Thompson', visits: 3, lastVisit: '1 month ago', totalSpent: 450, status: 'Inactive' }
                ],
                insights: [
                    {
                        type: 'positive',
                        icon: '📈',
                        title: 'Revenue Growth',
                        description: 'Revenue has increased by 12% compared to last week, driven by increased bookings for premium services.'
                    },
                    {
                        type: 'positive',
                        icon: '⭐',
                        title: 'High Customer Satisfaction',
                        description: 'Average rating of 4.9 stars with 95% of clients rating their experience as excellent.'
                    },
                    {
                        type: 'neutral',
                        icon: '📅',
                        title: 'Peak Booking Times',
                        description: 'Most popular booking times are Friday afternoons and Saturday mornings. Consider extending hours.'
                    },
                    {
                        type: 'positive',
                        icon: '🔄',
                        title: 'Strong Retention',
                        description: '85% client retention rate indicates excellent service quality and customer loyalty.'
                    }
                ]
            }
        };

        return baseData.week; // For now, return week data regardless of period
    }

    loadAnalyticsData() {
        return {
            stylists: [
                {
                    id: 'hannah',
                    name: 'Hannah',
                    metrics: {
                        revenue: 1850,
                        appointments: 16,
                        rating: 4.9,
                        satisfaction: 96
                    }
                },
                {
                    id: 'sarah',
                    name: 'Sarah',
                    metrics: {
                        revenue: 1000,
                        appointments: 8,
                        rating: 4.8,
                        satisfaction: 92
                    }
                }
            ]
        };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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

        console.log('Analytics mobile menu setup - hamburger found:', hamburger);

        // Hamburger menu toggle
        if (hamburger) {
            // Remove any existing event listeners
            hamburger.removeEventListener('click', this.handleHamburgerClick);
            
            // Add new event listener
            this.handleHamburgerClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Analytics hamburger menu clicked');
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
            
            console.log('Analytics hamburger event listeners attached successfully');
            console.log('Analytics hamburger element:', hamburger);
            console.log('Analytics hamburger computed styles:', {
                display: getComputedStyle(hamburger).display,
                visibility: getComputedStyle(hamburger).visibility,
                opacity: getComputedStyle(hamburger).opacity,
                pointerEvents: getComputedStyle(hamburger).pointerEvents,
                zIndex: getComputedStyle(hamburger).zIndex
            });
        } else {
            console.error('Analytics hamburger element not found!');
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
        
        console.log('Analytics toggle mobile menu called', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            const isActive = mobileMenu.classList.contains('active');
            console.log('Analytics menu is currently active:', isActive);
            
            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        } else {
            console.error('Analytics cannot toggle menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    openMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        
        console.log('Analytics opening mobile menu:', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            mobileMenu.classList.add('active');
            hamburger.classList.add('active');
            document.body.classList.add('mobile-menu-open');
            hamburger.setAttribute('aria-expanded', 'true');
            
            console.log('Analytics mobile menu classes after opening:', mobileMenu.className);
            console.log('Analytics mobile menu display after opening:', getComputedStyle(mobileMenu).display);
        } else {
            console.error('Analytics cannot open mobile menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    closeMobileMenu() {
        const hamburger = document.querySelector('.admin-hamburger');
        const mobileMenu = document.getElementById('admin-mobile-menu');
        
        console.log('Analytics closing mobile menu:', { hamburger, mobileMenu });
        
        if (mobileMenu && hamburger) {
            mobileMenu.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
            hamburger.setAttribute('aria-expanded', 'false');
            
            console.log('Analytics mobile menu classes after closing:', mobileMenu.className);
        } else {
            console.error('Analytics cannot close mobile menu - missing elements:', { hamburger, mobileMenu });
        }
    }

    handleLogout() {
        localStorage.removeItem('adminUser');
        window.location.href = 'admin.html';
    }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
        console.log('Initializing analytics mobile menu after delay');
        
        // Always initialize mobile menu functionality
        window.adminMobileMenu = new AdminMobileMenu();
        
        // Test hamburger menu functionality
        const hamburger = document.querySelector('.admin-hamburger');
        if (hamburger) {
            console.log('✅ Analytics hamburger menu found and should be visible');
            console.log('Analytics hamburger element:', hamburger);
            console.log('Analytics hamburger styles:', {
                display: getComputedStyle(hamburger).display,
                visibility: getComputedStyle(hamburger).visibility,
                opacity: getComputedStyle(hamburger).opacity,
                pointerEvents: getComputedStyle(hamburger).pointerEvents
            });
            
            // Add a test click handler
            hamburger.addEventListener('click', () => {
                console.log('🎉 Analytics hamburger menu clicked successfully!');
            });
        } else {
            console.error('❌ Analytics hamburger menu not found!');
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
    
    // Only initialize analytics functionality if we're on the analytics page
    if (document.getElementById('revenue-chart')) {
        window.analyticsManager = new AnalyticsManager();
    }
});
