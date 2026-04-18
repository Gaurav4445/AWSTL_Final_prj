// controllers/recordController.js
const MaintenanceRecord = require('../models/MaintenanceRecord');
const mongoose = require('mongoose');

// Get all records for a user
exports.getRecords = async (req, res, next) => {
  try {
    const records = await MaintenanceRecord.find({ userId: req.userId })
      .populate('propertyId')
      .populate('taskId')
      .sort({ serviceDate: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// Get records for specific property
exports.getPropertyRecords = async (req, res, next) => {
  try {
    const records = await MaintenanceRecord.find({
      userId: req.userId,
      propertyId: req.params.propertyId,
    })
      .populate('taskId')
      .sort({ serviceDate: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// Create maintenance record
exports.createRecord = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const record = await MaintenanceRecord.create(req.body);
    await record.populate('propertyId').populate('taskId');
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// Update record
exports.updateRecord = async (req, res, next) => {
  try {
    let record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    record = await MaintenanceRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    await record.populate('propertyId').populate('taskId');
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// Delete record
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// Get dashboard stats - FIXED VERSION
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const totalRecords = await MaintenanceRecord.countDocuments({ userId });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRecords = await MaintenanceRecord.countDocuments({
      userId,
      serviceDate: { $gte: thisMonth },
    });

    const totalSpentAgg = await MaintenanceRecord.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$actualCost' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        monthlyRecords,
        totalSpent: totalSpentAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};