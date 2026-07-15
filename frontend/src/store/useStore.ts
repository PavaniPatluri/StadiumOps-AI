import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Notification } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (n: Notification) => void;

  // Live data refresh
  lastRefresh: Date | null;
  setLastRefresh: (date: Date) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) =>
        set({ notifications, unreadCount: notifications.filter((n) => !n.is_read).length }),
      addNotification: (n) =>
        set((s) => ({
          notifications: [n, ...s.notifications],
          unreadCount: s.unreadCount + (n.is_read ? 0 : 1),
        })),

      lastRefresh: null,
      setLastRefresh: (date) => set({ lastRefresh: date }),
    }),
    {
      name: 'stadiumops-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
