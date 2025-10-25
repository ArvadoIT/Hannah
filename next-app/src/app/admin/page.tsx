'use client';

/**
 * Admin Dashboard Page
 * Interface for managing appointments and viewing analytics
 */

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
if (typeof window !== 'undefined') {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
}

interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  service: string;
  stylist?: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

type ViewTab = 'dashboard' | 'analytics';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>('dashboard');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
        return aptDate === dateFilter;
      });
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, dateFilter]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAppointment) {
        setSelectedAppointment(null);
      }
    };

    if (selectedAppointment) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedAppointment]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setError('');
    } catch (err) {
      setError('Unable to load appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      // Refresh appointments
      await fetchAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert('Failed to update appointment status');
      console.error('Error updating appointment:', err);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      await fetchAppointments();
      setSelectedAppointment(null);
    } catch (err) {
      alert('Failed to cancel appointment');
      console.error('Error deleting appointment:', err);
    }
  };

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    today: appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      const aptDate = new Date(a.startTime).toISOString().split('T')[0];
      return aptDate === today;
    }).length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Analytics calculations
  const calculateAnalytics = () => {
    const now = new Date();
    const periodStart = getPeriodStart(now, timePeriod);
    
    const periodAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= periodStart && aptDate <= now;
    });

    // Mock revenue calculation ($85 average per appointment)
    const revenue = periodAppointments.filter(a => a.status === 'completed').length * 85;
    const activeClients = new Set(periodAppointments.map(a => a.clientEmail)).size;
    const conversionRate = Math.round((periodAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length / Math.max(periodAppointments.length, 1)) * 100);
    const retentionRate = 85; // Mock data

    return {
      revenue,
      appointments: periodAppointments.length,
      activeClients,
      avgRating: 4.9,
      conversionRate,
      retentionRate,
      revenueChange: 12,
      appointmentsChange: 8,
      clientsChange: 15,
      ratingChange: 2,
      conversionChange: 5,
      retentionChange: 3
    };
  };

  const getPeriodStart = (date: Date, period: TimePeriod): Date => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    switch (period) {
      case 'week':
        start.setDate(date.getDate() - 7);
        break;
      case 'month':
        start.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(date.getFullYear() - 1);
        break;
    }
    return start;
  };

  const getRevenueChartData = () => {
    const labels = timePeriod === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timePeriod === 'month'
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : ['Q1', 'Q2', 'Q3', 'Q4'];

    return {
      labels,
      datasets: [{
        label: 'Revenue ($)',
        data: timePeriod === 'week' ? [420, 380, 520, 480, 650, 720, 680] : [1850, 2100, 2400, 2250],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const getDistributionChartData = () => {
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;

    return {
      labels: ['Confirmed', 'Pending', 'Completed'],
      datasets: [{
        data: [confirmed, pending, completed],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    };
  };

  const getServicesChartData = () => {
    const serviceCounts: { [key: string]: number } = {};
    appointments.forEach(apt => {
      serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
    });

    const sortedServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedServices.map(([service]) => service),
      datasets: [{
        label: 'Bookings',
        data: sortedServices.map(([, count]) => count),
        backgroundColor: '#8b5cf6',
        borderRadius: 8
      }]
    };
  };

  const getTopServices = () => {
    const serviceCounts: { [key: string]: number } = {};
    appointments.forEach(apt => {
      serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
    });

    return Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service, bookings]) => ({
        name: service,
        bookings,
        revenue: bookings * 85,
        duration: '90 min',
        rating: 4.9
      }));
  };

  const getTopClients = () => {
    const clientData: { [email: string]: { name: string; visits: number; lastVisit: Date } } = {};
    
    appointments.forEach(apt => {
      if (!clientData[apt.clientEmail]) {
        clientData[apt.clientEmail] = {
          name: apt.clientName,
          visits: 0,
          lastVisit: new Date(apt.startTime)
        };
      }
      clientData[apt.clientEmail].visits++;
      const aptDate = new Date(apt.startTime);
      if (aptDate > clientData[apt.clientEmail].lastVisit) {
        clientData[apt.clientEmail].lastVisit = aptDate;
      }
    });

    return Object.entries(clientData)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 5)
      .map(([_email, data]) => {
        const daysSinceVisit = Math.floor((Date.now() - data.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        const lastVisitText = daysSinceVisit === 0 ? 'Today' : daysSinceVisit === 1 ? '1 day ago' : `${daysSinceVisit} days ago`;
        return {
          name: data.name,
          visits: data.visits,
          lastVisit: lastVisitText,
          totalSpent: data.visits * 85,
          status: daysSinceVisit < 30 ? 'Active' : 'Inactive'
        };
      });
  };

  const getStylistPerformance = () => {
    const stylists = ['Hannah', 'Sarah', 'Emma'];
    return stylists.map(name => {
      const stylistAppointments = appointments.filter(a => a.stylist === name);
      return {
        name,
        metrics: {
          revenue: stylistAppointments.filter(a => a.status === 'completed').length * 85,
          appointments: stylistAppointments.length,
          rating: 4.9,
          satisfaction: 96
        }
      };
    }).filter(s => s.metrics.appointments > 0);
  };

  const getBusinessInsights = () => {
    const analytics = calculateAnalytics();
    return [
      {
        type: 'positive',
        icon: '📈',
        title: 'Revenue Growth',
        description: `Revenue has increased by ${analytics.revenueChange}% compared to last ${timePeriod}, driven by increased bookings for premium services.`
      },
      {
        type: 'positive',
        icon: '⭐',
        title: 'High Customer Satisfaction',
        description: `Average rating of ${analytics.avgRating} stars with 95% of clients rating their experience as excellent.`
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
        description: `${analytics.retentionRate}% client retention rate indicates excellent service quality and customer loyalty.`
      }
    ];
  };

  const analytics = calculateAnalytics();
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerActions}>
          <div className={styles.viewTabs}>
            <button 
              className={`${styles.viewTab} ${activeView === 'dashboard' ? styles.activeTab : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              📋 Dashboard
            </button>
            <button 
              className={`${styles.viewTab} ${activeView === 'analytics' ? styles.activeTab : ''}`}
              onClick={() => setActiveView('analytics')}
            >
              📊 Analytics
            </button>
          </div>
          <button onClick={fetchAppointments} className={styles.refreshBtn}>
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className={styles.dashboardView}>
          {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Appointments</div>
        </div>
        <div className={`${styles.statCard} ${styles.highlight}`}>
          <div className={styles.statValue}>{stats.today}</div>
          <div className={styles.statLabel}>Today</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#f59e0b' }}>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#3b82f6' }}>
          <div className={styles.statValue}>{stats.confirmed}</div>
          <div className={styles.statLabel}>Confirmed</div>
        </div>
        <div className={styles.statCard} style={{ borderLeftColor: '#10b981' }}>
          <div className={styles.statValue}>{stats.completed}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="date-filter">Date:</label>
          <input
            type="date"
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className={styles.clearFilter}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className={styles.loading}>Loading appointments...</div>
      ) : (
        <>
          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className={styles.noAppointments}>
              <p>No appointments found.</p>
              {(statusFilter !== 'all' || dateFilter) && (
                <p>Try adjusting your filters.</p>
              )}
            </div>
          ) : (
            <div className={styles.appointmentsList}>
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className={`${styles.appointmentCard} ${selectedAppointment?._id === appointment._id ? styles.selected : ''}`}
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className={styles.appointmentHeader}>
                    <div className={styles.appointmentInfo}>
                      <h3>{appointment.clientName}</h3>
                      <p className={styles.serviceName}>{appointment.service}</p>
                    </div>
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(appointment.status) }}
                    >
                      {appointment.status}
                    </div>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📅</span>
                      <span>{formatDate(appointment.startTime)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>🕐</span>
                      <span>{formatTime(appointment.startTime)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📧</span>
                      <span>{appointment.clientEmail}</span>
                    </div>
                    {appointment.clientPhone && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>📱</span>
                        <span>{appointment.clientPhone}</span>
                      </div>
                    )}
                    {appointment.stylist && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>💅</span>
                        <span>Stylist: {appointment.stylist}</span>
                      </div>
                    )}
                  </div>
                  {appointment.notes && (
                    <div className={styles.appointmentNotes}>
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAppointment(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className={styles.closeBtn}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Client:</strong>
                <span>{selectedAppointment.clientName}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Email:</strong>
                <span>{selectedAppointment.clientEmail}</span>
              </div>
              {selectedAppointment.clientPhone && (
                <div className={styles.detailRow}>
                  <strong>Phone:</strong>
                  <span>{selectedAppointment.clientPhone}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <strong>Service:</strong>
                <span>{selectedAppointment.service}</span>
              </div>
              {selectedAppointment.stylist && (
                <div className={styles.detailRow}>
                  <strong>Stylist:</strong>
                  <span>{selectedAppointment.stylist}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <strong>Date:</strong>
                <span>{formatDate(selectedAppointment.startTime)}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Time:</strong>
                <span>{formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(selectedAppointment.status) }}
                >
                  {selectedAppointment.status}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className={styles.detailRow}>
                  <strong>Notes:</strong>
                  <span>{selectedAppointment.notes}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <strong>Booked:</strong>
                <span>{formatDate(selectedAppointment.createdAt)}</span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <h3>Update Status</h3>
              <div className={styles.actionButtons}>
                {selectedAppointment.status !== 'pending' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'pending')}
                    className={`${styles.actionBtn} ${styles.pending}`}
                  >
                    Mark Pending
                  </button>
                )}
                {selectedAppointment.status !== 'confirmed' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'confirmed')}
                    className={`${styles.actionBtn} ${styles.confirmed}`}
                  >
                    Confirm
                  </button>
                )}
                {selectedAppointment.status !== 'completed' && (
                  <button
                    onClick={() => updateAppointmentStatus(selectedAppointment._id, 'completed')}
                    className={`${styles.actionBtn} ${styles.completed}`}
                  >
                    Mark Complete
                  </button>
                )}
                {selectedAppointment.status !== 'cancelled' && (
                  <button
                    onClick={() => deleteAppointment(selectedAppointment._id)}
                    className={`${styles.actionBtn} ${styles.cancelled}`}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className={styles.analyticsView}>
          {/* Time Period Navigation */}
          <div className={styles.periodNav}>
            <button 
              className={`${styles.periodBtn} ${timePeriod === 'week' ? styles.activePeriod : ''}`}
              onClick={() => setTimePeriod('week')}
            >
              This Week
            </button>
            <button 
              className={`${styles.periodBtn} ${timePeriod === 'month' ? styles.activePeriod : ''}`}
              onClick={() => setTimePeriod('month')}
            >
              This Month
            </button>
            <button 
              className={`${styles.periodBtn} ${timePeriod === 'quarter' ? styles.activePeriod : ''}`}
              onClick={() => setTimePeriod('quarter')}
            >
              This Quarter
            </button>
            <button 
              className={`${styles.periodBtn} ${timePeriod === 'year' ? styles.activePeriod : ''}`}
              onClick={() => setTimePeriod('year')}
            >
              This Year
            </button>
          </div>

          {/* Analytics Metrics */}
          <div className={styles.analyticsMetrics}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.revenue}`}>💰</div>
              <div className={styles.metricContent}>
                <h3>{formatCurrency(analytics.revenue)}</h3>
                <p>Total Revenue</p>
                <span className={styles.metricChange}>+{analytics.revenueChange}%</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.appointments}`}>📅</div>
              <div className={styles.metricContent}>
                <h3>{analytics.appointments}</h3>
                <p>Total Appointments</p>
                <span className={styles.metricChange}>+{analytics.appointmentsChange}%</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.clients}`}>👥</div>
              <div className={styles.metricContent}>
                <h3>{analytics.activeClients}</h3>
                <p>Active Clients</p>
                <span className={styles.metricChange}>+{analytics.clientsChange}%</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.rating}`}>⭐</div>
              <div className={styles.metricContent}>
                <h3>{analytics.avgRating}</h3>
                <p>Average Rating</p>
                <span className={styles.metricChange}>+{analytics.ratingChange}%</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.conversion}`}>🎯</div>
              <div className={styles.metricContent}>
                <h3>{analytics.conversionRate}%</h3>
                <p>Conversion Rate</p>
                <span className={styles.metricChange}>+{analytics.conversionChange}%</span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.retention}`}>🔄</div>
              <div className={styles.metricContent}>
                <h3>{analytics.retentionRate}%</h3>
                <p>Client Retention</p>
                <span className={styles.metricChange}>+{analytics.retentionChange}%</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsSection}>
            <div className={styles.chartRow}>
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <h3>Revenue Trends</h3>
                </div>
                <div className={styles.chartWrapper}>
                  {typeof window !== 'undefined' && <Line data={getRevenueChartData()} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return '$' + value;
                          }
                        }
                      }
                    }
                  }} />}
                </div>
              </div>
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <h3>Appointment Distribution</h3>
                </div>
                <div className={styles.chartWrapper}>
                  {typeof window !== 'undefined' && <Doughnut data={getDistributionChartData()} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }} />}
                </div>
              </div>
            </div>
            <div className={styles.chartRow}>
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <h3>Popular Services</h3>
                </div>
                <div className={styles.chartWrapper}>
                  {typeof window !== 'undefined' && <Bar data={getServicesChartData()} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }} />}
                </div>
              </div>
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <h3>Client Growth</h3>
                </div>
                <div className={styles.chartWrapper}>
                  {typeof window !== 'undefined' && <Line data={{
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                      label: 'New Clients',
                      data: [12, 15, 18, 21],
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4
                    }]
                  }} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }} />}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Tables */}
          <div className={styles.analyticsTables}>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h3>Top Performing Services</h3>
                <button className={styles.exportBtn}>Export</button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.analyticsTable}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                      <th>Avg. Duration</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTopServices().map((service, idx) => (
                      <tr key={idx}>
                        <td>{service.name}</td>
                        <td>{service.bookings}</td>
                        <td>{formatCurrency(service.revenue)}</td>
                        <td>{service.duration}</td>
                        <td>{service.rating} ⭐</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h3>Client Analytics</h3>
                <button className={styles.exportBtn}>Export</button>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.analyticsTable}>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Total Visits</th>
                      <th>Last Visit</th>
                      <th>Total Spent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTopClients().map((client, idx) => (
                      <tr key={idx}>
                        <td>{client.name}</td>
                        <td>{client.visits}</td>
                        <td>{client.lastVisit}</td>
                        <td>{formatCurrency(client.totalSpent)}</td>
                        <td>
                          <span className={`${styles.statusTag} ${client.status === 'Active' ? styles.active : styles.inactive}`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stylist Performance */}
          <div className={styles.stylistPerformance}>
            <div className={styles.sectionHeader}>
              <h3>Stylist Performance</h3>
            </div>
            <div className={styles.stylistCards}>
              {getStylistPerformance().map((stylist, idx) => (
                <div key={idx} className={styles.stylistCard}>
                  <div className={styles.stylistCardHeader}>
                    <div className={styles.stylistAvatar}>{stylist.name.charAt(0)}</div>
                    <div className={styles.stylistInfo}>
                      <h4>{stylist.name}</h4>
                      <p>Senior Stylist</p>
                    </div>
                  </div>
                  <div className={styles.stylistMetrics}>
                    <div className={styles.stylistMetric}>
                      <div className={styles.stylistMetricValue}>{formatCurrency(stylist.metrics.revenue)}</div>
                      <div className={styles.stylistMetricLabel}>Revenue</div>
                    </div>
                    <div className={styles.stylistMetric}>
                      <div className={styles.stylistMetricValue}>{stylist.metrics.appointments}</div>
                      <div className={styles.stylistMetricLabel}>Appointments</div>
                    </div>
                    <div className={styles.stylistMetric}>
                      <div className={styles.stylistMetricValue}>{stylist.metrics.rating}</div>
                      <div className={styles.stylistMetricLabel}>Rating</div>
                    </div>
                    <div className={styles.stylistMetric}>
                      <div className={styles.stylistMetricValue}>{stylist.metrics.satisfaction}%</div>
                      <div className={styles.stylistMetricLabel}>Satisfaction</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Insights */}
          <div className={styles.insightsSection}>
            <div className={styles.sectionHeader}>
              <h3>Business Insights</h3>
              <button className={styles.refreshInsightsBtn}>Refresh</button>
            </div>
            <div className={styles.insightsGrid}>
              {getBusinessInsights().map((insight, idx) => (
                <div key={idx} className={styles.insightCard}>
                  <div className={styles.insightCardHeader}>
                    <div className={`${styles.insightIcon} ${styles[insight.type]}`}>{insight.icon}</div>
                    <h4 className={styles.insightTitle}>{insight.title}</h4>
                  </div>
                  <p className={styles.insightDescription}>{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

