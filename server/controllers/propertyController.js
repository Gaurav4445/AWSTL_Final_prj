const Property = require('../models/Property');
const Task = require('../models/Task');
const MaintenanceRecord = require('../models/MaintenanceRecord');

exports.getProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ userId: req.userId });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (err) { next(err); }
};

exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    res.status(200).json({ success: true, data: property });
  } catch (err) { next(err); }
};

exports.createProperty = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (err) { next(err); }
};

exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: property });
  } catch (err) { next(err); }
};

exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, error: 'Property not found' });
    if (property.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    
    // Delete associated tasks and records
    await Task.deleteMany({ propertyId: req.params.id });
    await MaintenanceRecord.deleteMany({ propertyId: req.params.id });
    
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};