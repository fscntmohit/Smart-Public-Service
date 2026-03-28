import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import { registerSocketUser } from '../services/socket';

const getTypeBadgeClass = (type) => {
  if (type === 'SLA_BREACH') return 'bg-rose-100 text-rose-700';
  if (type === 'NEW_COMPLAINT') return 'bg-indigo-100 text-indigo-700';
  return 'bg-emerald-100 text-emerald-700';
};

export default function NotificationBell() {
  const { user } = useUser();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerkId = user?.id;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasUnread = unreadCount > 0;

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await getMyNotifications(token);
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) return;
      console.error('Notification load failed:', error?.response?.status, error?.response?.data || error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkId) return;

    loadNotifications();

    const socket = registerSocketUser(clerkId);
    const handleNotification = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('notification:new', handleNotification);
    };
  }, [isLoaded, isSignedIn, clerkId]);

  const markOneRead = async (id) => {
    try {
      const token = await getToken();
      if (!token) return;

      await markNotificationRead(id, token);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      if (error?.response?.status === 401) return;
      toast.error('Failed to mark notification');
    }
  };

  const markAllRead = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      if (error?.response?.status === 401) return;
      toast.error('Failed to mark all notifications');
    }
  };

  const list = useMemo(() => notifications.slice(0, 10), [notifications]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[85vw] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <button
              onClick={markAllRead}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-5 text-sm text-slate-500">Loading...</p>
            ) : list.length === 0 ? (
              <p className="px-4 py-5 text-sm text-slate-500">No notifications yet</p>
            ) : (
              list.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.read && markOneRead(n._id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getTypeBadgeClass(n.type)}`}>
                      {n.type.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
