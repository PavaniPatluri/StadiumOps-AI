import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { mockNotifications } from '@/data/mockData';
import type { Notification } from '@/types';
import { useStore } from '@/store/useStore';
import { cn, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const TYPE_STYLES: Record<string, { border: string; bg: string; dot: string }> = {
  emergency: { border: 'border-red-500/40', bg: 'bg-red-500/5', dot: 'bg-red-400' },
  warning: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', dot: 'bg-yellow-400' },
  info: { border: 'border-blue-500/30', bg: 'bg-blue-500/5', dot: 'bg-blue-400' },
  success: { border: 'border-green-500/30', bg: 'bg-green-500/5', dot: 'bg-green-400' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency' | 'warning'>('all');
  const { setNotifications: storeSetNotif } = useStore();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data);
      storeSetNotif(res.data);
    } catch { }
  }, [storeSetNotif]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try { await notificationsApi.markAllRead(); } catch { }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    storeSetNotif([]);
    toast.success('All notifications marked as read');
  };

  const handleMarkRead = async (id: number) => {
    try { await notificationsApi.markRead(id); } catch { }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'emergency') return n.notification_type === 'emergency';
    if (filter === 'warning') return n.notification_type === 'warning';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-red-500/20 text-red-400 border-red-500/30">{unreadCount} unread</span>
            )}
          </h2>
          <p className="section-subtitle mt-0.5">Stadium alerts, warnings, and updates</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit">
        {(['all', 'unread', 'emergency', 'warning'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize',
              filter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-slate-400">No notifications</div>
          </div>
        )}
        {filtered.map(n => {
          const style = TYPE_STYLES[n.notification_type] || TYPE_STYLES.info;
          return (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={cn(
                'glass-card p-4 border flex items-start gap-4 cursor-pointer hover:bg-slate-800/60 transition-all',
                style.border, style.bg, !n.is_read && 'ring-1 ring-inset ring-white/5'
              )}
            >
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', style.dot, n.notification_type === 'emergency' && 'animate-pulse')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className={cn('text-sm font-semibold', n.is_read ? 'text-slate-300' : 'text-white')}>
                    {n.title}
                  </div>
                  {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span>{timeAgo(n.created_at)}</span>
                  {n.target_role && n.target_role !== 'all' && (
                    <span className="badge bg-slate-700/50 text-slate-400 border-slate-600/30 capitalize">{n.target_role}</span>
                  )}
                  <span className={cn('badge capitalize', style.bg, 'border-0')} style={{ color: style.dot.replace('bg-', '') }}>
                    {n.notification_type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
