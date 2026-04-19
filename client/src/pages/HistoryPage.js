import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Filter, TrendingDown, Calendar, Tag, CreditCard, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label, Textarea, Select } from '../components/ui/FormElements';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition, AnimatedList } from '../components/Animations';
import { recordAPI, propertyAPI, taskAPI, vendorAPI } from '../services/api';
import { toast } from 'sonner';

const CATEGORIES = ['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety','Generator/Inverter','Gas/LPG','RO/Water Purifier','Security'];
const PAYMENT_MODES = ['Cash','UPI','NEFT/RTGS','Cheque','Credit Card','Debit Card'];
const EMPTY_FORM = { propertyId:'', taskId:'', vendorId:'', serviceDate:'', category:'General', description:'', actualCost:'', paymentMode:'Cash', upiTransactionId:'', warrantyMonths:'', rating:'', notes:'', technician:{ name:'', phone:'', company:'' } };

const CATEGORY_DOTS = {
  'AC/Cooling':'#457b9d','Water Systems':'#2a9d8f','Electrical':'#c47f4e',
  'Plumbing':'#6b4c3b','Pest Control':'#9b2226','General':'#7f8c8d',
  'Cleaning':'#52796f','Safety':'#b08968','Generator/Inverter':'#1d3557',
  'Gas/LPG':'#e76f51','RO/Water Purifier':'#2a9d8f','Security':'#4a4e69',
};

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tasksForProp, setTasksForProp] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchInitial(); }, []);

  useEffect(() => {
    if (formData.propertyId) {
      taskAPI.getByProperty(formData.propertyId).then(r => setTasksForProp(r.data.data || [])).catch(() => setTasksForProp([]));
    } else setTasksForProp([]);
  }, [formData.propertyId]);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [recRes, propRes, venRes] = await Promise.all([recordAPI.getAll(), propertyAPI.getAll(), vendorAPI.getAll()]);
      setRecords(recRes.data.data || []);
      setProperties(propRes.data.data || []);
      setVendors(venRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('technician.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, technician: { ...prev.technician, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyId) { toast.error('Please select a property'); return; }
    if (!formData.serviceDate) { toast.error('Please select service date'); return; }
    if (!formData.actualCost) { toast.error('Please enter actual cost'); return; }
    try {
      const payload = { ...formData, actualCost: parseFloat(formData.actualCost), warrantyMonths: parseInt(formData.warrantyMonths) || 0, rating: formData.rating ? parseInt(formData.rating) : undefined };
      if (!payload.taskId) delete payload.taskId;
      if (!payload.vendorId) delete payload.vendorId;
      if (!payload.rating) delete payload.rating;
      if (!payload.upiTransactionId) delete payload.upiTransactionId;
      await recordAPI.create(payload);
      toast.success('Service record logged successfully');
      fetchInitial();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    setDeleting(id);
    try {
      await recordAPI.delete(id);
      toast.success('Record deleted');
      fetchInitial();
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setShowForm(false); };

  let filtered = records;
  if (filterProperty !== 'all') filtered = filtered.filter(r => r.propertyId?._id === filterProperty);
  if (filterCategory !== 'all') filtered = filtered.filter(r => r.category === filterCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(r =>
      r.description?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.propertyId?.name?.toLowerCase().includes(q)
    );
  }

  const totalFiltered = filtered.reduce((sum, r) => sum + (r.actualCost || 0), 0);
  const avgCost = filtered.length ? Math.round(totalFiltered / filtered.length) : 0;

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}
          >
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: '#1c2b27', margin: 0, lineHeight: 1.1 }}>
                Maintenance <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>History</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>A complete log of every service done at your home.</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(!showForm)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: showForm ? '#6b7565' : '#1c2b27', color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background 0.2s', fontFamily: 'inherit' }}>
              <Plus size={16} />
              {showForm ? 'Cancel' : 'Log Service'}
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Total Records', value: records.length, dark: true },
              { label: 'Filtered Records', value: filtered.length },
              { label: 'Total Spent', value: `\u20B9${totalFiltered.toLocaleString('en-IN')}` },
              { label: 'Avg. Per Service', value: `\u20B9${avgCost.toLocaleString('en-IN')}` },
            ].map(({ label, value, dark }) => (
              <div key={label} style={{ background: dark ? '#1c2b27' : '#fff', border: dark ? 'none' : '1px solid #e4ddd4', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: dark ? 'rgba(245,237,228,0.55)' : '#6b7565', textTransform: 'uppercase', margin: '0 0 8px' }}>{label}</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: dark ? '#f5ede4' : '#1c2b27', margin: 0, fontFamily: "'Playfair Display', serif" }}>{value}</p>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0e9e0', background: 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)' }}>
                    <h2 style={{ color: '#f5ede4', fontSize: 18, fontWeight: 700, margin: 0 }}>Log Service Record</h2>
                    <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>Add a new maintenance or service entry</p>
                  </div>
                  <div style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      <div><Label htmlFor="propertyId">Property *</Label><Select id="propertyId" name="propertyId" value={formData.propertyId} onChange={handleChange} required className="mt-2"><option value="">Select Property</option>{properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</Select></div>
                      <div><Label htmlFor="serviceDate">Service Date *</Label><Input id="serviceDate" type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} required className="mt-2" /></div>
                      <div><Label htmlFor="category">Category</Label><Select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-2">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></div>
                      <div><Label htmlFor="actualCost">Actual Cost (₹) *</Label><Input id="actualCost" type="number" name="actualCost" value={formData.actualCost} onChange={handleChange} required placeholder="500" className="mt-2" /></div>
                      <div><Label htmlFor="paymentMode">Payment Mode</Label><Select id="paymentMode" name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="mt-2">{PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}</Select></div>
                      <div><Label htmlFor="vendorId">Vendor</Label><Select id="vendorId" name="vendorId" value={formData.vendorId} onChange={handleChange} className="mt-2"><option value="">Select Vendor</option>{vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}</Select></div>
                      <div style={{ gridColumn: '1 / -1' }}><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Details about the service..." className="mt-2" /></div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                        <button type="button" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#c47f4e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Log Service</button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: 200, maxWidth: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7565' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search records..."
                style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1.5px solid #d8d1c7', borderRadius: 10, fontSize: 14, color: '#1c2b27', background: '#fff', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <Select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} style={{ maxWidth: '220px' }}>
              <option value="all">All Properties</option>
              {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </Select>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ maxWidth: '220px' }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            {(filterProperty !== 'all' || filterCategory !== 'all' || searchQuery) && (
              <button onClick={() => { setFilterProperty('all'); setFilterCategory('all'); setSearchQuery(''); }}
                style={{ padding: '9px 16px', borderRadius: 10, background: '#e4ddd4', color: '#6b7565', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
          </motion.div>

          {/* Records */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '56px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2ebe1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Calendar size={24} color="#6b7565" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: '0 0 6px' }}>No records found</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Log a service to get started tracking your home maintenance.</p>
              <button onClick={() => setShowForm(true)}
                style={{ padding: '11px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                Log First Service
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((record, idx) => {
                const dot = CATEGORY_DOTS[record.category] || '#7f8c8d';
                return (
                  <motion.div key={record._id} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: idx * 0.04, duration: 0.3 }}>
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e4ddd4', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: dot, flexShrink: 0, boxShadow: `0 0 0 3px ${dot}22` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: '#1c2b27' }}>{record.category}</span>
                          {record.propertyId && (
                            <span style={{ fontSize: 12, color: '#6b7565', background: '#f2ebe1', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>{record.propertyId.name}</span>
                          )}
                        </div>
                        {record.description && <p style={{ fontSize: 13, color: '#6b7565', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.description}</p>}
                        <p style={{ fontSize: 12, color: '#9b8f85', margin: '4px 0 0' }}>
                          {new Date(record.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: '#1c2b27', margin: 0, fontFamily: "'Playfair Display', serif" }}>₹{record.actualCost?.toLocaleString('en-IN')}</p>
                        <span style={{ fontSize: 11, color: '#6b7565', background: '#f2ebe1', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>{record.paymentMode}</span>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(record._id)} disabled={deleting === record._id}
                        style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: deleting === record._id ? 0.5 : 1 }}>
                        <Trash2 size={14} />
                      </motion.button>
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
