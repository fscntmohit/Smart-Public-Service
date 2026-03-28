import { io } from 'socket.io-client';

let socket;

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const fallbackOrigin = 'http://localhost:5001';

const getSocketOrigin = () => {
  if (!rawApiUrl) return fallbackOrigin;
  const withoutApiPath = rawApiUrl.replace(/\/api\/?$/, '');
  return withoutApiPath.replace(/\/+$/, '');
};

export const getSocket = () => {
  if (socket) return socket;

  socket = io(getSocketOrigin(), {
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  return socket;
};

export const registerSocketUser = (clerkId) => {
  const client = getSocket();
  if (!clerkId) return client;

  const register = () => client.emit('register', clerkId);
  if (client.connected) {
    register();
  } else {
    client.once('connect', register);
  }

  return client;
};
