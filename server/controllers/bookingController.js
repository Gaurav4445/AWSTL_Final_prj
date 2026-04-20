const { ServiceBooking } = require('../models/ServiceBooking');
const Notification = require('./notificationController');

const populateBooking = (query) =>
  query.populate('propertyId', 'name city').populate('vendorId', 'name phone category').populate('taskId', 'name');

const buildReminderDate = (scheduledDate, scheduledTime, reminderLeadDays = 1) => {
  if (!scheduledDate) return null;
  const reminderAt = new Date(scheduledDate);
  if (scheduledTime) {
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      reminderAt.setHours(hours, minutes, 0, 0);
    }
  } else {
    reminderAt.setHours(9, 0, 0, 0);
  }
  reminderAt.setDate(reminderAt.getDate() - (Number(reminderLeadDays) || 0));
  return reminderAt;
};

const normalizeBookingPayload = (payload = {}) => {
  const normalized = { ...payload };
  if (normalized.scheduledDate) {
    normalized.reminderAt = normalized.reminderAt || buildReminderDate(normalized.scheduledDate, normalized.scheduledTime, normalized.reminderLeadDays);
  }
  if (normalized.followUpDate) {
    const followUpReminder = new Date(normalized.followUpDate);
    followUpReminder.setHours(9, 0, 0, 0);
    normalized.followUpReminderAt = normalized.followUpReminderAt || followUpReminder;
  }
  return normalized;
};

const serializeBooking = (bookingDoc) => {
  const booking = bookingDoc.toObject ? bookingDoc.toObject() : bookingDoc;
  const scheduledAt = booking.scheduledDate ? new Date(booking.scheduledDate) : null;
  return {
    ...booking,
    isUpcoming: !!scheduledAt && scheduledAt >= new Date() && !['Completed', 'Cancelled'].includes(booking.status),
  };
};

exports.getBookings = async (req, res, next) => {
  try {
    const query = { userId: req.userId };
    if (req.query.propertyId) query.propertyId = req.query.propertyId;
    const bookings = await populateBooking(ServiceBooking.find(query)).sort({ scheduledDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings.map(serializeBooking) });
  } catch (err) { next(err); }
};

exports.getPropertyBookings = async (req, res, next) => {
  try {
    const bookings = await populateBooking(ServiceBooking.find({ userId: req.userId, propertyId: req.params.propertyId })).sort({ scheduledDate: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings.map(serializeBooking) });
  } catch (err) { next(err); }
};

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await ServiceBooking.create({ ...normalizeBookingPayload(req.body), userId: req.userId });
    await booking.populate('propertyId', 'name city');
    await booking.populate('vendorId', 'name phone category');
    await booking.populate('taskId', 'name');

    const io = req.app.get('io');
    await Notification.createNotification(
      io,
      req.userId,
      'Service booking created',
      `${booking.title} has been scheduled for ${new Date(booking.scheduledDate).toLocaleDateString('en-IN')}.`,
      'booking',
      '/bookings'
    );

    res.status(201).json({ success: true, data: serializeBooking(booking) });
  } catch (err) { next(err); }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await ServiceBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    booking = await populateBooking(ServiceBooking.findByIdAndUpdate(req.params.id, normalizeBookingPayload(req.body), { new: true, runValidators: true }));
    res.status(200).json({ success: true, data: serializeBooking(booking) });
  } catch (err) { next(err); }
};


exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await ServiceBooking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) { next(err); }
};
