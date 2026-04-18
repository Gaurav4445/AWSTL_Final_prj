import React from 'react';
import { Building2, MapPin, Trash2, Edit2, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeColors = {
  'Apartment':        'bg-blue-100 text-blue-800',
  'Independent House':'bg-green-100 text-green-800',
  'Villa':            'bg-purple-100 text-purple-800',
  'Studio':           'bg-yellow-100 text-yellow-800',
  'Row House':        'bg-pink-100 text-pink-800',
  'Builder Floor':    'bg-orange-100 text-orange-800',
  'Bungalow':         'bg-teal-100 text-teal-800',
};

export const PropertyCard = ({ property, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 group hover:border-blue-200">
      {/* Top color bar */}
      <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{property.name}</h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{property.city}{property.state ? `, ${property.state}` : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(property)} className="p-2 hover:bg-blue-50 rounded-lg transition" title="Edit">
              <Edit2 className="w-4 h-4 text-blue-600" />
            </button>
            <button onClick={() => onDelete(property._id)} className="p-2 hover:bg-red-50 rounded-lg transition" title="Delete">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[property.propertyType] || 'bg-gray-100 text-gray-700'}`}>
            {property.propertyType}
          </span>
          {property.bhkType && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              {property.bhkType}
            </span>
          )}
          {property.societyName && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {property.societyName}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4 mb-5">
          <div>
            <p className="text-gray-500 text-xs font-semibold mb-1">Area</p>
            <p className="font-bold text-gray-800">{property.squareFeet ? `${property.squareFeet} sq ft` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold mb-1">Floor</p>
            <p className="font-bold text-gray-800">{property.floorNumber ? `Floor ${property.floorNumber}` : '—'}</p>
          </div>
          {property.pincode && (
            <div>
              <p className="text-gray-500 text-xs font-semibold mb-1">Pincode</p>
              <p className="font-bold text-gray-800">{property.pincode}</p>
            </div>
          )}
        </div>

        <Link
          to={`/property/${property._id}`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-semibold text-sm py-3 rounded-lg transition group-hover:from-blue-100 group-hover:to-indigo-100 border border-blue-200"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};