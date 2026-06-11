'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ChevronRight, Lock, LogIn } from 'lucide-react';
import { useTournamentStore } from '../lib/store';
import { useAuthStore } from '../lib/authStore';

export default function MatchPredictionCard() {
  const { teams, predictions, predictMatch } = useTournamentStore();
  const { user } = useAuthStore();
  const [selectedVote, setSelectedVote] = useState<'home' | 'away' | 'draw' | null>(null);
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // France (ID 33) and Brazil (ID 9) from JSON dataset
  const homeTeam = teams.find(t => t.id === '33') || teams.find(t => t.fifaCode === 'FRA');
  const awayTeam = teams.find(t => t.id === '9') || teams.find(t => t.fifaCode === 'BRA');

  // Hardcoded match details matching screenshot mockup
  const mockMatchId = 'predict_fra_bra_mock';
  const matchDate = 'JUN 15, 2026';
  const matchGroup = 'GROUP D'; // Mock group matching the screenshot

  const hasPredicted = predictions.some(p => p.matchId === mockMatchId) || predictionSubmitted;

  // Mock prediction percentages: 52% FRA Win, 20% Draw, 28% BRA Win
  // If user votes, we can adjust slightly
  const getPercentages = () => {
    if (selectedVote === 'home') return { home: 58, draw: 18, away: 24 };
    if (selectedVote === 'away') return { home: 48, draw: 18, away: 34 };
    if (selectedVote === 'draw') return { home: 49, draw: 26, away: 25 };
    return { home: 52, draw: 20, away: 28 };
  };

  const pct = getPercentages();

  const handleVote = (vote: 'home' | 'away' | 'draw') => {
    if (hasPredicted) return;
    setSelectedVote(vote);
  };

  const handleSubmit = () => {
    if (!selectedVote || hasPredicted) return;
    predictMatch(mockMatchId, selectedVote, 50);
    setPredictionSubmitted(true);
  };

  if (!homeTeam || !awayTeam) return null;

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel glass-panel-hover p-6">
      
      {/* Header */}
      <Link href="/predict" className="flex items-center justify-between mb-4 group cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
          <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-emerald-400 transition-colors duration-200">MATCH PREDICTION</h3>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>

      <p className="text-xs text-slate-400 mb-6">
        Predict match winners and challenge friends
      </p>

      <div className="flex-1 flex flex-col justify-center">
        {/* Match Info Banner */}
        <div className="text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">
          {matchDate} &bull; {matchGroup}
        </div>

        {/* Fixture Display */}
        <div className="grid grid-cols-7 items-center justify-center gap-2 mb-6">
          {/* Home Team */}
          <div className="col-span-3 flex flex-col items-center gap-1.5">
            <img 
              src={homeTeam.flag} 
              alt={homeTeam.name} 
              className="h-10 w-15 object-cover rounded shadow-md border border-slate-800/80"
            />
            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{homeTeam.fifaCode}</span>
          </div>

          {/* VS */}
          <div className="col-span-1 text-center font-black text-xs text-slate-500">
            VS
          </div>

          {/* Away Team */}
          <div className="col-span-3 flex flex-col items-center gap-1.5">
            <img 
              src={awayTeam.flag} 
              alt={awayTeam.name} 
              className="h-10 w-15 object-cover rounded shadow-md border border-slate-800/80"
            />
            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">{awayTeam.fifaCode}</span>
          </div>
        </div>

        {/* Win/Draw Buttons or Auth Gate */}
        {!user ? (
          /* Signed-out: locked state */
          <div className="flex flex-col items-center justify-center gap-4 py-6 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sign in to Predict</p>
              <p className="text-[10px] text-slate-500 mt-1">Join to predict match winners & earn WC coins</p>
            </div>
            <Link
              href="/auth"
              className="flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black px-5 py-2.5 transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-center text-slate-400 tracking-wider uppercase mb-1">
              Who will win?
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              {/* Home Win */}
              <button
                onClick={() => handleVote('home')}
                disabled={hasPredicted}
                className={`
                  py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200 border
                  ${selectedVote === 'home'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-700/80'
                  }
                  ${hasPredicted && selectedVote !== 'home' ? 'opacity-50' : ''}
                `}
              >
                {homeTeam.fifaCode} Win
              </button>

              {/* Draw */}
              <button
                onClick={() => handleVote('draw')}
                disabled={hasPredicted}
                className={`
                  py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200 border
                  ${selectedVote === 'draw'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-700/80'
                  }
                  ${hasPredicted && selectedVote !== 'draw' ? 'opacity-50' : ''}
                `}
              >
                Draw
              </button>

              {/* Away Win */}
              <button
                onClick={() => handleVote('away')}
                disabled={hasPredicted}
                className={`
                  py-2.5 rounded-lg text-xs font-extrabold transition-all duration-200 border
                  ${selectedVote === 'away'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-950/40 border-slate-850 text-slate-300 hover:border-slate-700/80'
                  }
                  ${hasPredicted && selectedVote !== 'away' ? 'opacity-50' : ''}
                `}
              >
                {awayTeam.fifaCode} Win
              </button>
            </div>

            {/* Dynamic percentages display if predicted */}
            {hasPredicted && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider">
                  <span>{homeTeam.fifaCode}: {pct.home}%</span>
                  <span>Draw: {pct.draw}%</span>
                  <span>{awayTeam.fifaCode}: {pct.away}%</span>
                </div>
                <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-900 border border-slate-850">
                  <div style={{ width: `${pct.home}%` }} className="h-full bg-emerald-500" />
                  <div style={{ width: `${pct.draw}%` }} className="h-full bg-slate-700" />
                  <div style={{ width: `${pct.away}%` }} className="h-full bg-blue-500" />
                </div>
              </div>
            )}

            {/* Action Button */}
            {!hasPredicted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedVote}
                className={`
                  w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-2
                  ${selectedVote 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-850'
                  }
                `}
              >
                Make Prediction
              </button>
            ) : (
              <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 py-3 rounded-lg mt-2 tracking-wide uppercase">
                Prediction Submitted!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer link */}
      <Link 
        href="/predict"
        className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-bold text-slate-400 hover:text-white group transition-colors"
      >
        <span>See Predictions Leaderboard</span>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </Link>

    </div>
  );
}
