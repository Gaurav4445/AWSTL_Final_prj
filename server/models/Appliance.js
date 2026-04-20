const mongoose = require('mongoose');

const ApplianceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true, trim: true },
  applianceType: {
    type: String,
    enum: ['AC', 'RO', 'Geyser', 'Inverter', 'Refrigerator', 'Washing Machine', 'Water Tank', 'Pump', 'Microwave', 'Dishwasher', 'Security System', 'Other'],
    default: 'Other',
  },
  brand: { type: String, default: '' },
  modelNumber: { type: String, default: '' },
  serialNumber: { type: String, default: '' },
  installDate: { type: Date, default: null },
  warrantyExpiry: { type: Date, default: null },
  lastServiceDate: { type: Date, default: null },
  serviceIntervalMonths: { type: Number, default: 6 },
  notes: { type: String, default: '' },
  coverImage: {
    fileName: { type: String, default: '' },
    dataUrl: { type: String, default: '' },
    uploadedAt: { type: Date, default: null },
  },
  documents: [{
    title: { type: String, default: '' },
    fileName: { type: String, default: '' },
    dataUrl: { type: String, default: '' },
    uploadedAt: { type: Date, default: null },
  }],
  status: { type: String, enum: ['Active', 'Needs Attention', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Appliance', ApplianceSchema);
