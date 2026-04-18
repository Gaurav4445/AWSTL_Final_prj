import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, BarChart3, Calendar, IndianRupee, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { recordAPI, propertyAPI } from '../services/api';
import { getMonthName } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

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
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propsRes, statsRes] = await Promise.all([propertyAPI.getAll(), recordAPI.getDashboardStats()]);
      setProperties(propsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
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
    if (h < 12) return 'Suprabhat'; // Good morning in Hindi
    if (h < 17) return 'Namaskar';
    return 'Shubh Sandhya';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-orange-600 font-medium text-sm">{greeting()}, {user?.name?.split(' ')[0]} 🙏</p>
            <h1 className="text-3xl font-bold text-gray-800 mt-0.5">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Here's your home maintenance overview</p>
          </div>
          <Link to="/properties"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm">
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">Total Records</p>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.totalRecords}</p>
            <p className="text-xs text-gray-400 mt-1">All time maintenance logs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">This Month</p>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">{stats.monthlyRecords}</p>
            <p className="text-xs text-gray-400 mt-1">Services done this month</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">Total Spent</p>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">₹{(stats.totalSpent || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-1">Overall maintenance spend</p>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Spend Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Monthly Spend (₹)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']} />
                  <Bar dataKey="spent" fill="#f97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  Spend by Category
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Properties */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">Your Properties</h2>
            <Link to="/properties" className="text-orange-600 text-sm font-medium hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-gray-600 font-medium">No properties yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">Add your home or flat to get started</p>
              <Link to="/properties" className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition">
                <Plus className="w-4 h-4" /> Add Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map(prop => (
                <PropertyCard key={prop._id} property={prop} onDelete={() => {}} onEdit={() => {}} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};