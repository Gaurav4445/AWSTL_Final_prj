import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Trash2, Edit2, Phone, Star, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { vendorAPI } from '../services/api';

const CATEGORIES = ['Plumber','Electrician','AC Mechanic','Carpenter','Painter','Pest Control','Cleaning Service','RO Technician','Inverter/Battery','Gas Agency','Security','General Handyman'];
const EMPTY_FORM = { name:'', phone:'', altPhone:'', category:'Plumber', city:'', area:'', upiId:'', rating:'3', notes:'' };

const categoryEmoji = { 'Plumber':'🔧','Electrician':'⚡','AC Mechanic':'❄️','Carpenter':'🪚','Painter':'🖌️','Pest Control':'🐛','Cleaning Service':'🧹','RO Technician':'💧','Inverter/Battery':'🔋','Gas Agency':'🔥','Security':'🔐','General Handyman':'🛠️' };

export const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await vendorAPI.getAll();
      setVendors(res.data.data);
    } catch { setError('Failed to load kaarigar list'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingVendor) await vendorAPI.update(editingVendor._id, { ...formData, rating: parseInt(formData.rating) });
      else await vendorAPI.create({ ...formData, rating: parseInt(formData.rating) });
      fetchVendors(); resetForm();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this kaarigar?')) return;
    try { await vendorAPI.delete(id); fetchVendors(); }
    catch { setError('Failed to delete'); }
  };

  const handleEdit = (v) => {
    setEditingVendor(v);
    setFormData({ name:v.name, phone:v.phone, altPhone:v.altPhone||'', category:v.category, city:v.city||'', area:v.area||'', upiId:v.upiId||'', rating:String(v.rating||3), notes:v.notes||'' });
    setShowForm(true); window.scrollTo({ top:0, behavior:'smooth' });
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingVendor(null); setShowForm(false); };

  let filtered = vendors;
  if (filterCat !== 'all') filtered = filtered.filter(v => v.category === filterCat);
  if (search) filtered = filtered.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.area?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kaarigar Book</h1>
            <p className="text-gray-500 mt-1 text-sm">Your trusted local service providers</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
            <Plus className="w-4 h-4" />
            {showForm && !editingVendor ? 'Cancel' : 'Add Kaarigar'}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">{editingVendor ? 'Edit Kaarigar' : 'Add New Kaarigar'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ramesh Kumar"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Mobile Number *</label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-600 text-sm">🇮🇳 +91</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength={10} placeholder="98765 43210"
                    className="flex-1 border border-gray-200 px-4 py-2.5 rounded-r-xl focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Alternate Number</label>
                <input type="tel" name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Optional"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Service Type *</label>
                <select name="category" value={formData.category} onChange={handleChange} required
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Area / Locality</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Andheri West, Koramangala..."
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">UPI ID</label>
                <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="ramesh@upi"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Your Rating</label>
                <select name="rating" value={formData.rating} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Good</option>
                  <option value="3">⭐⭐⭐ Average</option>
                  <option value="2">⭐⭐ Below Average</option>
                  <option value="1">⭐ Poor</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Reliable, comes on time, charges fairly..."
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition">
                  {editingVendor ? 'Update' : 'Save Kaarigar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or area..."
            className="flex-1 border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="border border-gray-200 px-4 py-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-400">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Vendor Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No kaarigar saved yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your trusted plumbers, electricians, and service providers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {categoryEmoji[v.category] || '🛠️'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{v.name}</h3>
                      <p className="text-xs text-orange-600 font-medium">{v.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(v)} className="p-1.5 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(v._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= v.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{v.rating}/5</span>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 mb-3">
                  <a href={`tel:+91${v.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-600 transition">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    +91 {v.phone}
                  </a>
                  {v.altPhone && (
                    <a href={`tel:+91${v.altPhone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-orange-600 transition">
                      <Phone className="w-3 h-3 text-gray-300" />
                      +91 {v.altPhone}
                    </a>
                  )}
                </div>

                {/* Location + UPI */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {v.area && <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">📍 {v.area}</span>}
                  {v.city && !v.area && <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">📍 {v.city}</span>}
                  {v.upiId && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">📱 {v.upiId}</span>}
                </div>

                {v.notes && <p className="text-xs text-gray-400 mt-2 italic">"{v.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};