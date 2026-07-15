import { useEffect, useState, useCallback } from 'react';
import { Plus, AlertTriangle, RefreshCw, Filter, Loader2, CheckCircle, Clock, X } from 'lucide-react';
import { incidentsApi } from '@/lib/api';
import { mockIncidents } from '@/data/mockData';
import type { Incident, IncidentType, IncidentStatus } from '@/types';
import { cn, getSeverityColor, getStatusColor, getIncidentColor, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const INCIDENT_TYPES: { value: IncidentType; label: string; emoji: string }[] = [
  { value: 'medical', label: 'Medical', emoji: '🏥' },
  { value: 'security', label: 'Security', emoji: '🔒' },
  { value: 'fire', label: 'Fire', emoji: '🔥' },
  { value: 'lost_child', label: 'Lost Child', emoji: '👶' },
  { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { value: 'other', label: 'Other', emoji: '📋' },
];

function IncidentModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    title: '', description: '', incident_type: 'medical' as IncidentType,
    location: '', zone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Report New Incident</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Incident Type</label>
            <div className="grid grid-cols-3 gap-2">
              {INCIDENT_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, incident_type: t.value }))}
                  className={cn('p-2.5 rounded-lg border text-center text-sm transition-all', form.incident_type === t.value
                    ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-slate-800/40 border-slate-600/30 text-slate-400 hover:border-slate-500'
                  )}
                >
                  <div className="text-lg mb-0.5">{t.emoji}</div>
                  <div className="text-xs">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field w-full" placeholder="Brief incident title" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input-field w-full resize-none" rows={3} placeholder="Describe the incident in detail..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="input-field w-full" placeholder="e.g. Section B-12" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Zone</label>
              <input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                className="input-field w-full" placeholder="e.g. North Stand" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI...</> : <>Report Incident</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchIncidents = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.incident_type = filterType;
      const res = await incidentsApi.list(params);
      setIncidents(res.data);
    } catch { }
  }, [filterStatus, filterType]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleCreate = async (data: any) => {
    try {
      const res = await incidentsApi.create(data);
      setIncidents(prev => [res.data, ...prev]);
      toast.success('Incident reported! AI is analyzing...');
    } catch {
      const mockIncident: Incident = {
        id: Date.now(), ...data,
        severity: 'medium', status: 'open',
        ai_summary: 'AI analysis in progress...',
        ai_recommended_actions: 'Dispatching response team...',
        ai_estimated_resolution: '20-40 minutes',
        created_at: new Date().toISOString(),
      };
      setIncidents(prev => [mockIncident, ...prev]);
      toast.success('Incident reported (demo mode)');
    }
    setShowModal(false);
  };

  const handleStatusUpdate = async (id: number, status: IncidentStatus) => {
    try {
      await incidentsApi.update(id, { status });
    } catch { }
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selectedIncident?.id === id) setSelectedIncident(prev => prev ? { ...prev, status } : null);
    toast.success(`Incident marked as ${status.replace('_', ' ')}`);
  };

  const filtered = incidents.filter(i =>
    (filterStatus === 'all' || i.status === filterStatus) &&
    (filterType === 'all' || i.incident_type === filterType)
  );

  const stats = {
    open: incidents.filter(i => i.status === 'open').length,
    in_progress: incidents.filter(i => i.status === 'in_progress').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stats.open, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'In Progress', value: stats.in_progress, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Critical', value: stats.critical, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map(s => (
          <div key={s.label} className={cn('glass-card p-4 flex items-center gap-3', s.bg)}>
            <AlertTriangle className={cn('w-5 h-5 flex-shrink-0', s.color)} />
            <div>
              <div className={cn('text-xl font-bold', s.color)}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="input-field text-xs py-1.5">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="input-field text-xs py-1.5">
            <option value="all">All Types</option>
            {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button onClick={fetchIncidents} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="ml-auto">
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident List */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">All Incidents ({filtered.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map(incident => (
              <button
                key={incident.id}
                onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all',
                  selectedIncident?.id === incident.id
                    ? 'bg-slate-700/80 border-blue-500/40'
                    : 'bg-slate-800/40 border-transparent hover:border-slate-600/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-lg flex-shrink-0">
                    {INCIDENT_TYPES.find(t => t.value === incident.incident_type)?.emoji || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">{incident.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cn('badge text-xs', getSeverityColor(incident.severity))}>{incident.severity}</span>
                      <span className={cn('badge text-xs', getStatusColor(incident.status))}>{incident.status.replace('_', ' ')}</span>
                      {incident.zone && <span className="text-xs text-slate-500">{incident.zone}</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{timeAgo(incident.created_at)}</div>
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                No incidents found
              </div>
            )}
          </div>
        </div>

        {/* AI Detail Panel */}
        <div className="glass-card p-5">
          {selectedIncident ? (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{INCIDENT_TYPES.find(t => t.value === selectedIncident.incident_type)?.emoji}</span>
                    <h2 className="text-base font-bold text-white">{selectedIncident.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <span className={cn('badge', getSeverityColor(selectedIncident.severity))}>{selectedIncident.severity}</span>
                    <span className={cn('badge', getStatusColor(selectedIncident.status))}>{selectedIncident.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/40">
                <div className="text-xs text-slate-400 mb-1">Description</div>
                <div className="text-sm text-slate-300">{selectedIncident.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedIncident.location && (
                  <div className="p-2.5 rounded-lg bg-slate-800/40">
                    <div className="text-xs text-slate-400 mb-0.5">Location</div>
                    <div className="text-white text-xs">{selectedIncident.location}</div>
                  </div>
                )}
                {selectedIncident.zone && (
                  <div className="p-2.5 rounded-lg bg-slate-800/40">
                    <div className="text-xs text-slate-400 mb-0.5">Zone</div>
                    <div className="text-white text-xs">{selectedIncident.zone}</div>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selectedIncident.ai_summary && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-xs text-white font-bold">AI</div>
                    <span className="text-xs font-semibold text-blue-400">AI Analysis</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed mb-3">{selectedIncident.ai_summary}</div>
                  {selectedIncident.ai_recommended_actions && (
                    <div>
                      <div className="text-xs text-blue-400 font-medium mb-1.5">Recommended Actions</div>
                      <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{selectedIncident.ai_recommended_actions}</div>
                    </div>
                  )}
                  {selectedIncident.ai_estimated_resolution && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Est. resolution: <span className="text-white">{selectedIncident.ai_estimated_resolution}</span></span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {selectedIncident.status === 'open' && (
                  <button onClick={() => handleStatusUpdate(selectedIncident.id, 'in_progress')}
                    className="btn-secondary text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />In Progress
                  </button>
                )}
                {(selectedIncident.status === 'open' || selectedIncident.status === 'in_progress') && (
                  <button onClick={() => handleStatusUpdate(selectedIncident.id, 'resolved')}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" />Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-600 mb-3" />
              <div className="text-slate-400 text-sm">Select an incident to view</div>
              <div className="text-slate-500 text-xs mt-1">AI-powered analysis and recommendations</div>
            </div>
          )}
        </div>
      </div>

      {showModal && <IncidentModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </div>
  );
}
