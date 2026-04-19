import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Phone, MapPin, Star, Trash2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/FormElements';
import { CategorySelect } from '../components/ui/CategorySelect';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { vendorAPI } from '../services/api';
import { toast } from 'sonner';


const EMPTY_FORM = { name:'', category:'', phone:'', city:'', rating:5, notes:'' };
const CATEGORIES = ['Plumber','Electrician','AC Mechanic','Carpenter','Painter','Pest Control','Cleaning Service','RO Technician','Inverter/Battery','Gas Agency','Security','General Handyman'];

const SPEC_COLORS = {
  'Plumber':'#457b9d','Electrician':'#2a9d8f','AC Mechanic':'#c47f4e',
  'Carpenter':'#6b4c3b','Painter':'#9b2226','Pest Control':'#7f8c8d',
  'Cleaning Service':'#52796f','RO Technician':'#b08968','Inverter/Battery':'#1d3557',
  'Gas Agency':'#e76f51','Security':'#4a4e69','General Handyman':'#6c757d',
};

const StarRating = ({ rating, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange && onChange(n)}
        style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 2 }}>
        <Star size={18} fill={n <= rating ? '#c47f4e' : 'none'} color={n <= rating ? '#c47f4e' : '#d8d1c7'} />
      </button>
    ))}
  </div>
);

export const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filterSpec, setFilterSpec] = useState('all');

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorAPI.getAll();
      setVendors(res.data.data || []);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) { toast.error('Please enter vendor name'); return; }
    if (!formData.phone) { toast.error('Please enter phone number'); return; }
    if (!formData.category) { toast.error('Please select a category'); return; }
    try {
      if (editingVendor) await vendorAPI.update(editingVendor._id, formData);
      else await vendorAPI.create(formData);
      toast.success(editingVendor ? 'Vendor updated!' : 'Vendor added!');
      fetchVendors();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save vendor');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await vendorAPI.delete(id);
      toast.success('Vendor deleted');
      fetchVendors();
    } catch {
      toast.error('Failed to delete vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({ name: vendor.name, category: vendor.category || '', phone: vendor.phone || '', city: vendor.city || '', rating: vendor.rating || 5, notes: vendor.notes || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingVendor(null); setShowForm(false); };

  const filtered = filterSpec === 'all' ? vendors : vendors.filter(v => v.category === filterSpec);

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
                Your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Vendors</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>Manage your trusted service providers.</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { resetForm(); setShowForm(!showForm); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: showForm && !editingVendor ? '#6b7565' : '#1c2b27', color: '#fff', padding: '12px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background 0.2s', fontFamily: 'inherit' }}>
              <Plus size={16} />
              {showForm && !editingVendor ? 'Cancel' : 'Add Vendor'}
            </motion.button>
          </motion.div>

          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ marginBottom: 32 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0e9e0', background: 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)' }}>
                    <h2 style={{ color: '#f5ede4', fontSize: 18, fontWeight: 700, margin: 0 }}>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                    <p style={{ color: 'rgba(245,237,228,0.6)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>{editingVendor ? 'Update vendor information' : 'Add a new service provider to your network'}</p>
                  </div>
                  <div style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      <div><Label htmlFor="name">Vendor Name *</Label><Input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. ABC Plumbing" className="mt-2" /></div>
                      <div><Label htmlFor="phone">Phone Number *</Label><Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" className="mt-2" /></div>
                      <div><Label htmlFor="category">Category *</Label><CategorySelect id="category" value={formData.category} onChange={handleChange} categories={CATEGORIES} /></div>
                      <div><Label htmlFor="city">City</Label><Input id="city" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="mt-2" /></div>
                      <div>
                        <Label>Rating</Label>
                        <div className="mt-2">
                          <StarRating rating={parseInt(formData.rating)} onChange={n => setFormData(prev => ({ ...prev, rating: n }))} />
                        </div>
                      </div>
                      <div><Label htmlFor="notes">Notes</Label><Input id="notes" type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional details..." className="mt-2" /></div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                        <button type="button" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#c47f4e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>{editingVendor ? 'Update Vendor' : 'Add Vendor'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ marginBottom: 28 }}>
            <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ maxWidth: 240, width: '100%', minHeight: 44, borderRadius: 10, border: '1.5px solid #d8d1c7', padding: '10px 14px', fontFamily: 'inherit', background: '#fff', color: '#1c2b27' }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </motion.div>

          {/* Vendors Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '56px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f2ebe1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={24} color="#6b7565" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: '0 0 6px' }}>No vendors yet</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Add your first trusted service provider.</p>
              <button onClick={() => setShowForm(true)} style={{ padding: '11px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Add Vendor</button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map((vendor, idx) => {
                const accent = SPEC_COLORS[vendor.category] || '#1c2b27';
                return (
                  <motion.div key={vendor._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: idx * 0.08, duration: 0.35 }}>
                    <motion.div whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }} transition={{ duration: 0.2 }}
                      style={{ background: '#fff', borderRadius: 18, border: '1px solid #e4ddd4', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
                      <div style={{ height: 4, background: accent }} />
                      <div style={{ padding: '20px 22px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1c2b27', margin: '0 0 4px' }}>{vendor.name}</h3>
                            {vendor.category && (
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${accent}18`, color: accent }}>
                                {vendor.category}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(vendor)}
                              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f2ebe1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Edit2 size={13} color="#6b7565" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(vendor._id)}
                              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={13} color="#dc2626" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                          {vendor.phone && (
                            <a href={`tel:${vendor.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7565', textDecoration: 'none' }}
                              onMouseEnter={e => e.currentTarget.style.color = accent}
                              onMouseLeave={e => e.currentTarget.style.color = '#6b7565'}>
                              <Phone size={13} color={accent} /> {vendor.phone}
                            </a>
                          )}
                          {vendor.city && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7565' }}>
                              <MapPin size={13} color="#9b8f85" /> {vendor.city}
                            </div>
                          )}
                        </div>

                        {vendor.rating && (
                          <div style={{ marginBottom: 12 }}>
                            <StarRating rating={vendor.rating} />
                          </div>
                        )}

                        {vendor.notes && (
                          <p style={{ fontSize: 12, color: '#6b7565', margin: 0, paddingTop: 12, borderTop: '1px solid #f2ebe1', lineHeight: 1.5 }}>{vendor.notes}</p>
                        )}
                      </div>
                    </motion.div>
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
