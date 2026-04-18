// src/components/TaskCard.js
import React from 'react';
import { Calendar, DollarSign, Trash2, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export const TaskCard = ({ record, onDelete }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'AC/Cooling': 'bg-blue-100 text-blue-800',
      'Water Systems': 'bg-cyan-100 text-cyan-800',
      'Electrical': 'bg-yellow-100 text-yellow-800',
      'Plumbing': 'bg-purple-100 text-purple-800',
      'Pest Control': 'bg-red-100 text-red-800',
      'General': 'bg-gray-100 text-gray-800',
      'Cleaning': 'bg-green-100 text-green-800',
      'Safety': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition border-t-4 border-orange-500 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(record.category)}`}>
                {record.category}
              </span>
              {record.status === 'Completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{record.taskId?.name || record.description || 'Maintenance Record'}</h3>
          </div>
          <button onClick={() => onDelete(record._id)} className="p-2 hover:bg-red-100 rounded-lg transition">
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {record.description && <p className="text-gray-600 text-sm mb-4">{record.description}</p>}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm border-y py-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-gray-500 text-xs">Service Date</p>
              <p className="font-semibold text-gray-800">{formatDate(record.serviceDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-orange-600" />
            <div>
              <p className="text-gray-500 text-xs">Cost</p>
              <p className="font-semibold text-gray-800">₹{record.actualCost}</p>
            </div>
          </div>
        </div>

        {record.technician?.name && (
          <div className="text-sm text-gray-600">
            <p className="text-gray-500 text-xs mb-1">Technician</p>
            <p className="font-semibold">{record.technician.name}</p>
            {record.technician.phone && <p>{record.technician.phone}</p>}
          </div>
        )}
      </div>
    </div>
  );
};