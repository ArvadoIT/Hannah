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

type ViewTab = 'dashboard' | 'analytics';
type DatePreset = 'today' | 'week' | 'month' | 'all';

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState<ViewTab>('dashboard');

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
              className="space-y-10"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Pending', value: stats.pending, border: 'border-[#f59e0b]' },
                  { label: 'Confirmed', value: stats.confirmed, border: 'border-[#3b82f6]' },
                  { label: 'Completed', value: stats.completed, border: 'border-[#10b981]' },
                  { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, border: 'border-[#ef4444]' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border-2 ${stat.border} hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200 cursor-pointer`}
                  >
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                      {stat.label}
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
              >
                <div className="flex flex-wrap gap-4 items-end justify-between">
                  {/* Status Filter */}
                  <div className="flex items-center gap-4">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Pending', value: 'pending' },
                      { label: 'Confirmed', value: 'confirmed' },
                      { label: 'Completed', value: 'completed' },
                      { label: 'Cancelled', value: 'cancelled' },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          statusFilter === filter.value
                            ? 'bg-[#b28c66] text-white shadow-md'
                            : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-[#b28c66] hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Presets */}
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Today', value: 'today' },
                      { label: 'Week', value: 'week' },
                      { label: 'Month', value: 'month' },
                      { label: 'All', value: 'all' },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          setDatePreset(preset.value as DatePreset);
                          if (preset.value !== 'all') setDateFilter('');
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          datePreset === preset.value
                            ? 'bg-[#b28c66] text-white shadow-sm'
                            : 'bg-white/70 text-gray-700 border border-gray-200 hover:bg-[#b28c66] hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Picker */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setDatePreset('all');
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-300 bg-white/70 text-sm focus:outline-none focus:border-[#b28c66] transition-all shadow-sm hover:border-[#b28c66]"
                    />
                    {dateFilter && (
                      <button 
                        onClick={() => setDateFilter('')}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Appointments List */}
              {loading ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm border border-white/40">
                  <div className="inline-block w-12 h-12 border-4 border-[#b28c66] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm border border-white/40"
                >
                  <p className="text-6xl mb-4">☕</p>
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    No appointments yet. Enjoy your coffee break.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment, idx) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedAppointment(appointment)}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-white/40 flex flex-col md:flex-row justify-between items-center gap-4"
                    >
                      {/* Left: Avatar and Info */}
                      <div className="flex items-center gap-4 flex-1">
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {getInitials(appointment.clientName)}
                        </div>
                        
                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                            {appointment.clientName}
                          </h3>
                          <p className="text-gray-600 text-sm truncate">
                            {appointment.service}
                          </p>
                        </div>
                      </div>

                      {/* Right: Date, Time, Status */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">{formatDate(appointment.startTime)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatTime(appointment.startTime)}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-[200px]">
                          {appointment.clientEmail}
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white uppercase whitespace-nowrap"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total', value: stats.total, border: 'border-[#b28c66]' },
                  { label: 'Completed', value: stats.completed, border: 'border-[#10b981]' },
                  { label: 'Confirmed', value: stats.confirmed, border: 'border-[#3b82f6]' },
                  { label: 'Pending', value: stats.pending, border: 'border-[#f59e0b]' },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border-2 ${stat.border} hover:-translate-y-[2px] hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                      {stat.label}
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Services Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/40"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Services Breakdown
                </h3>
                {(() => {
                  const serviceCounts: { [key: string]: number } = {};
                  appointments.forEach(apt => {
                    serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
                  });
                  const sortedServices = Object.entries(serviceCounts)
                    .sort((a, b) => b[1] - a[1]);

                  return sortedServices.length === 0 ? (
                    <p className="text-gray-500">No service data available</p>
                  ) : (
                    <div className="space-y-3">
                      {sortedServices.map(([service, count]) => (
                        <div 
                          key={service} 
                          className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100"
                        >
                          <span className="font-medium text-gray-900">{service}</span>
                          <span className="px-3 py-1 rounded-full bg-[#b28c66] text-white text-sm font-semibold">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>

              {/* Recent Appointments Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/40 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Recent Appointments
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      No appointments to display
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.slice(0, 10).map((apt, idx) => (
                          <tr 
                            key={apt._id} 
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              idx === 9 ? 'border-0' : ''
                            }`}
                          >
                            <td className="py-4 px-4 font-medium text-gray-900">{apt.clientName}</td>
                            <td className="py-4 px-4 text-gray-600">{apt.service}</td>
                            <td className="py-4 px-4 text-gray-600">{formatDate(apt.startTime)}</td>
                            <td className="py-4 px-4">
                              <span 
                                className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                                style={{ backgroundColor: getStatusColor(apt.status) }}
                              >
                                {apt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
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
      </div>
    </div>
  );
}
