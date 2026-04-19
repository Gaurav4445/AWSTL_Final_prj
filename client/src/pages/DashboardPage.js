import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Calendar, IndianRupee, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { recordAPI, propertyAPI, taskAPI } from '../services/api';
import { getMonthName } from '../utils/dateUtils';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  'AC/Cooling':        '#1c2b27',
  'Water Systems':     '#2d6a4f',
  'Electrical':        '#c47f4e',
  'Plumbing':          '#6b4c3b',
  'Pest Control':      '#9b2226',
  'General':           '#7f8c8d',
  'Cleaning':          '#52796f',
  'Safety':            '#b08968',
  'Generator/Inverter':'#457b9d',
  'Gas/LPG':           '#e76f51',
  'RO/Water Purifier': '#2a9d8f',
  'Security':          '#4a4e69',
};

const StatCard = ({ icon: Icon, label, value, dark }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      background: dark ? '#1c2b27' : '#ffffff',
      border: dark ? 'none' : '1px solid #e4ddd4',
      borderRadius: 14,
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minWidth: 0,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon size={15} color={dark ? 'rgba(245,237,228,0.6)' : '#6b7565'} />
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
        color: dark ? 'rgba(245,237,228,0.6)' : '#6b7565',
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
    <p style={{
      fontSize: 42, fontWeight: 700, lineHeight: 1,
      fontFamily: "'Playfair Display', Georgia, serif",
      color: dark ? '#f5ede4' : '#1c2b27',
      margin: 0,
    }}>{value}</p>
  </motion.div>
);

export const DashboardPage = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalRecords: 0, monthlyRecords: 0, totalSpent: 0, monthlySpend: [], categoryBreakdown: [] });
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, statsRes, tasksRes] = await Promise.all([
        propertyAPI.getAll(),
        recordAPI.getDashboardStats(),
        taskAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      setProperties(propsRes.data.data);
      setStats(statsRes.data.data);
      const pending = (tasksRes.data.data || []).filter(t => !t.completed);
      setUpcomingCount(pending.length);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  const chartData = (stats.monthlySpend || []).map(item => ({
    month: getMonthName(item._id.month),
    spent: item.total,
  }));

  const pieData = (stats.categoryBreakdown || []).slice(0, 6).map(item => ({
    name: item._id,
    value: item.total,
  }));

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />

        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}
          >
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px, 3vw, 44px)',
                fontWeight: 800,
                color: '#1c2b27',
                margin: 0,
                lineHeight: 1.1,
              }}>
                Your home, <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>at a glance.</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>
                A calm view of what's done, what's due, and what it costs.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/history" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #c47f4e 0%, #b8754a 100%)', color: '#fff',
                padding: '12px 24px', borderRadius: 50,
                fontSize: 14, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(196,127,78,0.4)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.3px',
              }}>
                📝 Log Service
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Stat cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {loading ? (
              [1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
            ) : (
              <>
                <StatCard icon={BarChart3}    label="Total Services"  value={stats.totalRecords}  dark />
                <StatCard icon={Calendar}     label="This Month"      value={stats.monthlyRecords} />
                <StatCard icon={IndianRupee}  label="Total Spent"     value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`} />
                <StatCard icon={CheckSquare}  label="Upcoming Tasks"  value={upcomingCount} />
              </>
            )}
          </div>

          {/* ── Charts ── */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}
            >
              {/* Bar chart */}
              <div style={{ background: '#fff', border: '1px solid #e4ddd4', borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1c2b27', margin: 0 }}>Last 6 months spend</h2>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#6b7565',
                    background: '#f2ebe1', border: '1px solid #e4ddd4',
                    padding: '4px 10px', borderRadius: 20,
                  }}>₹ INR</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ede6dc" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9b8f85' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9b8f85' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip
                      formatter={val => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                      contentStyle={{ borderRadius: 10, border: '1px solid #e4ddd4', fontSize: 13, color: '#1c2b27' }}
                      cursor={{ fill: 'rgba(28,43,39,0.05)' }}
                    />
                    <Bar dataKey="spent" fill="#1c2b27" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              {pieData.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #e4ddd4', borderRadius: 16, padding: '28px 24px' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1c2b27', margin: '0 0 20px' }}>Spend by category</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#7f8c8d'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={val => `₹${val.toLocaleString('en-IN')}`}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e4ddd4', fontSize: 13 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#6b7565', paddingTop: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Properties ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c2b27', margin: 0 }}>Your Properties</h2>
              <Link to="/properties" style={{ fontSize: 13, fontWeight: 600, color: '#c47f4e', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[1,2,3].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
              </div>
            ) : properties.length === 0 ? (
              <div style={{
                background: '#fff', border: '2px dashed #d8d1c7',
                borderRadius: 16, padding: '64px 32px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1c2b27', margin: '0 0 8px' }}>No properties yet</p>
                <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Add your home or flat to get started</p>
                <Link to="/properties" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#1c2b27', color: '#f5ede4',
                  padding: '12px 22px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>
                  <Plus size={16} /> Add Property
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {properties.map((prop, idx) => (
                  <motion.div
                    key={prop._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.35 }}
                  >
                    <PropertyCard property={prop} onDelete={() => {}} onEdit={() => {}} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

        </main>
      </div>
    </PageTransition>
  );
};
