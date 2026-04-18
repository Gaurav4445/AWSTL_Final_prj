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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group">
      {/* Top color bar */}
      <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800 leading-tight">{property.name}</h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{property.city}{property.state ? `, ${property.state}` : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(property)} className="p-1.5 hover:bg-blue-50 rounded-lg transition">
              <Edit2 className="w-4 h-4 text-blue-500" />
            </button>
            <button onClick={() => onDelete(property._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[property.propertyType] || 'bg-gray-100 text-gray-700'}`}>
            {property.propertyType}
          </span>
          {property.bhkType && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
              {property.bhkType}
            </span>
          )}
          {property.societyName && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
              {property.societyName}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-3 mb-4">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Area</p>
            <p className="font-semibold text-gray-700">{property.squareFeet ? `${property.squareFeet} sq ft` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Floor</p>
            <p className="font-semibold text-gray-700">{property.floorNumber ? `Floor ${property.floorNumber}` : '—'}</p>
          </div>
          {property.pincode && (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Pincode</p>
              <p className="font-semibold text-gray-700">{property.pincode}</p>
            </div>
          )}
        </div>

        <Link
          to={`/property/${property._id}`}
          className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-sm py-2.5 rounded-lg transition group-hover:bg-orange-100"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};