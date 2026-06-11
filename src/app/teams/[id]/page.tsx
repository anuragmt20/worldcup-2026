'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, Users, List, MapPin, Play } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
// @ts-ignore
import lineups from '@/data/football.lineups.json';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { teams, matches, getStandings, stadiums } = useTournamentStore();

  const team = teams.find(t => t.id === id);

  if (!team) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-300">Team Not Found</h2>
        <Link href="/teams" className="text-emerald-400 font-bold flex items-center justify-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back to Teams
        </Link>
      </div>
    );
  }

  const getStadium = (sid: string) => stadiums.find(s => s.id === sid);

  // Standings context
  const standings = getStandings();
  const groupStandings = standings[team.group] || [];
  const teamStanding = groupStandings.find(r => r.teamId === team.id);

  const lineup: { name: string; pos: string }[] = (lineups as Record<string, any>)[team.id] ?? [];

  // Group players by position for pitch display
  const gk = lineup.filter(p => p.pos === 'GK');
  const dfs = lineup.filter(p => p.pos === 'DF');
  const mfs = lineup.filter(p => p.pos === 'MF');
  const fws = lineup.filter(p => p.pos === 'FW');

  // Filter fixtures involving this team
  const teamMatches = matches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id);

  const getOpponent = (match: any) => {
    const oppId = match.homeTeamId === team.id ? match.awayTeamId : match.homeTeamId;
    return teams.find(t => t.id === oppId);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };



  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">

      {/* Back button */}
      <div>
        <Link href="/teams" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Teams
        </Link>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl glass-panel p-8">
        <div className="flex items-center gap-5">
          <img
            src={team.flag}
            alt={`${team.name} Flag`}
            className="h-14 w-22 object-cover rounded shadow border border-slate-800 shrink-0"
          />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">{team.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-semibold tracking-wide">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">FIFA: {team.fifaCode}</span>
              <span>&bull;</span>
              <span>GROUP {team.group}</span>
              {teamStanding && (
                <>
                  <span>&bull;</span>
                  <span>Pos: #{teamStanding.position} ({teamStanding.points} pts)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Standings & Matches */}
        <div className="lg:col-span-7 space-y-8">

          {/* Group Standings */}
          <div className="rounded-xl glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <List className="h-4 w-4 text-emerald-400" /> Group standings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-900 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    <th className="pb-3 w-8">#</th>
                    <th className="pb-3">Team</th>
                    <th className="pb-3 text-center">P</th>
                    <th className="pb-3 text-center">GD</th>
                    <th className="pb-3 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {groupStandings.map((row) => (
                    <tr
                      key={row.teamId}
                      className={`
                        transition-colors
                        ${row.teamId === team.id ? 'bg-emerald-500/5 text-emerald-400 font-bold' : 'text-slate-300'}
                      `}
                    >
                      <td className="py-3 font-bold">{row.position}</td>
                      <td className="py-3">
                        <Link href={`/teams/${row.teamId}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                          <img src={row.teamFlag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                          <span className="truncate max-w-[120px]">{row.teamName}</span>
                        </Link>
                      </td>
                      <td className="py-3 text-center">{row.played}</td>
                      <td className="py-3 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                      <td className="py-3 text-center font-bold text-emerald-400">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixtures & Results */}
          <div className="rounded-xl glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" /> Team Fixtures & Results
            </h3>

            <div className="space-y-3">
              {teamMatches.map(match => {
                const opponent = getOpponent(match);
                const stadium = getStadium(match.stadiumId);
                const isHome = match.homeTeamId === team.id;
                const scoreHome = isHome ? match.homeScore : match.awayScore;
                const scoreAway = isHome ? match.awayScore : match.homeScore;

                return (
                  <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/40 border border-slate-900/60 hover:border-slate-850 transition-colors">

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        MATCH #{match.id} &bull; {match.type === 'group' ? `GROUP ${match.group}` : match.group}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-black text-slate-200">
                        <span>{isHome ? 'VS' : 'AT'}</span>
                        {opponent ? (
                          <Link href={`/teams/${opponent.id}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                            <img src={opponent.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                            <span className="uppercase">{opponent.name}</span>
                          </Link>
                        ) : (
                          <span className="italic">{isHome ? match.awayTeamLabel : match.homeTeamLabel}</span>
                        )}
                      </div>

                      {stadium && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{stadium.name}, {stadium.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Score or Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400">{formatDate(match.localDate)}</span>

                      {match.finished ? (
                        <div className={`text-xs font-black px-3 py-1.5 rounded border ${scoreHome > scoreAway ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : scoreHome < scoreAway ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' : 'bg-slate-900 border-slate-850 text-slate-300'}`}>
                          {match.homeScore} - {match.awayScore}
                        </div>
                      ) : match.timeElapsed !== 'notstarted' ? (
                        <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1.5 rounded uppercase tracking-wider">
                          LIVE &bull; {match.homeScore} - {match.awayScore} ({match.timeElapsed})
                        </div>
                      ) : opponent ? (
                        <div className="text-[10px] text-slate-450 font-bold uppercase border border-slate-850 bg-slate-900/40 px-3 py-1.5 rounded">Scheduled</div>
                      ) : (
                        <div className="text-[10px] text-slate-500 font-bold italic uppercase border border-slate-900 px-3 py-1.5 rounded">TBD</div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Squad Roster Grid */}
        <div className="lg:col-span-5 space-y-8">

          {/* Pitch Roster */}
          <div className="rounded-xl glass-panel p-6 space-y-6">
            <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" /> Starting XI Pitch Lineup
            </h3>

            {/* Soccer Pitch Graphic representation */}
            <div style={{ aspectRatio: '3/4' }} className="relative w-full rounded-lg bg-emerald-950/45 border-2 border-emerald-500/20 overflow-hidden flex flex-col justify-between p-4 shadow-inner">

              {/* Center Line and Center Circle */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-emerald-500/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500/15" />

              {/* Penalty Area Top */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-44 h-16 border-b border-x border-emerald-500/10" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-24 h-6 border-b border-x border-emerald-500/10" />

              {/* Penalty Area Bottom */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-44 h-16 border-t border-x border-emerald-500/10" />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-24 h-6 border-t border-x border-emerald-500/10" />

              {/* Pitch Players Nodes representation */}
              {/* Forwards */}
              <div className="flex justify-around items-center z-10 pt-4">
                {fws.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white/40 shadow">FW</div>
                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-wide mt-1.5 bg-slate-950/60 px-1.5 py-0.5 rounded">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Midfielders */}
              <div className="flex justify-around items-center z-10">
                {mfs.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-200 font-black text-[10px] flex items-center justify-center border border-slate-700 shadow">MF</div>
                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-wide mt-1.5 bg-slate-950/60 px-1.5 py-0.5 rounded">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Defenders */}
              <div className="flex justify-around items-center z-10">
                {dfs.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-slate-800 text-slate-200 font-black text-[10px] flex items-center justify-center border border-slate-700 shadow">DF</div>
                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-wide mt-1.5 bg-slate-950/60 px-1.5 py-0.5 rounded">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Goalkeeper */}
              <div className="flex justify-center items-center z-10 pb-4">
                {gk.map((p, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-yellow-500 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white/40 shadow">GK</div>
                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-wide mt-1.5 bg-slate-950/60 px-1.5 py-0.5 rounded">{p.name}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
