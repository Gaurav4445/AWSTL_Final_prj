import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { propertyAPI } from '../services/api';

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
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyAPI.getAll();
      setProperties(res.data.data);
    } catch { setError('Failed to load properties'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editingProperty) await propertyAPI.update(editingProperty._id, formData);
      else await propertyAPI.create(formData);
      fetchProperties(); resetForm();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save property'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property and all its data?')) return;
    try { await propertyAPI.delete(id); fetchProperties(); }
    catch { setError('Failed to delete property'); }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({ name:property.name, address:property.address, city:property.city, state:property.state||'', pincode:property.pincode||'', propertyType:property.propertyType, bhkType:property.bhkType||'2 BHK', squareFeet:property.squareFeet||'', floorNumber:property.floorNumber||'', societyName:property.societyName||'', description:property.description||'' });
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingProperty(null); setShowForm(false); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-2 text-base">Manage your homes and apartments</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg">
            <Plus className="w-5 h-5" />
            {showForm && !editingProperty ? 'Cancel' : 'Add Property'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingProperty ? 'Edit Property' : '➕ Add New Property'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Property Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. My Home, Flat 201"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Society / Building Name</label>
                <input type="text" name="societyName" value={formData.societyName} onChange={handleChange} placeholder="e.g. Lodha Palava, DLF City"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} placeholder="Flat no., Wing, Street, Area"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai, Pune, Delhi..."
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <select name="state" value={formData.state} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} placeholder="400001"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition">
                  {['Apartment','Independent House','Villa','Studio','Row House','Builder Floor','Bungalow'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">BHK Type</label>
                <select name="bhkType" value={formData.bhkType} onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white transition">
                  {['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','4+ BHK'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area (sq ft)</label>
                <input type="number" name="squareFeet" value={formData.squareFeet} onChange={handleChange} placeholder="1200"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Floor Number</label>
                <input type="number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} placeholder="3"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-semibold transition">
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-700 font-semibold text-lg">No properties yet. Add your first property above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard key={p._id} property={p} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};