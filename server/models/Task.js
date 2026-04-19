const mongoose = require('mongoose');

const TASK_CATEGORIES = ['AC/Cooling', 'Water Systems', 'Electrical', 'Plumbing', 'Pest Control', 'General', 'Cleaning', 'Safety', 'Generator/Inverter', 'Gas/LPG', 'RO/Water Purifier', 'Security'];

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: TASK_CATEGORIES, default: 'General' },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Bi-Annual', 'Annual', 'As-Needed'],
    default: 'Quarterly',
  },
  estimatedCost: { type: Number, default: 0 },
  nextDueDate: { type: Date, default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  isTemplate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
