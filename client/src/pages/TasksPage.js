import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, CheckCircle2, Clock, AlertTriangle, MapPin, CalendarDays } from 'lucide-react';
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

const EMPTY_FORM = { name:'', propertyId:'', description:'', dueDate:'', priority:'Medium' };

const PRIORITY_CONFIG = {
  High:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'High Priority' },
  Medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Medium Priority' },
  Low:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Low Priority' },
};

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
    if (!formData.name) { toast.error('Please enter task title'); return; }
    if (!formData.propertyId) { toast.error('Please select a property'); return; }
    try {
      await taskAPI.create(formData);
      toast.success('Task created successfully');
      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleToggle = async (task) => {
    try {
      await taskAPI.update(task._id, { ...task, completed: !task.completed });
      toast.success(task.completed ? 'Task marked incomplete' : 'Task marked complete');
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

  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.filter(t => !t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: '#1c2b27', margin: 0, lineHeight: 1.1 }}>
                Your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Tasks</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>Stay on top of your maintenance schedule.</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(!showForm)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: showForm ? '#6b7565' : '#1c2b27', color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background 0.2s', fontFamily: 'inherit' }}>
              <Plus size={16} />
              {showForm ? 'Cancel' : 'New Task'}
            </motion.button>
          </motion.div>

          {/* Stats + Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Total Tasks', value: tasks.length, dark: true },
              { label: 'Completed', value: completed, color: '#16a34a' },
              { label: 'Pending', value: pending, color: '#d97706' },
            ].map(({ label, value, dark, color }) => (
              <div key={label} style={{ background: dark ? '#1c2b27' : '#fff', border: dark ? 'none' : '1px solid #e4ddd4', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: dark ? 'rgba(245,237,228,0.55)' : '#6b7565', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: dark ? '#f5ede4' : (color || '#1c2b27'), margin: 0, fontFamily: "'Playfair Display', serif" }}>{value}</p>
              </div>
            ))}
            {/* Progress bar card */}
            <div style={{ background: '#fff', border: '1px solid #e4ddd4', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: '#6b7565', textTransform: 'uppercase', margin: 0 }}>Overall Progress</p>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1c2b27' }}>{progress}%</span>
              </div>
              <div style={{ height: 8, background: '#f2ebe1', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', background: progress === 100 ? '#16a34a' : '#c47f4e', borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 12, color: '#6b7565', margin: '8px 0 0' }}>{completed} of {tasks.length} tasks done</p>
            </div>
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginBottom: 32 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0e9e0', background: 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)' }}>
                    <h2 style={{ color: '#f5ede4', fontSize: 18, fontWeight: 700, margin: 0 }}>Create New Task</h2>
                    <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Add a task to track your maintenance schedule</p>
                  </div>
                  <div style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      <div><Label htmlFor="name">Task Title *</Label><Input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. AC Servicing" className="mt-2" /></div>
                      <div><Label htmlFor="propertyId">Property *</Label><Select id="propertyId" name="propertyId" value={formData.propertyId} onChange={handleChange} required className="mt-2"><option value="">Select Property</option>{properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</Select></div>
                      <div><Label htmlFor="dueDate">Due Date</Label><Input id="dueDate" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-2" /></div>
                      <div><Label htmlFor="priority">Priority</Label><Select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="mt-2"><option>Low</option><option>Medium</option><option>High</option></Select></div>
                      <div style={{ gridColumn: '1 / -1' }}><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Details about the task..." className="mt-2" /></div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                        <button type="button" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#c47f4e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Create Task</button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ maxWidth: '200px' }}>
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ maxWidth: '200px' }}>
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </Select>
          </motion.div>

          {/* Tasks */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '56px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2ebe1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={24} color="#6b7565" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: '0 0 6px' }}>No tasks found</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Create a task to begin tracking your maintenance.</p>
              <button onClick={() => setShowForm(true)} style={{ padding: '11px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                Add First Task
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((task, idx) => {
                const pconf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
                const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                return (
                  <motion.div key={task._id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: idx * 0.04, duration: 0.3 }}>
                    <div style={{ background: task.completed ? '#fafaf8' : '#fff', borderRadius: 14, border: `1px solid ${task.completed ? '#e4ddd4' : isOverdue ? '#fecaca' : '#e4ddd4'}`, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                      {/* Checkbox */}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleToggle(task)}
                        style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${task.completed ? '#16a34a' : '#d8d1c7'}`, background: task.completed ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
                        {task.completed && <Check size={13} color="#fff" />}
                      </motion.button>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: task.completed ? '#9b8f85' : '#1c2b27', margin: 0, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.name}</h3>
                        {task.description && <p style={{ fontSize: 13, color: '#6b7565', margin: '4px 0 0' }}>{task.description}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                          {task.propertyId && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7565' }}>
                              <MapPin size={11} /> {task.propertyId.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isOverdue ? '#dc2626' : '#6b7565', fontWeight: isOverdue ? 600 : 400 }}>
                              <CalendarDays size={11} />
                              {isOverdue ? 'Overdue · ' : ''}{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Priority + Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {task.priority && (
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: pconf.bg, color: pconf.color, border: `1px solid ${pconf.border}` }}>
                            {task.priority}
                          </span>
                        )}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(task._id)}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={13} />
                        </motion.button>
                      </div>
                    </div>
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
