const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.userId }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Helper to create notification + emit via socket
exports.createNotification = async (io, userId, title, message, type = 'system', link = null) => {
  try {
    const notification = await Notification.create({ user: userId, title, message, type, link });
    if (io) {
      io.to(`user_${userId}`).emit('newNotification', notification);
    }
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};