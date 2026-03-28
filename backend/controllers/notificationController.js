const { getAuth } = require('@clerk/express');
const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    return res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
};
