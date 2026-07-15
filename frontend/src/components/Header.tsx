import { Bell, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Operations Dashboard',
  '/map': 'Stadium Map',
  '/incidents': 'Incident Management',
  '/parking': 'Parking Management',
  '/food-court': 'Food Court Analytics',
  '/tournament': 'Tournament Management',
  '/volunteers': 'Volunteer & Staff',
  '/analytics': 'Analytics & Reports',
  '/chatbot': 'AI Operations Chatbot',
  '/notifications': 'Notifications',
};

export default function Header() {
  const location = useLocation();
  const { unreadCount, lastRefresh } = useStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const title = pageTitles[location.pathname] || 'StadiumOps AI';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const refreshTime = lastRefresh
    ? `Last updated ${Math.floor((Date.now() - lastRefresh.getTime()) / 1000)}s ago`
    : 'Auto-refresh active';

  return (
    <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="live-dot" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className={cn('flex items-center gap-1.5 text-xs', isOnline ? 'text-green-400' : 'text-red-400')}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:block">{isOnline ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Refresh indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="hidden md:block">{refreshTime}</span>
        </div>

        {/* Notifications */}
        <Link to="/notifications" className="relative p-2 hover:bg-slate-700/60 rounded-lg transition-colors">
          <Bell className="w-4.5 h-4.5 text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Current time */}
        <LiveClock />
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-xs text-slate-400 font-mono hidden sm:block">
      {time.toLocaleTimeString()}
    </div>
  );
}
