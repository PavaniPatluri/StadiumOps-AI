import { useEffect, useState, useCallback } from 'react';
import {
  Users, AlertTriangle, Car, Clock, Cloud, TrendingUp,
  Activity, DollarSign, CheckCircle, Zap, Wind, Droplets
} from 'lucide-react';
import { dashboardApi, incidentsApi, notificationsApi } from '@/lib/api';
import { mockKPIs, mockIncidents, mockNotifications } from '@/data/mockData';
import { useStore } from '@/store/useStore';
import type { DashboardKPI, Incident, Notification } from '@/types';
import { formatNumber, formatCurrency, formatPercent, getSeverityColor, getStatusColor, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; up: boolean };
  alert?: boolean;
}

function KPICard({ label, value, sub, icon: Icon, color, trend, alert }: KPICardProps) {
  return (
    <div className={cn('kpi-card animate-fade-in', alert && 'border-red-500/40 bg-red-500/5')}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span className={cn('text-xs font-medium', trend.up ? 'text-green-400' : 'text-red-400')}>
            {trend.up ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-300 mb-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPI>(mockKPIs);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { setNotifications: storeSetNotif, setLastRefresh } = useStore();

  const fetchData = useCallback(async () => {
    try {
      const [kpiRes, incRes, notifRes] = await Promise.allSettled([
        dashboardApi.getKPIs(),
        incidentsApi.list({ status: 'open' }),
        notificationsApi.list({ unread_only: 'true', limit: '5' } as any),
      ]);
      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
      if (incRes.status === 'fulfilled') setIncidents(incRes.value.data.slice(0, 5));
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data);
        storeSetNotif(notifRes.value.data);
      }
    } catch {
      // keep mock data on error
    }
    setLastRefresh(new Date());
  }, [storeSetNotif, setLastRefresh]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const kpiCards: KPICardProps[] = [
    {
      label: 'Total Attendance',
      value: formatNumber(kpis.total_attendance),
      sub: `${formatPercent(kpis.capacity_percent)} of 65K capacity`,
      icon: Users,
      color: 'bg-blue-500/20 text-blue-400',
      trend: { value: 4.2, up: true },
    },
    {
      label: 'Active Incidents',
      value: kpis.active_incidents.toString(),
      sub: `${kpis.resolved_incidents} resolved today`,
      icon: AlertTriangle,
      color: 'bg-orange-500/20 text-orange-400',
      alert: kpis.active_incidents >= 5,
    },
    {
      label: 'Parking Available',
      value: formatNumber(kpis.parking_available),
      sub: `${formatPercent(kpis.parking_percent)} lots occupied`,
      icon: Car,
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      label: 'Avg Queue Time',
      value: `${kpis.avg_queue_time}m`,
      sub: 'Food & beverage stations',
      icon: Clock,
      color: 'bg-yellow-500/20 text-yellow-400',
      alert: kpis.avg_queue_time > 15,
    },
    {
      label: 'Revenue Today',
      value: formatCurrency(kpis.revenue_today),
      sub: 'All revenue streams',
      icon: DollarSign,
      color: 'bg-green-500/20 text-green-400',
      trend: { value: 8.1, up: true },
    },
    {
      label: 'Active Volunteers',
      value: kpis.active_volunteers.toString(),
      sub: 'On shift right now',
      icon: Activity,
      color: 'bg-cyan-500/20 text-cyan-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      {kpis.active_incidents >= 3 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="font-medium">{kpis.active_incidents} active incidents</span> — Medical, Security, and Maintenance teams are responding.
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => <KPICard key={card.label} {...card} />)}
      </div>

      {/* Weather Bar */}
      <div className="glass-card p-4 flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-300">
          <Cloud className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">{kpis.weather_temp.toFixed(1)}°C</span>
          <span className="text-sm">{kpis.weather_condition}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Droplets className="w-4 h-4" />
          <span>{kpis.weather_humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Wind className="w-4 h-4" />
          <span>12 km/h SW</span>
        </div>
        <div className="ml-auto text-xs text-slate-500">
          Stadium Weather · Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Active Incidents + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Active Incidents</h2>
              <p className="section-subtitle">Requiring attention now</p>
            </div>
            <a href="/incidents" className="text-xs text-blue-400 hover:text-blue-300">View all →</a>
          </div>
          <div className="space-y-3">
            {incidents.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-400 p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="w-4 h-4" />
                <span>No active incidents — operations normal</span>
              </div>
            )}
            {incidents.map(incident => (
              <div key={incident.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', {
                  'bg-red-400': incident.severity === 'critical' || incident.severity === 'high',
                  'bg-yellow-400': incident.severity === 'medium',
                  'bg-green-400': incident.severity === 'low',
                })} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white truncate">{incident.title}</span>
                    <span className={cn('badge text-xs', getSeverityColor(incident.severity))}>{incident.severity}</span>
                  </div>
                  <div className="text-xs text-slate-400">{incident.location} · {timeAgo(incident.created_at)}</div>
                </div>
                <span className={cn('badge text-xs', getStatusColor(incident.status))}>{incident.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Live Notifications</h2>
              <p className="section-subtitle">Alerts and updates</p>
            </div>
            <a href="/notifications" className="text-xs text-blue-400 hover:text-blue-300">View all →</a>
          </div>
          <div className="space-y-3">
            {notifications.map(n => {
              const colors = {
                emergency: 'border-red-500/30 bg-red-500/10',
                warning: 'border-yellow-500/30 bg-yellow-500/10',
                info: 'border-blue-500/30 bg-blue-500/10',
                success: 'border-green-500/30 bg-green-500/10',
              };
              return (
                <div key={n.id} className={cn('p-3 rounded-lg border', colors[n.notification_type], !n.is_read && 'ring-1 ring-blue-500/20')}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium text-white">{n.title}</div>
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.message}</div>
                  <div className="text-xs text-slate-500 mt-1">{timeAgo(n.created_at)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gates Open', value: '12/16', icon: CheckCircle, color: 'text-green-400' },
          { label: 'Medical Units', value: '4 Active', icon: Activity, color: 'text-red-400' },
          { label: 'Security Patrols', value: '18 On-duty', icon: TrendingUp, color: 'text-orange-400' },
          { label: 'Shuttle Buses', value: '6 Running', icon: Car, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <Icon className={cn('w-5 h-5 flex-shrink-0', color)} />
            <div>
              <div className="text-base font-bold text-white">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
