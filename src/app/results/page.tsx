'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, Eye, Clock, BarChart3, ChevronRight, X } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
import { Match } from '@/types';
import { formatMatchDateTime } from '@/lib/timezoneUtils';
import { Cinzel } from 'next/font/google';

const cinzelFont = Cinzel({ subsets: ['latin'] });

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

  const getMatchesByIds = (ids: string[]) => {
    return ids.map(id => matches.find(m => m.id === id)).filter(Boolean) as Match[];
  };

  const leftR32 = getMatchesByIds(['73', '74', '75', '76', '77', '78', '79', '80']);
  const leftR16 = getMatchesByIds(['89', '90', '91', '92']);
  const leftQF = getMatchesByIds(['97', '98']);
  const leftSF = getMatchesByIds(['101']);

  const rightSF = getMatchesByIds(['102']);
  const rightQF = getMatchesByIds(['99', '100']);
  const rightR16 = getMatchesByIds(['93', '94', '95', '96']);
  const rightR32 = getMatchesByIds(['81', '82', '83', '84', '85', '86', '87', '88']);

  const grandFinal = matches.find(m => m.id === '104');
  const thirdPlace = matches.find(m => m.id === '103');

  const renderSymmetricalBracketMatchCard = (match: Match) => {
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
          flex flex-col p-2.5 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer w-[130px] shrink-0 bg-slate-950/65 border-slate-900/80 hover:border-emerald-500/50 hover:bg-slate-900/35 relative select-none
          ${match.finished ? 'shadow-md shadow-emerald-500/5' : ''}
        `}
      >
        <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
          <span>MATCH {match.id}</span>
          {match.finished && <span className="text-emerald-400 font-black">FT</span>}
        </div>

        <div className={`flex items-center justify-between py-0.5 ${isHomeWinner ? 'text-slate-100 font-bold' : match.finished ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            {homeTeam ? (
              <>
                <img src={homeTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shrink-0 shadow-sm border border-slate-800" />
                <span className="truncate">{homeTeam.fifaCode}</span>
              </>
            ) : (
              <span className="italic truncate text-[10px] text-slate-550">{match.homeTeamLabel || 'TBD'}</span>
            )}
          </div>
          {match.finished ? (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-850/40 min-w-5 text-center ${isHomeWinner ? 'text-emerald-400' : 'text-slate-500'}`}>
              {match.homeScore}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-700">-</span>
          )}
        </div>

        <div className={`flex items-center justify-between py-0.5 mt-0.5 ${isAwayWinner ? 'text-slate-100 font-bold' : match.finished ? 'text-slate-500' : 'text-slate-400'}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            {awayTeam ? (
              <>
                <img src={awayTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shrink-0 shadow-sm border border-slate-800" />
                <span className="truncate">{awayTeam.fifaCode}</span>
              </>
            ) : (
              <span className="italic truncate text-[10px] text-slate-550">{match.awayTeamLabel || 'TBD'}</span>
            )}
          </div>
          {match.finished ? (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-850/40 min-w-5 text-center ${isAwayWinner ? 'text-emerald-400' : 'text-slate-500'}`}>
              {match.awayScore}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-700">-</span>
          )}
        </div>

        {match.finished && match.timeElapsed.includes('pen') && (
          <div className="text-[8px] font-black text-center text-emerald-400 uppercase tracking-widest mt-1.5 pt-1 border-t border-slate-900/40">
            PENS
          </div>
        )}
      </div>
    );
  };

  const renderCenterGrandFinalCard = (match: Match | undefined) => {
    if (!match) return null;
    const homeTeam = getTeam(match.homeTeamId);
    const awayTeam = getTeam(match.awayTeamId);

    const isHomeWinner = match.finished && (match.homeScore > match.awayScore || (match as any).shootoutWinner === 'home');
    const isAwayWinner = match.finished && (match.awayScore > match.homeScore || (match as any).shootoutWinner === 'away');

    return (
      <div 
        onClick={() => {
          if (match.finished) {
            setActiveMatchStats(match);
          }
        }}
        className="w-[200px] rounded-xl border-2 border-amber-500/80 bg-slate-950/80 p-5 text-center shadow-[0_0_15px_rgba(245,158,11,0.15)] space-y-4 hover:border-amber-400 cursor-pointer transition-all duration-300 relative overflow-hidden select-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <img 
            src="/images/logo.svg" 
            alt="FIFA World Cup 2026 Trophy" 
            className="h-16 w-16 object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] mx-auto"
          />
        </div>

        <div className="space-y-0.5">
          <div className={`${cinzelFont.className} text-[11px] font-black tracking-[0.2em] text-amber-400 uppercase`}>
            GRAND FINAL
          </div>
          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
            MATCH 104
          </div>
        </div>

        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between gap-2">
            {homeTeam ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <img src={homeTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded border border-slate-900" />
                <span className={`text-[11px] font-extrabold truncate ${isHomeWinner ? 'text-amber-400' : 'text-slate-200'}`}>{homeTeam.fifaCode}</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 italic uppercase truncate">{match.homeTeamLabel || 'TBD'}</span>
            )}
            
            {match.finished ? (
              <span className={`text-xs font-black min-w-5 text-right ${isHomeWinner ? 'text-amber-400' : 'text-slate-500'}`}>{match.homeScore}</span>
            ) : (
              <span className="text-[10px] text-slate-700">-</span>
            )}
          </div>

          <div className="text-[8px] font-black text-slate-650 tracking-widest uppercase">VS</div>

          <div className="flex items-center justify-between gap-2">
            {awayTeam ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <img src={awayTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded border border-slate-900" />
                <span className={`text-[11px] font-extrabold truncate ${isAwayWinner ? 'text-amber-400' : 'text-slate-200'}`}>{awayTeam.fifaCode}</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 italic uppercase truncate">{match.awayTeamLabel || 'TBD'}</span>
            )}
            
            {match.finished ? (
              <span className={`text-xs font-black min-w-5 text-right ${isAwayWinner ? 'text-amber-400' : 'text-slate-500'}`}>{match.awayScore}</span>
            ) : (
              <span className="text-[10px] text-slate-700">-</span>
            )}
          </div>
        </div>

        <div className="inline-flex items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/5 px-3.5 py-1 text-[9px] font-black text-amber-400 uppercase tracking-widest">
          07/19/2026
        </div>
      </div>
    );
  };

  const renderCenterThirdPlaceCard = (match: Match | undefined) => {
    if (!match) return null;
    const homeTeam = getTeam(match.homeTeamId);
    const awayTeam = getTeam(match.awayTeamId);

    const isHomeWinner = match.finished && (match.homeScore > match.awayScore || (match as any).shootoutWinner === 'home');
    const isAwayWinner = match.finished && (match.awayScore > match.homeScore || (match as any).shootoutWinner === 'away');

    return (
      <div 
        onClick={() => {
          if (match.finished) {
            setActiveMatchStats(match);
          }
        }}
        className="w-[160px] rounded-lg border border-slate-800 bg-slate-950/65 p-3 text-center space-y-2 hover:border-slate-700 cursor-pointer transition-all duration-300 relative select-none mt-4"
      >
        <div className="text-[8px] font-black text-slate-500 tracking-wider uppercase">
          3RD PLACE MATCH
        </div>

        <div className="flex items-center justify-around gap-1.5 py-0.5 text-[10px]">
          {homeTeam ? (
            <span className={`font-bold ${isHomeWinner ? 'text-emerald-400' : 'text-slate-400'}`}>{homeTeam.fifaCode}</span>
          ) : (
            <span className="text-slate-650 italic">TBD</span>
          )}
          
          <span className="text-[9px] font-black text-slate-600">
            {match.finished ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
          </span>

          {awayTeam ? (
            <span className={`font-bold ${isAwayWinner ? 'text-emerald-400' : 'text-slate-400'}`}>{awayTeam.fifaCode}</span>
          ) : (
            <span className="text-slate-650 italic">TBD</span>
          )}
        </div>
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
        <div className="flex flex-col items-center space-y-8 pt-4">
          {/* Symmetrical Bracket Header */}
          <div className="text-center space-y-2">
            <h2 className={`${cinzelFont.className} text-4xl font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500`} style={{ letterSpacing: '0.15em' }}>
              ROAD TO GLORY
            </h2>
            <div className="text-[9px] font-black tracking-[0.25em] text-slate-500 uppercase">
              KNOCKOUT STAGE BRACKET
            </div>
          </div>

          {/* Symmetrical Bracket container */}
          <div 
            className="w-full pb-8 pt-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex justify-center items-center min-w-max px-4 relative">
              {/* SVG Flow Lines */}
              <svg 
                className="absolute inset-y-0 left-4 pointer-events-none stroke-slate-800/80 fill-none"
                style={{
                  width: '1052px',
                  height: '640px',
                  zIndex: 0
                }}
              >
                {/* Left Side Connectors */}
                {/* R16 to QF: Upper */}
                <path d="M 130,113 L 136,113 L 136,259 L 130,259 M 136,186 L 142,186" strokeWidth="1.5" />
                {/* R16 to QF: Lower */}
                <path d="M 130,405 L 136,405 L 136,551 L 130,551 M 136,478 L 142,478" strokeWidth="1.5" />
                
                {/* QF to SF */}
                <path d="M 272,186 L 278,186 L 278,478 L 272,478 M 278,332 L 284,332" strokeWidth="1.5" />
                
                {/* SF to Final */}
                <path d="M 414,332 L 426,332" strokeWidth="1.5" />

                {/* Right Side Connectors */}
                {/* SF to Final */}
                <path d="M 638,332 L 626,332" strokeWidth="1.5" />

                {/* QF to SF */}
                <path d="M 780,186 L 774,186 L 774,478 L 780,478 M 774,332 L 768,332" strokeWidth="1.5" />

                {/* R16 to QF: Upper */}
                <path d="M 922,113 L 916,113 L 916,259 L 922,259 M 916,186 L 910,186" strokeWidth="1.5" />
                {/* R16 to QF: Lower */}
                <path d="M 922,405 L 916,405 L 916,551 L 922,551 M 916,478 L 910,478" strokeWidth="1.5" />
              </svg>

              <div 
                className="grid gap-3 items-center text-center relative z-10"
                style={{
                  gridTemplateColumns: '130px 130px 130px 200px 130px 130px 130px'
                }}
              >
                
                {/* Column 1: Round of 16 (Left) */}
                <div className="flex flex-col justify-around h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Round of 16</span>
                  {leftR16.map(m => renderSymmetricalBracketMatchCard(m))}
                </div>

                {/* Column 2: Quarter Finals (Left) */}
                <div className="flex flex-col justify-around h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Quarter-Finals</span>
                  {leftQF.map(m => renderSymmetricalBracketMatchCard(m))}
                </div>

                {/* Column 3: Semi Finals (Left) */}
                <div className="flex flex-col justify-center h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Semi-Finals</span>
                  {leftSF.map(m => renderSymmetricalBracketMatchCard(m))}
                </div>

                {/* Column 4: Center (Championship) */}
                <div className="flex flex-col justify-center items-center h-[640px] py-4 space-y-4">
                  <span className="text-[9px] font-black text-amber-500/80 tracking-wider uppercase border-b border-amber-500/10 pb-1.5 mb-2 w-full">Championship</span>
                  {renderCenterGrandFinalCard(grandFinal)}
                  {renderCenterThirdPlaceCard(thirdPlace)}
                </div>

                {/* Column 5: Semi Finals (Right) */}
                <div className="flex flex-col justify-center h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Semi-Finals</span>
                  {rightSF.map(m => renderSymmetricalBracketMatchCard(m))}
                </div>

                {/* Column 6: Quarter Finals (Right) */}
                <div className="flex flex-col justify-around h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Quarter-Finals</span>
                  {rightQF.map(m => renderSymmetricalBracketMatchCard(m))}
                </div>

                {/* Column 7: Round of 16 (Right) */}
                <div className="flex flex-col justify-around h-[640px] py-4">
                  <span className="text-[9px] font-black text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-1.5 mb-2">Round of 16</span>
                  {rightR16.map(m => renderSymmetricalBracketMatchCard(m))}
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
