import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, AlertTriangle, Car, UtensilsCrossed,
  Trophy, Users, BarChart3, MessageSquare, Bell, LogOut,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/map', icon: Map, label: 'Stadium Map' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/parking', icon: Car, label: 'Parking' },
  { to: '/food-court', icon: UtensilsCrossed, label: 'Food Courts' },
  { to: '/tournament', icon: Trophy, label: 'Tournament' },
  { to: '/volunteers', icon: Users, label: 'Volunteers' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/chatbot', icon: MessageSquare, label: 'AI Chatbot' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, clearAuth, user, unreadCount } = useStore();
  const location = useLocation();

  return (
    <div className={cn(
      'fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 z-50',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <div className="font-bold text-white text-sm leading-tight">StadiumOps</div>
            <div className="text-blue-400 text-xs font-medium">AI Platform</div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors z-10"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3 text-slate-300" /> : <ChevronRight className="w-3 h-3 text-slate-300" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          const isNotifications = to === '/notifications';
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(isActive ? 'nav-item-active' : 'nav-item', 'relative')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">{label}</span>}
              {isNotifications && unreadCount > 0 && (
                <span className={cn(
                  'absolute rounded-full bg-red-500 text-white text-xs font-bold',
                  sidebarOpen ? 'right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center' : 'top-1 right-1 w-4 h-4 flex items-center justify-center'
                )}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-slate-700/50 p-3">
        {sidebarOpen && user && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-slate-800/60 animate-fade-in">
            <div className="text-xs font-medium text-white truncate">{user.full_name}</div>
            <div className="text-xs text-blue-400 capitalize">{user.role}</div>
          </div>
        )}
        <button
          onClick={clearAuth}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
