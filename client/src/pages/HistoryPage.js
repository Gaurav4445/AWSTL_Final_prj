import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Filter, IndianRupee } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { TaskCard } from '../components/TaskCard';
import { recordAPI, propertyAPI, taskAPI, vendorAPI } from '../services/api';

const CATEGORIES = ['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety','Generator/Inverter','Gas/LPG','RO/Water Purifier','Security'];
const PAYMENT_MODES = ['Cash','UPI','NEFT/RTGS','Cheque','Credit Card','Debit Card'];
const EMPTY_FORM = { propertyId:'', taskId:'', vendorId:'', serviceDate:'', category:'General', description:'', actualCost:'', paymentMode:'Cash', upiTransactionId:'', warrantyMonths:'', rating:'', notes:'', technician:{ name:'', phone:'', company:'' } };

export const HistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tasksForProp, setTasksForProp] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
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
    e.preventDefault(); setError('');
    if (!formData.propertyId) { setError('Please select a property'); return; }
    if (!formData.serviceDate) { setError('Please select service date'); return; }
    if (!formData.actualCost) { setError('Please enter actual cost'); return; }
    try {
      const payload = { ...formData, actualCost: parseFloat(formData.actualCost), warrantyMonths: parseInt(formData.warrantyMonths) || 0, rating: formData.rating ? parseInt(formData.rating) : undefined };
      if (!payload.taskId) delete payload.taskId;
      if (!payload.vendorId) delete payload.vendorId;
      if (!payload.rating) delete payload.rating;
      if (!payload.upiTransactionId) delete payload.upiTransactionId;
      await recordAPI.create(payload);
      fetchInitial(); resetForm();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save record'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await recordAPI.delete(id); fetchInitial(); }
    catch { setError('Failed to delete record'); }
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setShowForm(false); };

  let filtered = records;
  if (filterProperty !== 'all') filtered = filtered.filter(r => r.propertyId?._id === filterProperty);
  if (filterCategory !== 'all') filtered = filtered.filter(r => r.category === filterCategory);

  const totalFiltered = filtered.reduce((sum, r) => sum + (r.actualCost || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Maintenance History</h1>
            <p className="text-gray-500 mt-1 text-sm">Log all your home service records</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'Log Service'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-base font-bold text-gray-800 mb-5">Log New Maintenance Service</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Property *</label>
                <select name="propertyId" value={formData.propertyId} onChange={handleChange} required
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.name} — {p.city}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Service Date *</label>
                <input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} required
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Task (Optional)</label>
                <select name="taskId" value={formData.taskId} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option value="">Select Task</option>
                  {tasksForProp.map(t => <option key={t._id} value={t._id}>{t.name} — {t.category}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Actual Cost (₹) *</label>
                <input type="number" name="actualCost" value={formData.actualCost} onChange={handleChange} required step="0.01" placeholder="500"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {formData.paymentMode === 'UPI' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">UPI Transaction ID</label>
                  <input type="text" name="upiTransactionId" value={formData.upiTransactionId} onChange={handleChange} placeholder="e.g. 123456789012"
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description / Work Done</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                  placeholder="What maintenance was done?"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              {/* Kaarigar (Technician) details */}
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-gray-600 mb-2">Technician / Kaarigar Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" name="technician.name" value={formData.technician.name} onChange={handleChange}
                    placeholder="Kaarigar Name"
                    className="border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
                  <input type="tel" name="technician.phone" value={formData.technician.phone} onChange={handleChange}
                    placeholder="Mobile Number"
                    className="border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
                  <input type="text" name="technician.company" value={formData.technician.company} onChange={handleChange}
                    placeholder="Company (optional)"
                    className="border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>

              {/* Saved Vendor */}
              {vendors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Or pick from Kaarigar Book</label>
                  <select name="vendorId" value={formData.vendorId} onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                    <option value="">Select Saved Kaarigar</option>
                    {vendors.map(v => <option key={v._id} value={v._id}>{v.name} — {v.category}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Warranty (months)</label>
                <input type="number" name="warrantyMonths" value={formData.warrantyMonths} onChange={handleChange} placeholder="0"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Rating (1–5)</label>
                <select name="rating" value={formData.rating} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option value="">No Rating</option>
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Below Average</option>
                  <option value="1">⭐ Poor</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters + Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-400">
            <option value="all">All Properties</option>
            {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-400">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {filtered.length > 0 && (
            <div className="sm:ml-auto flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-xl">
              <IndianRupee className="w-4 h-4" />
              {totalFiltered.toLocaleString('en-IN')} total
            </div>
          )}
        </div>

        {/* Records */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-48 animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No records found</p>
            <p className="text-gray-400 text-sm mt-1">Log a service using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(record => (
              <TaskCard key={record._id} record={record} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};