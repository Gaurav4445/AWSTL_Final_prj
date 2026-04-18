// src/pages/PropertiesPage.js
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { PropertyCard } from '../components/PropertyCard';
import { propertyAPI } from '../services/api';

export const PropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    propertyType: 'Apartment',
    squareFeet: '',
    description: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll();
      setProperties(response.data.data);
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await propertyAPI.update(editingProperty._id, formData);
      } else {
        await propertyAPI.create(formData);
      }
      fetchProperties();
      resetForm();
    } catch (err) {
      setError('Failed to save property');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this property?')) {
      try {
        await propertyAPI.delete(id);
        fetchProperties();
      } catch (err) {
        setError('Failed to delete property');
      }
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      city: property.city,
      propertyType: property.propertyType,
      squareFeet: property.squareFeet || '',
      description: property.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '', address: '', city: '', propertyType: 'Apartment',
      squareFeet: '', description: '',
    });
    setEditingProperty(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Properties</h1>
            <p className="text-gray-600 mt-2">Manage all your properties</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add Property'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p>{error}</p>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Property Name" value={formData.name} onChange={handleInputChange} required className="border p-3 rounded-lg" />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required className="border p-3 rounded-lg" />
              <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleInputChange} required rows="3" className="md:col-span-2 border p-3 rounded-lg" />
              <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="border p-3 rounded-lg">
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
              <input type="number" name="squareFeet" placeholder="Square Feet" value={formData.squareFeet} onChange={handleInputChange} className="border p-3 rounded-lg" />
              <textarea name="description" placeholder="Description (optional)" value={formData.description} onChange={handleInputChange} rows="2" className="md:col-span-2 border p-3 rounded-lg" />

              <div className="md:col-span-2 flex gap-4 justify-end">
                <button type="button" onClick={resetForm} className="px-6 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="bg-orange-600 text-white px-6 py-2 rounded-lg">
                  {editingProperty ? 'Update' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? <p>Loading properties...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard 
                key={property._id} 
                property={property} 
                onDelete={handleDelete} 
                onEdit={handleEdit} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};