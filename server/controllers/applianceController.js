const Appliance = require('../models/Appliance');

exports.getAppliances = async (req, res, next) => {
  try {
    const query = { userId: req.userId };
    if (req.query.propertyId) query.propertyId = req.query.propertyId;
    const appliances = await Appliance.find(query).populate('propertyId', 'name city').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appliances.length, data: appliances });
  } catch (err) { next(err); }
};

exports.getPropertyAppliances = async (req, res, next) => {
  try {
    const appliances = await Appliance.find({ userId: req.userId, propertyId: req.params.propertyId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: appliances.length, data: appliances });
  } catch (err) { next(err); }
};

exports.createAppliance = async (req, res, next) => {
  try {
    if (req.body.coverImage?.dataUrl && !req.body.coverImage?.uploadedAt) {
      req.body.coverImage.uploadedAt = new Date();
    }
    if (Array.isArray(req.body.documents)) {
      req.body.documents = req.body.documents.map((document) => ({
        ...document,
        uploadedAt: document.uploadedAt || new Date(),
      }));
    }
    const appliance = await Appliance.create({ ...req.body, userId: req.userId });
    await appliance.populate('propertyId', 'name city');
    res.status(201).json({ success: true, data: appliance });
  } catch (err) { next(err); }
};

exports.updateAppliance = async (req, res, next) => {
  try {
    let appliance = await Appliance.findById(req.params.id);
    if (!appliance) return res.status(404).json({ success: false, error: 'Appliance not found' });
    if (appliance.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    if (req.body.coverImage?.dataUrl && !req.body.coverImage?.uploadedAt) {
      req.body.coverImage.uploadedAt = new Date();
    }
    if (Array.isArray(req.body.documents)) {
      req.body.documents = req.body.documents.map((document) => ({
        ...document,
        uploadedAt: document.uploadedAt || new Date(),
      }));
    }
    appliance = await Appliance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('propertyId', 'name city');
    res.status(200).json({ success: true, data: appliance });
  } catch (err) { next(err); }
};

exports.deleteAppliance = async (req, res, next) => {
  try {
    const appliance = await Appliance.findById(req.params.id);
    if (!appliance) return res.status(404).json({ success: false, error: 'Appliance not found' });
    if (appliance.userId.toString() !== req.userId)
      return res.status(403).json({ success: false, error: 'Not authorized' });
    await Appliance.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};
