const mongoose = require('mongoose');

const SERVICE_TYPES = [
  'AC Service',
  'Deep Cleaning',
  'Plumbing Visit',
  'Electrical Repair',
  'Pest Control',
  'RO Service',
  'Appliance Repair',
  'Painting',
  'Carpentry',
  'General Inspection',
];

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  serviceType: { type: String, enum: SERVICE_TYPES, default: 'General Inspection' },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, default: '' },
  timeSlot: {
    type: String,
    enum: ['Early Morning', 'Morning', 'Afternoon', 'Evening', 'Flexible'],
    default: 'Flexible',
  },
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Requested', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Requested',
  },
  quotedPrice: { type: Number, default: 0 },
  contactPerson: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  followUpDate: { type: Date, default: null },
  reminderAt: { type: Date, default: null },
  followUpReminderAt: { type: Date, default: null },
  reminderLeadDays: { type: Number, default: 1 },
  demoReminder: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = {
  ServiceBooking: mongoose.model('ServiceBooking', bookingSchema),
  SERVICE_TYPES,
};
