'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';
import { useTournamentStore } from '../lib/store';

export default function ParticipatingTeamsCard() {
  const { teams } = useTournamentStore();

  // Show a selection of 25 flags that fits beautifully in the dashboard
  const displayTeams = teams.slice(0, 25);

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel glass-panel-hover p-6">
      
      {/* Header */}
      <Link href="/teams" className="flex items-center justify-between mb-4 group cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
          <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-emerald-400 transition-colors duration-200">PARTICIPATING TEAMS</h3>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>

      <p className="text-xs text-slate-400 mb-6">
        48 best football teams in the world
      </p>

      {/* Grid of Flags */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-5 gap-3.5 justify-items-center">
          {displayTeams.map((team) => (
            <Link 
              href={`/teams/${team.id}`}
              key={team.id}
              className="group relative flex flex-col items-center gap-1.5 focus:outline-none"
              title={`${team.name} (${team.fifaCode})`}
            >
              {/* Flag container */}
              <div className="relative h-8 w-11 overflow-hidden rounded-md border border-slate-800/80 bg-slate-900 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/5">
                <img 
                  src={team.flag} 
                  alt={team.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <Link 
        href="/teams"
        className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-bold text-slate-400 hover:text-white group transition-colors"
      >
        <span>Explore All Teams</span>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </Link>

    </div>
  );
}
