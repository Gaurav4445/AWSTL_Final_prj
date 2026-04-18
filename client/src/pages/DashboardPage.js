import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, BarChart3, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition, StatsCard, AnimatedList } from '../components/Animations';
import { recordAPI, propertyAPI } from '../services/api';
import { getMonthName } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CATEGORY_COLORS = {
  'AC/Cooling': '#3b82f6',
  'Water Systems': '#06b6d4',
  'Electrical': '#eab308',
  'Plumbing': '#8b5cf6',
  'Pest Control': '#ef4444',
  'General': '#6b7280',
  'Cleaning': '#22c55e',
  'Safety': '#f97316',
  'Generator/Inverter': '#6366f1',
  'Gas/LPG': '#f43f5e',
  'RO/Water Purifier': '#14b8a6',
  'Security': '#64748b',
};

export const DashboardPage = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalRecords:0, monthlyRecords:0, totalSpent:0, monthlySpend:[], categoryBreakdown:[] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, statsRes] = await Promise.all([propertyAPI.getAll(), recordAPI.getDashboardStats()]);
      setProperties(propsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  const chartData = (stats.monthlySpend || []).map(item => ({
    month: getMonthName(item._id.month),
    spent: item.total,
    count: item.count,
  }));

  const pieData = (stats.categoryBreakdown || []).slice(0, 6).map(item => ({
    name: item._id,
    value: item.total,
  }));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12"
          >
            <div>
              <p className="text-blue-600 font-semibold text-base">{greeting()}, {user?.name?.split(' ')[0]} 👋</p>
              <h1 className="text-5xl font-bold text-gray-900 mt-2">Dashboard</h1>
              <p className="text-gray-600 mt-2 text-base">Track your home maintenance at a glance</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/properties">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" /> Add Property
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatsCard
              icon={BarChart3}
              title="Total Records"
              value={stats.totalRecords}
              subtitle="All time maintenance logs"
              gradient="bg-gradient-to-br from-blue-50 to-blue-100"
            />
            <StatsCard
              icon={Calendar}
              title="This Month"
              value={stats.monthlyRecords}
              subtitle="Services done this month"
              gradient="bg-gradient-to-br from-purple-50 to-purple-100"
            />
            <StatsCard
              icon={IndianRupee}
              title="Total Spent"
              value={`₹${(stats.totalSpent || 0).toLocaleString('en-IN')}`}
              subtitle="Overall maintenance spend"
              gradient="bg-gradient-to-br from-green-50 to-green-100"
            />
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
            >
              {/* Monthly Spend */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Monthly Spend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                      <Tooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="spent" fill="#2563eb" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Pie */}
              {pieData.length > 0 && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Spend by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Properties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
              <Link to="/properties" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition">View all →</Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                    <Skeleton className="h-64 rounded-2xl" />
                  </motion.div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300 shadow-sm"
              >
                <p className="text-gray-700 font-semibold text-lg">No properties yet</p>
                <p className="text-gray-500 text-base mt-2 mb-6">Add your home or flat to get started</p>
                <Link to="/properties">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" /> Add Property
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop, idx) => (
                  <motion.div
                    key={prop._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
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