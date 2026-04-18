const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a property name'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    propertyType: {
      type: String,
      enum: ['Apartment', 'House', 'Villa', 'Studio'],
      default: 'Apartment',
    },
    squareFeet: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    appliances: [
      {
        name: String,
        model: String,
        purchaseDate: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);