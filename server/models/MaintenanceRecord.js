// server/models/MaintenanceRecord.js
const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: false,           // ← Made optional
    },
    serviceDate: {
      type: Date,
      required: [true, 'Please provide service date'],
    },
    category: {
      type: String,
      enum: [
        'AC/Cooling', 'Water Systems', 'Electrical', 'Plumbing',
        'Pest Control', 'General', 'Cleaning', 'Safety'
      ],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    technician: {
      name: String,
      phone: String,
      company: String,
    },
    actualCost: {
      type: Number,
      required: [true, 'Please provide actual cost'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Completed',
    },
    notes: {
      type: String,
      default: '',
    },
    attachments: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);