const Notification = require('../models/Notification');
const Task = require('../models/Task');
const Appliance = require('../models/Appliance');
const User = require('../models/User');
const { ServiceBooking } = require('../models/ServiceBooking');
const { isEmailEnabled, sendReminderEmail } = require('../utils/mailer');

const upsertNotification = async ({ userId, title, message, type, link, dedupeKey }) => {
  const existing = await Notification.findOne({ dedupeKey });
  if (existing) return { notification: existing, isNew: false };

  try {
    const notification = await Notification.create({ user: userId, title, message, type, link, dedupeKey });
    return { notification, isNew: true };
  } catch (err) {
    if (err?.code === 11000) {
      const notification = await Notification.findOne({ dedupeKey });
      return { notification, isNew: false };
    }
    throw err;
  }
};

const maybeSendReminderEmail = async (notification) => {
  if (!notification || notification.emailSentAt || !isEmailEnabled()) return;

  const user = await User.findById(notification.user).select('email name notificationPreferences');
  if (!user?.email || user.notificationPreferences?.emailReminders === false) return;

  const sent = await sendReminderEmail({
    to: user.email,
    subject: `GharSeva reminder: ${notification.title}`,
    text: `Hi ${user.name || 'there'},\n\n${notification.message}\n\nOpen GharSeva to review it.\n`,
  });

  if (sent) {
    await Notification.findByIdAndUpdate(notification._id, { emailSentAt: new Date() });
  }
};

const deliverNotification = async (notification, io = null) => {
  if (!notification) return;
  if (io) {
    io.to(`user_${notification.user}`).emit('newNotification', notification);
  }
  await maybeSendReminderEmail(notification);
};

const syncReminderNotifications = async (userId, io = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  const upcomingTaskCutoff = new Date(today);
  upcomingTaskCutoff.setDate(upcomingTaskCutoff.getDate() + 7);

  const warrantyCutoff = new Date(today);
  warrantyCutoff.setDate(warrantyCutoff.getDate() + 30);

  const bookingCutoff = new Date(today);
  bookingCutoff.setDate(bookingCutoff.getDate() + 3);

  const [tasks, appliances, bookings] = await Promise.all([
    Task.find({ userId, completed: false, nextDueDate: { $lte: upcomingTaskCutoff, $ne: null } }).limit(20),
    Appliance.find({ userId, warrantyExpiry: { $lte: warrantyCutoff, $ne: null } }).limit(20),
    ServiceBooking.find({
      userId,
      status: { $in: ['Requested', 'Confirmed', 'In Progress'] },
      $or: [
        { reminderAt: { $lte: now, $ne: null } },
        { followUpReminderAt: { $lte: now, $ne: null } },
        { scheduledDate: { $lte: bookingCutoff, $ne: null } },
        { followUpDate: { $lte: upcomingTaskCutoff, $ne: null } },
      ],
    }).limit(20),
  ]);

  const syncResults = await Promise.all([
    ...tasks.map((task) => {
      const isOverdue = task.nextDueDate && new Date(task.nextDueDate) < today;
      return upsertNotification({
        userId,
        title: isOverdue ? 'Task overdue' : 'Task due soon',
        message: `${task.name} ${isOverdue ? 'is overdue' : 'is due soon'}.`,
        type: 'task',
        link: '/tasks',
        dedupeKey: `task-${task._id}-${isOverdue ? 'overdue' : 'due-soon'}`,
      });
    }),
    ...appliances.map((appliance) => {
      const isExpired = appliance.warrantyExpiry && new Date(appliance.warrantyExpiry) < today;
      return upsertNotification({
        userId,
        title: isExpired ? 'Warranty expired' : 'Warranty expiring soon',
        message: `${appliance.name} warranty ${isExpired ? 'has expired' : 'is expiring soon'}.`,
        type: 'system',
        link: `/property/${appliance.propertyId}`,
        dedupeKey: `appliance-${appliance._id}-${isExpired ? 'expired' : 'expiring'}`,
      });
    }),
    ...bookings.flatMap((booking) => {
      const items = [];
      if ((booking.reminderAt && new Date(booking.reminderAt) <= now) || (booking.scheduledDate && new Date(booking.scheduledDate) <= bookingCutoff)) {
        items.push(upsertNotification({
          userId,
          title: booking.demoReminder ? 'Demo reminder ready' : 'Upcoming booking',
          message: booking.demoReminder ? `${booking.title} is ready for the live demo now.` : `${booking.title} is scheduled soon.`,
          type: 'booking',
          link: '/bookings',
          dedupeKey: `booking-${booking._id}-${booking.demoReminder ? 'demo' : 'schedule'}`,
        }));
      }
      if ((booking.followUpReminderAt && new Date(booking.followUpReminderAt) <= now) || (booking.followUpDate && new Date(booking.followUpDate) <= upcomingTaskCutoff)) {
        items.push(upsertNotification({
          userId,
          title: 'Booking follow-up due',
          message: `${booking.title} needs a follow-up.`,
          type: 'booking',
          link: '/bookings',
          dedupeKey: `booking-${booking._id}-follow-up`,
        }));
      }
      return items;
    }),
  ]);

  await Promise.all(
    syncResults
      .filter((result) => result?.isNew)
      .map((result) => deliverNotification(result.notification, io))
  );
};

exports.getNotifications = async (req, res, next) => {
  try {
    await syncReminderNotifications(req.userId, req.app.get('io'));
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });
    await Promise.all(notifications.slice(0, 10).map((notification) => maybeSendReminderEmail(notification)));
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

exports.createNotification = async (io, userId, title, message, type = 'system', link = null, dedupeKey = null) => {
  try {
    const notification = dedupeKey
      ? (await upsertNotification({ userId, title, message, type, link, dedupeKey })).notification
      : await Notification.create({ user: userId, title, message, type, link });
    await deliverNotification(notification, io);
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

exports.syncReminderNotifications = syncReminderNotifications;
