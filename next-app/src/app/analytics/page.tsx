'use client';

/**
 * Analytics Page
 * Elegant analytics dashboard for Lacque & Latte admin panel
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { Calendar, UserCheck, Clock } from 'lucide-react';

interface Appointment {
  _id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data.appointments || []);
      setError(null);
      console.log('✅ Analytics: Loaded', data.appointments?.length || 0, 'appointments');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      // Set empty array on error to show empty state
      setAppointments([]);
      setError('Unable to connect to database. Please check your MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const totalAppointments = appointments.length;
    
    // Repeat clients: count clients who appear more than once
    const clientMap = new Map<string, number>();
    appointments.forEach(apt => {
      clientMap.set(apt.clientEmail, (clientMap.get(apt.clientEmail) || 0) + 1);
    });
    const repeatClients = Array.from(clientMap.values()).filter(count => count > 1).length;
    
    // Average service duration
    const durations = appointments
      .map(apt => {
        const start = new Date(apt.startTime);
        const end = new Date(apt.endTime);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      })
      .filter(d => d > 0);
    
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 90;

    return {
      totalAppointments,
      repeatClients,
      avgDuration
    };
  };

  // Line chart data: Appointments over the last 8 weeks
  const getAppointmentsOverTime = () => {
    const weeksAgo = Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (8 - i - 1) * 7);
      return date.toISOString().split('T')[0];
    });

    return weeksAgo.map((weekStart, index) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const count = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate >= new Date(weekStart) && aptDate < weekEnd;
      }).length;

      return {
        week: `Week ${index + 1}`,
        appointments: count
      };
    });
  };

  // Pie chart data: Appointment status breakdown
  const getStatusBreakdown = () => {
    const statuses = {
      Confirmed: appointments.filter(a => a.status === 'confirmed').length,
      Completed: appointments.filter(a => a.status === 'completed').length,
      Pending: appointments.filter(a => a.status === 'pending').length,
    };

    return Object.entries(statuses)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  };

  // Recent activity: last 5 appointments
  const getRecentActivity = () => {
    return appointments
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
  };

  const metrics = calculateMetrics();
  const lineChartData = getAppointmentsOverTime();
  const pieChartData = getStatusBreakdown();
  const recentActivity = getRecentActivity();

  const COLORS = ['#b28c66', '#d6bfa3', '#c4a37d'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(250, 248, 245, 0.95)',
        backgroundImage: 'url(/images/DOWNroundflower.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        paddingTop: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgba(250, 248, 245, 0.95)',
      backgroundImage: 'url(/images/DOWNroundflower.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundBlendMode: 'overlay',
      paddingTop: '100px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
      }}>
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '0.02em',
          }}>
            Analytics Overview
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            Track appointments, performance, and trends.
          </p>
          <div style={{
            marginTop: '1.5rem',
            height: '2px',
            background: 'linear-gradient(90deg, #b28c66 0%, #d6bfa3 100%)',
            borderRadius: '2px',
          }} />
        </motion.header>

        {/* Key Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {[
            { 
              icon: Calendar, 
              label: 'Total Appointments', 
              value: metrics.totalAppointments,
              color: '#b28c66'
            },
            { 
              icon: UserCheck, 
              label: 'Repeat Clients', 
              value: metrics.repeatClients,
              color: '#d6bfa3'
            },
            { 
              icon: Clock, 
              label: 'Avg Service Duration', 
              value: `${metrics.avgDuration} min`,
              color: '#c4a37d'
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                border: `2px solid transparent`,
                backgroundImage: `linear-gradient(white, white), linear-gradient(90deg, ${metric.color}, #d6bfa3)`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: 'rgba(178, 140, 102, 0.1)',
                }}>
                  <metric.icon size={24} color={metric.color} />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {metric.label}
                </div>
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {metric.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'white',
              padding: '4rem 2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}
          >
            {error ? (
              <>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
                <p style={{
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: '#ef4444',
                }}>
                  Database Connection Error
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}>
                  {error}
                </p>
                <p style={{
                  marginTop: '1.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  Please check your MongoDB connection settings in .env.local
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</p>
                <p style={{
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  No analytics data yet
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                }}>
                  Start booking clients to see insights ☕
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <>
            {/* Two Charts Side by Side */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              {/* Line Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                }}>
                  Appointments Over Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#999"
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#999"
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '0.75rem',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#b28c66" 
                      strokeWidth={3}
                      dot={{ fill: '#b28c66', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                }}
              >
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                }}>
                  Appointment Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '0.75rem',
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Recent Activity Table */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
              }}>
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                  No recent appointments
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid var(--border-color)',
                        }}>
                          Client Name
                        </th>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid var(--border-color)',
                        }}>
                          Service
                        </th>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid var(--border-color)',
                        }}>
                          Date
                        </th>
                        <th style={{
                          textAlign: 'left',
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '2px solid var(--border-color)',
                        }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((apt, idx) => (
                        <tr key={apt._id} style={{
                          borderBottom: idx < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}>
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                          }}>
                            {apt.clientName}
                          </td>
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--text-secondary)',
                          }}>
                            {apt.service}
                          </td>
                          <td style={{
                            padding: '1rem 0.75rem',
                            color: 'var(--text-secondary)',
                          }}>
                            {formatDate(apt.startTime)}
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.875rem',
                              borderRadius: '20px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'white',
                              backgroundColor: getStatusColor(apt.status),
                              textTransform: 'capitalize',
                            }}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
