import React from 'react';
import { Calendar, IndianRupee, Trash2, CheckCircle, User, Smartphone, Star } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const categoryColors = {
  'AC/Cooling':         'bg-blue-100 text-blue-800',
  'Water Systems':      'bg-cyan-100 text-cyan-800',
  'Electrical':         'bg-yellow-100 text-yellow-800',
  'Plumbing':           'bg-purple-100 text-purple-800',
  'Pest Control':       'bg-red-100 text-red-800',
  'General':            'bg-gray-100 text-gray-700',
  'Cleaning':           'bg-green-100 text-green-800',
  'Safety':             'bg-orange-100 text-orange-800',
  'Generator/Inverter': 'bg-indigo-100 text-indigo-800',
  'Gas/LPG':            'bg-rose-100 text-rose-800',
  'RO/Water Purifier':  'bg-teal-100 text-teal-800',
  'Security':           'bg-slate-100 text-slate-800',
};

const paymentIcons = {
  'UPI': '📱',
  'Cash': '💵',
  'NEFT/RTGS': '🏦',
  'Cheque': '📝',
  'Credit Card': '💳',
  'Debit Card': '💳',
};

export const TaskCard = ({ record, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-2">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[record.category] || 'bg-gray-100 text-gray-700'}`}>
                {record.category}
              </span>
              {record.status === 'Completed' && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Done
                </span>
              )}
              {record.warrantyMonths > 0 && (
                <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {record.warrantyMonths}m warranty
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              {record.taskId?.name || record.description || 'Maintenance Record'}
            </h3>
            {record.propertyId?.name && (
              <p className="text-xs text-gray-400 mt-0.5">{record.propertyId.name} · {record.propertyId.city}</p>
            )}
          </div>
          <button onClick={() => onDelete(record._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition flex-shrink-0">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {record.description && record.taskId && (
          <p className="text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-2">{record.description}</p>
        )}

        {/* Cost + Date */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Cost</p>
            <p className="font-bold text-green-700 flex items-center gap-0.5">
              <IndianRupee className="w-3.5 h-3.5" />
              {record.actualCost?.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 mb-0.5">Date</p>
            <p className="font-semibold text-blue-700 text-xs">{formatDate(record.serviceDate)}</p>
          </div>
        </div>

        {/* Payment mode */}
        {record.paymentMode && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span>{paymentIcons[record.paymentMode] || '💰'}</span>
            <span>{record.paymentMode}</span>
            {record.upiTransactionId && <span className="text-gray-400">· {record.upiTransactionId}</span>}
          </div>
        )}

        {/* Technician */}
        {record.technician?.name && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium mb-1">
              <User className="w-3.5 h-3.5" /> {record.technician.name}
            </div>
            {record.technician.phone && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Smartphone className="w-3 h-3" />
                <a href={`tel:${record.technician.phone}`} className="hover:text-orange-600 transition">
                  {record.technician.phone}
                </a>
              </div>
            )}
            {record.technician.company && <p className="text-gray-400 mt-0.5">{record.technician.company}</p>}
          </div>
        )}

        {/* Rating */}
        {record.rating && (
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= record.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};