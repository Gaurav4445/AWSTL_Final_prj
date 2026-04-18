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
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}
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
                Your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Tasks</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>
                Stay on top of your maintenance schedule.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={() => setShowForm(!showForm)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: showForm ? '#6b7565' : '#1c2b27', color: '#fff',
                padding: '12px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'background 0.2s',
              }} className="gap-2">
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
                style={{ marginBottom: 32 }}
              >
                <Card style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <CardHeader style={{ padding: 28 }}>
                    <CardTitle style={{ color: '#1c2b27', fontSize: 20, fontWeight: 700 }}>Create New Task</CardTitle>
                    <CardDescription style={{ color: '#6b7565', marginTop: 8 }}>Add a task to track your maintenance schedule</CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: 28, paddingTop: 0 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
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

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16 }}>
                        <Button type="button" variant="secondary" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</Button>
                        <Button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Create Task</Button>
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
            style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}
          >
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: '250px' }}>
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ maxWidth: '250px' }}>
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
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}
          >
            <Card style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4ddd4' }}>
              <CardContent style={{ padding: 24 }}>
                <p style={{ color: '#6b7565', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>Total Tasks</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#1c2b27', margin: 0 }}>{tasks.length}</p>
              </CardContent>
            </Card>
            <Card style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4ddd4' }}>
              <CardContent style={{ padding: 24 }}>
                <p style={{ color: '#6b7565', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>Completed</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#22c55e', margin: 0 }}>{tasks.filter(t => t.completed).length}</p>
              </CardContent>
            </Card>
            <Card style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4ddd4' }}>
              <CardContent style={{ padding: 24 }}>
                <p style={{ color: '#6b7565', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 12px' }}>Pending</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#ea580c', margin: 0 }}>{tasks.filter(t => !t.completed).length}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1c2b27', margin: '0 0 8px' }}>No tasks found</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: 0 }}>Create a task to get started</p>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
