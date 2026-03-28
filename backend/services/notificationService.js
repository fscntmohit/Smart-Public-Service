const Notification = require('../models/Notification');
const { emitToUser } = require('./socketService');

const createNotification = async ({ userId, message, type, meta = null }) => {
  if (!userId) return null;

  const notification = await Notification.create({
    userId,
    message,
    type,
  });

  emitToUser(userId, 'notification:new', {
    ...notification.toObject(),
    meta,
  });

  return notification;
};

module.exports = {
  createNotification,
};
