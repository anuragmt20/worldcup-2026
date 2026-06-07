'use client';

import React from 'react';
import Link from 'next/link';
import { List, ChevronRight, ChevronDown } from 'lucide-react';
import { useTournamentStore } from '../lib/store';

export default function GroupStandingsCard() {
  const { getStandings, selectedGroup, setSelectedGroup } = useTournamentStore();
  const standings = getStandings();

  const groups = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L'];
  const activeGroupLetter = selectedGroup.replace('Group ', '');
  const activeStandings = standings[activeGroupLetter] || [];

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel glass-panel-hover p-6">
      
      {/* Header */}
      <Link href="/groups" className="flex items-center justify-between mb-4 group cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <List className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
          <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-emerald-400 transition-colors duration-200">GROUP STANDINGS</h3>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>

      <p className="text-xs text-slate-400 mb-6">
        Team rankings in the group stage
      </p>

      {/* Group Selector Dropdown */}
      <div className="relative mb-5">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full appearance-none rounded-lg bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer pr-10"
        >
          {groups.map((g) => (
            <option key={g} value={g} className="bg-slate-950 text-slate-200">
              {g}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {/* Standings Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-900 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <th className="pb-3 w-8">#</th>
              <th className="pb-3">Team</th>
              <th className="pb-3 text-center w-8">P</th>
              <th className="pb-3 text-center w-8">W</th>
              <th className="pb-3 text-center w-8">D</th>
              <th className="pb-3 text-center w-8">L</th>
              <th className="pb-3 text-center w-10">GD</th>
              <th className="pb-3 text-center w-10">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {activeStandings.map((row) => (
              <tr key={row.teamId} className="hover:bg-slate-900/10 transition-colors">
                <td className="py-3.5 font-bold text-slate-400">{row.position}</td>
                <td className="py-3.5">
                  <Link href={`/teams/${row.teamId}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                    <img 
                      src={row.teamFlag} 
                      alt={row.teamName} 
                      className="h-4.5 w-6.5 object-cover rounded shadow-sm"
                    />
                    <span className="font-semibold text-slate-200 truncate max-w-[80px] sm:max-w-[100px]">{row.teamName}</span>
                  </Link>
                </td>
                <td className="py-3.5 text-center font-medium text-slate-300">{row.played}</td>
                <td className="py-3.5 text-center font-medium text-slate-300">{row.wins}</td>
                <td className="py-3.5 text-center font-medium text-slate-300">{row.draws}</td>
                <td className="py-3.5 text-center font-medium text-slate-300">{row.losses}</td>
                <td className={`py-3.5 text-center font-semibold ${row.goalDifference > 0 ? 'text-emerald-400' : row.goalDifference < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className="py-3.5 text-center font-bold text-emerald-400">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <Link 
        href="/groups"
        className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-bold text-slate-400 hover:text-white group transition-colors"
      >
        <span>View All Groups</span>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </Link>

    </div>
  );
}
