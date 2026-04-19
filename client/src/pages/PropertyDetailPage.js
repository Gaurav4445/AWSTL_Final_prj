import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, IndianRupee, MapPin, Plus, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { PageTransition } from '../components/Animations';
import { propertyAPI, recordAPI, taskAPI } from '../services/api';
import { toast } from 'sonner';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e4ddd4',
  borderRadius: 16,
  padding: '22px 24px',
};

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [propertyRes, recordsRes, tasksRes] = await Promise.all([
        propertyAPI.getById(id),
        recordAPI.getByProperty(id),
        taskAPI.getByProperty(id),
      ]);
      setProperty(propertyRes.data.data);
      setRecords(recordsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
    } catch {
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteProperty = async () => {
    if (!window.confirm('Delete this property and all related data?')) return;
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
      setRecords((prev) => prev.filter((record) => record._id !== recordId));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const summary = useMemo(() => {
    const totalSpent = records.reduce((sum, record) => sum + (record.actualCost || 0), 0);
    return {
      totalSpent,
      completedTasks: tasks.filter((task) => task.completed).length,
      pendingTasks: tasks.filter((task) => !task.completed).length,
    };
  }, [records, tasks]);

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>
          <button type="button" onClick={() => navigate('/properties')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', color: '#6b7565', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}>
            <ArrowLeft size={16} />
            Back to properties
          </button>

          {loading ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ ...cardStyle, minHeight: 180 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
                {[1, 2, 3].map((item) => <div key={item} style={{ ...cardStyle, minHeight: 120 }} />)}
              </div>
            </div>
          ) : !property ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '56px 24px' }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Property not found</p>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardStyle, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(30px, 4vw, 44px)', color: '#1c2b27' }}>{property.name}</h1>
                    <p style={{ margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 8, color: '#6b7565', fontSize: 15 }}>
                      <MapPin size={16} />
                      {property.address}, {property.city}{property.state ? `, ${property.state}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
                      <span style={primaryChipStyle}>{property.propertyType}</span>
                      {property.bhkType ? <span style={secondaryChipStyle}>{property.bhkType}</span> : null}
                      {property.societyName ? <span style={secondaryChipStyle}>{property.societyName}</span> : null}
                    </div>
                  </div>

                  <button type="button" onClick={handleDeleteProperty} style={{ border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>
                    Delete property
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 24, paddingTop: 24, borderTop: '1px solid #f1ebe2' }}>
                  <Metric label="Area" value={property.squareFeet ? `${property.squareFeet} sq ft` : 'Not added'} />
                  <Metric label="Floor" value={property.floorNumber ? `Floor ${property.floorNumber}` : 'Not added'} />
                  <Metric label="Pincode" value={property.pincode || 'Not added'} />
                  <Metric label="Description" value={property.description || 'No notes yet'} />
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon={IndianRupee} label="Total spent" value={`₹${summary.totalSpent.toLocaleString('en-IN')}`} />
                <SummaryCard icon={CheckCircle2} label="Completed tasks" value={summary.completedTasks} />
                <SummaryCard icon={Clock3} label="Pending tasks" value={summary.pendingTasks} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 18 }}>
                <section style={cardStyle}>
                  <SectionHeader title="Maintenance history" subtitle="Every service logged for this property." buttonLabel="Add record" onClick={() => navigate(`/history?property=${id}`)} />
                  {records.length === 0 ? (
                    <EmptyState text="No maintenance records yet." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {records.map((record) => (
                        <div key={record._id} style={listItemStyle}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c2b27' }}>{record.category}</p>
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7565' }}>{record.description || 'Service completed'}</p>
                            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9b8f85' }}>{new Date(record.serviceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <strong style={{ color: '#1c2b27' }}>₹{(record.actualCost || 0).toLocaleString('en-IN')}</strong>
                            <button type="button" onClick={() => handleDeleteRecord(record._id)} style={dangerButtonStyle}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section style={cardStyle}>
                  <SectionHeader title="Tasks" subtitle="Planned maintenance and reminders." buttonLabel="Add task" onClick={() => navigate(`/tasks?property=${id}`)} />
                  {tasks.length === 0 ? (
                    <EmptyState text="No tasks added yet." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {tasks.map((task) => (
                        <div key={task._id} style={{ ...listItemStyle, background: task.completed ? '#faf7f2' : '#ffffff' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: task.completed ? '#9b8f85' : '#1c2b27', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.name}</p>
                            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7565' }}>{task.description || 'No description provided'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: '#9b8f85' }}>
                              {task.dueDate ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                  <CalendarDays size={12} />
                                  {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              ) : null}
                              {task.frequency ? <span>{task.frequency}</span> : null}
                              <span style={{ color: task.completed ? '#16a34a' : '#c47f4e', fontWeight: 700 }}>{task.completed ? 'Completed' : task.priority}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => handleDeleteTask(task._id)} style={dangerButtonStyle}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

const Metric = ({ label, value }) => (
  <div>
    <p style={{ margin: '0 0 6px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9b8f85', fontWeight: 700 }}>{label}</p>
    <p style={{ margin: 0, fontSize: 15, color: '#1c2b27', fontWeight: 700 }}>{value}</p>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value }) => (
  <div style={{ ...cardStyle, background: '#1c2b27', color: '#f5ede4' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.65 }}>{label}</p>
      <Icon size={18} />
    </div>
    <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
  </div>
);

const SectionHeader = ({ title, subtitle, buttonLabel, onClick }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1c2b27' }}>{title}</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7565' }}>{subtitle}</p>
    </div>
    <button type="button" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', borderRadius: 10, background: '#1c2b27', color: '#ffffff', padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
      <Plus size={14} /> {buttonLabel}
    </button>
  </div>
);

const EmptyState = ({ text }) => (
  <div style={{ border: '2px dashed #d8d1c7', borderRadius: 14, padding: '36px 20px', textAlign: 'center', color: '#6b7565', fontSize: 14 }}>
    {text}
  </div>
);

const primaryChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 12px',
  background: '#1c2b27',
  color: '#f5ede4',
  fontSize: 12,
  fontWeight: 700,
};

const secondaryChipStyle = {
  ...primaryChipStyle,
  background: '#f2ebe1',
  color: '#6b7565',
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 18px',
  borderRadius: 14,
  border: '1px solid #ece5db',
};

const dangerButtonStyle = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: 'none',
  background: '#fef2f2',
  color: '#dc2626',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};
