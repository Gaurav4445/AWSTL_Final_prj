const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ userId: req.userId }).sort({ name: 1 });
    res.status(200).json({ success: true, count: vendors.length, data: vendors });
  } catch (err) { next(err); }
};

exports.createVendor = async (req, res, next) => {
  try {
    req.body.userId = req.userId;
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.updateVendor = async (req, res, next) => {
  try {
    let vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    if (vendor.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    if (vendor.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    await Vendor.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};