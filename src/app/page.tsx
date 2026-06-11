'use client';

import React from 'react';
import HeroSection from '@/components/HeroSection';
import MatchScheduleCard from '@/components/MatchScheduleCard';
import ParticipatingTeamsCard from '@/components/ParticipatingTeamsCard';
import GroupStandingsCard from '@/components/GroupStandingsCard';
import StadiumsCard from '@/components/StadiumsCard';
import MatchPredictionCard from '@/components/MatchPredictionCard';
import { useTournamentStore } from '@/lib/store';
import { RefreshCw, CheckCircle2, Award } from 'lucide-react';

export default function Home() {
  const { 
    matches, 
    liveSyncMode, 
    syncWithFifa, 
    lastSynced,
    syncChanges
  } = useTournamentStore();

  const [mounted, setMounted] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncWithFifa();
    setSyncing(false);
  };

  React.useEffect(() => {
    setMounted(true);
    // Auto sync on load
    syncWithFifa();
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
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">Official FIFA Sync Dashboard</h2>
                <p className="text-xs text-slate-400">
                  Played: <span className="text-emerald-400 font-bold">{finishedCount}/104 matches</span> &bull; Status: <span className="text-slate-200 font-semibold">{tournamentStatus}</span>
                </p>
                {liveSyncMode && lastSynced && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 py-0.5 px-2 rounded uppercase tracking-wider mt-1.5">
                    <CheckCircle2 className="h-3 w-3" /> FIFA Sync Active &bull; Last Checked: {lastSynced}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {/* Live Sync Action */}
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold px-4 py-2.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
            </div>
            {/* Sync Changes Logs removed as requested */}
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

    </div>
  );
}
