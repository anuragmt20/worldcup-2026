'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Calendar, ChevronRight, Vote, CheckCircle2, Coins, LogIn, Lock, Hourglass, BarChart3, Clock, AlertTriangle, History } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';

export default function PredictPage() {
  const { matches, teams, predictions, predictMatch, leaderboard, globalPredictions, loadGlobalPredictions } = useTournamentStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'fixtures' | 'history' | 'leaderboard'>('fixtures');
  const [mounted, setMounted] = useState(false);

  // Keep track of chosen bet sizes per match. Default to 50 WC.
  const [bets, setBets] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    loadGlobalPredictions();
    const interval = setInterval(() => {
      loadGlobalPredictions();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-850 border-t-emerald-500" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Predictions...</span>
        </div>
      </div>
    );
  }

  const getTeam = (id: string) => teams.find(t => t.id === id);

  // Parse kickoff date "MM/DD/YYYY HH:mm"
  const parseKickoff = (dateStr: string) => {
    try {
      const [datePart, timePart] = dateStr.split(' ');
      const [month, day, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute);
    } catch (e) {
      return new Date(dateStr);
    }
  };

  // Get lock status (1 hour before kickoff)
  const getMatchLockStatus = (dateStr: string, finished: boolean) => {
    if (finished) return { isLocked: true, timeLeftText: 'Finished' };
    
    const kickoff = parseKickoff(dateStr);
    const now = new Date();
    const diffMs = kickoff.getTime() - now.getTime();
    
    if (diffMs <= 60 * 60 * 1000) {
      return { isLocked: true, timeLeftText: 'Locked (Kickoff soon)' };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeLeftText = '';
    if (diffHours > 24) {
      timeLeftText = `Closes in ${Math.floor(diffHours / 24)}d`;
    } else {
      timeLeftText = `Closes in ${diffHours}h ${diffMins}m`;
    }

    return { isLocked: false, timeLeftText };
  };

  // Dynamically calculate pool multipliers using real user bets in globalPredictions
  const getPoolMultipliers = (matchId: string) => {
    const seed = Number(matchId) || 1;
    const basePool = 1000 + (seed % 5) * 500;
    const r1 = 0.4 + (seed % 3) * 0.1; // 0.4, 0.5, 0.6
    const r2 = 0.2 + (seed % 2) * 0.05; // 0.2, 0.25
    const r3 = 1.0 - r1 - r2;
    
    let poolHome = Math.round(basePool * r1);
    let poolDraw = Math.round(basePool * r2);
    let poolAway = Math.round(basePool * r3);

    // Sum all bets placed by users in the system
    const matchBets = globalPredictions || [];
    matchBets.forEach(p => {
      if (p.matchId === matchId) {
        if (p.predictedWinner === 'home') poolHome += (p.betAmount || 0);
        else if (p.predictedWinner === 'draw') poolDraw += (p.betAmount || 0);
        else if (p.predictedWinner === 'away') poolAway += (p.betAmount || 0);
      }
    });

    const totalPool = poolHome + poolDraw + poolAway;

    return {
      home: (totalPool / poolHome).toFixed(1) + 'x',
      draw: (totalPool / poolDraw).toFixed(1) + 'x',
      away: (totalPool / poolAway).toFixed(1) + 'x',
      totalPool
    };
  };

  const handleVoteCast = async (matchId: string, choice: 'home' | 'away' | 'draw') => {
    if (!user) return;
    const betSize = bets[matchId] || 50;
    
    if ((user.points || 0) < betSize) {
      alert('Insufficient WC Coins balance! Claim welcome coins or check in daily.');
      return;
    }

    try {
      await predictMatch(matchId, choice, betSize);
    } catch (e: any) {
      alert(e.message || 'Error placing prediction');
    }
  };

  // Filter unplayed matches to predict
  const upcomingMatches = matches
    .filter(m => !m.finished && m.homeTeamId !== '0' && m.awayTeamId !== '0')
    .slice(0, 8); // Display first 8 upcoming matches to predict

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Prediction Center</h1>
          <p className="text-sm text-slate-400 mt-1">Bet your WC Coins on matches, beat the odds, and claim the public pools</p>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 px-4 py-2 rounded-xl">
            <Coins className="h-5 w-5 text-amber-500" />
            <div className="text-left">
              <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Your Balance</div>
              <div className="text-base font-extrabold text-amber-400 leading-tight mt-0.5">{user.points || 0} WC</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex w-fit rounded-lg bg-slate-900/40 p-1 border border-slate-900">
        <button
          onClick={() => setActiveTab('fixtures')}
          className={`
            px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
            ${activeTab === 'fixtures' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          Predict Fixtures
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('history')}
            className={`
              px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
              ${activeTab === 'history' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            Prediction History
          </button>
        )}
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`
            px-5 py-2 text-xs font-bold rounded-md transition-colors cursor-pointer
            ${activeTab === 'leaderboard' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-slate-400 hover:text-white'
            }
          `}
        >
          Leaderboard Standings
        </button>
      </div>

      {/* Main Predictions flow */}
      {!user && activeTab !== 'leaderboard' ? (
        /* Login Prompt Sheet */
        <div className="rounded-2xl glass-panel bg-gradient-to-br from-slate-950 via-slate-950/90 to-emerald-950/20 border border-slate-850 p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">Authentication Required</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect or create an account to unlock the Prediction Center! A new user can claim <strong>250 WC Coins</strong> instantly, participate in predictions, and check in daily to accumulate free tokens.
            </p>
          </div>

          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 text-xs tracking-wider uppercase transition-colors shadow-lg shadow-emerald-500/15"
          >
            <LogIn className="h-4 w-4" />
            Sign In / Register
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-8">
            
            {/* Fixtures list tab */}
            {activeTab === 'fixtures' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingMatches.length === 0 ? (
                  <div className="col-span-full text-center py-16 rounded-xl glass-panel p-8">
                    <Calendar className="h-10 w-10 text-slate-650 mx-auto mb-4" />
                    <h3 className="text-sm font-bold text-slate-300 uppercase">No Upcoming Predictions</h3>
                    <p className="text-xs text-slate-500 mt-1">All matches have kicked off or finished. Reset the simulation to predict again.</p>
                  </div>
                ) : (
                  upcomingMatches.map((match) => {
                    const homeTeam = getTeam(match.homeTeamId);
                    const awayTeam = getTeam(match.awayTeamId);
                    
                    const userPrediction = predictions.find(p => p.matchId === match.id);
                    const isVoted = userPrediction !== undefined;
                    
                    const { isLocked, timeLeftText } = getMatchLockStatus(match.localDate, match.finished);
                    const mults = getPoolMultipliers(match.id);
                    const selectedBet = bets[match.id] || 50;

                    if (!homeTeam || !awayTeam) return null;

                    return (
                      <div key={match.id} className="rounded-xl glass-panel p-5 flex flex-col justify-between space-y-4 relative overflow-hidden">
                        
                        {/* Header metadata */}
                        <div className="flex items-center justify-between text-[9px] font-black tracking-widest uppercase">
                          <span className="text-slate-500">MATCH #{match.id}</span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${isLocked ? 'border-red-500/20 text-red-400 bg-red-500/5' : 'border-slate-800 text-slate-400 bg-slate-900/40'}`}>
                            {isLocked ? <Lock className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                            {timeLeftText}
                          </span>
                        </div>

                        {/* Team flags and names */}
                        <div className="grid grid-cols-7 items-center gap-1 py-1">
                          <div className="col-span-3 flex flex-col items-center gap-1.5 text-center">
                            <img src={homeTeam.flag} alt="" className="h-7 w-11 object-cover rounded shadow border border-slate-850" />
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{homeTeam.name}</span>
                          </div>
                          <span className="col-span-1 text-center font-bold text-slate-600 text-[10px]">VS</span>
                          <div className="col-span-3 flex flex-col items-center gap-1.5 text-center">
                            <img src={awayTeam.flag} alt="" className="h-7 w-11 object-cover rounded shadow border border-slate-850" />
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{awayTeam.name}</span>
                          </div>
                        </div>

                        {/* Bet Size selector (only if not predicted yet and not locked) */}
                        {!isVoted && !isLocked && (
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">Bet Size (WC Coins)</div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[10, 25, 50, 100].map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setBets(prev => ({ ...prev, [match.id]: size }))}
                                  className={`
                                    py-1 rounded text-[10px] font-extrabold transition-all border
                                    ${selectedBet === size 
                                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                      : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-850'
                                    }
                                  `}
                                >
                                  {size} WC
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Predict odds choices */}
                        <div className="space-y-2 pt-1 border-t border-slate-900/50">
                          {!isVoted ? (
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                onClick={() => handleVoteCast(match.id, 'home')}
                                disabled={isLocked}
                                className="flex flex-col items-center py-2 rounded border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 disabled:opacity-50 text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
                              >
                                <span>{homeTeam.fifaCode}</span>
                                <span className="text-[8px] font-black text-amber-400/90 mt-0.5">{mults.home}</span>
                              </button>

                              <button
                                onClick={() => handleVoteCast(match.id, 'draw')}
                                disabled={isLocked}
                                className="flex flex-col items-center py-2 rounded border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 disabled:opacity-50 text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
                              >
                                <span>Draw</span>
                                <span className="text-[8px] font-black text-amber-400/90 mt-0.5">{mults.draw}</span>
                              </button>

                              <button
                                onClick={() => handleVoteCast(match.id, 'away')}
                                disabled={isLocked}
                                className="flex flex-col items-center py-2 rounded border border-slate-900 bg-slate-950 hover:bg-slate-900 hover:border-slate-800 disabled:opacity-50 text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
                              >
                                <span>{awayTeam.fifaCode}</span>
                                <span className="text-[8px] font-black text-amber-400/90 mt-0.5">{mults.away}</span>
                              </button>
                            </div>
                          ) : (
                            /* Already Voted state display */
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/5 py-2 rounded border border-emerald-500/10">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Predicted: {userPrediction.predictedWinner === 'home' ? homeTeam.fifaCode : userPrediction.predictedWinner === 'away' ? awayTeam.fifaCode : 'Draw'}
                              </div>
                              <div className="flex justify-between text-[8px] font-bold text-slate-500 px-1">
                                <span>Bet: {userPrediction.betAmount || 50} WC</span>
                                <span>Active Pool: {userPrediction.totalPool || mults.totalPool} WC</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Prediction History Tab */}
            {activeTab === 'history' && (
              <div className="rounded-xl glass-panel p-6 space-y-4">
                <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                  <History className="h-4.5 w-4.5 text-emerald-400" /> Past Prediction Bets
                </h2>

                {predictions.length === 0 ? (
                  <div className="text-center py-12">
                    <Vote className="h-8 w-8 text-slate-650 mx-auto mb-3" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Predictions Logged Yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {predictions.map((p, idx) => {
                      const match = matches.find(m => m.id === p.matchId);
                      if (!match) return null;
                      
                      const homeTeam = getTeam(match.homeTeamId);
                      const awayTeam = getTeam(match.awayTeamId);
                      
                      const actualOutcome = match.finished 
                        ? (match.homeScore > match.awayScore ? 'home' : match.awayScore > match.homeScore ? 'away' : 'draw')
                        : 'pending';

                      return (
                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg bg-slate-950/60 border border-slate-900 p-4 gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              <span>MATCH #{p.matchId}</span>
                              <span>&bull;</span>
                              <span>Predicted: {p.predictedWinner.toUpperCase()}</span>
                              <span>&bull;</span>
                              <span>Bet: {p.betAmount || 50} WC</span>
                            </div>
                            
                            {/* Match result line */}
                            <div className="flex items-center gap-2.5 text-xs text-slate-200">
                              <span className="font-bold">{homeTeam?.fifaCode || match.homeTeamLabel}</span>
                              <span className="font-black text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                                {match.finished ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                              </span>
                              <span className="font-bold">{awayTeam?.fifaCode || match.awayTeamLabel}</span>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto text-right">
                            {p.settled ? (
                              p.outcome === 'won' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                  WON +{p.payout} WC
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-900 border border-slate-850 px-3 py-1 rounded-full uppercase tracking-wider">
                                  LOST -{p.betAmount || 50} WC
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                Pending Settle
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Public Predictor Rankings Tab */}
            {activeTab === 'leaderboard' && (
              <div className="rounded-xl glass-panel p-6 space-y-4">
                <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-yellow-400" /> Predictor Rankings
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        <th className="pb-3 w-8">#</th>
                        <th className="pb-3">Predictor</th>
                        <th className="pb-3 text-center">Correct</th>
                        <th className="pb-3 text-center">Accuracy</th>
                        <th className="pb-3 text-center">Coins</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {leaderboard.map((player, index) => {
                        const isUser = user && (player.username === user.username || player.username === 'You (Local)');
                        const accuracy = player.totalPredictions > 0 
                          ? Math.round((player.correctPredictions / player.totalPredictions) * 100)
                          : 0;

                        return (
                          <tr 
                            key={player.username}
                            className={`
                              transition-colors
                              ${isUser ? 'bg-emerald-500/5 text-emerald-400 font-bold' : 'text-slate-300'}
                            `}
                          >
                            <td className="py-3.5 pl-2 font-bold">{index + 1}</td>
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200">{player.username}</span>
                                {isUser && <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase tracking-widest">You</span>}
                              </div>
                            </td>
                            <td className="py-3.5 text-center">{player.correctPredictions} / {player.totalPredictions}</td>
                            <td className="py-3.5 text-center">{accuracy}%</td>
                            <td className="py-3.5 text-center font-black text-emerald-400">
                              {player.points !== undefined ? player.points : 0} WC
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick rules */}
            <div className="rounded-xl glass-panel p-6 space-y-4">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide flex items-center gap-2 border-b border-slate-900 pb-2.5">
                <Vote className="h-4.5 w-4.5 text-emerald-400" /> Prediction Rules
              </h3>
              
              <ul className="space-y-3.5 text-[11px] text-slate-400 leading-relaxed font-semibold">
                <li className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>1-Hour Lock:</strong> Predictions close exactly 1 hour before kickoff. You cannot bet or modify options once locked.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Pari-Mutuel Pooling:</strong> All coins bet on a match are pooled. Winning outcomes distribute the total pool among the winning predictors proportionally.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Hourglass className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>1-Hour Settle Payout:</strong> Payout rewards will be processed and added to your balance 1 hour after the match finishes.
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
