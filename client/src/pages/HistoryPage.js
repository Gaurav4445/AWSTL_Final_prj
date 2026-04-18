// src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Filter } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { TaskCard } from '../components/TaskCard';
import { recordAPI, propertyAPI, taskAPI } from '../services/api';

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tasksForProperty, setTasksForProperty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterProperty, setFilterProperty] = useState('all');

  const [formData, setFormData] = useState({
    propertyId: '',
    taskId: '',           // will be sent only if selected
    serviceDate: '',
    category: 'General',
    description: '',
    actualCost: '',
    technician: { name: '', phone: '', company: '' },
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [recordsRes, propertiesRes] = await Promise.all([
        recordAPI.getAll(),
        propertyAPI.getAll(),
      ]);
      setRecords(recordsRes.data.data || []);
      setProperties(propertiesRes.data.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when property changes
  useEffect(() => {
    if (formData.propertyId) {
      loadTasksForProperty(formData.propertyId);
    } else {
      setTasksForProperty([]);
    }
  }, [formData.propertyId]);

  const loadTasksForProperty = async (propertyId) => {
    try {
      const res = await taskAPI.getByProperty(propertyId);
      setTasksForProperty(res.data.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
      setTasksForProperty([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('technician.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        technician: { ...prev.technician, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.propertyId) {
      setError("Please select a property");
      return;
    }
    if (!formData.serviceDate) {
      setError("Please select a service date");
      return;
    }
    if (!formData.actualCost) {
      setError("Please enter actual cost");
      return;
    }

    try {
      const submitData = {
        propertyId: formData.propertyId,
        serviceDate: formData.serviceDate,
        category: formData.category,
        description: formData.description,
        actualCost: parseFloat(formData.actualCost),
        technician: formData.technician,
      };

      // Only add taskId if user actually selected one
      if (formData.taskId) {
        submitData.taskId = formData.taskId;
      }

      await recordAPI.create(submitData);

      fetchInitialData();
      resetForm();
      alert('✅ Maintenance record saved successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save record. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        await recordAPI.delete(id);
        fetchInitialData();
      } catch (err) {
        setError('Failed to delete record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: '',
      taskId: '',
      serviceDate: '',
      category: 'General',
      description: '',
      actualCost: '',
      technician: { name: '', phone: '', company: '' },
    });
    setShowForm(false);
  };

  const filteredRecords = filterProperty === 'all' 
    ? records 
    : records.filter(r => r.propertyId?._id === filterProperty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Maintenance History</h1>
            <p className="text-gray-600 mt-2">Log and track all your maintenance records</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Log New Service'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Log New Maintenance Service</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property *</label>
                <select 
                  name="propertyId" 
                  value={formData.propertyId} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-orange-500"
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {p.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Service Date *</label>
                <input 
                  type="date" 
                  name="serviceDate" 
                  value={formData.serviceDate} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full border border-gray-300 p-3 rounded-lg" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Task (Optional)</label>
                <select 
                  name="taskId" 
                  value={formData.taskId} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg"
                >
                  <option value="">Select Task (Optional)</option>
                  {tasksForProperty.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.name} — {task.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg"
                >
                  {['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Actual Cost (₹) *</label>
                <input 
                  type="number" 
                  name="actualCost" 
                  value={formData.actualCost} 
                  onChange={handleInputChange} 
                  required 
                  step="0.01"
                  placeholder="500.00"
                  className="w-full border border-gray-300 p-3 rounded-lg" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description / Work Done</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows="3"
                  placeholder="What maintenance was performed?"
                  className="w-full border border-gray-300 p-3 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input 
                  type="text" 
                  name="technician.name" 
                  placeholder="Technician Name" 
                  value={formData.technician.name} 
                  onChange={handleInputChange} 
                  className="border border-gray-300 p-3 rounded-lg" 
                />
                <input 
                  type="tel" 
                  name="technician.phone" 
                  placeholder="Phone Number" 
                  value={formData.technician.phone} 
                  onChange={handleInputChange} 
                  className="border border-gray-300 p-3 rounded-lg" 
                />
                <input 
                  type="text" 
                  name="technician.company" 
                  placeholder="Company Name" 
                  value={formData.technician.company} 
                  onChange={handleInputChange} 
                  className="border border-gray-300 p-3 rounded-lg" 
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 rounded-lg font-medium"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select 
            value={filterProperty} 
            onChange={(e) => setFilterProperty(e.target.value)} 
            className="border border-gray-300 px-4 py-2 rounded-lg"
          >
            <option value="all">All Properties</option>
            {properties.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center py-12">Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <AlertCircle className="mx-auto w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No maintenance records yet.<br />Log your first service above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(record => (
              <TaskCard key={record._id} record={record} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};