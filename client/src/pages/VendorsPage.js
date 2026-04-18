import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Phone, MapPin, Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label, Select } from '../components/ui/FormElements';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { vendorAPI } from '../services/api';
import { toast } from 'sonner';

const EMPTY_FORM = { name:'', specialization:'', phone:'', city:'', rating:5, notes:'' };
const SPECIALIZATIONS = ['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety','Generator/Inverter','Gas/LPG','RO/Water Purifier','Security','Painting','Carpentry','Masonry'];

export const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

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
    setFormData({ name: vendor.name, specialization: vendor.specialization || '', phone: vendor.phone || '', city: vendor.city || '', rating: vendor.rating || 5, notes: vendor.notes || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingVendor(null); setShowForm(false); };

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
                Your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Vendors</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>
                Manage your trusted service providers
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: showForm && !editingVendor ? '#6b7565' : '#1c2b27', color: '#fff',
                padding: '12px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'background 0.2s',
              }} className="gap-2">
                <Plus className="w-5 h-5" />
                {showForm && !editingVendor ? 'Cancel' : 'Add Vendor'}
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
                    <CardTitle style={{ color: '#1c2b27', fontSize: 20, fontWeight: 700 }}>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</CardTitle>
                    <CardDescription style={{ color: '#6b7565', marginTop: 8 }}>{editingVendor ? 'Update vendor information' : 'Add a new service provider'}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: 28, paddingTop: 0 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                        <Label htmlFor="name">Vendor Name *</Label>
                        <Input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. ABC Plumbing" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        <Label htmlFor="specialization">Specialization</Label>
                        <Select id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} className="mt-2">
                          <option value="">Select Specialization</option>
                          {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                        <Label htmlFor="rating">Rating (1-5)</Label>
                        <Input id="rating" type="number" name="rating" value={formData.rating} onChange={handleChange} min="1" max="5" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" type="text" name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional details..." className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16 }}>
                        <Button type="button" variant="secondary" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</Button>
                        <Button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{editingVendor ? 'Update Vendor' : 'Add Vendor'}</Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vendors Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : vendors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1c2b27', margin: '0 0 8px' }}>No vendors yet</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Add your first vendor above</p>
              <Button size="lg" onClick={() => setShowForm(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1c2b27', color: '#fff',
                padding: '12px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }} className="gap-2">
                <Plus className="w-5 h-5" /> Add Vendor
              </Button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {vendors.map((vendor, idx) => (
                <motion.div
                  key={vendor._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                          {vendor.specialization && (
                            <p className="text-sm text-blue-600 font-semibold mt-1">{vendor.specialization}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(vendor._id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${vendor.phone}`} className="hover:text-blue-600">{vendor.phone}</a>
                        </div>
                      )}

                      {vendor.city && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          {vendor.city}
                        </div>
                      )}

                      {vendor.rating && (
                        <div className="flex items-center gap-2 mb-4">
                          {[...Array(vendor.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{vendor.rating}/5</span>
                        </div>
                      )}

                      {vendor.notes && (
                        <p className="text-sm text-gray-600 border-t border-gray-100 pt-4">{vendor.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};
