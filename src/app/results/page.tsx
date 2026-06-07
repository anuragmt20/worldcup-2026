'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, Eye, Clock, BarChart3, ChevronRight, X } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
import { Match } from '@/types';
import { formatMatchDateTime } from '@/lib/timezoneUtils';

export default function ResultsPage() {
  const { matches, teams, stadiums, timezone } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<'bracket' | 'list'>('bracket');
  const [activeMatchStats, setActiveMatchStats] = useState<Match | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-850 border-t-emerald-500" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Results...</span>
        </div>
      </div>
    );
  }

  const getTeam = (id: string) => teams.find(t => t.id === id);
  const getStadium = (id: string) => stadiums.find(s => s.id === id);

  // Filter completed matches
  const completedMatches = matches.filter(m => m.finished);

  // Group completed matches by stage
  const groupStageCompleted = completedMatches.filter(m => m.type === 'group');
  const knockoutCompleted = completedMatches.filter(m => m.type !== 'group');

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return dateStr.split(' ')[0];
    }
  };

  // Helper to get round matches
  const getMatchesByRound = (roundType: 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final') => {
    return matches.filter(m => m.type === roundType);
  };

  // Generate mock statistics for completed matches
  const getMockMatchStats = (match: Match) => {
    // Deterministic mock values based on match ID and scores
    const matchIdNum = Number(match.id) || 1;
    const homeGoals = match.homeScore;
    const awayGoals = match.awayScore;

    const homeShots = homeGoals * 3 + (matchIdNum % 5) + 4;
    const awayShots = awayGoals * 3 + (matchIdNum % 4) + 4;
    
    // Total possession is 100%
    const homePossession = 40 + (matchIdNum % 20);
    const awayPossession = 100 - homePossession;

    const homeFouls = 8 + (matchIdNum % 8);
    const awayFouls = 7 + (matchIdNum % 9);

    const homeYellows = matchIdNum % 3;
    const awayYellows = (matchIdNum + 1) % 3;

    return {
      possession: { home: homePossession, away: awayPossession },
      shots: { home: homeShots, away: awayShots },
      fouls: { home: homeFouls, away: awayFouls },
      yellows: { home: homeYellows, away: awayYellows },
      reds: { home: homeGoals > 4 ? 1 : 0, away: awayGoals > 4 ? 1 : 0 }
    };
  };

  // Render match card inside bracket
  const renderBracketMatchCard = (match: Match) => {
    const homeTeam = getTeam(match.homeTeamId);
    const awayTeam = getTeam(match.awayTeamId);
    
    const isHomeWinner = match.finished && (match.homeScore > match.awayScore || (match as any).shootoutWinner === 'home');
    const isAwayWinner = match.finished && (match.awayScore > match.homeScore || (match as any).shootoutWinner === 'away');

    return (
      <div 
        key={match.id}
        onClick={() => {
          if (match.finished) {
            setActiveMatchStats(match);
          }
        }}
        className={`
          flex flex-col p-3 rounded-lg border text-xs transition-all duration-200 cursor-pointer w-[180px] shrink-0
          ${match.finished 
            ? 'glass-panel glass-panel-hover' 
            : 'bg-slate-950/20 border-slate-900 text-slate-500'
          }
        `}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          <span>MATCH {match.id}</span>
          {match.finished && <span className="text-emerald-400">FT</span>}
        </div>

        {/* Home Team */}
        <div className={`flex items-center justify-between py-1 ${isHomeWinner ? 'text-white font-extrabold' : match.finished ? 'text-slate-400' : ''}`}>
          <div className="flex items-center gap-1.5 truncate">
            {homeTeam ? (
              <>
                <img src={homeTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                <span className="truncate">{homeTeam.name}</span>
              </>
            ) : (
              <span className="italic truncate">{match.homeTeamLabel || 'TBD'}</span>
            )}
          </div>
          {match.finished && <span>{match.homeScore}</span>}
        </div>

        {/* Away Team */}
        <div className={`flex items-center justify-between py-1 ${isAwayWinner ? 'text-white font-extrabold' : match.finished ? 'text-slate-400' : ''}`}>
          <div className="flex items-center gap-1.5 truncate">
            {awayTeam ? (
              <>
                <img src={awayTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                <span className="truncate">{awayTeam.name}</span>
              </>
            ) : (
              <span className="italic truncate">{match.awayTeamLabel || 'TBD'}</span>
            )}
          </div>
          {match.finished && <span>{match.awayScore}</span>}
        </div>

        {/* Penalty shootout label */}
        {match.finished && match.timeElapsed.includes('pen') && (
          <div className="text-[8px] font-black text-center text-emerald-400 uppercase tracking-widest mt-1.5">
            Pens: {match.timeElapsed.replace('ft', '').replace('ft (pen. ', '').replace(')', '')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Tournament Results</h1>
        <p className="text-sm text-slate-400 mt-1">Explore results, match statistics, and the knockout stage progression</p>
      </div>

      {/* Tabs */}
      <div className="flex w-fit rounded-lg bg-slate-900/40 p-1 border border-slate-900">
        <button
          onClick={() => setActiveTab('bracket')}
          className={`
            px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
            ${activeTab === 'bracket' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          Knockout Bracket
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`
            px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
            ${activeTab === 'list' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          Completed Matches List
        </button>
      </div>

      {/* Bracket View */}
      {activeTab === 'bracket' && (
        <div className="w-full overflow-x-auto pb-4 pt-2">
          {/* Bracket columns */}
          <div className="flex gap-8 justify-start items-center min-w-[1000px] h-[580px] px-4">
            
            {/* Round of 32 */}
            <div className="flex flex-col justify-between h-full space-y-2 py-4">
              <h3 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase text-center border-b border-slate-900 pb-1">Round of 32</h3>
              <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-3 max-h-[500px] pr-2">
                {getMatchesByRound('r32').map(renderBracketMatchCard)}
              </div>
            </div>

            {/* Link divider */}
            <div className="h-6.5 w-4 border-y border-r border-slate-800/80 rounded-r hidden lg:block" />

            {/* Round of 16 */}
            <div className="flex flex-col justify-between h-full space-y-2 py-4">
              <h3 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase text-center border-b border-slate-900 pb-1">Round of 16</h3>
              <div className="flex-1 flex flex-col justify-around space-y-4 pr-2">
                {getMatchesByRound('r16').map(renderBracketMatchCard)}
              </div>
            </div>

            {/* Link divider */}
            <div className="h-12 w-4 border-y border-r border-slate-800/80 rounded-r hidden lg:block" />

            {/* Quarter Finals */}
            <div className="flex flex-col justify-between h-full space-y-2 py-4">
              <h3 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase text-center border-b border-slate-900 pb-1">Quarter-Finals</h3>
              <div className="flex-1 flex flex-col justify-around space-y-8 pr-2">
                {getMatchesByRound('qf').map(renderBracketMatchCard)}
              </div>
            </div>

            {/* Link divider */}
            <div className="h-24 w-4 border-y border-r border-slate-800/80 rounded-r hidden lg:block" />

            {/* Semi Finals */}
            <div className="flex flex-col justify-between h-full space-y-2 py-4">
              <h3 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase text-center border-b border-slate-900 pb-1">Semi-Finals</h3>
              <div className="flex-1 flex flex-col justify-around space-y-16 pr-2">
                {getMatchesByRound('sf').map(renderBracketMatchCard)}
              </div>
            </div>

            {/* Final */}
            <div className="flex flex-col justify-between h-full space-y-2 py-4">
              <h3 className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase text-center border-b border-emerald-500/10 pb-1">Championship</h3>
              <div className="flex-1 flex flex-col justify-center gap-10">
                {/* Final Card */}
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-center text-slate-500 uppercase tracking-widest">Grand Final</div>
                  {getMatchesByRound('final').map(renderBracketMatchCard)}
                </div>

                {/* Third Place Card */}
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-center text-slate-500 uppercase tracking-widest">3rd Place Match</div>
                  {getMatchesByRound('third').map(renderBracketMatchCard)}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {completedMatches.length === 0 ? (
            <div className="text-center py-12 rounded-xl glass-panel p-6">
              <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-slate-300 uppercase">No Completed Matches Yet</h3>
              <p className="text-xs text-slate-500 mt-1">Use the Tournament Simulator on the Homepage to run matches and view results here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.map((match) => {
                const homeTeam = getTeam(match.homeTeamId);
                const awayTeam = getTeam(match.awayTeamId);
                const venue = getStadium(match.stadiumId);
                const formatted = formatMatchDateTime(match, timezone, stadiums);

                if (!homeTeam || !awayTeam) return null;

                return (
                  <div 
                    key={match.id}
                    onClick={() => setActiveMatchStats(match)}
                    className="flex items-center justify-between rounded-xl glass-panel glass-panel-hover p-4 cursor-pointer"
                  >
                    <div className="flex-1 space-y-3.5 pr-4">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[9px] font-extrabold tracking-widest text-slate-500 uppercase">
                        <span>MATCH #{match.id}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-500">{match.type === 'group' ? `GROUP ${match.group}` : match.group}</span>
                        <span>&bull;</span>
                        <span>{formatted.date}</span>
                      </div>

                      {/* Teams */}
                      <div className="space-y-2">
                        {/* Home */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={homeTeam.flag} alt="" className="h-4 w-6 object-cover rounded shadow-sm border border-slate-800" />
                            <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{homeTeam.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-200">{match.homeScore}</span>
                        </div>
                        {/* Away */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={awayTeam.flag} alt="" className="h-4 w-6 object-cover rounded shadow-sm border border-slate-800" />
                            <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{awayTeam.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-200">{match.awayScore}</span>
                        </div>
                      </div>

                      {/* Stadium */}
                      {venue && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{venue.name}, {venue.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center border-l border-slate-900 pl-6 w-20 shrink-0 text-center space-y-1.5">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 py-1 px-2.5 rounded">STATS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Match Stats Modal Popup */}
      {activeMatchStats && (() => {
        const match = activeMatchStats;
        const homeTeam = getTeam(match.homeTeamId);
        const awayTeam = getTeam(match.awayTeamId);
        const venue = getStadium(match.stadiumId);
        const stats = getMockMatchStats(match);

        if (!homeTeam || !awayTeam) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-950 p-6 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              {/* Close */}
              <button 
                onClick={() => setActiveMatchStats(null)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-6 pt-2">
                <div className="text-center space-y-1">
                  <div className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">MATCH RESULTS STATS</div>
                  <div className="text-xs font-bold text-slate-400 uppercase">
                    {formatMatchDateTime(match, timezone, stadiums).date} &bull; {formatMatchDateTime(match, timezone, stadiums).time} &bull; {venue?.name}
                  </div>
                </div>

                {/* Scoreboard */}
                <div className="rounded-xl bg-slate-900/60 border border-slate-850 p-5 text-center">
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1 text-center w-24">
                      <img src={homeTeam.flag} alt="" className="h-8 w-12 object-cover rounded shadow border border-slate-800" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{homeTeam.name}</span>
                    </div>
                    <div className="text-2xl font-black text-slate-100">{match.homeScore} - {match.awayScore}</div>
                    <div className="flex flex-col items-center gap-1 text-center w-24">
                      <img src={awayTeam.flag} alt="" className="h-8 w-12 object-cover rounded shadow border border-slate-800" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{awayTeam.name}</span>
                    </div>
                  </div>
                  {match.timeElapsed.includes('pen') && (
                    <div className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest mt-3">{match.timeElapsed}</div>
                  )}
                </div>

                {/* Statistics breakdown */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" /> Match Statistics
                  </h3>

                  <div className="space-y-4 text-xs font-semibold text-slate-300">
                    {/* Possession */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{homeTeam.fifaCode}: {stats.possession.home}%</span>
                        <span>Possession</span>
                        <span>{stats.possession.away}%: {awayTeam.fifaCode}</span>
                      </div>
                      <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-900 border border-slate-850">
                        <div style={{ width: `${stats.possession.home}%` }} className="h-full bg-emerald-500" />
                        <div style={{ width: `${stats.possession.away}%` }} className="h-full bg-blue-500" />
                      </div>
                    </div>

                    {/* Shots */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{stats.shots.home}</span>
                        <span>Total Shots</span>
                        <span>{stats.shots.away}</span>
                      </div>
                      <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-900 border border-slate-850">
                        <div style={{ width: `${(stats.shots.home / (stats.shots.home + stats.shots.away)) * 100}%` }} className="h-full bg-emerald-500" />
                        <div style={{ width: `${(stats.shots.away / (stats.shots.home + stats.shots.away)) * 100}%` }} className="h-full bg-blue-500" />
                      </div>
                    </div>

                    {/* Fouls */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{stats.fouls.home}</span>
                        <span>Fouls Committed</span>
                        <span>{stats.fouls.away}</span>
                      </div>
                      <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-900 border border-slate-850">
                        <div style={{ width: `${(stats.fouls.home / (stats.fouls.home + stats.fouls.away)) * 100}%` }} className="h-full bg-emerald-500" />
                        <div style={{ width: `${(stats.fouls.away / (stats.fouls.home + stats.fouls.away)) * 100}%` }} className="h-full bg-blue-500" />
                      </div>
                    </div>

                    {/* Cards grid */}
                    <div className="grid grid-cols-2 gap-4 pt-2 text-center text-xs">
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex justify-around">
                        <div className="flex flex-col items-center">
                          <span className="h-4.5 w-3 bg-yellow-400 rounded-sm mb-1 shadow-sm" />
                          <span className="font-bold">{stats.yellows.home}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="h-4.5 w-3 bg-red-600 rounded-sm mb-1 shadow-sm" />
                          <span className="font-bold">{stats.reds.home}</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 flex justify-around">
                        <div className="flex flex-col items-center">
                          <span className="h-4.5 w-3 bg-yellow-400 rounded-sm mb-1 shadow-sm" />
                          <span className="font-bold">{stats.yellows.away}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="h-4.5 w-3 bg-red-600 rounded-sm mb-1 shadow-sm" />
                          <span className="font-bold">{stats.reds.away}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Scorers list */}
                {(match.homeScorers || match.awayScorers) && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Goals Scored</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                      <div>
                        {match.homeScorers && match.homeScorers.length > 0 ? (
                          <ul className="space-y-1 text-slate-300">
                            {match.homeScorers.map((s, i) => <li key={i}>&#9917; {s}</li>)}
                          </ul>
                        ) : <span className="text-slate-500">-</span>}
                      </div>
                      <div>
                        {match.awayScorers && match.awayScorers.length > 0 ? (
                          <ul className="space-y-1 text-slate-300">
                            {match.awayScorers.map((s, i) => <li key={i}>&#9917; {s}</li>)}
                          </ul>
                        ) : <span className="text-slate-500">-</span>}
                      </div>
                    </div>
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
