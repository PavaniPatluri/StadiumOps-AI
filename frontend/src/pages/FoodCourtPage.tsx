import { useEffect, useState, useCallback } from 'react';
import { UtensilsCrossed, Clock, Users, TrendingUp, Store } from 'lucide-react';
import { foodCourtApi } from '@/lib/api';
import { mockFoodCourts } from '@/data/mockData';
import type { FoodCourt } from '@/types';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function QueueBar({ queue, capacity }: { queue: number; capacity: number }) {
  const pct = Math.min(100, (queue / capacity) * 100);
  const color = pct >= 70 ? '#ef4444' : pct >= 40 ? '#eab308' : '#22c55e';
  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function FoodCourtPage() {
  const [courts, setCourts] = useState<FoodCourt[]>(mockFoodCourts);
  const [forecast, setForecast] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [courtsRes, forecastRes] = await Promise.allSettled([
        foodCourtApi.list(), foodCourtApi.forecast()
      ]);
      if (courtsRes.status === 'fulfilled') setCourts(courtsRes.value.data);
      if (forecastRes.status === 'fulfilled') setForecast(forecastRes.value.data.forecast || []);
    } catch { }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const avgWait = courts.length ? (courts.reduce((a, c) => a + c.avg_wait_time, 0) / courts.length).toFixed(1) : 0;
  const totalQueue = courts.reduce((a, c) => a + c.current_queue, 0);
  const busiest = courts.reduce((a, c) => c.current_queue > a.current_queue ? c : a, courts[0]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Wait Time', value: `${avgWait}m`, icon: Clock, color: 'text-yellow-400 bg-yellow-500/20' },
          { label: 'Total Queue', value: totalQueue.toString(), icon: Users, color: 'text-blue-400 bg-blue-500/20' },
          { label: 'Open Courts', value: `${courts.filter(c => c.is_open).length}/${courts.length}`, icon: Store, color: 'text-green-400 bg-green-500/20' },
          { label: 'Busiest Court', value: busiest?.avg_wait_time + 'm wait', icon: TrendingUp, color: 'text-red-400 bg-red-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={cn('p-2 rounded-lg w-fit mb-2', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court Cards */}
        <div className="space-y-3">
          <h2 className="section-title">Food Courts</h2>
          {courts.map(court => {
            const waitColor = court.avg_wait_time >= 15 ? 'text-red-400' : court.avg_wait_time >= 10 ? 'text-yellow-400' : 'text-green-400';
            const isHigh = court.avg_wait_time >= 15;
            return (
              <div key={court.id} className={cn('glass-card p-4', isHigh && 'border-red-500/20 bg-red-500/5')}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-white">{court.name}</span>
                      {!court.is_open && <span className="badge bg-red-500/20 text-red-400 border-red-500/30 text-xs">CLOSED</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{court.location} · {court.vendor_count} vendors</div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-xl font-bold', waitColor)}>{court.avg_wait_time}m</div>
                    <div className="text-xs text-slate-400">wait time</div>
                  </div>
                </div>

                <QueueBar queue={court.current_queue} capacity={court.capacity} />

                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>{court.current_queue} in queue</span>
                  <span>Capacity: {court.capacity}</span>
                </div>

                {isHigh && (
                  <div className="mt-2 text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">
                    ⚠️ High queue — open additional counters
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Demand Forecast */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-xs text-white font-bold">AI</div>
            <h2 className="section-title">Demand Forecast</h2>
          </div>
          <p className="section-subtitle mb-4">AI-predicted queue for next 6 hours</p>
          {forecast.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Line type="monotone" dataKey="predicted_queue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Queue Size" />
                <Line type="monotone" dataKey="predicted_wait" stroke="#f59e0b" strokeWidth={2} dot={false} name="Wait (min)" />
                <Line type="monotone" dataKey="recommended_staff" stroke="#22c55e" strokeWidth={2} dot={false} name="Staff Needed" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading forecast...</div>
          )}

          {/* Staff Recommendations */}
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-xs font-semibold text-blue-400 mb-2">AI Staff Recommendations</div>
            {courts.filter(c => c.avg_wait_time >= 15).map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-300">{c.name}</span>
                <span className="text-yellow-400">+2 staff needed</span>
              </div>
            ))}
            {courts.filter(c => c.avg_wait_time < 15).length === courts.length && (
              <div className="text-xs text-green-400">All courts operating within targets ✓</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
