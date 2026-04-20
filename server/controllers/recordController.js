const MaintenanceRecord = require('../models/MaintenanceRecord');
const Appliance = require('../models/Appliance');
const Notification = require('./notificationController');
const { ServiceBooking } = require('../models/ServiceBooking');
const mongoose = require('mongoose');

const populateRecord = (query) => query.populate('propertyId').populate('applianceId').populate('taskId').populate('vendorId');

const updateApplianceFromRecord = async (record) => {
  if (!record.applianceId) return;
  const updates = { lastServiceDate: record.serviceDate };
  if (record.warrantyMonths > 0 && record.serviceDate) {
    const warrantyExpiry = new Date(record.serviceDate);
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + record.warrantyMonths);
    updates.warrantyExpiry = warrantyExpiry;
  }
  await Appliance.findByIdAndUpdate(record.applianceId._id || record.applianceId, updates, { new: true });
};

exports.getRecords = async (req, res, next) => {
  try {
    const records = await populateRecord(MaintenanceRecord.find({ userId: req.userId })).sort({ serviceDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.getPropertyRecords = async (req, res, next) => {
  try {
    const records = await populateRecord(MaintenanceRecord.find({ userId: req.userId, propertyId: req.params.propertyId })).sort({ serviceDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.createRecord = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    if (req.body.invoiceAttachment?.dataUrl && !req.body.invoiceAttachment?.uploadedAt) {
      req.body.invoiceAttachment.uploadedAt = new Date();
    }
    const record = await MaintenanceRecord.create(req.body);
    await record.populate(['propertyId', 'applianceId', 'taskId', 'vendorId']);
    await updateApplianceFromRecord(record);
    const io = req.app.get('io');
    await Notification.createNotification(
      io,
      req.userId,
      'Service logged',
      `${record.category} service was logged${record.applianceId?.name ? ` for ${record.applianceId.name}` : ''}.`,
      'record',
      '/history'
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.updateRecord = async (req, res, next) => {
  try {
    let record = await MaintenanceRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Record not found' });
    if (record.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    if (req.body.invoiceAttachment?.dataUrl && !req.body.invoiceAttachment?.uploadedAt) {
      req.body.invoiceAttachment.uploadedAt = new Date();
    }
    record = await MaintenanceRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await record.populate(['propertyId', 'applianceId', 'taskId', 'vendorId']);
    await updateApplianceFromRecord(record);
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
    const applianceCount = await Appliance.countDocuments({ userId });
    const activeBookings = await ServiceBooking.countDocuments({
      userId,
      status: { $in: ['Requested', 'Confirmed', 'In Progress'] },
      scheduledDate: { $gte: new Date() },
    });
    const pendingFollowUps = await ServiceBooking.countDocuments({
      userId,
      status: { $in: ['Requested', 'Confirmed', 'In Progress'] },
      followUpDate: { $gte: new Date(0), $lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) },
    });

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

    const warrantyCutoff = new Date();
    warrantyCutoff.setDate(warrantyCutoff.getDate() + 30);
    const expiringWarrantyCount = await Appliance.countDocuments({
      userId,
      warrantyExpiry: { $gte: new Date(0), $lte: warrantyCutoff },
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        applianceCount,
        activeBookings,
        pendingFollowUps,
        expiringWarrantyCount,
        monthlyRecords,
        totalSpent: totalSpentAgg[0]?.total || 0,
        monthlySpend,
        categoryBreakdown,
      },
    });
  } catch (err) { next(err); }
};
