'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Search, ChevronRight } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';

export default function TeamsPage() {
  const { teams } = useTournamentStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Group teams by their tournament groups (A to L)
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.fifaCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Participating Teams</h1>
          <p className="text-sm text-slate-400 mt-1">Explore all 48 qualified nations competing for the championship</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search teams or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 pl-10 text-slate-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Grid by Groups */}
      {searchQuery !== '' ? (
        // Plain search results grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTeams.map(team => (
            <Link 
              key={team.id}
              href={`/teams/${team.id}`}
              className="flex flex-col items-center justify-center p-5 rounded-xl glass-panel glass-panel-hover text-center relative overflow-hidden group border border-slate-850"
            >
              <img src={team.flag} alt="" className="h-10 w-15 object-cover rounded shadow border border-slate-850 mb-3 group-hover:scale-105 transition-transform" />
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{team.name}</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{team.fifaCode}</span>
              <span className="absolute top-2.5 right-2.5 text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">GP {team.group}</span>
            </Link>
          ))}
          {filteredTeams.length === 0 && (
            <div className="col-span-full text-center py-12 rounded-xl glass-panel">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-300 uppercase">No Teams Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try another search query.</p>
            </div>
          )}
        </div>
      ) : (
        // Grouped by Group stage (A to L)
        <div className="space-y-10">
          {groupLetters.map(letter => {
            const groupTeams = teams.filter(t => t.group === letter);

            return (
              <div key={letter} className="space-y-4">
                <h2 className="text-sm font-extrabold tracking-wider text-emerald-400 uppercase border-b border-slate-900 pb-2">
                  GROUP {letter}
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {groupTeams.map(team => (
                    <Link 
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl glass-panel glass-panel-hover group"
                    >
                      <img 
                        src={team.flag} 
                        alt="" 
                        className="h-8 w-12 object-cover rounded shadow border border-slate-850 group-hover:scale-105 transition-transform shrink-0" 
                      />
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide truncate">{team.name}</h3>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{team.fifaCode}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 ml-auto transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
