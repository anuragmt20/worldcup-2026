'use client';

import React from 'react';
import { BarChart3, Trophy, Users, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';

export default function StatsPage() {
  const { matches, teams } = useTournamentStore();

  const finishedMatches = matches.filter(m => m.finished);

  // 1. Dynamic Top Scorers calculation from simulated match events!
  const scorersMap: { [name: string]: { goals: number; teamId: string } } = {};

  finishedMatches.forEach(match => {
    const processScorers = (scorersList: string[] | null, teamId: string) => {
      if (!scorersList) return;
      scorersList.forEach(s => {
        // Extract scorer name (e.g. "Mbappé 45'" -> "Mbappé")
        const namePart = s.replace(/\s\d+'/, '').trim();
        if (namePart && namePart !== 'null' && namePart !== 'None') {
          if (!scorersMap[namePart]) {
            scorersMap[namePart] = { goals: 0, teamId };
          }
          scorersMap[namePart].goals += 1;
        }
      });
    };

    processScorers(match.homeScorers, match.homeTeamId);
    processScorers(match.awayScorers, match.awayTeamId);
  });

  const topScorers = Object.keys(scorersMap)
    .map(name => ({
      name,
      goals: scorersMap[name].goals,
      teamId: scorersMap[name].teamId,
      team: teams.find(t => t.id === scorersMap[name].teamId)
    }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10); // Top 10

  // 2. Team Stats Calculation: Total Goals Scored
  const teamStatsMap: { [teamId: string]: { goals: number; mp: number; possessionSum: number; cleanSheets: number } } = {};

  // Initialize all teams
  teams.forEach(t => {
    teamStatsMap[t.id] = { goals: 0, mp: 0, possessionSum: 0, cleanSheets: 0 };
  });

  finishedMatches.forEach(match => {
    const statsHome = teamStatsMap[match.homeTeamId];
    const statsAway = teamStatsMap[match.awayTeamId];

    if (statsHome && statsAway) {
      statsHome.mp += 1;
      statsAway.mp += 1;

      statsHome.goals += match.homeScore;
      statsAway.goals += match.awayScore;

      // Mock possession based on match id seed
      const matchIdNum = Number(match.id) || 1;
      const homePossession = 40 + (matchIdNum % 20);
      const awayPossession = 100 - homePossession;

      statsHome.possessionSum += homePossession;
      statsAway.possessionSum += awayPossession;

      if (match.awayScore === 0) statsHome.cleanSheets += 1;
      if (match.homeScore === 0) statsAway.cleanSheets += 1;
    }
  });

  // Sort teams by Goals Scored
  const teamGoalsRankings = teams
    .map(t => {
      const stats = teamStatsMap[t.id];
      return {
        team: t,
        goals: stats ? stats.goals : 0,
      };
    })
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 8);

  // Sort teams by Average Possession
  const teamPossessionRankings = teams
    .map(t => {
      const stats = teamStatsMap[t.id];
      const avg = stats && stats.mp > 0 ? Math.round(stats.possessionSum / stats.mp) : 0;
      return {
        team: t,
        possession: avg,
      };
    })
    .sort((a, b) => b.possession - a.possession)
    .slice(0, 8);

  // Sort teams by Clean Sheets
  const teamCleanSheetsRankings = teams
    .map(t => {
      const stats = teamStatsMap[t.id];
      return {
        team: t,
        cleanSheets: stats ? stats.cleanSheets : 0,
      };
    })
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Tournament Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Live tracking of top scorers, team performance, and defensive clean sheets</p>
      </div>

      {finishedMatches.length === 0 ? (
        // Blank slate notice
        <div className="text-center py-16 rounded-xl glass-panel p-8">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-300 uppercase">Analytics Dashboard Empty</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            Matches must be simulated or played to populate the leaderboard. Use the **Simulation Control panel** on the Homepage to run games!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Scorers - Golden Boot (5 columns) */}
          <div className="lg:col-span-5 rounded-xl glass-panel p-6 space-y-5">
            <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-yellow-400" /> Golden Boot Standings
            </h2>

            <div className="space-y-3">
              {topScorers.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-4">No goals recorded yet.</div>
              ) : (
                topScorers.map((scorer, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-900/60 hover:border-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
                      {scorer.team && (
                        <img src={scorer.team.flag} alt="" className="h-4 w-6 object-cover rounded shadow-sm border border-slate-800" />
                      )}
                      <div>
                        <div className="text-xs font-black text-slate-200 uppercase tracking-wide">{scorer.name}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">{scorer.team?.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 py-1.5 px-3 rounded">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                      {scorer.goals} {scorer.goals === 1 ? 'Goal' : 'Goals'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Metrics (7 columns) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Goals Scored & Possession Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Goals Scored */}
              <div className="rounded-xl glass-panel p-6 space-y-4">
                <h3 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-400" /> Goals Scored (Teams)
                </h3>
                <div className="space-y-3">
                  {teamGoalsRankings.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2 truncate">
                        <img src={t.team.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                        <span className="font-semibold text-slate-200 truncate max-w-[80px]">{t.team.name}</span>
                      </div>
                      <div className="font-black text-emerald-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">{t.goals} goals</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Possession averages */}
              <div className="rounded-xl glass-panel p-6 space-y-4">
                <h3 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-emerald-400" /> Avg Possession
                </h3>
                <div className="space-y-3">
                  {teamPossessionRankings.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2 truncate">
                        <img src={t.team.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                        <span className="font-semibold text-slate-200 truncate max-w-[80px]">{t.team.name}</span>
                      </div>
                      <div className="font-black text-blue-400 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">{t.possession}%</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Clean Sheets */}
            <div className="rounded-xl glass-panel p-6 space-y-4">
              <h3 className="text-xs font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" /> Clean Sheets (Shutouts)
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {teamCleanSheetsRankings.map((t, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-950/40 border border-slate-900/60 text-center">
                    <img src={t.team.flag} alt="" className="h-6 w-9 object-cover rounded shadow-sm border border-slate-800 mb-2" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wide truncate max-w-full">{t.team.name}</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 py-0.5 px-2.5 rounded mt-2">{t.cleanSheets} clean</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
