import React, { useState, useEffect } from 'react';
import { Plus, Building2, Home, Warehouse, DollarSign, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label, Textarea, Select } from '../components/ui/FormElements';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/Animations';
import { propertyAPI } from '../services/api';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
];

const EMPTY_FORM = { name:'', address:'', city:'', state:'', pincode:'', propertyType:'Apartment', bhkType:'2 BHK', squareFeet:'', floorNumber:'', societyName:'', description:'' };

export const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyAPI.getAll();
      setProperties(res.data.data);
    } catch {
      toast.error('Failed to load properties');
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) await propertyAPI.update(editingProperty._id, formData);
      else await propertyAPI.create(formData);
      toast.success(editingProperty ? 'Property updated!' : 'Property added!');
      fetchProperties();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save property');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property and all its data?')) return;
    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch {
      toast.error('Failed to delete property');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({ name:property.name, address:property.address, city:property.city, state:property.state||'', pincode:property.pincode||'', propertyType:property.propertyType, bhkType:property.bhkType||'2 BHK', squareFeet:property.squareFeet||'', floorNumber:property.floorNumber||'', societyName:property.societyName||'', description:property.description||'' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingProperty(null); setShowForm(false); };

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
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
                Your <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>Properties</em>
              </h1>
              <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>
                Manage all your homes in one place.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: showForm && !editingProperty ? '#6b7565' : 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)', color: '#fff',
                padding: '12px 24px', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 16px rgba(28,43,39,0.3)',
                transition: 'all 0.2s',
              }} className="gap-2">
                <Plus className="w-5 h-5" />
                {showForm && !editingProperty ? 'Cancel' : 'Add Property'}
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
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 32 }}
              >
                <Card className="shadow-lg" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4' }}>
                  <CardHeader style={{ padding: 28, borderBottom: '1px solid #f0e9e0', background: 'linear-gradient(135deg, #1c2b27 0%, #2d4a3e 100%)' }}>
                    <CardTitle style={{ color: '#f5ede4', fontSize: 20, fontWeight: 700 }}>{editingProperty ? 'Edit Property' : 'Add New Property'}</CardTitle>
                    <CardDescription style={{ color: 'rgba(245,237,228,0.7)', marginTop: 8 }}>{editingProperty ? 'Update your property details' : 'Add a new home or apartment'}</CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: 28, paddingTop: 0 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                        <Label htmlFor="name">Property Name *</Label>
                        <Input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. My Home, Flat 201" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <Label htmlFor="societyName">Society / Building Name</Label>
                        <Input id="societyName" type="text" name="societyName" value={formData.societyName} onChange={handleChange} placeholder="e.g. Lodha Palava" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="sm:col-span-2">
                        <Label htmlFor="address">Full Address *</Label>
                        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={2} placeholder="Flat no., Wing, Street, Area" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai, Pune, Delhi..." className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                        <Label htmlFor="state">State</Label>
                        <Select id="state" name="state" value={formData.state} onChange={handleChange} className="mt-2">
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} placeholder="400001" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleChange} className="mt-2">
                          {['Apartment','Independent House','Villa','Studio','Row House','Builder Floor','Bungalow'].map(t => <option key={t}>{t}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <Label htmlFor="bhkType">BHK Type</Label>
                        <Select id="bhkType" name="bhkType" value={formData.bhkType} onChange={handleChange} className="mt-2">
                          {['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','4+ BHK'].map(t => <option key={t}>{t}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                        <Label htmlFor="squareFeet">Area (sq ft)</Label>
                        <Input id="squareFeet" type="number" name="squareFeet" value={formData.squareFeet} onChange={handleChange} placeholder="1200" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <Label htmlFor="floorNumber">Floor Number</Label>
                        <Input id="floorNumber" type="number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} placeholder="3" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16 }}>
                        <Button type="button" variant="secondary" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</Button>
                        <Button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{editingProperty ? 'Update Property' : 'Add Property'}</Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Properties List */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : properties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '64px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1c2b27', margin: '0 0 8px' }}>No properties yet</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: '0 0 24px' }}>Add your first property above to get started</p>
              <Button size="lg" onClick={() => setShowForm(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1c2b27', color: '#fff',
                padding: '12px 22px', borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }} className="gap-2">
                <Plus className="w-5 h-5" /> Add Property
              </Button>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {properties.map((p, idx) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <PropertyCard property={p} onDelete={handleDelete} onEdit={handleEdit} />
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};
