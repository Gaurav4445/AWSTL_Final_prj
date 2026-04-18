const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  taskId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
  vendorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: false },
  serviceDate:{ type: Date, required: true },
  category: {
    type: String,
    enum: ['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety','Generator/Inverter','Gas/LPG','RO/Water Purifier','Security'],
    required: true,
  },
  description: { type: String, default: '' },
  technician: { name: String, phone: String, company: String },
  actualCost:  { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ['Cash','UPI','NEFT/RTGS','Cheque','Credit Card','Debit Card'],
    default: 'Cash',
  },
  upiTransactionId: { type: String, default: '' },
  status: { type: String, enum: ['Completed','Pending','Cancelled'], default: 'Completed' },
  warrantyMonths: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5 },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);