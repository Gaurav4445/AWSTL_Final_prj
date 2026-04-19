import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Trash2, Plus, Home, Zap, Droplets, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition, StatsCard, AnimatedList } from '../components/Animations';
import { propertyAPI, recordAPI, taskAPI } from '../services/api';
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

const PRIORITY_COLORS = {
  'Low': '#22c55e',
  'Medium': '#eab308',
  'High': '#ef4444',
  'Urgent': '#dc2626',
};

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propRes, recordsRes, tasksRes] = await Promise.all([
        propertyAPI.getById(id),
        recordAPI.getByProperty(id),
        taskAPI.getByProperty(id),
      ]);
      setProperty(propRes.data.data);
      setRecords(recordsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this property and all its data?')) return;
    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted');
      navigate('/properties');
    } catch {
      toast.error('Failed to delete property');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Delete this maintenance record?')) return;
    try {
      await recordAPI.delete(recordId);
      toast.success('Record deleted');
      setRecords(records.filter(r => r._id !== recordId));
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const totalSpent = records.reduce((sum, r) => sum + (r.cost || 0), 0);
  const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/properties')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Properties
            </button>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-48 rounded-2xl" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            </div>
          ) : !property ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200"
            >
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold text-lg">Property not found</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Property Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start gap-6 flex-wrap">
                      <div className="flex-1">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.name}</h1>
                        <div className="flex items-center gap-2 text-gray-600 text-base mb-4">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          {property.address}, {property.city}
                          {property.state && `, ${property.state}`}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                            {property.propertyType}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                            {property.bhkType}
                          </span>
                          {property.societyName && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                              {property.societyName}
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Property
                        </Button>
                      </motion.div>
                    </div>

                    {/* Property Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
                      {property.squareFeet && (
                        <div>
                          <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Area</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{property.squareFeet} sqft</p>
                        </div>
                      )}
                      {property.floorNumber && (
                        <div>
                          <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Floor</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">Floor {property.floorNumber}</p>
                        </div>
                      )}
                      {property.pincode && (
                        <div>
                          <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Pincode</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{property.pincode}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Records</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatsCard
                  icon={Home}
                  title="Total Records"
                  value={records.length}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  delay={0}
                />
                <StatsCard
                  icon={Zap}
                  title="Total Spent"
                  value={`₹${totalSpent.toLocaleString()}`}
                  gradient="bg-gradient-to-br from-green-500 to-green-600"
                  delay={0.1}
                />
                <StatsCard
                  icon={Clock}
                  title="Active Tasks"
                  value={activeTasks}
                  gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                  delay={0.2}
                />
              </div>

              {/* Maintenance History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Maintenance History</h2>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/history?property=${id}`)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Record
                    </Button>
                  </motion.div>
                </div>

                {records.length === 0 ? (
                  <Card className="shadow-sm border-dashed border-2">
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-600 font-medium">No maintenance records yet</p>
                      <p className="text-gray-500 text-sm mt-1">Start tracking maintenance by adding a record</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {records.map((record, idx) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-gray-900">{record.category}</h3>
                                  <span
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-white"
                                    style={{ backgroundColor: CATEGORY_COLORS[record.category] || '#6b7280' }}
                                  >
                                    ₹{record.cost}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">{record.description}</p>
                                <p className="text-gray-500 text-xs mt-2">
                                  {new Date(record.date).toLocaleDateString('en-IN')}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteRecord(record._id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Tasks Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/tasks?property=${id}`)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </Button>
                  </motion.div>
                </div>

                {tasks.length === 0 ? (
                  <Card className="shadow-sm border-dashed border-2">
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-600 font-medium">No tasks yet</p>
                      <p className="text-gray-500 text-sm mt-1">Create tasks to organize your maintenance work</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task, idx) => (
                      <motion.div
                        key={task._id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <Card
                          className={`shadow-sm hover:shadow-md transition-all ${
                            task.status === 'Completed' ? 'opacity-75 bg-gray-50' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  {task.status === 'Completed' && (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                  )}
                                  <h3 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                                    {task.title}
                                  </h3>
                                  <span
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold text-white flex-shrink-0"
                                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] || '#6b7280' }}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  {task.dueDate && (
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}</span>
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    task.status === 'Completed'
                                      ? 'bg-green-100 text-green-700'
                                      : task.status === 'In Progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteTask(task._id)}
                                className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};
