import { useEffect, useState, useCallback } from 'react';
import { zonesApi } from '@/lib/api';
import { mockZones } from '@/data/mockData';
import type { StadiumZone } from '@/types';
import { cn, getDensityColor, getDensityBg, formatPercent } from '@/lib/utils';
import { Users, RefreshCw, Info, X } from 'lucide-react';

export default function MapPage() {
  const [zones, setZones] = useState<StadiumZone[]>(mockZones);
  const [selected, setSelected] = useState<StadiumZone | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      const res = await zonesApi.list();
      setZones(res.data);
    } catch { /* use mock */ }
  }, []);

  useEffect(() => {
    fetchZones();
    const iv = setInterval(fetchZones, 5000);
    return () => clearInterval(iv);
  }, [fetchZones]);

  const densityCounts = {
    green: zones.filter(z => z.density_level === 'green').length,
    yellow: zones.filter(z => z.density_level === 'yellow').length,
    red: zones.filter(z => z.density_level === 'red').length,
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <Info className="w-4 h-4 text-blue-400" />
          Crowd Density Map
        </div>
        <div className="flex items-center gap-4 ml-auto">
          {[
            { level: 'green', label: 'Normal (<65%)' },
            { level: 'yellow', label: 'Busy (65–84%)' },
            { level: 'red', label: 'Critical (85%+)' },
          ].map(({ level, label }) => (
            <div key={level} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getDensityColor(level) }} />
              <span className="text-xs text-slate-400">{label}</span>
              <span className="badge text-xs" style={{ backgroundColor: `${getDensityColor(level)}20`, color: getDensityColor(level), borderColor: `${getDensityColor(level)}50` }}>
                {densityCounts[level as keyof typeof densityCounts]}
              </span>
            </div>
          ))}
        </div>
        <button onClick={fetchZones} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stadium Map SVG */}
        <div className="xl:col-span-2 glass-card p-4">
          <div className="text-sm text-slate-400 mb-3">Click a zone for details</div>
          <div className="relative w-full" style={{ paddingBottom: '70%' }}>
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '8px' }}
            >
              {/* Stadium outline */}
              <ellipse cx="50" cy="50" rx="48" ry="48" fill="none" stroke="#334155" strokeWidth="0.5" />
              <ellipse cx="50" cy="50" rx="40" ry="40" fill="none" stroke="#1e3a5f" strokeWidth="0.3" strokeDasharray="2 1" />

              {/* Field */}
              <rect x="25" y="30" width="50" height="40" rx="4" fill="#064e3b" stroke="#065f46" strokeWidth="0.5" />
              {/* Field markings */}
              <rect x="35" y="36" width="30" height="28" fill="none" stroke="#065f46" strokeWidth="0.3" />
              <circle cx="50" cy="50" r="6" fill="none" stroke="#065f46" strokeWidth="0.3" />
              <line x1="50" y1="36" x2="50" y2="64" stroke="#065f46" strokeWidth="0.3" />

              {/* Zones */}
              {zones.map(zone => {
                if (!zone.x_position || zone.zone_code === 'FIELD') return null;
                const color = getDensityColor(zone.density_level);
                const pct = zone.current_occupancy / zone.capacity;
                const isSelected = selected?.id === zone.id;

                return (
                  <g key={zone.id} className="zone-hover" onClick={() => setSelected(zone === selected ? null : zone)}>
                    <rect
                      x={zone.x_position}
                      y={zone.y_position}
                      width={zone.width}
                      height={zone.height}
                      rx="1"
                      fill={color + '40'}
                      stroke={color}
                      strokeWidth={isSelected ? 1 : 0.5}
                      style={{ transition: 'all 0.3s' }}
                    />
                    {isSelected && (
                      <rect
                        x={zone.x_position! - 0.5}
                        y={zone.y_position! - 0.5}
                        width={zone.width! + 1}
                        height={zone.height! + 1}
                        rx="1.5"
                        fill="none"
                        stroke="white"
                        strokeWidth="0.8"
                        opacity="0.6"
                      />
                    )}
                    {/* Zone label */}
                    <text
                      x={zone.x_position! + zone.width! / 2}
                      y={zone.y_position! + zone.height! / 2 - 1.5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="2"
                      fontWeight="600"
                      opacity="0.9"
                    >
                      {zone.name.split(' ')[0]}
                    </text>
                    <text
                      x={zone.x_position! + zone.width! / 2}
                      y={zone.y_position! + zone.height! / 2 + 2}
                      textAnchor="middle"
                      fill={color}
                      fontSize="2"
                    >
                      {Math.round(pct * 100)}%
                    </text>

                    {/* Pulse for red zones */}
                    {zone.density_level === 'red' && (
                      <circle
                        cx={zone.x_position! + zone.width! / 2}
                        cy={zone.y_position! + zone.height! / 2}
                        r="2"
                        fill={color}
                        opacity="0.4"
                      >
                        <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Compass rose */}
              <text x="50" y="4" textAnchor="middle" fill="#64748b" fontSize="3">N</text>
              <text x="50" y="99" textAnchor="middle" fill="#64748b" fontSize="3">S</text>
              <text x="2" y="52" textAnchor="middle" fill="#64748b" fontSize="3">W</text>
              <text x="98" y="52" textAnchor="middle" fill="#64748b" fontSize="3">E</text>
            </svg>
          </div>
        </div>

        {/* Zone Details Panel */}
        <div className="space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Zone Overview</h3>
            <div className="space-y-2">
              {zones.filter(z => z.zone_code !== 'FIELD').map(zone => {
                const pct = zone.current_occupancy / zone.capacity;
                const isSelected = selected?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelected(isSelected ? null : zone)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all',
                      isSelected ? 'bg-slate-700/80 ring-1 ring-blue-500/40' : 'hover:bg-slate-800/60'
                    )}
                  >
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: getDensityColor(zone.density_level) }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">{zone.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct * 100}%`, backgroundColor: getDensityColor(zone.density_level) }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{Math.round(pct * 100)}%</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-white font-medium">{zone.current_occupancy.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">/{zone.capacity.toLocaleString()}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Zone Details */}
          {selected && (
            <div className={cn('glass-card p-4 border animate-fade-in', getDensityBg(selected.density_level))}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Occupancy</span>
                  <span className="text-white font-medium">{selected.current_occupancy.toLocaleString()} / {selected.capacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity %</span>
                  <span className="text-white font-medium">{formatPercent((selected.current_occupancy / selected.capacity) * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className={cn('badge', getDensityBg(selected.density_level))} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                    {selected.density_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available</span>
                  <span className="text-white font-medium">{(selected.capacity - selected.current_occupancy).toLocaleString()} spaces</span>
                </div>
              </div>
              {selected.density_level === 'red' && (
                <div className="mt-3 p-2 rounded-lg bg-red-500/20 text-xs text-red-300">
                  ⚠️ Overcrowded! Redirect fans and deploy crowd control.
                </div>
              )}
              {selected.density_level === 'yellow' && (
                <div className="mt-3 p-2 rounded-lg bg-yellow-500/20 text-xs text-yellow-300">
                  ⚡ Getting busy. Monitor closely.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
