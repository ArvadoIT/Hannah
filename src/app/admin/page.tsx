'use client';

/**
 * Admin Dashboard Page - Premium Design
 * Modern, minimal admin interface with solid colors and smooth animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

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

type ViewTab = 'dashboard' | 'analytics' | 'calendar';
type DatePreset = 'today' | 'week' | 'month' | 'all';

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter] = useState<string>(''); // Used in filter logic
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Generate calendar days
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];
    
    // Add previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(date);
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth]);

  // Apply filters
  useEffect(() => {
    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Apply date preset
    const now = new Date();
    let filteredByPreset = filtered;
    
    if (datePreset === 'today') {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      filteredByPreset = filtered.filter(apt => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
    } else if (datePreset === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredByPreset = filtered.filter(apt => new Date(apt.startTime) >= weekAgo);
    } else if (datePreset === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filteredByPreset = filtered.filter(apt => new Date(apt.startTime) >= monthAgo);
    }

    // Date filter (manual date picker)
    if (dateFilter) {
      filteredByPreset = filteredByPreset.filter(apt => {
        const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
        return aptDate === dateFilter;
      });
    }

    // Sort by date (upcoming first)
    filteredByPreset.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    setFilteredAppointments(filteredByPreset);
  }, [appointments, statusFilter, dateFilter, datePreset]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedAppointment) {
          setSelectedAppointment(null);
        } else if (selectedDay) {
          setSelectedDay(null);
        }
      }
    };

    if (selectedAppointment || selectedDay) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedAppointment, selectedDay]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Unable to load appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAppointments();
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('Appointments refreshed');
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

      await fetchAppointments();
      setSelectedAppointment(null);
      toast.success('Appointment status updated successfully');
    } catch (err) {
      toast.error('Failed to update appointment status');
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
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel appointment');
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


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <Toaster position="top-right" />
      
      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-6 py-28 space-y-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#b28c66] to-[#7e6854]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Admin Dashboard
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Tab Switcher */}
            <div className="flex bg-white/70 rounded-full p-1 border border-[#b28c66]/20">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeView === 'dashboard' 
                    ? 'bg-[#b28c66] text-white shadow-lg' 
                    : 'text-gray-700 hover:text-[#b28c66]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeView === 'analytics' 
                    ? 'bg-[#b28c66] text-white shadow-lg' 
                    : 'text-gray-700 hover:text-[#b28c66]'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  activeView === 'calendar' 
                    ? 'bg-[#b28c66] text-white shadow-lg' 
                    : 'text-gray-700 hover:text-[#b28c66]'
                }`}
              >
                Calendar
              </button>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#b28c66] text-[#b28c66] hover:bg-[#b28c66] hover:text-white transition-all duration-200 hover:scale-105"
              title={isRefreshing ? 'Refreshing...' : 'Refresh data'}
            >
              {isRefreshing ? (
                <div className="w-5 h-5 border-2 border-[#b28c66] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-xl">↻</span>
              )}
            </button>
          </div>
        </motion.header>

        {/* Dashboard View */}
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Today', 
                    value: stats.today, 
                    icon: '💅',
                    bg: 'bg-gradient-to-br from-[#b28c66] to-[#7e6854]',
                    description: 'Clients today',
                    onClick: () => {
                      setDatePreset('today');
                      setStatusFilter('all');
                    }
                  },
                  { 
                    label: 'Pending', 
                    value: stats.pending, 
                    icon: '⏳',
                    bg: 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]',
                    description: 'Need confirmation',
                    onClick: () => setStatusFilter('pending')
                  },
                  { 
                    label: 'Confirmed', 
                    value: stats.confirmed, 
                    icon: '✅',
                    bg: 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb]',
                    description: 'Ready for service',
                    onClick: () => setStatusFilter('confirmed')
                  },
                  { 
                    label: 'Completed', 
                    value: stats.completed, 
                    icon: '✨',
                    bg: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
                    description: 'Services done',
                    onClick: () => setStatusFilter('completed')
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={stat.onClick}
                    className={`${stat.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1 hover:scale-105`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl">{stat.icon}</div>
                      <div className="text-white/80 text-xs font-medium">{stat.description}</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-white/90 text-sm font-semibold uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Today's Schedule & Quick Actions */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Today's Appointments */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                      Today's Schedule
                    </h2>
                    <span className="px-3 py-1 bg-[#b28c66]/10 text-[#b28c66] rounded-full text-sm font-semibold">
                      {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                  {(() => {
                    const todayAppointments = appointments.filter(apt => {
                      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
                      const today = new Date().toISOString().split('T')[0];
                      return aptDate === today && apt.status !== 'cancelled';
                    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    return todayAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-3">💅</div>
                        <p className="text-gray-600 font-medium">No appointments scheduled for today</p>
                        <p className="text-sm text-gray-500 mt-2">Enjoy your break!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todayAppointments.map((apt) => (
                          <div
                            key={apt._id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-[#b28c66] hover:shadow-md transition-all cursor-pointer"
                          >
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                              style={{ backgroundColor: getStatusColor(apt.status) }}
                            >
                              {getInitials(apt.clientName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">{apt.clientName}</h3>
                              <p className="text-sm text-gray-600 truncate">{apt.service}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-gray-900">{formatTime(apt.startTime)}</div>
                              <div className="text-xs text-gray-500">Duration: {Math.round((new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime()) / 60000)}m</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* Quick Actions & Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Completion Rate */}
                  <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-2xl p-6 shadow-lg text-white cursor-pointer transform hover:scale-105 transition-all" onClick={() => setStatusFilter('completed')}>
                    <div className="text-4xl mb-2">✨</div>
                    <div className="text-3xl font-bold mb-1">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </div>
                    <div className="text-white/90 text-sm font-semibold">Services Completed</div>
                    <div className="text-white/70 text-xs mt-1">Click to view all</div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/40">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Status Overview</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Completed', value: stats.completed, color: '#10b981' },
                        { label: 'Confirmed', value: stats.confirmed, color: '#3b82f6' },
                        { label: 'Pending', value: stats.pending, color: '#f59e0b' },
                        { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Appointments List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Recent Appointments
                  </h2>
                  
                  {/* Compact Filters */}
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Confirmed', value: 'confirmed' },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          statusFilter === filter.value
                            ? 'bg-[#b28c66] text-white shadow-sm'
                            : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-[#b28c66] hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appointments List */}
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block w-12 h-12 border-4 border-[#b28c66] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-3">💅</p>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      No appointments found
                    </p>
                    <p className="text-sm text-gray-500">Try adjusting your filters or check back later</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                  {filteredAppointments.map((appointment, idx) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-[#b28c66] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {getInitials(appointment.clientName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{appointment.clientName}</h3>
                        <p className="text-sm text-gray-600 truncate">{appointment.service}</p>
                      </div>
                      <div className="text-sm text-gray-600 flex-shrink-0">
                        <div className="font-semibold">{formatDate(appointment.startTime)}</div>
                        <div className="text-xs">{formatTime(appointment.startTime)}</div>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(appointment.status) }}
                      >
                        {appointment.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Analytics View - Data Insights */}
          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Analytics Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                  const pendingRate = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;
                  const avgAppointmentsPerWeek = Math.round(stats.total / 52);

                  return [
                    { 
                      label: 'Completion Rate', 
                      value: `${completionRate}%`,
                      icon: '✨',
                      bg: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
                      description: 'Services completed'
                    },
                    { 
                      label: 'Pending Rate', 
                      value: `${pendingRate}%`,
                      icon: '⏳',
                      bg: 'bg-gradient-to-br from-[#f59e0b] to-[#d97706]',
                      description: 'Awaiting confirmation'
                    },
                    { 
                      label: 'Weekly Avg', 
                      value: avgAppointmentsPerWeek,
                      icon: '📅',
                      bg: 'bg-gradient-to-br from-[#3b82f6] to-[#2563eb]',
                      description: 'Clients per week'
                    },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`${stat.bg} rounded-2xl p-6 shadow-lg text-white`}
                    >
                      <div className="text-4xl mb-3">{stat.icon}</div>
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-white/90 text-sm font-semibold mb-1">{stat.label}</div>
                      <div className="text-white/70 text-xs">{stat.description}</div>
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Services Analytics */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Services Breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="text-2xl">💅</span>
                    Most Popular Services
                  </h3>
                  {(() => {
                    const serviceCounts: { [key: string]: number } = {};
                    appointments.forEach(apt => {
                      serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
                    });
                    const sortedServices = Object.entries(serviceCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5);
                    const maxCount = sortedServices[0]?.[1] || 1;

                    return sortedServices.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No service data available</p>
                    ) : (
                      <div className="space-y-4">
                        {sortedServices.map(([service, count]) => {
                          const percentage = (count / maxCount) * 100;
                          return (
                            <div key={service}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900 text-sm truncate flex-1">{service}</span>
                                <span className="px-3 py-1 rounded-full bg-[#b28c66] text-white text-sm font-bold ml-2">
                                  {count}
                                </span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#b28c66] to-[#7e6854] rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="text-2xl">📊</span>
                    Status Distribution
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Completed', value: stats.completed, color: '#10b981', icon: '✓' },
                      { label: 'Confirmed', value: stats.confirmed, color: '#3b82f6', icon: '✓' },
                      { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: '⏳' },
                      { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444', icon: '✕' },
                    ].map((item) => {
                      const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 font-medium">{Math.round(percentage)}%</span>
                              <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: item.color }}>
                                {item.value}
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-2xl">💅</span>
                  Recent Appointments
                </h3>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity to display
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.slice(0, 5).map((apt) => (
                      <div
                        key={apt._id}
                        onClick={() => setSelectedAppointment(apt)}
                        className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-[#b28c66] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(apt.status) }}
                        >
                          {getInitials(apt.clientName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{apt.clientName}</span>
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: getStatusColor(apt.status) }}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {apt.service} • {formatDate(apt.startTime)} at {formatTime(apt.startTime)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Calendar Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentMonth);
                      prevMonth.setMonth(prevMonth.getMonth() - 1);
                      setCurrentMonth(prevMonth);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#b28c66] hover:text-white transition-all text-gray-700"
                  >
                    ←
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="text-xs text-[#b28c66] hover:underline font-medium"
                    >
                      Today
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const nextMonth = new Date(currentMonth);
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setCurrentMonth(nextMonth);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#b28c66] hover:text-white transition-all text-gray-700"
                  >
                    →
                  </button>
                </div>

                {/* Calendar Grid */}
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block w-12 h-12 border-4 border-[#b28c66] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading calendar...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((date, index) => {
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const dateStr = date.toISOString().split('T')[0];
                        
                        // Get appointments for this date
                        const dayAppointments = appointments.filter(apt => {
                          const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
                          return aptDate === dateStr && apt.status !== 'cancelled';
                        });

                        return (
                          <div
                            key={index}
                            className={`
                              min-h-[100px] border-2 rounded-xl p-2 transition-all cursor-pointer
                              ${isCurrentMonth ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}
                              ${isToday ? 'border-[#b28c66] bg-[#b28c66]/5' : ''}
                              hover:border-[#b28c66] hover:shadow-md
                            `}
                            onClick={() => {
                              setSelectedDay(date);
                            }}
                          >
                            <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-[#b28c66]' : 'text-gray-700'}`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayAppointments.slice(0, 3).map((apt) => (
                                <div
                                  key={apt._id}
                                  className="text-xs p-1 rounded truncate text-white shadow-sm"
                                  style={{ backgroundColor: getStatusColor(apt.status) }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAppointment(apt);
                                  }}
                                  title={`${apt.clientName} - ${formatTime(apt.startTime)}`}
                                >
                                  <div className="font-semibold truncate">{apt.clientName}</div>
                                  <div className="opacity-90">{formatTime(apt.startTime)}</div>
                                </div>
                              ))}
                              {dayAppointments.length > 3 && (
                                <div className="text-xs text-gray-500 font-semibold">
                                  +{dayAppointments.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💅 Appointment Status</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: 'Pending', status: 'pending', desc: 'Awaiting confirmation' },
                    { label: 'Confirmed', status: 'confirmed', desc: 'Ready for service' },
                    { label: 'Completed', status: 'completed', desc: 'Service finished' },
                  ].map((item) => (
                    <div 
                      key={item.status} 
                      className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-gray-100 hover:border-[#b28c66] transition-all cursor-pointer"
                      onClick={() => {
                        setActiveView('dashboard');
                        setStatusFilter(item.status);
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedAppointment && (
            <div
              onClick={() => setSelectedAppointment(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Appointment Details
                  </h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Client', value: selectedAppointment.clientName },
                    { label: 'Email', value: selectedAppointment.clientEmail },
                    { label: 'Service', value: selectedAppointment.service },
                    { label: 'Date', value: formatDate(selectedAppointment.startTime) },
                    { label: 'Time', value: `${formatTime(selectedAppointment.startTime)} - ${formatTime(selectedAppointment.endTime)}` },
                    { label: 'Status', value: selectedAppointment.status, isStatus: true },
                    ...(selectedAppointment.notes ? [{ label: 'Notes', value: selectedAppointment.notes }] : []),
                  ].map((item) => (
                    <div key={item.label} className="border-b border-gray-100 pb-3 last:border-0">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{item.label}</div>
                      <div className={`text-gray-900 font-medium ${item.isStatus ? '' : ''}`}>
                        {item.isStatus ? (
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: getStatusColor(item.value) }}
                          >
                            {item.value.toUpperCase()}
                          </span>
                        ) : (
                          item.value
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Actions */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Update Status</div>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedAppointment.status !== 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppointment._id, 'pending')}
                        className="py-2 rounded-full font-semibold text-white bg-[#f59e0b] shadow-md hover:opacity-90 transition-all duration-200"
                      >
                        Pending
                      </button>
                    )}
                    {selectedAppointment.status !== 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppointment._id, 'confirmed')}
                        className="py-2 rounded-full font-semibold text-white bg-[#3b82f6] shadow-md hover:opacity-90 transition-all duration-200"
                      >
                        Confirm
                      </button>
                    )}
                    {selectedAppointment.status !== 'completed' && (
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppointment._id, 'completed')}
                        className="py-2 rounded-full font-semibold text-white bg-[#10b981] shadow-md hover:opacity-90 transition-all duration-200"
                      >
                        Complete
                      </button>
                    )}
                    {selectedAppointment.status !== 'cancelled' && (
                      <button
                        onClick={() => deleteAppointment(selectedAppointment._id)}
                        className="py-2 rounded-full font-semibold text-white bg-[#ef4444] shadow-md hover:opacity-90 transition-all duration-200 col-span-2"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Day Schedule Modal */}
        <AnimatePresence>
          {selectedDay && (
            <div
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedDay.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </h2>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Day's Appointments */}
                {(() => {
                  const dateStr = selectedDay.toISOString().split('T')[0];
                  const dayAppointments = appointments.filter(apt => {
                    const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
                    return aptDate === dateStr && apt.status !== 'cancelled';
                  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                  return dayAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-3">💅</div>
                      <p className="text-gray-600 font-medium">No appointments scheduled for this day</p>
                      <p className="text-sm text-gray-500 mt-2">Enjoy your break!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
                        </span>
                        <span className="px-3 py-1 bg-[#b28c66]/10 text-[#b28c66] rounded-full text-sm font-semibold">
                          {dayAppointments.length} total
                        </span>
                      </div>
                      
                      {dayAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedDay(null);
                            setSelectedAppointment(appointment);
                          }}
                          className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-[#b28c66] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: getStatusColor(appointment.status) }}
                          >
                            {getInitials(appointment.clientName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate">{appointment.clientName}</h3>
                            <p className="text-sm text-gray-600 truncate">{appointment.service}</p>
                          </div>
                          <div className="text-sm text-gray-600 flex-shrink-0">
                            <div className="font-semibold">{formatTime(appointment.startTime)}</div>
                            <div className="text-xs">Duration: {Math.round((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / 60000)}m</div>
                          </div>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap flex-shrink-0"
                            style={{ backgroundColor: getStatusColor(appointment.status) }}
                          >
                            {appointment.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
