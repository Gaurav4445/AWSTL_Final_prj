const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Please provide a task name'],
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'AC/Cooling',
        'Water Systems',
        'Electrical',
        'Plumbing',
        'Pest Control',
        'General',
        'Cleaning',
        'Safety',
      ],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Bi-Annual', 'Annual', 'As-Needed'],
      default: 'Quarterly',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    notes: {
      type: String,
      default: '',
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);