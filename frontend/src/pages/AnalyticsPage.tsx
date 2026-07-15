import { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/api';
import { mockAttendanceTrend } from '@/data/mockData';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, AlertTriangle, Car, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <div className="text-slate-300 mb-1.5 font-medium">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-medium">{typeof p.value === 'number' && p.value > 1000 ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({
    attendance_trend: mockAttendanceTrend,
    incident_types: [
      { type: 'Medical', count: 5, fill: '#ef4444' },
      { type: 'Security', count: 4, fill: '#f97316' },
      { type: 'Maintenance', count: 8, fill: '#eab308' },
      { type: 'Lost Child', count: 2, fill: '#8b5cf6' },
      { type: 'Fire', count: 1, fill: '#ec4899' },
    ],
    parking_utilization: [
      { name: 'Lot A (VIP)', occupied: 87, available: 13 },
      { name: 'Lot B (Main)', occupied: 62, available: 38 },
      { name: 'Lot C (East)', occupied: 45, available: 55 },
      { name: 'Lot D (Remote)', occupied: 23, available: 77 },
    ],
    revenue_breakdown: [
      { category: 'Tickets', amount: 98000 },
      { category: 'Food & Bev', amount: 42000 },
      { category: 'Parking', amount: 16000 },
      { category: 'Merch', amount: 12000 },
      { category: 'VIP', amount: 28000 },
    ],
    crowd_density_trend: mockAttendanceTrend.map(d => ({
      time: d.time, north: Math.floor(Math.random() * 30 + 60), south: Math.floor(Math.random() * 30 + 40),
      east: Math.floor(Math.random() * 20 + 70), west: Math.floor(Math.random() * 25 + 55),
    })),
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await dashboardApi.getAnalytics();
      setData(res.data);
    } catch { }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalRevenue = data.revenue_breakdown?.reduce((a: number, r: any) => a + r.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Peak Attendance', value: '47K', icon: Users, color: 'text-blue-400 bg-blue-500/20' },
          { label: 'Total Incidents', value: data.incident_types?.reduce((a: number, i: any) => a + i.count, 0) || 20, icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/20' },
          { label: 'Avg Parking Use', value: '54%', icon: Car, color: 'text-purple-400 bg-purple-500/20' },
          { label: "Today's Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-400 bg-green-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="kpi-card">
            <div className={`p-2 rounded-lg w-fit mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Attendance Trend */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="section-title">Attendance Trend (Today)</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.attendance_trend}>
            <defs>
              <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="url(#attendanceGrad)" strokeWidth={2} name="Attendance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col grid: Incidents + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.incident_types} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={85} label={({ type, count }) => `${type}: ${count}`} labelLine={{ stroke: '#64748b' }}>
                {data.incident_types?.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Breakdown */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Revenue Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenue_breakdown} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {data.revenue_breakdown?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parking Utilization */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Parking Utilization by Lot</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.parking_utilization} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="occupied" name="Occupied %" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="available" name="Available %" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Crowd Density Trend */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Zone Crowd Density Over Time (%)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.crowd_density_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Line type="monotone" dataKey="north" stroke="#3b82f6" strokeWidth={2} dot={false} name="North" />
            <Line type="monotone" dataKey="south" stroke="#22c55e" strokeWidth={2} dot={false} name="South" />
            <Line type="monotone" dataKey="east" stroke="#ef4444" strokeWidth={2} dot={false} name="East" />
            <Line type="monotone" dataKey="west" stroke="#f59e0b" strokeWidth={2} dot={false} name="West" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
