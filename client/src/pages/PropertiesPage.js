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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your homes and apartments</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition">
            <Plus className="w-4 h-4" />
            {showForm && !editingProperty ? 'Cancel' : 'Add Property'}
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
            <h2 className="text-lg font-bold text-gray-800 mb-5">{editingProperty ? 'Edit Property' : '➕ Add New Property'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Property Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. My Home, Flat 201"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Society / Building Name</label>
                <input type="text" name="societyName" value={formData.societyName} onChange={handleChange} placeholder="e.g. Lodha Palava, DLF City"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Full Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} placeholder="Flat no., Wing, Street, Area"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai, Pune, Delhi..."
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">State</label>
                <select name="state" value={formData.state} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} placeholder="400001"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Property Type</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white">
                  {['Apartment','Independent House','Villa','Studio','Row House','Builder Floor','Bungalow'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">BHK Type</label>
                <select name="bhkType" value={formData.bhkType} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white">
                  {['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','4+ BHK'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Area (sq ft)</label>
                <input type="number" name="squareFeet" value={formData.squareFeet} onChange={handleChange} placeholder="1200"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Floor Number</label>
                <input type="number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} placeholder="3"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition">
                  {editingProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <p className="text-gray-500">No properties yet. Add your first property above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(p => (
              <PropertyCard key={p._id} property={p} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};