// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { recordAPI, propertyAPI } from '../services/api';

export const DashboardPage = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalRecords: 0, monthlyRecords: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, statsRes] = await Promise.all([
        propertyAPI.getAll(),
        recordAPI.getDashboardStats(),
      ]);
      setProperties(propertiesRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">Keep track of all your home maintenance tasks</p>
          </div>
          <Link to="/properties" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Property
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Total Records</p>
            <p className="text-4xl font-bold mt-2">{stats.totalRecords}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">This Month</p>
            <p className="text-4xl font-bold mt-2">{stats.monthlyRecords}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Total Spent</p>
            <p className="text-4xl font-bold mt-2">₹{stats.totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Properties */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Properties</h2>
          {loading ? (
            <p>Loading...</p>
          ) : properties.length === 0 ? (
            <p>No properties yet. Add one from Properties page.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop._id} property={prop} onDelete={() => {}} onEdit={() => {}} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};