import { useEffect, useState, useCallback } from 'react';
import { Car, Zap, TrendingUp, MapPin, DollarSign, RefreshCw } from 'lucide-react';
import { parkingApi } from '@/lib/api';
import { mockParking } from '@/data/mockData';
import type { ParkingLot } from '@/types';
import { cn, formatPercent } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

function ParkingBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e';
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function ParkingPage() {
  const [lots, setLots] = useState<ParkingLot[]>(mockParking);
  const [stats, setStats] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [lotsRes, statsRes, predRes] = await Promise.allSettled([
        parkingApi.list(), parkingApi.stats(), parkingApi.prediction()
      ]);
      if (lotsRes.status === 'fulfilled') setLots(lotsRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (predRes.status === 'fulfilled') setPrediction(predRes.value.data);
    } catch { }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 8000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const totalSpaces = lots.reduce((a, l) => a + l.total_spaces, 0);
  const totalOccupied = lots.reduce((a, l) => a + l.occupied_spaces, 0);
  const totalAvailable = totalSpaces - totalOccupied;
  const overallPct = (totalOccupied / totalSpaces) * 100;

  const chartData = lots.map(l => ({
    name: l.lot_code?.replace('LOT_', 'Lot ') || l.name.split('–')[0].trim(),
    available: l.available_spaces,
    occupied: l.occupied_spaces,
    pct: l.occupancy_percent,
  }));

  return (
    <div className="space-y-6">
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spaces', value: totalSpaces.toLocaleString(), icon: Car, color: 'text-blue-400 bg-blue-500/20' },
          { label: 'Available', value: totalAvailable.toLocaleString(), icon: Car, color: 'text-green-400 bg-green-500/20' },
          { label: 'Occupied', value: totalOccupied.toLocaleString(), icon: Car, color: 'text-orange-400 bg-orange-500/20' },
          { label: 'Overall Usage', value: formatPercent(overallPct), icon: TrendingUp, color: 'text-purple-400 bg-purple-500/20' },
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

      {/* AI Prediction Banner */}
      {prediction && (
        <div className="glass-card p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-xs text-white font-bold">AI</div>
            <span className="text-sm font-semibold text-blue-300">AI Parking Prediction</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400 text-xs">Predicted Occupancy</div>
              <div className="text-white font-bold text-lg">{prediction.predicted_occupancy_pct}%</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Peak Time</div>
              <div className="text-white font-medium">{prediction.peak_time}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Arrivals/Hour</div>
              <div className="text-white font-medium">{prediction.expected_arrivals_per_hour}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Recommendation</div>
              <div className="text-blue-300 text-xs">{prediction.recommendation}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lot Details */}
        <div className="space-y-4">
          {lots.map(lot => {
            const pct = lot.occupancy_percent;
            const statusColor = pct >= 90 ? 'border-red-500/30 bg-red-500/5' : pct >= 70 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/20 bg-green-500/5';
            const textColor = pct >= 90 ? 'text-red-400' : pct >= 70 ? 'text-yellow-400' : 'text-green-400';

            return (
              <div key={lot.id} className={cn('glass-card p-4 border', statusColor)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{lot.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">{lot.distance_to_entrance}</span>
                      <DollarSign className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">${lot.price_per_hour}/hr</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-xl font-bold', textColor)}>{pct}%</div>
                    <div className="text-xs text-slate-400">{lot.available_spaces} free</div>
                  </div>
                </div>

                <ParkingBar pct={pct} />

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-white">{lot.total_spaces.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-400">{lot.occupied_spaces.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">{lot.ev_spaces - lot.ev_occupied}</span>
                    </div>
                    <div className="text-xs text-slate-500">EV Available</div>
                  </div>
                </div>

                {pct >= 90 && (
                  <div className="mt-2 text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">
                    ⚠️ Nearly full — redirect to Lot C or D
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-1">Lot Comparison</h2>
          <p className="section-subtitle mb-4">Occupied vs available spaces</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="occupied" name="Occupied" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available" name="Available" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* EV Charging Summary */}
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">EV Charging Stations</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-lg font-bold text-white">{lots.reduce((a, l) => a + l.ev_spaces, 0)}</div>
                <div className="text-xs text-slate-400">Total EV Spots</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-400">{lots.reduce((a, l) => a + l.ev_occupied, 0)}</div>
                <div className="text-xs text-slate-400">In Use</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">{lots.reduce((a, l) => a + (l.ev_spaces - l.ev_occupied), 0)}</div>
                <div className="text-xs text-slate-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
