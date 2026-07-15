import { useEffect, useState, useCallback } from 'react';
import { Users, MapPin, CheckCircle, Clock, Zap, User } from 'lucide-react';
import { volunteersApi } from '@/lib/api';
import { mockVolunteers } from '@/data/mockData';
import type { Volunteer } from '@/types';
import { cn } from '@/lib/utils';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [aiTasks, setAiTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'on_duty'>('all');

  const fetchData = useCallback(async () => {
    try {
      const [volRes, tasksRes, statsRes] = await Promise.allSettled([
        volunteersApi.list(), volunteersApi.aiTasks(), volunteersApi.stats()
      ]);
      if (volRes.status === 'fulfilled') setVolunteers(volRes.value.data);
      if (tasksRes.status === 'fulfilled') setAiTasks(tasksRes.value.data.recommendations || []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
    } catch {
      setAiTasks([
        { priority: 'HIGH', zone: 'East Wing', task: 'Crowd flow management — redirect fans to West Gate', volunteers_needed: 4, reason: 'Current density at 94% capacity' },
        { priority: 'MEDIUM', zone: 'Food Court Zone A', task: 'Queue management assistance', volunteers_needed: 2, reason: '22-minute wait time exceeds target' },
        { priority: 'MEDIUM', zone: 'Parking Lot A', task: 'Direct vehicles to Lot C/D', volunteers_needed: 3, reason: 'Lot A at 87% capacity' },
      ]);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = volunteers.filter(v => {
    if (filter === 'available') return v.is_available;
    if (filter === 'on_duty') return !v.is_available;
    return true;
  });

  const totalAvailable = volunteers.filter(v => v.is_available).length;
  const totalOnDuty = volunteers.filter(v => !v.is_available).length;

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Volunteers', value: volunteers.length, icon: Users, color: 'text-blue-400 bg-blue-500/20' },
          { label: 'Available', value: totalAvailable, icon: CheckCircle, color: 'text-green-400 bg-green-500/20' },
          { label: 'On Duty', value: totalOnDuty, icon: Clock, color: 'text-orange-400 bg-orange-500/20' },
          { label: 'Tasks Done Today', value: volunteers.reduce((a, v) => a + v.tasks_completed, 0), icon: Zap, color: 'text-purple-400 bg-purple-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={cn('p-2 rounded-lg w-fit mb-2', color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer List */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Volunteer Roster</h2>
            <div className="flex gap-1">
              {(['all', 'available', 'on_duty'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                    filter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  )}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(v => (
              <div key={v.id} className="p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{v.name}</span>
                      <span className={cn('badge text-xs', v.is_available ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30')}>
                        {v.is_available ? 'Available' : 'On Duty'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400">{v.role}</span>
                      {v.zone_assigned && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-2.5 h-2.5" />{v.zone_assigned}
                        </span>
                      )}
                    </div>
                    {v.skills && <div className="text-xs text-blue-400/70 mt-0.5">{v.skills}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{v.tasks_completed}</div>
                    <div className="text-xs text-slate-500">tasks</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Task Recommendations */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-xs text-white font-bold">AI</div>
            <h2 className="section-title">AI Task Recommendations</h2>
          </div>
          <div className="space-y-3">
            {aiTasks.map((task, i) => (
              <div key={i} className={cn('p-3 rounded-lg border', priorityColors[task.priority] || 'border-slate-600/30 bg-slate-800/40')}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('badge text-xs', priorityColors[task.priority])}>{task.priority}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {task.zone}
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <Users className="w-3 h-3" />
                    {task.volunteers_needed} needed
                  </div>
                </div>
                <div className="text-sm text-slate-200 font-medium mb-1">{task.task}</div>
                <div className="text-xs text-slate-400">{task.reason}</div>
              </div>
            ))}
          </div>

          {/* Zone Distribution */}
          {stats?.by_zone && (
            <div className="mt-5">
              <div className="text-sm font-semibold text-white mb-3">Deployment by Zone</div>
              <div className="space-y-2">
                {stats.by_zone.slice(0, 6).map((z: any) => (
                  <div key={z.zone} className="flex items-center gap-3">
                    <div className="text-xs text-slate-400 w-28 truncate">{z.zone}</div>
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(z.count / volunteers.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-300 w-4 text-right">{z.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
