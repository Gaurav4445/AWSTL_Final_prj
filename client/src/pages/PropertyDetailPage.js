import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarClock, CalendarDays, CheckCircle2, Clock3, Cpu, IndianRupee, MapPin, Plus, Trash2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { PageTransition } from '../components/Animations';
import { applianceAPI, bookingAPI, propertyAPI, recordAPI, taskAPI } from '../services/api';
import { toast } from 'sonner';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e4ddd4',
  borderRadius: 16,
  padding: '22px 24px',
};

const APPLIANCE_TYPES = ['AC', 'RO', 'Geyser', 'Inverter', 'Refrigerator', 'Washing Machine', 'Water Tank', 'Pump', 'Microwave', 'Dishwasher', 'Security System', 'Other'];

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [records, setRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showApplianceForm, setShowApplianceForm] = useState(false);
  const [applianceForm, setApplianceForm] = useState({
    name: '',
    applianceType: 'Other',
    brand: '',
    modelNumber: '',
    installDate: '',
    warrantyExpiry: '',
    serviceIntervalMonths: 6,
    notes: '',
    coverImage: null,
    documents: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [propertyRes, recordsRes, tasksRes, applianceRes, bookingRes] = await Promise.all([
        propertyAPI.getById(id),
        recordAPI.getByProperty(id),
        taskAPI.getByProperty(id),
        applianceAPI.getByProperty(id),
        bookingAPI.getByProperty(id),
      ]);
      setProperty(propertyRes.data.data);
      setRecords(recordsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setAppliances(applianceRes.data.data || []);
      setBookings(bookingRes.data.data || []);
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

  const handleApplianceChange = (e) => {
    setApplianceForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateAppliance = async (e) => {
    e.preventDefault();
    if (!applianceForm.name.trim()) return toast.error('Please enter appliance name');
    try {
      const response = await applianceAPI.create({ ...applianceForm, propertyId: id });
      setAppliances((prev) => [response.data.data, ...prev]);
      setApplianceForm({ name: '', applianceType: 'Other', brand: '', modelNumber: '', installDate: '', warrantyExpiry: '', serviceIntervalMonths: 6, notes: '', coverImage: null, documents: [] });
      setShowApplianceForm(false);
      toast.success('Appliance added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add appliance');
    }
  };

  const handleApplianceImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setApplianceForm((prev) => ({
        ...prev,
        coverImage: { fileName: file.name, dataUrl: reader.result },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplianceDocumentUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ title: file.name, fileName: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    }))).then((documents) => {
      setApplianceForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...documents],
      }));
    });
  };

  const handleDeleteAppliance = async (applianceId) => {
    if (!window.confirm('Delete this appliance?')) return;
    try {
      await applianceAPI.delete(applianceId);
      setAppliances((prev) => prev.filter((appliance) => appliance._id !== applianceId));
      toast.success('Appliance deleted');
    } catch {
      toast.error('Failed to delete appliance');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await bookingAPI.delete(bookingId);
      setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
      toast.success('Booking deleted');
    } catch {
      toast.error('Failed to delete booking');
    }
  };

  const summary = useMemo(() => {
    const totalSpent = records.reduce((sum, record) => sum + (record.actualCost || 0), 0);
    const expiringWarrantyCount = appliances.filter((appliance) => appliance.warrantyExpiry && new Date(appliance.warrantyExpiry) <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)).length;
    return {
      totalSpent,
      completedTasks: tasks.filter((task) => task.completed).length,
      pendingTasks: tasks.filter((task) => !task.completed).length,
      expiringWarrantyCount,
      upcomingBookings: bookings.filter((booking) => ['Requested', 'Confirmed', 'In Progress'].includes(booking.status)).length,
    };
  }, [records, tasks, appliances, bookings]);

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
                {[1, 2, 3, 4].map((item) => <div key={item} style={{ ...cardStyle, minHeight: 120 }} />)}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
                <SummaryCard icon={IndianRupee} label="Total spent" value={`₹${summary.totalSpent.toLocaleString('en-IN')}`} />
                <SummaryCard icon={CheckCircle2} label="Completed tasks" value={summary.completedTasks} />
                <SummaryCard icon={Clock3} label="Pending tasks" value={summary.pendingTasks} />
                <SummaryCard icon={Cpu} label="Appliances" value={appliances.length} subtitle={`${summary.expiringWarrantyCount} warranty alerts · ${summary.upcomingBookings} bookings`} />
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
                            {record.applianceId?.name ? <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7565' }}>Appliance: {record.applianceId.name}</p> : null}
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
                              {task.dueDate ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalendarDays size={12} />{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> : null}
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

              <section style={{ ...cardStyle, marginTop: 18 }}>
                <SectionHeader title="Scheduled services" subtitle="Upcoming vendor visits and follow-up reminders for this property." buttonLabel="Book service" onClick={() => navigate('/bookings')} />
                {bookings.length === 0 ? (
                  <EmptyState text="No services booked yet." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {bookings.map((booking) => (
                      <div key={booking._id} style={{ border: '1px solid #ece5db', borderRadius: 14, padding: '16px 18px', background: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c2b27' }}>{booking.title}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7565' }}>{booking.serviceType}</p>
                          </div>
                          <button type="button" onClick={() => handleDeleteBooking(booking._id)} style={dangerButtonStyle}><Trash2 size={14} /></button>
                        </div>
                        <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
                          <p style={metaStyle}><CalendarClock size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />{new Date(booking.scheduledDate).toLocaleDateString('en-IN')} · {booking.timeSlot}</p>
                          <p style={metaStyle}>Status: {booking.status}</p>
                          {booking.vendorId?.name ? <p style={metaStyle}>Vendor: {booking.vendorId.name}</p> : null}
                          {booking.followUpDate ? <p style={metaStyle}>Follow-up: {new Date(booking.followUpDate).toLocaleDateString('en-IN')}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section style={{ ...cardStyle, marginTop: 18 }}>
                <SectionHeader title="Appliances" subtitle="Track appliances, service intervals, and warranty expiries." buttonLabel={showApplianceForm ? 'Hide form' : 'Add appliance'} onClick={() => setShowApplianceForm((prev) => !prev)} />
                {showApplianceForm && (
                  <form onSubmit={handleCreateAppliance} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
                    <input name="name" value={applianceForm.name} onChange={handleApplianceChange} placeholder="Appliance name" style={inputLikeStyle} />
                    <select name="applianceType" value={applianceForm.applianceType} onChange={handleApplianceChange} style={inputLikeStyle}>
                      {APPLIANCE_TYPES.map((type) => <option key={type}>{type}</option>)}
                    </select>
                    <input name="brand" value={applianceForm.brand} onChange={handleApplianceChange} placeholder="Brand" style={inputLikeStyle} />
                    <input name="modelNumber" value={applianceForm.modelNumber} onChange={handleApplianceChange} placeholder="Model number" style={inputLikeStyle} />
                    <input type="date" name="installDate" value={applianceForm.installDate} onChange={handleApplianceChange} style={inputLikeStyle} />
                    <input type="date" name="warrantyExpiry" value={applianceForm.warrantyExpiry} onChange={handleApplianceChange} style={inputLikeStyle} />
                    <input type="number" name="serviceIntervalMonths" value={applianceForm.serviceIntervalMonths} onChange={handleApplianceChange} placeholder="Service interval (months)" style={inputLikeStyle} />
                    <input name="notes" value={applianceForm.notes} onChange={handleApplianceChange} placeholder="Notes" style={inputLikeStyle} />
                    <input type="file" accept="image/*" onChange={handleApplianceImageUpload} style={inputLikeStyle} />
                    <input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleApplianceDocumentUpload} style={inputLikeStyle} />
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" style={primaryActionStyle}>Save appliance</button>
                    </div>
                  </form>
                )}

                {appliances.length === 0 ? (
                  <EmptyState text="No appliances added yet." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {appliances.map((appliance) => {
                      const warrantyExpiring = appliance.warrantyExpiry && new Date(appliance.warrantyExpiry) <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
                      return (
                        <div key={appliance._id} style={{ border: `1px solid ${warrantyExpiring ? '#fed7aa' : '#ece5db'}`, borderRadius: 14, padding: '16px 18px', background: warrantyExpiring ? '#fff7ed' : '#fff' }}>
                          {appliance.coverImage?.dataUrl ? (
                            <img src={appliance.coverImage.dataUrl} alt={appliance.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 12, border: '1px solid #ece5db' }} />
                          ) : null}
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c2b27' }}>{appliance.name}</p>
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7565' }}>{appliance.applianceType}{appliance.brand ? ` · ${appliance.brand}` : ''}</p>
                            </div>
                            <button type="button" onClick={() => handleDeleteAppliance(appliance._id)} style={dangerButtonStyle}><Trash2 size={14} /></button>
                          </div>
                          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
                            {appliance.lastServiceDate ? <p style={metaStyle}>Last service: {new Date(appliance.lastServiceDate).toLocaleDateString('en-IN')}</p> : null}
                            {appliance.warrantyExpiry ? <p style={{ ...metaStyle, color: warrantyExpiring ? '#c2410c' : '#6b7565' }}>Warranty: {new Date(appliance.warrantyExpiry).toLocaleDateString('en-IN')}</p> : null}
                            {appliance.notes ? <p style={metaStyle}>{appliance.notes}</p> : null}
                            {appliance.documents?.length ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                                {appliance.documents.map((document, index) => (
                                  <a key={`${appliance._id}-doc-${index}`} href={document.dataUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1c2b27', background: '#f2ebe1', padding: '6px 10px', borderRadius: 999, textDecoration: 'none' }}>
                                    {document.title || document.fileName || `Document ${index + 1}`}
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
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

const SummaryCard = ({ icon: Icon, label, value, subtitle }) => (
  <div style={{ ...cardStyle, background: '#1c2b27', color: '#f5ede4' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.65 }}>{label}</p>
      <Icon size={18} />
    </div>
    <p style={{ margin: 0, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
    {subtitle ? <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.75 }}>{subtitle}</p> : null}
  </div>
);

const SectionHeader = ({ title, subtitle, buttonLabel, onClick }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1c2b27' }}>{title}</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7565' }}>{subtitle}</p>
    </div>
    <button type="button" onClick={onClick} style={primaryActionStyle}>
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

const inputLikeStyle = {
  minHeight: 42,
  borderRadius: 10,
  border: '1.5px solid #d8d1c7',
  background: '#fff',
  padding: '10px 12px',
  fontFamily: 'inherit',
  color: '#1c2b27',
};

const metaStyle = {
  margin: 0,
  fontSize: 12,
  color: '#6b7565',
};

const primaryActionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: 'none',
  borderRadius: 10,
  background: '#1c2b27',
  color: '#ffffff',
  padding: '10px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};
