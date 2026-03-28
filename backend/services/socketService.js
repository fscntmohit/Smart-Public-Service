const { Server } = require('socket.io');

let io;
const userSockets = new Map();

const addUserSocket = (userId, socketId) => {
  if (!userId) return;
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
};

const removeUserSocket = (socketId) => {
  for (const [userId, socketSet] of userSockets.entries()) {
    if (socketSet.has(socketId)) {
      socketSet.delete(socketId);
      if (socketSet.size === 0) {
        userSockets.delete(userId);
      }
      break;
    }
  }
};

const initSocketServer = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('register', (clerkId) => {
      if (!clerkId || typeof clerkId !== 'string') return;
      socket.data.clerkId = clerkId;
      addUserSocket(clerkId, socket.id);
    });

    socket.on('disconnect', () => {
      removeUserSocket(socket.id);
    });
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  const sockets = userSockets.get(userId);
  if (!sockets || sockets.size === 0) return;

  sockets.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

module.exports = {
  initSocketServer,
  emitToUser,
};
