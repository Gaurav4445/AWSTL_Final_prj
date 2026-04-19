const MaintenanceRecord = require('../models/MaintenanceRecord');
const mongoose = require('mongoose');

exports.getRecords = async (req, res, next) => {
  try {
    const records = await MaintenanceRecord.find({ userId: req.userId })
      .populate('propertyId')
      .populate('taskId')
      .populate('vendorId')
      .sort({ serviceDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.getPropertyRecords = async (req, res, next) => {
  try {
    const records = await MaintenanceRecord.find({ userId: req.userId, propertyId: req.params.propertyId })
      .populate('taskId')
      .populate('vendorId')
      .sort({ serviceDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.createRecord = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const record = await MaintenanceRecord.create(req.body);
    await record.populate(['propertyId', 'taskId', 'vendorId']);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.updateRecord = async (req, res, next) => {
  try {
    let record = await MaintenanceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    if (record.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    record = await MaintenanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await record.populate(['propertyId', 'taskId', 'vendorId']);
    res.status(200).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    if (record.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    await MaintenanceRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const totalRecords = await MaintenanceRecord.countDocuments({ userId });

    const thisMonth = new Date();
    thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
    const monthlyRecords = await MaintenanceRecord.countDocuments({ userId, serviceDate: { $gte: thisMonth } });

    const totalSpentAgg = await MaintenanceRecord.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$actualCost' } } },
    ]);

    // Last 6 months monthly spend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0, 0, 0, 0);
    const monthlySpend = await MaintenanceRecord.aggregate([
      { $match: { userId, serviceDate: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$serviceDate' }, month: { $month: '$serviceDate' } }, total: { $sum: '$actualCost' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await MaintenanceRecord.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$actualCost' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        monthlyRecords,
        totalSpent: totalSpentAgg[0]?.total || 0,
        monthlySpend,
        categoryBreakdown,
      },
    });
  } catch (err) { next(err); }
};