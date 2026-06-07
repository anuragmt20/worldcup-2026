'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import MatchScheduleCard from '@/components/MatchScheduleCard';
import ParticipatingTeamsCard from '@/components/ParticipatingTeamsCard';
import GroupStandingsCard from '@/components/GroupStandingsCard';
import StadiumsCard from '@/components/StadiumsCard';
import MatchPredictionCard from '@/components/MatchPredictionCard';
import { useTournamentStore } from '@/lib/store';
import { Play, RotateCcw, Award, Mail } from 'lucide-react';

export default function Home() {
  const { 
    simulateGroupStage, 
    simulateKnockouts, 
    simulateEntireTournament, 
    resetTournament, 
    matches, 
    liveSyncMode, 
    toggleLiveSync, 
    syncWithFifa, 
    lastSynced 
  } = useTournamentStore();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-850 border-t-emerald-500" />
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const finishedCount = matches.filter(m => m.finished).length;
  
  let tournamentStatus = 'Upcoming';
  if (finishedCount > 0 && finishedCount < 72) {
    tournamentStatus = 'Group Stage in Progress';
  } else if (finishedCount === 72) {
    tournamentStatus = 'Group Stage Completed (Knockouts Pending)';
  } else if (finishedCount > 72 && finishedCount < 104) {
    tournamentStatus = 'Knockouts in Progress';
  } else if (finishedCount === 104) {
    tournamentStatus = 'Tournament Completed!';
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-16 space-y-8">
      {/* Hero section with floating trophy */}
      <HeroSection />

      {/* Interactive Simulation & Live Sync Control Dashboard */}
      <div className="px-6 lg:px-12 mx-auto w-full max-w-7xl">
        <div className="rounded-2xl glass-panel p-6 border-l-4 border-l-emerald-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">Tournament Control Panel</h2>
              <p className="text-xs text-slate-400">
                Played: <span className="text-emerald-400 font-bold">{finishedCount}/104 matches</span> &bull; Status: <span className="text-slate-200 font-semibold">{tournamentStatus}</span>
              </p>
              {liveSyncMode && lastSynced && (
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-1">
                  FIFA Sync Active &bull; Last Synced: {lastSynced}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Sync Mode Toggle */}
              <button
                onClick={toggleLiveSync}
                className={`
                  flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer
                  ${liveSyncMode 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                {liveSyncMode ? 'Disable FIFA Live Sync' : 'Enable FIFA Live Sync'}
              </button>

              {/* Live Sync Action */}
              {liveSyncMode ? (
                <button
                  onClick={syncWithFifa}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Sync Official Scores
                </button>
              ) : (
                /* Simulation Actions */
                <div className="flex flex-wrap gap-2.5">
                  {finishedCount < 72 && (
                    <button
                      onClick={simulateGroupStage}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 text-xs font-bold text-slate-200 px-4 py-2.5 transition-colors cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 text-emerald-400" />
                      Simulate Group Stage
                    </button>
                  )}
                  {finishedCount >= 72 && finishedCount < 104 && (
                    <button
                      onClick={simulateKnockouts}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 text-xs font-bold text-slate-200 px-4 py-2.5 transition-colors cursor-pointer"
                    >
                      <Award className="h-3.5 w-3.5 text-emerald-400" />
                      Simulate Knockouts
                    </button>
                  )}
                  {finishedCount < 104 && (
                    <button
                      onClick={simulateEntireTournament}
                      className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Simulate Entire Cup
                    </button>
                  )}
                  {finishedCount > 0 && (
                    <button
                      onClick={resetTournament}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/40 text-xs font-bold text-slate-400 hover:text-red-400 px-4 py-2.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Tournament
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards Grid */}
      <div className="px-6 lg:px-12 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Match Schedule (Spans 2 columns on medium & large viewports) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <MatchScheduleCard />
          </div>

          {/* Match Prediction */}
          <div className="col-span-1">
            <MatchPredictionCard />
          </div>

          {/* Group Standings */}
          <div className="col-span-1">
            <GroupStandingsCard />
          </div>

          {/* Participating Teams */}
          <div className="col-span-1">
            <ParticipatingTeamsCard />
          </div>

          {/* Stadiums Showcase */}
          <div className="col-span-1">
            <StadiumsCard />
          </div>

        </div>
      </div>

      {/* Bottom Newsletter Footer Banner */}
      <div className="px-6 lg:px-12 mx-auto w-full max-w-7xl pt-4">
        <div className="relative rounded-2xl overflow-hidden glass-panel bg-gradient-to-r from-blue-950/20 via-slate-950/60 to-emerald-950/20 border border-slate-800/80 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">Don't Miss a Moment</h3>
                <p className="text-xs text-slate-400 mt-1">Get the latest match updates, news and ticket notices delivered directly.</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-950/80 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 w-full sm:w-64 text-slate-200"
              />
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 text-xs uppercase tracking-wider transition-colors shrink-0">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* 26 Watermark on the bottom right */}
          <div className="absolute right-0 bottom-0 select-none text-8xl font-black text-slate-900/15 -mb-6 mr-4 z-0 pointer-events-none">
            26
          </div>
        </div>
      </div>

    </div>
  );
}
