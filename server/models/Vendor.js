const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  altPhone: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Plumber','Electrician','AC Mechanic','Carpenter','Painter','Pest Control','Cleaning Service','RO Technician','Inverter/Battery','Gas Agency','Security','General Handyman'],
    required: true,
  },
  city:    { type: String, default: '' },
  area:    { type: String, default: '' },
  upiId:   { type: String, default: '' },
  rating:  { type: Number, min: 1, max: 5, default: 3 },
  notes:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);