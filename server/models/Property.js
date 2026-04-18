const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  address:      { type: String, required: true },
  city:         { type: String, required: true },
  state:        { type: String, default: '' },
  pincode:      { type: String, default: '' },
  propertyType: {
    type: String,
    enum: ['Apartment', 'Independent House', 'Villa', 'Studio', 'Row House', 'Builder Floor', 'Bungalow'],
    default: 'Apartment',
  },
  bhkType: {
    type: String,
    enum: ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'],
    default: '2 BHK',
  },
  squareFeet:   { type: Number, default: 0 },
  floorNumber:  { type: Number, default: 0 },
  societyName:  { type: String, default: '' },
  description:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);