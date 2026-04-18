import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tasksForProp, setTasksForProp] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState(EMPTY_FORM);

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
      toast.success('Record added!');
      fetchInitial();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await recordAPI.delete(id);
      toast.success('Record deleted');
      fetchInitial();
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setShowForm(false); };

  let filtered = records;
  if (filterProperty !== 'all') filtered = filtered.filter(r => r.propertyId?._id === filterProperty);
  if (filterCategory !== 'all') filtered = filtered.filter(r => r.category === filterCategory);

  const totalFiltered = filtered.reduce((sum, r) => sum + (r.actualCost || 0), 0);

  return (
    <PageTransition>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f2ebe1', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
        <Navbar />
        <main style={{ flex: 1, padding: '48px 48px 64px', overflowY: 'auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  fontWeight: 800,
                  color: '#1c2b27',
                  margin: 0,
                  lineHeight: 1.1,
                }}>
                  Maintenance <em style={{ color: '#c47f4e', fontStyle: 'italic' }}>History</em>
                </h1>
                <p style={{ color: '#6b7565', fontSize: 15, marginTop: 8 }}>
                  Log all your home service records
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
                  {showForm ? 'Cancel' : 'Log Service'}
                </Button>
              </motion.div>
            </div>
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
                <Card style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4ddd4', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                  <CardHeader style={{ padding: 28 }}>
                    <CardTitle style={{ color: '#1c2b27', fontSize: 20, fontWeight: 700 }}>Log Service Record</CardTitle>
                    <CardDescription style={{ color: '#6b7565', marginTop: 8 }}>Add a new maintenance or service record</CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: 28, paddingTop: 0 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                        <Label htmlFor="propertyId">Property *</Label>
                        <Select id="propertyId" name="propertyId" value={formData.propertyId} onChange={handleChange} required className="mt-2">
                          <option value="">Select Property</option>
                          {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <Label htmlFor="serviceDate">Service Date *</Label>
                        <Input id="serviceDate" type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} required className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        <Label htmlFor="category">Category</Label>
                        <Select id="category" name="category" value={formData.category} onChange={handleChange} className="mt-2">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Label htmlFor="actualCost">Actual Cost (₹) *</Label>
                        <Input id="actualCost" type="number" name="actualCost" value={formData.actualCost} onChange={handleChange} required placeholder="500" className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="sm:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Details about the service..." className="mt-2" />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Label htmlFor="paymentMode">Payment Mode</Label>
                        <Select id="paymentMode" name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="mt-2">
                          {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                        <Label htmlFor="vendorId">Vendor</Label>
                        <Select id="vendorId" name="vendorId" value={formData.vendorId} onChange={handleChange} className="mt-2">
                          <option value="">Select Vendor</option>
                          {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </Select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16 }}>
                        <Button type="button" variant="secondary" onClick={resetForm} style={{ padding: '10px 24px', borderRadius: 10, background: '#e4ddd4', color: '#1c2b27', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancel</Button>
                        <Button type="submit" style={{ padding: '10px 24px', borderRadius: 10, background: '#1c2b27', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Log Service</Button>
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
            <Select value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)} style={{ maxWidth: '250px' }}>
              <option value="all">All Properties</option>
              {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </Select>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ maxWidth: '250px' }}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </motion.div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 32, textAlign: 'right' }}
          >
            <p style={{ fontSize: 16, color: '#6b7565', fontWeight: 600, margin: 0 }}>Total Spent: <span style={{ fontSize: 28, color: '#1c2b27', fontWeight: 800 }}>₹{totalFiltered.toLocaleString('en-IN')}</span></p>
          </motion.div>

          {/* Records List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#fff', borderRadius: 16, padding: '48px 32px', textAlign: 'center', border: '2px dashed #d8d1c7' }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1c2b27', margin: '0 0 8px' }}>No records found</p>
              <p style={{ fontSize: 14, color: '#6b7565', margin: 0 }}>Log a service to get started</p>
            </motion.div>
          ) : (
            <AnimatedList
              items={filtered}
              children={(record) => (
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{record.category}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(record.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {record.propertyId && <p className="text-sm text-gray-500 mt-1">📍 {record.propertyId.name}</p>}
                        {record.description && <p className="text-sm text-gray-600 mt-2">{record.description}</p>}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-blue-600 text-xl">₹{record.actualCost?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-500 mt-1">{record.paymentMode}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record._id)} className="ml-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};
