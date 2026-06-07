'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, Trophy, Calendar, MapPin } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';

export default function GroupsPage() {
  const { getStandings, getThirdPlaceTeams } = useTournamentStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-850 border-t-emerald-500" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Standings...</span>
        </div>
      </div>
    );
  }

  const standings = getStandings();
  const thirdPlaceTeams = getThirdPlaceTeams();

  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Check if a team is one of the top 8 qualified third-placed teams
  const isBestThirdPlaced = (teamId: string) => {
    const qualifiedThirds = thirdPlaceTeams.slice(0, 8);
    return qualifiedThirds.some(t => t.teamId === teamId);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Group Standings</h1>
        <p className="text-sm text-slate-400 mt-1">Recalculating live standings across all 12 groups</p>
      </div>

      {/* Group Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {groupLetters.map((letter) => {
          const groupRows = standings[letter] || [];

          return (
            <div key={letter} className="rounded-xl glass-panel p-5 space-y-4">
              <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase border-b border-slate-900 pb-2">
                GROUP {letter}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-900 pb-2">
                      <th className="pb-2 w-6">#</th>
                      <th className="pb-2">Team</th>
                      <th className="pb-2 text-center w-6">P</th>
                      <th className="pb-2 text-center w-6">GD</th>
                      <th className="pb-2 text-center w-8">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {groupRows.map((row) => {
                      const isTop2 = row.position <= 2;
                      const isQualifiedThird = row.position === 3 && isBestThirdPlaced(row.teamId);
                      
                      let qualificationBadgeClass = '';
                      if (isTop2) {
                        qualificationBadgeClass = 'border-l-2 border-emerald-500 bg-emerald-500/5';
                      } else if (isQualifiedThird) {
                        qualificationBadgeClass = 'border-l-2 border-blue-500 bg-blue-500/5';
                      } else if (row.position === 3) {
                        qualificationBadgeClass = 'border-l-2 border-rose-950/40 bg-rose-950/5';
                      }

                      return (
                        <tr 
                          key={row.teamId} 
                          className={`
                            hover:bg-slate-900/10 transition-colors
                            ${qualificationBadgeClass}
                          `}
                        >
                          <td className="py-2.5 pl-2 font-bold text-slate-400">{row.position}</td>
                          <td className="py-2.5">
                            <Link href={`/teams/${row.teamId}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                              <img src={row.teamFlag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm border border-slate-900" />
                              <span className="font-semibold text-slate-200 truncate max-w-[100px]">{row.teamName}</span>
                            </Link>
                          </td>
                          <td className="py-2.5 text-center font-medium text-slate-300">{row.played}</td>
                          <td className={`py-2.5 text-center font-medium ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className={`py-2.5 text-center font-bold ${isTop2 ? 'text-emerald-400' : isQualifiedThird ? 'text-blue-400' : 'text-slate-400'}`}>{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Qualification Legend */}
              <div className="flex gap-4 pt-1.5 border-t border-slate-900/40 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Top 2 (Qualified)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Best 3rd (Qualified)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
