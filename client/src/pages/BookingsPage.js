import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/Input';
import { Label, Select, Textarea } from '../components/ui/FormElements';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { bookingAPI, propertyAPI, taskAPI, vendorAPI } from '../services/api';
import { toast } from 'sonner';

const EMPTY_FORM = {
  propertyId: '',
  vendorId: '',
  taskId: '',
  serviceType: 'General Inspection',
  title: '',
  description: '',
  scheduledDate: '',
  scheduledTime: '',
  timeSlot: 'Flexible',
  urgency: 'Medium',
  quotedPrice: '',
  contactPerson: '',
  contactPhone: '',
  followUpDate: '',
  reminderAt: '',
  followUpReminderAt: '',
  reminderLeadDays: 1,
  notes: '',
};

const SERVICE_TYPES = ['AC Service', 'Deep Cleaning', 'Plumbing Visit', 'Electrical Repair', 'Pest Control', 'RO Service', 'Appliance Repair', 'Painting', 'Carpentry', 'General Inspection'];
const TIME_SLOTS = ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Flexible'];
const STATUS_FLOW = ['Requested', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

const statusStyles = {
  Requested: { bg: '#fff7ed', color: '#c2410c' },
  Confirmed: { bg: '#eff6ff', color: '#1d4ed8' },
  'In Progress': { bg: '#ecfeff', color: '#0f766e' },
  Completed: { bg: '#f0fdf4', color: '#15803d' },
  Cancelled: { bg: '#fef2f2', color: '#b91c1c' },
};

export const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!formData.propertyId) {
      setTasks([]);
      return;
    }
    taskAPI.getByProperty(formData.propertyId)
      .then((response) => setTasks(response.data.data || []))
      .catch(() => setTasks([]));
  }, [formData.propertyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingRes, propertyRes, vendorRes, taskRes] = await Promise.all([
        bookingAPI.getAll(),
        propertyAPI.getAll(),
        vendorAPI.getAll(),
        taskAPI.getAll(),
      ]);
      setBookings(bookingRes.data.data || []);
      setProperties(propertyRes.data.data || []);
      setVendors(vendorRes.data.data || []);
      setTasks(taskRes.data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.propertyId || !formData.title.trim() || !formData.scheduledDate) {
      toast.error('Please fill property, title, and date');
      return;
    }

    try {
      await bookingAPI.create({
        ...formData,
        quotedPrice: formData.quotedPrice ? Number(formData.quotedPrice) : 0,
        reminderLeadDays: Number(formData.reminderLeadDays) || 1,
        vendorId: formData.vendorId || undefined,
        taskId: formData.taskId || undefined,
        followUpDate: formData.followUpDate || undefined,
        reminderAt: formData.reminderAt || undefined,
        followUpReminderAt: formData.followUpReminderAt || undefined,
      });
      toast.success('Booking scheduled');
      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await bookingAPI.delete(id);
      toast.success('Booking deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete booking');
    }
  };

  const updateStatus = async (booking, status) => {
    try {
      await bookingAPI.update(booking._id, { status });
      toast.success(`Booking marked ${status}`);
      fetchData();
    } catch {
      toast.error('Failed to update booking');
    }
  };

  const summary = useMemo(() => {
    const active = bookings.filter((booking) => ['Requested', 'Confirmed', 'In Progress'].includes(booking.status));
    const upcoming = active.filter((booking) => booking.scheduledDate && new Date(booking.scheduledDate) >= new Date());
    const followUps = active.filter((booking) => booking.followUpDate && new Date(booking.followUpDate) >= new Date());
    const confirmedValue = active.reduce((sum, booking) => sum + (booking.quotedPrice || 0), 0);
    return {
      total: bookings.length,
      upcoming: upcoming.length,
      followUps: followUps.length,
      confirmedValue,
    };
  }, [bookings]);

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: '#1c2b27', margin: 0, lineHeight: 1.1 }}>
                Service <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Bookings</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>Plan visits, track vendor progress, and remember follow-ups.</p>
            </div>
            <button type="button" onClick={() => setShowForm((prev) => !prev)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: showForm ? '#6b7565' : '#1c2b27', color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Schedule Service'}
            </button>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Bookings', value: summary.total, dark: true },
              { label: 'Upcoming Visits', value: summary.upcoming },
              { label: 'Follow-Ups', value: summary.followUps },
              { label: 'Quoted Value', value: `₹${summary.confirmedValue.toLocaleString('en-IN')}` },
            ].map(({ label, value, dark }) => (
              <div key={label} style={{ background: dark ? '#1c2b27' : '#fff', border: dark ? 'none' : '1px solid #e4ddd4', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: dark ? 'rgba(245,237,228,0.55)' : '#6b7565', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
                <p style={{ fontSize: 30, fontWeight: 700, color: dark ? '#f5ede4' : '#1c2b27', margin: 0, fontFamily: "'Playfair Display', serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {showForm && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0e9e0', background: 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)' }}>
                <h2 style={{ color: '#f5ede4', fontSize: 18, fontWeight: 700, margin: 0 }}>Schedule a Service</h2>
                <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>This gives your project a strong “service workflow” story without becoming too big.</p>
              </div>
              <div style={{ padding: 28 }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
                  <div><Label htmlFor="propertyId">Property *</Label><Select id="propertyId" name="propertyId" value={formData.propertyId} onChange={handleChange} required><option value="">Select Property</option>{properties.map((property) => <option key={property._id} value={property._id}>{property.name}</option>)}</Select></div>
                  <div><Label htmlFor="vendorId">Vendor</Label><Select id="vendorId" name="vendorId" value={formData.vendorId} onChange={handleChange}><option value="">Select Vendor</option>{vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.name}</option>)}</Select></div>
                  <div><Label htmlFor="taskId">Linked Task</Label><Select id="taskId" name="taskId" value={formData.taskId} onChange={handleChange}><option value="">Select Task</option>{tasks.map((task) => <option key={task._id} value={task._id}>{task.name}</option>)}</Select></div>
                  <div><Label htmlFor="serviceType">Service Type</Label><Select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange}>{SERVICE_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></div>
                  <div><Label htmlFor="title">Booking Title *</Label><Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="AC servicing for living room" /></div>
                  <div><Label htmlFor="scheduledDate">Scheduled Date *</Label><Input id="scheduledDate" type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} required /></div>
                  <div><Label htmlFor="scheduledTime">Scheduled Time</Label><Input id="scheduledTime" type="time" name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} /></div>
                  <div><Label htmlFor="timeSlot">Time Slot</Label><Select id="timeSlot" name="timeSlot" value={formData.timeSlot} onChange={handleChange}>{TIME_SLOTS.map((slot) => <option key={slot}>{slot}</option>)}</Select></div>
                  <div><Label htmlFor="urgency">Urgency</Label><Select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange}><option>Low</option><option>Medium</option><option>High</option></Select></div>
                  <div><Label htmlFor="quotedPrice">Quoted Price</Label><Input id="quotedPrice" type="number" name="quotedPrice" value={formData.quotedPrice} onChange={handleChange} placeholder="1500" /></div>
                  <div><Label htmlFor="contactPerson">Contact Person</Label><Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Resident / tenant name" /></div>
                  <div><Label htmlFor="contactPhone">Contact Phone</Label><Input id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="9876543210" /></div>
                  <div><Label htmlFor="followUpDate">Follow-Up Date</Label><Input id="followUpDate" type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} /></div>
                  <div><Label htmlFor="reminderAt">Reminder Date & Time</Label><Input id="reminderAt" type="datetime-local" name="reminderAt" value={formData.reminderAt} onChange={handleChange} /></div>
                  <div><Label htmlFor="followUpReminderAt">Follow-Up Reminder</Label><Input id="followUpReminderAt" type="datetime-local" name="followUpReminderAt" value={formData.followUpReminderAt} onChange={handleChange} /></div>
                  <div><Label htmlFor="reminderLeadDays">Reminder Lead Days</Label><Input id="reminderLeadDays" type="number" name="reminderLeadDays" value={formData.reminderLeadDays} onChange={handleChange} min="0" /></div>
                  <div style={{ gridColumn: '1 / -1' }}><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Problem statement or scope of work..." /></div>
                  <div style={{ gridColumn: '1 / -1' }}><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Entry instructions, spare parts, tenant availability, etc." /></div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
                    <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#c47f4e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Create Booking</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '56px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2ebe1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><CalendarClock size={24} color="#6b7565" /></div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: '0 0 6px' }}>No bookings scheduled yet</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Add a service booking to make the app feel much more complete during your project demo.</p>
              <button type="button" onClick={() => setShowForm(true)} style={{ padding: '11px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Schedule First Booking</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map((booking, idx) => {
                const statusStyle = statusStyles[booking.status] || statusStyles.Requested;
                return (
                  <motion.div key={booking._id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.04, duration: 0.3 }}>
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4ddd4', padding: '18px 22px', display: 'grid', gridTemplateColumns: '1.2fr 0.9fr auto', gap: 18, alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: 16, color: '#1c2b27' }}>{booking.title}</h3>
                          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '4px 10px', background: statusStyle.bg, color: statusStyle.color }}>{booking.status}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '4px 10px', background: '#f2ebe1', color: '#6b7565' }}>{booking.urgency}</span>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7565' }}>{booking.description || booking.serviceType}</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: '#6b7565' }}>
                          <span>{booking.propertyId?.name || 'Property not found'}</span>
                          <span>{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>{booking.timeSlot}</span>
                          {booking.vendorId?.name ? <span>Vendor: {booking.vendorId.name}</span> : null}
                          {booking.followUpDate ? <span>Follow-up: {new Date(booking.followUpDate).toLocaleDateString('en-IN')}</span> : null}
                        </div>
                      </div>

                      <div>
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1c2b27', fontFamily: "'Playfair Display', serif" }}>₹{(booking.quotedPrice || 0).toLocaleString('en-IN')}</p>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7565' }}>{booking.contactPerson || 'No contact set'}{booking.contactPhone ? ` · ${booking.contactPhone}` : ''}</p>
                        {booking.notes ? <p style={{ margin: '8px 0 0', fontSize: 12, color: '#9b8f85' }}>{booking.notes}</p> : null}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {STATUS_FLOW.filter((status) => status !== booking.status).slice(0, 2).map((status) => (
                          <button key={status} type="button" onClick={() => updateStatus(booking, status)} style={{ border: '1px solid #d8d1c7', background: '#fff', color: '#1c2b27', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {status}
                          </button>
                        ))}
                        {booking.status !== 'Completed' ? (
                          <button type="button" onClick={() => updateStatus(booking, 'Completed')} style={{ border: 'none', background: '#ecfdf5', color: '#15803d', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        ) : null}
                        <button type="button" onClick={() => handleDelete(booking._id)} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
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
