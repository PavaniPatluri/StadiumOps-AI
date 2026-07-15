import { useEffect, useState, useCallback } from 'react';
import { Trophy, Calendar, Users, Activity } from 'lucide-react';
import { tournamentApi } from '@/lib/api';
import { mockTeams } from '@/data/mockData';
import type { Team, Fixture } from '@/types';
import { cn } from '@/lib/utils';

const FLAG_EMOJIS: Record<string, string> = {
  USA: '🇺🇸', Brazil: '🇧🇷', Germany: '🇩🇪', Spain: '🇪🇸',
  France: '🇫🇷', Italy: '🇮🇹', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Portugal: '🇵🇹',
};

function ScoreBadge({ home, away, status }: { home?: number; away?: number; status: string }) {
  if (status === 'scheduled') return <span className="text-slate-400 text-xs">TBD</span>;
  if (status === 'live') return (
    <div className="flex items-center gap-2">
      <span className="text-white font-bold text-sm">{home ?? 0} – {away ?? 0}</span>
      <span className="badge bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">LIVE</span>
    </div>
  );
  return <span className="text-white font-bold text-sm">{home ?? 0} – {away ?? 0}</span>;
}

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'standings'>('fixtures');
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, fixturesRes, standingsRes] = await Promise.allSettled([
        tournamentApi.teams(), tournamentApi.fixtures(), tournamentApi.standings()
      ]);
      if (teamsRes.status === 'fulfilled') setTeams(teamsRes.value.data);
      if (fixturesRes.status === 'fulfilled') setFixtures(fixturesRes.value.data);
      if (standingsRes.status === 'fulfilled') setStandings(standingsRes.value.data.standings || []);
    } catch {
      // Mock fixtures
      setFixtures([
        { id: 1, home_team: mockTeams[0], away_team: mockTeams[2], home_score: 1, away_score: 0, status: 'live', stage: 'Group A', venue: 'Main Arena', match_date: new Date().toISOString(), expected_attendance: 65000 },
        { id: 2, home_team: mockTeams[4], away_team: mockTeams[6], home_score: 2, away_score: 1, status: 'completed', stage: 'Group B', venue: 'Stadium North', match_date: new Date(Date.now() - 2 * 86400000).toISOString(), expected_attendance: 55000 },
        { id: 3, home_team: mockTeams[1], away_team: mockTeams[3], status: 'scheduled', stage: 'Group A', venue: 'Stadium South', match_date: new Date(Date.now() + 2 * 86400000).toISOString(), expected_attendance: 45000 },
      ]);
      setStandings(mockTeams.map((t, i) => ({ ...t, played: t.wins + t.losses + t.draws, goal_difference: t.goals_for - t.goals_against, points: t.wins * 3 + t.draws })));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const groupA = standings.filter(t => t.group_name === 'Group A').sort((a, b) => b.points - a.points);
  const groupB = standings.filter(t => t.group_name === 'Group B').sort((a, b) => b.points - a.points);
  const liveFixtures = fixtures.filter(f => f.status === 'live');

  return (
    <div className="space-y-6">
      {/* Live Match Banner */}
      {liveFixtures.map(f => f.home_team && f.away_team && (
        <div key={f.id} className="glass-card p-4 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-xs font-bold text-red-400 uppercase">Live Now</span>
            </div>
            <div className="text-xs text-slate-400">{f.venue}</div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="text-center">
              <div className="text-base font-bold text-white">{FLAG_EMOJIS[f.home_team.country || ''] || '🏳️'} {f.home_team.name}</div>
            </div>
            <ScoreBadge home={f.home_score} away={f.away_score} status={f.status} />
            <div className="text-center">
              <div className="text-base font-bold text-white">{f.away_team.name} {FLAG_EMOJIS[f.away_team.country || ''] || '🏳️'}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
            <span>{f.stage}</span>
            {f.expected_attendance && <span>Expected: {f.expected_attendance.toLocaleString()} fans</span>}
          </div>
        </div>
      ))}

      {/* Tabs */}
      <div className="flex gap-1 glass-card p-1 w-fit">
        {(['fixtures', 'standings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'fixtures' && (
        <div className="space-y-3">
          {(['live', 'scheduled', 'completed'] as const).map(status => {
            const group = fixtures.filter(f => f.status === status);
            if (group.length === 0) return null;
            return (
              <div key={status}>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {status === 'live' ? '🔴 Live' : status === 'scheduled' ? '📅 Upcoming' : '✅ Completed'}
                </h3>
                <div className="space-y-2">
                  {group.map(f => f.home_team && f.away_team && (
                    <div key={f.id} className={cn('glass-card p-4', status === 'live' && 'border-red-500/20')}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-sm font-medium text-white text-right w-32 truncate">
                            {FLAG_EMOJIS[f.home_team.country || ''] || '🏳️'} {f.home_team.name}
                          </div>
                          <div className="flex items-center justify-center w-24">
                            <ScoreBadge home={f.home_score} away={f.away_score} status={f.status} />
                          </div>
                          <div className="text-sm font-medium text-white w-32 truncate">
                            {f.away_team.name} {FLAG_EMOJIS[f.away_team.country || ''] || '🏳️'}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-400 ml-4">
                          <div>{f.stage}</div>
                          <div>{f.venue}</div>
                          {f.match_date && <div>{new Date(f.match_date).toLocaleDateString()}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'standings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[{ label: 'Group A', data: groupA }, { label: 'Group B', data: groupB }].map(({ label, data }) => (
            <div key={label} className="glass-card overflow-hidden">
              <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-700/50">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> {label}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700/50">
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-2 py-2 text-center">P</th>
                      <th className="px-2 py-2 text-center">W</th>
                      <th className="px-2 py-2 text-center">D</th>
                      <th className="px-2 py-2 text-center">L</th>
                      <th className="px-2 py-2 text-center">GD</th>
                      <th className="px-2 py-2 text-center font-bold">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((team, idx) => (
                      <tr key={team.id} className={cn('border-b border-slate-700/30 hover:bg-slate-800/40', idx < 2 && 'text-white')}>
                        <td className="px-4 py-2.5">
                          <span className={cn('w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs',
                            idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-500/20 text-slate-300' : 'text-slate-500'
                          )}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {FLAG_EMOJIS[team.country || ''] || '🏳️'} {team.name}
                        </td>
                        <td className="px-2 py-2.5 text-center text-slate-400">{team.played}</td>
                        <td className="px-2 py-2.5 text-center text-green-400">{team.wins}</td>
                        <td className="px-2 py-2.5 text-center text-yellow-400">{team.draws}</td>
                        <td className="px-2 py-2.5 text-center text-red-400">{team.losses}</td>
                        <td className="px-2 py-2.5 text-center text-slate-300">
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </td>
                        <td className="px-2 py-2.5 text-center font-bold text-white">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
