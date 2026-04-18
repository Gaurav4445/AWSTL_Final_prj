import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, Home, Calendar, Droplet, Zap, MapPin, IndianRupee } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { propertyAPI, recordAPI, taskAPI } from '../services/api';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propRes, recRes, taskRes] = await Promise.all([
        propertyAPI.getById(id),
        recordAPI.getByProperty(id),
        taskAPI.getByProperty(id),
      ]);
      setProperty(propRes.data.data);
      setRecords(recRes.data.data || []);
      setTasks(taskRes.data.data || []);
    } catch (err) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this property and all its data?')) return;
    try {
      await propertyAPI.delete(id);
      navigate('/properties');
    } catch {
      setError('Failed to delete property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Properties
          </button>
          <div className="bg-white rounded-2xl p-12 animate-pulse border border-gray-200" />
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Properties
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-semibold">Property not found</p>
          </div>
        </main>
      </div>
    );
  }

  const totalSpent = records.reduce((sum, r) => sum + (r.actualCost || 0), 0);
  const typeColors = {
    'Apartment': 'bg-blue-100 text-blue-800',
    'Independent House': 'bg-green-100 text-green-800',
    'Villa': 'bg-purple-100 text-purple-800',
    'Studio': 'bg-yellow-100 text-yellow-800',
    'Row House': 'bg-pink-100 text-pink-800',
    'Builder Floor': 'bg-orange-100 text-orange-800',
    'Bungalow': 'bg-teal-100 text-teal-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <button onClick={() => navigate('/properties')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 font-semibold transition">
          <ArrowLeft className="w-5 h-5" /> Back to Properties
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">{property.name}</h1>
              </div>
              <p className="text-gray-600 flex items-center gap-2 text-base font-medium">
                <MapPin className="w-5 h-5" />
                {property.address}, {property.city}{property.state ? `, ${property.state}` : ''}
              </p>
            </div>
            <Link to={`/properties`} className="text-blue-600 text-sm font-bold hover:text-blue-700 transition">Edit Property →</Link>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${typeColors[property.propertyType] || 'bg-gray-100 text-gray-700'}`}>
              {property.propertyType}
            </span>
            {property.bhkType && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">
                {property.bhkType}
              </span>
            )}
            {property.societyName && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
                {property.societyName}
              </span>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {property.squareFeet && (
              <div>
                <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Area</p>
                <p className="text-2xl font-bold text-gray-900">{property.squareFeet} sq ft</p>
              </div>
            )}
            {property.floorNumber && (
              <div>
                <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Floor</p>
                <p className="text-2xl font-bold text-gray-900">Floor {property.floorNumber}</p>
              </div>
            )}
            {property.pincode && (
              <div>
                <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Pincode</p>
                <p className="text-2xl font-bold text-gray-900">{property.pincode}</p>
              </div>
            )}
            {property.description && (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wide">Description</p>
                <p className="text-gray-700 text-base">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-bold mb-2">Total Maintenance Records</p>
            <p className="text-4xl font-bold text-gray-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-bold mb-2">Total Spent</p>
            <p className="text-4xl font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200 hover:shadow-xl transition">
            <p className="text-gray-600 text-sm font-bold mb-2">Active Tasks</p>
            <p className="text-4xl font-bold text-gray-900">{tasks.filter(t => !t.completed).length}</p>
          </div>
        </div>

        {/* Maintenance Records */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Maintenance History</h2>
            <Link to="/history" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition">Add Record →</Link>
          </div>
          {records.length === 0 ? (
            <p className="text-gray-500 text-base">No maintenance records yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {records.slice(0, 10).map(record => (
                <div key={record._id} className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200 hover:border-blue-200 transition">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-base">{record.category}</p>
                    <p className="text-sm text-gray-600 mt-1">{new Date(record.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {record.description && <p className="text-sm text-gray-700 mt-2">{record.description}</p>}
                  </div>
                  <p className="font-bold text-blue-600 text-lg whitespace-nowrap ml-4">₹{record.actualCost?.toLocaleString('en-IN')}</p>
                </div>
              ))}
              {records.length > 10 && (
                <p className="text-sm text-gray-600 text-center pt-4 font-semibold">+{records.length - 10} more records</p>
              )}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <Link to="/tasks" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition">Manage Tasks →</Link>
          </div>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-base">No tasks for this property</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map(task => (
                <div key={task._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-200">
                  <input type="checkbox" defaultChecked={task.completed} disabled className="w-5 h-5 rounded" />
                  <span className={`text-base flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-sm text-gray-600 text-center pt-4 font-semibold">+{tasks.length - 5} more tasks</p>
              )}
            </div>
          )}
        </div>

        {/* Delete Button */}
        <div className="flex justify-end">
          <button onClick={handleDelete} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg hover:shadow-xl">
            Delete Property
          </button>
        </div>
      </main>
    </div>
  );
};
