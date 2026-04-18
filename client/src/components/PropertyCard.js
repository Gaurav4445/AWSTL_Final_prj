// src/components/PropertyCard.js
import React from 'react';
import { Building2, MapPin, Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PropertyCard = ({ property, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-orange-500">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{property.name}</h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                {property.city}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(property)} className="p-2 hover:bg-blue-100 rounded-lg transition">
              <Edit2 className="w-5 h-5 text-blue-600" />
            </button>
            <button onClick={() => onDelete(property._id)} className="p-2 hover:bg-red-100 rounded-lg transition">
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">{property.address}</p>
        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-semibold text-gray-800">{property.propertyType}</p>
          </div>
          <div>
            <p className="text-gray-500">Size</p>
            <p className="font-semibold text-gray-800">
              {property.squareFeet ? `${property.squareFeet} sq ft` : 'Not specified'}
            </p>
          </div>
        </div>
        <Link
          to={`/property/${property._id}`}
          className="mt-4 inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};