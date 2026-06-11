'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { useTournamentStore } from '../lib/store';
import { formatMatchDateTime } from '../lib/timezoneUtils';

export default function MatchScheduleCard() {
  const { matches, teams, stadiums, timezone } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all'>('upcoming');

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getStadium = (id: string) => stadiums.find(s => s.id === id);

  // Sort matches so that Live/Ongoing matches come first, then other unfinished matches chronologically, and finally finished matches.
  const sortedMatches = [...matches].sort((a, b) => {
    const isLiveA = !a.finished && a.timeElapsed && a.timeElapsed !== 'notstarted';
    const isLiveB = !b.finished && b.timeElapsed && b.timeElapsed !== 'notstarted';
    
    if (isLiveA && !isLiveB) return -1;
    if (!isLiveA && isLiveB) return 1;
    
    // Unfinished matches first
    if (a.finished !== b.finished) {
      return a.finished ? 1 : -1;
    }
    
    // Chronological order within those groups
    const dateA = new Date(a.localDate);
    const dateB = new Date(b.localDate);
    return dateA.getTime() - dateB.getTime();
  });

  const displayedMatches = activeTab === 'upcoming' 
    ? sortedMatches.filter(m => !m.finished).slice(0, 3)
    : sortedMatches.slice(0, 3);

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel glass-panel-hover p-6">
      
      {/* Header */}
      <Link href="/matches" className="flex items-center justify-between mb-4 group cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
          <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-emerald-400 transition-colors duration-200">MATCH SCHEDULE</h3>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>
      
      <p className="text-xs text-slate-400 mb-6">
        View schedule and results of all World Cup matches
      </p>

      {/* Tabs */}
      <div className="flex w-full rounded-lg bg-slate-950/50 p-1 mb-6 border border-slate-900">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`
            flex-1 text-center py-2 text-xs font-bold rounded-md transition-colors
            ${activeTab === 'upcoming' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          Upcoming Matches
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`
            flex-1 text-center py-2 text-xs font-bold rounded-md transition-colors
            ${activeTab === 'all' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          All Matches
        </button>
      </div>

      {/* Match List */}
      <div className="flex-1 space-y-4">
        {displayedMatches.map((match) => {
          const homeTeam = getTeam(match.homeTeamId);
          const awayTeam = getTeam(match.awayTeamId);
          const venue = getStadium(match.stadiumId);
          const formatted = formatMatchDateTime(match, timezone, stadiums);

          if (!homeTeam || !awayTeam) return null;

          return (
            <div 
              key={match.id}
              className={`flex flex-col p-4 rounded-xl transition-all ${
                !match.finished && match.timeElapsed && match.timeElapsed !== 'notstarted'
                  ? 'bg-rose-950/5 border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                  : 'bg-slate-950/30 border-slate-900/60 hover:border-slate-800/80'
              }`}
            >
              {/* Match Meta */}
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-3">
                <span>{formatted.date}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">GROUP {match.group}</span>
              </div>

              {/* Match Teams & Time */}
              <div className="grid grid-cols-7 items-center justify-center gap-1">
                {/* Home Team */}
                <div className="col-span-2 flex flex-col items-center gap-1">
                  <img 
                    src={homeTeam.flag} 
                    alt={homeTeam.name} 
                    className="h-7.5 w-11 object-cover rounded shadow-md border border-slate-800/50"
                  />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{homeTeam.fifaCode}</span>
                </div>

              {/* Score, Live or Time */}
              <div className="col-span-3 flex flex-col items-center justify-center text-center">
                {!match.finished && match.timeElapsed && match.timeElapsed !== 'notstarted' ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 uppercase tracking-widest animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Live &bull; {match.timeElapsed}
                    </span>
                    <div className="text-base font-black text-slate-100 flex items-center gap-2 mt-0.5">
                      <span>{match.homeScore}</span>
                      <span className="text-slate-650 font-normal">:</span>
                      <span>{match.awayScore}</span>
                    </div>
                  </div>
                ) : match.finished ? (
                  <div className="text-base font-black text-slate-100 flex items-center gap-2">
                    <span>{match.homeScore}</span>
                    <span className="text-slate-605 font-normal">:</span>
                    <span>{match.awayScore}</span>
                  </div>
                ) : (
                  <div className="text-sm font-black text-slate-100">
                    {formatted.time}
                  </div>
                )}
              </div>

                {/* Away Team */}
                <div className="col-span-2 flex flex-col items-center gap-1">
                  <img 
                    src={awayTeam.flag} 
                    alt={awayTeam.name} 
                    className="h-7.5 w-11 object-cover rounded shadow-md border border-slate-800/50"
                  />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{awayTeam.fifaCode}</span>
                </div>
              </div>

              {/* Stadium Venue */}
              {venue && (
                <div className="flex items-center gap-1 mt-3.5 text-[10px] font-medium text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{venue.name}, {venue.city}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <Link 
        href="/matches"
        className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-bold text-slate-400 hover:text-white group transition-colors"
      >
        <span>View Full Schedule</span>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </Link>

    </div>
  );
}
