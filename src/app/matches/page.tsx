'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, List, Eye, Clock, X, Play, CheckCircle } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
import { Match } from '@/types';
import { formatMatchDateTime } from '@/lib/timezoneUtils';

export default function MatchesPage() {
  const { matches, teams, stadiums, simulateMatch, manualPlayMatch, liveSyncMode, timezone } = useTournamentStore();
  const [activeView, setActiveView] = useState<'calendar' | 'playZone'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [activeMatchDetail, setActiveMatchDetail] = useState<Match | null>(null);
  const [scoresInput, setScoresInput] = useState<{ [matchId: string]: { home: string; away: string } }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-850 border-t-emerald-500" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Matches...</span>
        </div>
      </div>
    );
  }

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getStadium = (id: string) => stadiums.find(s => s.id === id);

  const groups = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];

  // Extract unique dates from matches in selected timezone
  const uniqueDates = Array.from(new Set(matches.map(m => {
    return formatMatchDateTime(m, timezone, stadiums).date;
  })));
  uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Filter matches
  const filteredMatches = matches.filter(match => {
    const homeTeam = getTeam(match.homeTeamId);
    const awayTeam = getTeam(match.awayTeamId);
    
    const matchesSearch = searchQuery === '' || 
      (homeTeam?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (awayTeam?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (match.homeTeamLabel?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (match.awayTeamLabel?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (getStadium(match.stadiumId)?.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGroup = selectedGroup === 'All' || 
      match.group.toUpperCase() === selectedGroup.toUpperCase() ||
      match.type.toUpperCase() === selectedGroup.toUpperCase();

    const formatted = formatMatchDateTime(match, timezone, stadiums);
    const matchDateOnly = formatted.date;
    const matchesDate = selectedDate === 'All' || matchDateOnly === selectedDate;

    return matchesSearch && matchesGroup && matchesDate;
  });

  // Group filtered matches by date in selected timezone (used for calendar view)
  const matchesByDate: { [date: string]: Match[] } = {};
  filteredMatches.forEach(m => {
    const formatted = formatMatchDateTime(m, timezone, stadiums);
    const d = formatted.date;
    if (!matchesByDate[d]) {
      matchesByDate[d] = [];
    }
    matchesByDate[d].push(m);
  });

  const sortedDates = Object.keys(matchesByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleSimulateInPopup = (matchId: string) => {
    const scoreHome = Math.floor(Math.random() * 3) + (Math.random() > 0.6 ? 1 : 0);
    const scoreAway = Math.floor(Math.random() * 3) + (Math.random() > 0.6 ? 1 : 0);
    simulateMatch(matchId, scoreHome, scoreAway);
    
    const updated = useTournamentStore.getState().matches.find(m => m.id === matchId);
    if (updated) {
      setActiveMatchDetail(updated);
    }
  };

  const handleScoreInputChange = (matchId: string, side: 'home' | 'away', val: string) => {
    // Only accept numeric positive characters
    if (val !== '' && !/^\d+$/.test(val)) return;

    setScoresInput(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { home: '', away: '' },
        [side]: val
      }
    }));
  };

  const handleManualRecord = (matchId: string) => {
    const inputs = scoresInput[matchId];
    if (!inputs || inputs.home === '' || inputs.away === '') return;

    const h = Number(inputs.home);
    const a = Number(inputs.away);
    manualPlayMatch(matchId, h, a);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Match Schedule & Play Zone</h1>
          <p className="text-sm text-slate-400 mt-1">Explore fixtures, sync live scores, or play custom brackets</p>
        </div>

        {/* View Tabs */}
        <div className="flex rounded-lg bg-slate-900/40 p-1 border border-slate-900 shrink-0">
          <button
            onClick={() => setActiveView('calendar')}
            className={`
              px-4 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
              ${activeView === 'calendar' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            Matches Calendar
          </button>
          <button
            onClick={() => setActiveView('playZone')}
            className={`
              px-4 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
              ${activeView === 'playZone' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            Interactive Play Zone
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl glass-panel p-5">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 pl-10 text-slate-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Group Filter */}
        <div className="flex flex-col gap-1.5">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 text-slate-200 font-bold cursor-pointer"
          >
            <option value="All">Filter by Stage / Group (All)</option>
            {groups.filter(g => g !== 'All').map(g => (
              <option key={g} value={g}>{g.length === 1 ? `Group ${g}` : g}</option>
            ))}
          </select>
        </div>

        {/* Date Filter (disabled in playZone to make listing simpler) */}
        <div className="flex flex-col gap-1.5">
          <select
            disabled={activeView === 'playZone'}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 text-slate-200 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="All">Filter by Date (All)</option>
            {uniqueDates.map(d => (
              <option key={d} value={d}>{formatDateLabel(d)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Matches Calendar View */}
      {activeView === 'calendar' && (
        <div className="space-y-10">
          {sortedDates.length === 0 ? (
            <div className="text-center py-12 rounded-xl glass-panel p-6">
              <Calendar className="h-10 w-10 text-slate-650 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-300 uppercase">No Matches Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search filters.</p>
            </div>
          ) : (
            sortedDates.map((dateStr) => {
              const dayMatches = matchesByDate[dateStr];

              return (
                <div key={dateStr} className="space-y-4">
                  <h2 className="text-sm font-extrabold tracking-wider text-emerald-400 uppercase border-b border-slate-900 pb-2">
                    {formatDateLabel(dateStr)}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayMatches.map((match) => {
                      const homeTeam = getTeam(match.homeTeamId);
                      const awayTeam = getTeam(match.awayTeamId);
                      const venue = getStadium(match.stadiumId);
                      const isKnockout = match.type !== 'group';

                      return (
                        <div 
                          key={match.id}
                          onClick={() => setActiveMatchDetail(match)}
                          className="flex items-center justify-between rounded-xl glass-panel glass-panel-hover p-4 cursor-pointer relative"
                        >
                          <div className="flex-1 space-y-3.5 pr-4">
                            <div className="flex items-center gap-3 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">
                              <span>MATCH #{match.id}</span>
                              <span>&bull;</span>
                              <span className="text-emerald-500">{isKnockout ? match.group : `GROUP ${match.group}`}</span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                {homeTeam ? (
                                  <>
                                    <img src={homeTeam.flag} alt="" className="h-4 w-6 object-cover rounded shadow-sm border border-slate-800" />
                                    <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{homeTeam.name}</span>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-slate-500 italic uppercase">{match.homeTeamLabel || 'TBD'}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {awayTeam ? (
                                  <>
                                    <img src={awayTeam.flag} alt="" className="h-4 w-6 object-cover rounded shadow-sm border border-slate-800" />
                                    <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{awayTeam.name}</span>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-slate-500 italic uppercase">{match.awayTeamLabel || 'TBD'}</span>
                                )}
                              </div>
                            </div>

                            {venue && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{venue.name}, {venue.city}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center justify-center border-l border-slate-900 pl-6 w-24 shrink-0 text-center space-y-1.5">
                            {match.finished ? (
                              <>
                                <div className="text-sm font-black text-slate-200 bg-slate-950/50 py-1.5 px-3 rounded border border-slate-900">
                                  {match.homeScore} - {match.awayScore}
                                </div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">FT</span>
                              </>
                            ) : (
                              <>
                                <div className="text-[11px] font-black text-slate-200 leading-tight">
                                  {formatMatchDateTime(match, timezone, stadiums).time.split(' ')[0]}
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  {formatMatchDateTime(match, timezone, stadiums).time.split(' ')[1]}
                                </span>
                              </>
                            )}
                            
                            <div className="text-[9px] font-bold text-slate-500 hover:text-emerald-400 flex items-center gap-0.5 pt-1">
                              <Eye className="h-3 w-3" />
                              Details
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Interactive Play Zone View */}
      {activeView === 'playZone' && (
        <div className="space-y-4">
          <div className="rounded-xl glass-panel p-4 border border-slate-900 bg-slate-950/40 text-xs text-slate-400 leading-relaxed">
            {liveSyncMode ? (
              <span className="text-rose-400 font-bold">
                ⚠️ FIFA Live Sync Mode is currently ACTIVE. Manual score entries are locked. Disable Live Sync on the Homepage to manually type in scores.
              </span>
            ) : (
              <span>
                Enter scores in the boxes below and click <strong>Record</strong> to play the match. Standing tables, stats, and bracket progressions will recalculate automatically!
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-12 rounded-xl glass-panel">
                <Play className="h-10 w-10 text-slate-650 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-slate-300 uppercase">No Playable Matches Found</h3>
                <p className="text-xs text-slate-500 mt-1">Refine your search or filters.</p>
              </div>
            ) : (
              filteredMatches.map(match => {
                const homeTeam = getTeam(match.homeTeamId);
                const awayTeam = getTeam(match.awayTeamId);
                const inputs = scoresInput[match.id] || { home: '', away: '' };
                const isPlayable = homeTeam !== undefined && awayTeam !== undefined && !liveSyncMode;

                return (
                  <div 
                    key={match.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel bg-slate-950/30 border border-slate-900/60"
                  >
                    {/* Meta */}
                    <div className="w-32 shrink-0">
                      <div className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">MATCH #{match.id}</div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase mt-0.5">{match.type === 'group' ? `GROUP ${match.group}` : match.group}</div>
                      <div className="text-[9px] font-medium text-slate-500 mt-0.5">{match.localDate.split(' ')[0]}</div>
                    </div>

                    {/* Team Row & Score Inputs */}
                    <div className="flex-1 flex items-center justify-center gap-3 md:gap-5">
                      {/* Home */}
                      <div className="flex-1 flex items-center justify-end gap-2.5 min-w-0">
                        {homeTeam ? (
                          <>
                            <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate">{homeTeam.name}</span>
                            <img src={homeTeam.flag} alt="" className="h-3.5 w-5 object-cover rounded shadow border border-slate-900" />
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 italic truncate uppercase">{match.homeTeamLabel || 'TBD'}</span>
                        )}
                      </div>

                      {/* Score Input Fields */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="text"
                          disabled={!isPlayable}
                          maxLength={2}
                          value={match.finished ? match.homeScore : inputs.home}
                          onChange={(e) => handleScoreInputChange(match.id, 'home', e.target.value)}
                          placeholder="0"
                          className="h-9 w-9 bg-slate-950/60 border border-slate-850 rounded text-center text-xs font-black focus:outline-none focus:border-emerald-500/50 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-slate-600 font-bold">-</span>
                        <input
                          type="text"
                          disabled={!isPlayable}
                          maxLength={2}
                          value={match.finished ? match.awayScore : inputs.away}
                          onChange={(e) => handleScoreInputChange(match.id, 'away', e.target.value)}
                          placeholder="0"
                          className="h-9 w-9 bg-slate-950/60 border border-slate-850 rounded text-center text-xs font-black focus:outline-none focus:border-emerald-500/50 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Away */}
                      <div className="flex-1 flex items-center justify-start gap-2.5 min-w-0">
                        {awayTeam ? (
                          <>
                            <img src={awayTeam.flag} alt="" className="h-3.5 w-5 object-cover rounded shadow border border-slate-900" />
                            <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate">{awayTeam.name}</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 italic truncate uppercase">{match.awayTeamLabel || 'TBD'}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-24 shrink-0 text-right">
                      {match.finished ? (
                        <div className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 py-1.5 px-3 rounded uppercase tracking-wider">
                          <CheckCircle className="h-3.5 w-3.5" /> Played
                        </div>
                      ) : isPlayable ? (
                        <button
                          onClick={() => handleManualRecord(match.id)}
                          disabled={inputs.home === '' || inputs.away === ''}
                          className="w-full flex items-center justify-center gap-1 rounded bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Record
                        </button>
                      ) : (
                        <div className="text-[10px] text-slate-500 font-bold italic uppercase border border-slate-900 py-2 text-center rounded">Locked</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Match Details Popup Modal */}
      {activeMatchDetail && (() => {
        const match = activeMatchDetail;
        const homeTeam = getTeam(match.homeTeamId);
        const awayTeam = getTeam(match.awayTeamId);
        const venue = getStadium(match.stadiumId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-950 p-6 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setActiveMatchDetail(null)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6 pt-2">
                <div className="text-center space-y-1">
                  <div className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                    MATCH #{match.id} &bull; {match.type.toUpperCase()} STAGE
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {formatDateLabel(formatMatchDateTime(match, timezone, stadiums).date)} &bull; {formatMatchDateTime(match, timezone, stadiums).time}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 border border-slate-850 p-6">
                  <div className="grid grid-cols-7 items-center justify-center gap-2">
                    <div className="col-span-3 flex flex-col items-center gap-2 text-center">
                      {homeTeam ? (
                        <>
                          <img src={homeTeam.flag} alt="" className="h-10 w-15 object-cover rounded shadow border border-slate-800" />
                          <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{homeTeam.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{homeTeam.fifaCode}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-15 rounded bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-500 font-bold text-xs uppercase italic">TBD</div>
                          <span className="text-xs font-bold text-slate-400 italic uppercase">{match.homeTeamLabel || 'TBD'}</span>
                        </>
                      )}
                    </div>

                    <div className="col-span-1 text-center">
                      {match.finished ? (
                        <div className="text-xl font-black text-slate-100">{match.homeScore} - {match.awayScore}</div>
                      ) : (
                        <div className="text-slate-650 font-black text-lg">VS</div>
                      )}
                    </div>

                    <div className="col-span-3 flex flex-col items-center gap-2 text-center">
                      {awayTeam ? (
                        <>
                          <img src={awayTeam.flag} alt="" className="h-10 w-15 object-cover rounded shadow border border-slate-800" />
                          <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{awayTeam.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{awayTeam.fifaCode}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-10 w-15 rounded bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-500 font-bold text-xs uppercase italic">TBD</div>
                          <span className="text-xs font-bold text-slate-400 italic uppercase">{match.awayTeamLabel || 'TBD'}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {match.finished && match.timeElapsed.includes('pen') && (
                    <div className="text-center text-[10px] font-bold text-emerald-400 uppercase tracking-wide mt-4">
                      {match.timeElapsed}
                    </div>
                  )}
                </div>

                {match.finished && (match.homeScorers || match.awayScorers) && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Match Events & Goals</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                      <div className="border-r border-slate-900/60 pr-2">
                        {match.homeScorers && match.homeScorers.length > 0 ? (
                          <ul className="space-y-1 text-slate-300">
                            {match.homeScorers.map((scorer, i) => (
                              <li key={i} className="flex items-center gap-1.5">&#9917; {scorer}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </div>
                      
                      <div className="pl-2">
                        {match.awayScorers && match.awayScorers.length > 0 ? (
                          <ul className="space-y-1 text-slate-300">
                            {match.awayScorers.map((scorer, i) => (
                              <li key={i} className="flex items-center gap-1.5">&#9917; {scorer}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-500 italic">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Venue Details</h3>
                  {venue ? (
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span className="font-bold">{venue.name}</span>
                      </div>
                      <div className="text-slate-400 pl-6 space-y-1">
                        <div>Location: {venue.city}, {venue.country}</div>
                        <div>Capacity: {venue.capacity.toLocaleString()} spectators</div>
                        <div>Region: {venue.region}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic text-xs">Venue info unassigned.</div>
                  )}
                </div>

                {!match.finished && homeTeam && awayTeam && !liveSyncMode && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleSimulateInPopup(match.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                      Simulate Match
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
