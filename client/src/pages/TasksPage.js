import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label, Textarea, Select } from '../components/ui/FormElements';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { taskAPI, propertyAPI } from '../services/api';
import { toast } from 'sonner';

const EMPTY_FORM = { title:'', propertyId:'', description:'', dueDate:'', priority:'Medium' };

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, propRes] = await Promise.all([taskAPI.getAll(), propertyAPI.getAll()]);
      setTasks(taskRes.data.data || []);
      setProperties(propRes.data.data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) { toast.error('Please enter task title'); return; }
    try {
      await taskAPI.create(formData);
      toast.success('Task created!');
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleToggle = async (task) => {
    try {
      await taskAPI.update(task._id, { ...task, completed: !task.completed });
      toast.success(task.completed ? 'Task marked incomplete' : 'Task completed! 🎉');
      fetchData();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setShowForm(false); };

  let filtered = tasks;
  if (filterStatus === 'completed') filtered = filtered.filter(t => t.completed);
  else if (filterStatus === 'pending') filtered = filtered.filter(t => !t.completed);
  if (filterPriority !== 'all') filtered = filtered.filter(t => t.priority === filterPriority);

  const priorityConfig = {
    High: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
    Medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    Low: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
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
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600 mt-2 text-base">Track and manage your maintenance tasks</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => setShowForm(!showForm)} className="gap-2">
                <Plus className="w-5 h-5" />
                {showForm ? 'Cancel' : 'New Task'}
              </Button>
            </motion.div>
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-10"
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Create New Task</CardTitle>
                    <CardDescription>Add a task to track your maintenance schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                        <Label htmlFor="title">Task Title *</Label>
                        <Input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. AC Servicing" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Label htmlFor="propertyId">Property</Label>
                        <Select id="propertyId" name="propertyId" value={formData.propertyId} onChange={handleChange} className="mt-2">
                          <option value="">All Properties</option>
                          {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Label htmlFor="priority">Priority</Label>
                        <Select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="mt-2">
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="sm:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Details about the task..." className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="sm:col-span-2 flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                        <Button type="submit">Create Task</Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex gap-4 flex-wrap"
          >
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="max-w-xs">
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="max-w-xs">
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm font-semibold">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm font-semibold">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{tasks.filter(t => t.completed).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{tasks.filter(t => !t.completed).length}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300"
            >
              <p className="text-gray-700 font-semibold text-lg">No tasks found</p>
              <p className="text-gray-500 text-base mt-2">Create a task to get started</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((task, idx) => {
                const PriorityIcon = priorityConfig[task.priority]?.icon || AlertTriangle;
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`${task.completed ? 'bg-gray-50' : 'hover:shadow-lg'} transition-all`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggle(task)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                              task.completed ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-blue-600'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4 text-white" />}
                          </motion.button>

                          <div className="flex-1">
                            <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</h3>
                            {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                            {task.propertyId && <p className="text-sm text-gray-500 mt-1">📍 {task.propertyId.name}</p>}
                            {task.dueDate && <p className="text-sm text-gray-500 mt-1">📅 {new Date(task.dueDate).toLocaleDateString('en-IN')}</p>}
                          </div>

                          <div className="flex items-center gap-2">
                            {task.priority && (
                              <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`}>
                                <PriorityIcon className="w-3 h-3" />
                                {task.priority}
                              </span>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(task._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};
