'use client';

import React, { useState } from 'react';
import { TrendingUp, Users, Award, Calendar, ChevronRight, Vote, CheckCircle2 } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';

export default function PredictPage() {
  const { matches, teams, predictions, predictMatch, leaderboard } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<'fixtures' | 'leaderboard'>('fixtures');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
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

  // Filter unplayed matches to predict
  const upcomingMatches = matches
    .filter(m => !m.finished && m.homeTeamId !== '0' && m.awayTeamId !== '0')
    .slice(0, 6); // Display first 6 upcoming matches to predict

  const handleVoteCast = (matchId: string, vote: 'home' | 'away' | 'draw') => {
    predictMatch(matchId, vote);
  };

  const getVoteForMatch = (matchId: string) => {
    return predictions.find(p => p.matchId === matchId)?.predictedWinner;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Prediction Center</h1>
        <p className="text-sm text-slate-400 mt-1">Cast your votes on upcoming matches, beat the bots, and climb the leaderboard</p>
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
          Predict Upcoming Fixtures
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 columns) */}
        <div className="lg:col-span-8">
          {activeTab === 'fixtures' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMatches.length === 0 ? (
                <div className="col-span-full text-center py-16 rounded-xl glass-panel p-8">
                  <Calendar className="h-10 w-10 text-slate-650 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-300 uppercase">No Upcoming Predictable Matches</h3>
                  <p className="text-xs text-slate-500 mt-1">All matches have been simulated or finished! Reset the tournament to start predicting again.</p>
                </div>
              ) : (
                upcomingMatches.map((match) => {
                  const homeTeam = getTeam(match.homeTeamId);
                  const awayTeam = getTeam(match.awayTeamId);
                  const userVote = getVoteForMatch(match.id);
                  const isVoted = userVote !== undefined;

                  if (!homeTeam || !awayTeam) return null;

                  return (
                    <div key={match.id} className="rounded-xl glass-panel p-5 flex flex-col justify-between space-y-4">
                      {/* Meta */}
                      <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-slate-500 uppercase">
                        <span>MATCH #{match.id}</span>
                        <span className="text-emerald-500">GROUP {match.group}</span>
                      </div>

                      {/* Teams display */}
                      <div className="grid grid-cols-7 items-center gap-1">
                        <div className="col-span-3 flex flex-col items-center gap-1.5">
                          <img src={homeTeam.flag} alt="" className="h-8 w-12 object-cover rounded shadow border border-slate-850" />
                          <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{homeTeam.name}</span>
                        </div>
                        <span className="col-span-1 text-center font-bold text-slate-500 text-[10px]">VS</span>
                        <div className="col-span-3 flex flex-col items-center gap-1.5">
                          <img src={awayTeam.flag} alt="" className="h-8 w-12 object-cover rounded shadow border border-slate-850" />
                          <span className="text-xs font-black text-slate-200 uppercase tracking-wide truncate max-w-full">{awayTeam.name}</span>
                        </div>
                      </div>

                      {/* Vote options */}
                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          <button
                            onClick={() => handleVoteCast(match.id, 'home')}
                            disabled={isVoted}
                            className={`
                              py-2 rounded border font-bold transition-all
                              ${userVote === 'home'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                              }
                              ${isVoted && userVote !== 'home' ? 'opacity-55' : ''}
                            `}
                          >
                            {homeTeam.fifaCode}
                          </button>

                          <button
                            onClick={() => handleVoteCast(match.id, 'draw')}
                            disabled={isVoted}
                            className={`
                              py-2 rounded border font-bold transition-all
                              ${userVote === 'draw'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                              }
                              ${isVoted && userVote !== 'draw' ? 'opacity-55' : ''}
                            `}
                          >
                            Draw
                          </button>

                          <button
                            onClick={() => handleVoteCast(match.id, 'away')}
                            disabled={isVoted}
                            className={`
                              py-2 rounded border font-bold transition-all
                              ${userVote === 'away'
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                              }
                              ${isVoted && userVote !== 'away' ? 'opacity-55' : ''}
                            `}
                          >
                            {awayTeam.fifaCode}
                          </button>
                        </div>

                        {/* Confirmation notification badge */}
                        {isVoted && (
                          <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-500/5 py-1.5 rounded border border-emerald-500/10 mt-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Predicted: {userVote === 'home' ? homeTeam.fifaCode : userVote === 'away' ? awayTeam.fifaCode : 'Draw'}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            // Dedicated Leaderboard list table
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
                      <th className="pb-3 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {leaderboard.map((player, index) => {
                      const isUser = player.username === 'You (Local)';
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
                          <td className="py-3.5 text-center font-black text-emerald-400">{player.points} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 columns) - Trending / Side widget */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick instructions */}
          <div className="rounded-xl glass-panel p-6 space-y-3">
            <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Vote className="h-4.5 w-4.5 text-emerald-400" /> How to Play
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predict the outcomes of upcoming matches. You will get **+3 points** for every correct match winner prediction.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once you predict, simulate the matches on the Home page. Standings and leaderboard scores will recalculate automatically!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
