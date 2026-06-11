'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertTriangle, X, Check, ArrowRight, Coins } from 'lucide-react';
import { useTournamentStore } from '../lib/store';
import { useAuthStore } from '../lib/authStore';

export default function PredictionResultPopup() {
  const { predictions, acknowledgePredictions, teams } = useTournamentStore();
  const { user } = useAuthStore();

  if (!user) return null;

  // Find all predictions that are settled but the user has not acknowledged yet
  const unacknowledged = predictions.filter(p => p.settled && !p.acknowledged);

  if (unacknowledged.length === 0) return null;

  const getTeam = (id: string) => teams.find(t => t.id === id);

  const winsCount = unacknowledged.filter(p => p.outcome === 'won').length;
  const lossesCount = unacknowledged.filter(p => p.outcome === 'lost').length;
  const totalPayout = unacknowledged.reduce((sum, p) => sum + (p.payout || 0), 0);
  const totalBetLost = unacknowledged
    .filter(p => p.outcome === 'lost')
    .reduce((sum, p) => sum + (p.betAmount || 0), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg rounded-2xl bg-slate-950/90 border border-slate-800 p-6 shadow-2xl overflow-hidden flex flex-col gap-6"
        >
          {/* Animated Glowing backgrounds */}
          <div className="absolute -inset-10 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />

          {/* Close Header Button */}
          <button
            onClick={() => acknowledgePredictions()}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon Header */}
          <div className="text-center space-y-2 pt-4 relative">
            <div className="flex justify-center">
              {winsCount > 0 ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-bounce">
                  <Trophy className="h-8 w-8" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 shadow-md">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider">
              {winsCount > 0 ? 'Prediction Results Unlocked!' : 'Match Bets Settled'}
            </h2>
            <p className="text-xs text-slate-450">
              {winsCount > 0 
                ? `You won ${winsCount} prediction${winsCount > 1 ? 's' : ''}! Payouts credited to your balance.` 
                : 'Your recent prediction bets have been settled.'}
            </p>
          </div>

          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 text-center">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total Won Payout</span>
              <span className="text-lg font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <Coins className="h-4 w-4 text-amber-500" />
                +{totalPayout} WC
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total Bets Lost</span>
              <span className="text-lg font-black text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                <Coins className="h-4 w-4 text-slate-600" />
                -{totalBetLost} WC
              </span>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[30vh] overflow-y-auto pr-1 space-y-3">
            {unacknowledged.map((p, idx) => {
              const homeTeam = getTeam(p.matchId + '_home') || getTeam('home') || { name: 'Home Team', fifaCode: 'HOM', flag: '' }; // Fallback resolving if needed
              // Wait, in page.tsx: matches are queried, teams are queried. Let's get the teams dynamically using matches stored in the store.
              const match = useTournamentStore.getState().matches.find(m => m.id === p.matchId);
              const home = match ? getTeam(match.homeTeamId) : null;
              const away = match ? getTeam(match.awayTeamId) : null;

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-lg border text-xs transition-all gap-3
                    ${p.outcome === 'won' 
                      ? 'bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/20' 
                      : 'bg-slate-900/40 border-slate-900 hover:border-slate-850'
                    }
                  `}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <span>MATCH #{p.matchId}</span>
                      <span>&bull;</span>
                      <span>Bet: {p.betAmount} WC</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-200 font-bold">
                      <span>{home?.fifaCode || 'TBD'}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400">
                        {match?.finished ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                      </span>
                      <span>{away?.fifaCode || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-900/60 pt-2 sm:pt-0">
                    <span className="text-[10px] text-slate-400">
                      Predicted: <strong className="text-slate-200">{p.predictedWinner.toUpperCase()}</strong>
                    </span>

                    {p.outcome === 'won' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md uppercase tracking-wider">
                        <Check className="h-3 w-3" /> Won +{p.payout} WC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md uppercase tracking-wider">
                        <X className="h-3 w-3" /> Lost -{p.betAmount} WC
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => acknowledgePredictions()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/10 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{winsCount > 0 ? 'Awesome! Claim Coins' : 'Acknowledge & Dismiss'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
