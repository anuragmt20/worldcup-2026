import { create } from 'zustand';
import { Match, Team, Stadium, GroupStandings, GroupStandingRow, Prediction, PredictionLeaderboardEntry } from '../types';
import { getTeams, getStadiums, getMatches } from './dataLoader';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { useAuthStore } from './authStore';

interface TournamentState {
  matches: Match[];
  teams: Team[];
  stadiums: Stadium[];
  predictions: Prediction[];
  leaderboard: PredictionLeaderboardEntry[];
  selectedGroup: string;
  liveSyncMode: boolean;
  lastSynced: string | null;
  syncChanges: string[];
  timezone: string;
  setSelectedGroup: (group: string) => void;
  syncWithFifa: () => Promise<void>;
  predictMatch: (matchId: string, outcome: 'home' | 'away' | 'draw', betAmount: number) => Promise<void>;
  getStandings: () => GroupStandings;
  getThirdPlaceTeams: () => any[];
  fetchLeaderboard: () => Promise<void>;
  loadUserPredictions: () => Promise<void>;
  setTimezone: (tz: string) => void;
  globalPredictions: { matchId: string; predictedWinner: 'home' | 'away' | 'draw'; betAmount: number }[];
  loadGlobalPredictions: () => Promise<void>;
  acknowledgePredictions: () => Promise<void>;
}

// Seeded random scores helper for calendar date sync
const getSeededScore = (matchId: string, isHome: boolean): number => {
  const seed = Number(matchId) + (isHome ? 7 : 13);
  const x = Math.sin(seed) * 10000;
  const rand = x - Math.floor(x);
  if (rand < 0.22) return 0;
  if (rand < 0.55) return 1;
  if (rand < 0.80) return 2;
  if (rand < 0.93) return 3;
  return 4;
};

// Helper to simulate realistic scores (average of 1.5 goals per team, Poisson-like)
const generateRealisticScore = (): number => {
  const r = Math.random();
  if (r < 0.22) return 0;
  if (r < 0.55) return 1;
  if (r < 0.80) return 2;
  if (r < 0.92) return 3;
  if (r < 0.97) return 4;
  return 5;
};

const MOCK_SCORERS = [
  'Mbappé', 'Vinícius Jr.', 'Kane', 'Messi', 'Haaland', 'Bellingham', 'Musiala', 'Salah',
  'Pulisic', 'Giménez', 'David', 'Son', 'Mitrović', 'Morata', 'Bruno Fernandes', 'Lautaro Martínez',
  'Leão', 'Gakpo', 'Saka', 'Wirtz', 'Osimhen', 'Kvaratskhelia', 'Lukaku', 'Rodri'
];

const generateScorers = (goals: number): string[] => {
  if (goals <= 0) return [];
  const scorers: string[] = [];
  for (let i = 0; i < goals; i++) {
    const scorer = MOCK_SCORERS[Math.floor(Math.random() * MOCK_SCORERS.length)];
    const minute = Math.floor(Math.random() * 90) + 1;
    scorers.push(`${scorer} ${minute}'`);
  }
  return scorers;
};

const getSeededScorers = (goals: number, matchId: string, isHome: boolean): string[] => {
  if (goals <= 0) return [];
  const scorers: string[] = [];
  for (let i = 0; i < goals; i++) {
    const seed = Number(matchId) + (isHome ? 31 : 57) + i * 17;
    const x = Math.sin(seed) * 10000;
    const randIndex = Math.floor((x - Math.floor(x)) * MOCK_SCORERS.length);
    const scorer = MOCK_SCORERS[randIndex];
    
    const minuteSeed = Math.sin(seed + 5) * 10000;
    const minute = Math.floor((minuteSeed - Math.floor(minuteSeed)) * 90) + 1;
    scorers.push(`${scorer} ${minute}'`);
  }
  
  // Sort by minute
  scorers.sort((a, b) => {
    const minA = parseInt(a.split(' ').pop() || '0');
    const minB = parseInt(b.split(' ').pop() || '0');
    return minA - minB;
  });
  
  return scorers;
};

const parseOfficialScorers = (scorersVal: any): string[] | null => {
  if (!scorersVal || scorersVal === 'null' || scorersVal === 'None' || scorersVal === 'undefined') {
    return null;
  }
  if (Array.isArray(scorersVal)) {
    return scorersVal;
  }
  if (typeof scorersVal === 'string') {
    return scorersVal.split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
};

export const useTournamentStore = create<TournamentState>((set, get) => {
  const initialTeams = getTeams();
  const initialStadiums = getStadiums();
  const initialMatches = getMatches();

  let savedMatches: Match[] = [];
  let savedPredictions: Prediction[] = [];
  let savedLeaderboard: PredictionLeaderboardEntry[] = [];
  let savedLiveSync = true; // Always enable sync to the official website
  let savedLastSynced: string | null = null;
  let savedTimezone = 'India';
  let savedSyncChanges: string[] = [];

  if (typeof window !== 'undefined') {
    try {
      const storedMatches = localStorage.getItem('wc2026_matches');
      if (storedMatches) savedMatches = JSON.parse(storedMatches);

      const storedPredictions = localStorage.getItem('wc2026_predictions');
      if (storedPredictions) savedPredictions = JSON.parse(storedPredictions);

      const storedLeaderboard = localStorage.getItem('wc2026_leaderboard');
      if (storedLeaderboard) savedLeaderboard = JSON.parse(storedLeaderboard);

      savedLastSynced = localStorage.getItem('wc2026_lastsynced');

      const storedTimezone = localStorage.getItem('wc2026_timezone');
      if (storedTimezone) savedTimezone = storedTimezone;

      const storedSyncChanges = localStorage.getItem('wc2026_syncchanges');
      if (storedSyncChanges) {
        savedSyncChanges = JSON.parse(storedSyncChanges).filter((log: string) => {
          return !log.includes('(notstarted)') && !log.includes('0 - 0');
        });
      }
    } catch (e) {
      console.error('Error loading localStorage', e);
    }
  }

  const finalMatches = savedMatches.length > 0 ? savedMatches : initialMatches;
  
  const defaultLeaderboard: PredictionLeaderboardEntry[] = savedLeaderboard.length > 0 ? savedLeaderboard : [
    { username: 'Alex_Sports_Fan', points: 42, correctPredictions: 14, totalPredictions: 20 },
    { username: 'SoccerGuru99', points: 36, correctPredictions: 12, totalPredictions: 18 },
    { username: 'WorldCupPredictor', points: 33, correctPredictions: 11, totalPredictions: 22 },
    { username: 'GoalHunteR', points: 30, correctPredictions: 10, totalPredictions: 15 },
    { username: 'You (Local)', points: 0, correctPredictions: 0, totalPredictions: 0 },
  ];

  const calculateStandings = (matchesList: Match[]): GroupStandings => {
    const standings: GroupStandings = {};
    const teamsList = initialTeams;

    teamsList.forEach(t => {
      if (!standings[t.group]) standings[t.group] = [];
      if (!standings[t.group].some(row => row.teamId === t.id)) {
        standings[t.group].push({
          position: 1,
          teamId: t.id,
          teamName: t.name,
          teamFlag: t.flag,
          fifaCode: t.fifaCode,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        });
      }
    });

    const groupMatches = matchesList.filter(m => m.type === 'group');
    groupMatches.forEach(m => {
      if (!m.finished) return;
      
      const groupStandingsList = standings[m.group];
      if (!groupStandingsList) return;

      const homeRow = groupStandingsList.find(r => r.teamId === m.homeTeamId);
      const awayRow = groupStandingsList.find(r => r.teamId === m.awayTeamId);

      if (!homeRow || !awayRow) return;

      homeRow.played += 1;
      awayRow.played += 1;

      homeRow.goalsFor += m.homeScore;
      homeRow.goalsAgainst += m.awayScore;
      awayRow.goalsFor += m.awayScore;
      awayRow.goalsAgainst += m.homeScore;

      homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
      awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;

      if (m.homeScore > m.awayScore) {
        homeRow.wins += 1;
        homeRow.points += 3;
        awayRow.losses += 1;
      } else if (m.awayScore > m.homeScore) {
        awayRow.wins += 1;
        awayRow.points += 3;
        homeRow.losses += 1;
      } else {
        homeRow.draws += 1;
        homeRow.points += 1;
        awayRow.draws += 1;
        awayRow.points += 1;
      }
    });

    Object.keys(standings).forEach(groupLetter => {
      standings[groupLetter].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });
      standings[groupLetter].forEach((row, idx) => {
        row.position = idx + 1;
      });
    });

    return standings;
  };

  const getThirdPlaceRanking = (standings: GroupStandings): any[] => {
    const thirds: any[] = [];
    Object.keys(standings).forEach(groupLetter => {
      const thirdRow = standings[groupLetter].find(r => r.position === 3);
      if (thirdRow) {
        thirds.push({ ...thirdRow, group: groupLetter });
      }
    });

    thirds.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.group.localeCompare(b.group);
    });

    return thirds;
  };

  const propagateKnockouts = (matchesList: Match[]): Match[] => {
    const updated = [...matchesList];
    const standings = calculateStandings(updated);
    const thirds = getThirdPlaceRanking(standings);
    
    const qualifiedThirds = thirds.slice(0, 8);
    const qualifiedThirdsGroups = qualifiedThirds.map(t => t.group);

    const getWinnerOfGroup = (groupLetter: string): string => {
      const group = standings[groupLetter];
      return group && group[0] ? group[0].teamId : '0';
    };

    const getRunnerUpOfGroup = (groupLetter: string): string => {
      const group = standings[groupLetter];
      return group && group[1] ? group[1].teamId : '0';
    };

    const getBestThirdOfGroups = (groupsAllowed: string[]): string => {
      const matches = qualifiedThirds.filter(t => groupsAllowed.includes(t.group));
      return matches.length > 0 ? matches[0].teamId : '0';
    };

    const getWinnerOfMatch = (matchId: string): string => {
      const m = updated.find(x => x.id === matchId);
      if (!m || !m.finished) return '0';
      if (m.homeScore > m.awayScore) return m.homeTeamId;
      if (m.awayScore > m.homeScore) return m.awayTeamId;
      if (m.timeElapsed.includes('pen') || (m as any).shootoutWinner) {
        return (m as any).shootoutWinner === 'home' ? m.homeTeamId : m.awayTeamId;
      }
      return '0';
    };

    const getLoserOfMatch = (matchId: string): string => {
      const m = updated.find(x => x.id === matchId);
      if (!m || !m.finished) return '0';
      if (m.homeScore > m.awayScore) return m.awayTeamId;
      if (m.awayScore > m.homeScore) return m.homeTeamId;
      if (m.timeElapsed.includes('pen') || (m as any).shootoutWinner) {
        return (m as any).shootoutWinner === 'home' ? m.awayTeamId : m.homeTeamId;
      }
      return '0';
    };

    updated.forEach(m => {
      if (m.type === 'r32') {
        if (m.homeTeamLabel?.includes('Winner Group')) {
          const group = m.homeTeamLabel.replace('Winner Group ', '');
          m.homeTeamId = getWinnerOfGroup(group);
        } else if (m.homeTeamLabel?.includes('Runner-up Group')) {
          const group = m.homeTeamLabel.replace('Runner-up Group ', '');
          m.homeTeamId = getRunnerUpOfGroup(group);
        }
        
        if (m.awayTeamLabel?.includes('Runner-up Group')) {
          const group = m.awayTeamLabel.replace('Runner-up Group ', '');
          m.awayTeamId = getRunnerUpOfGroup(group);
        } else if (m.awayTeamLabel?.includes('3rd Group')) {
          const groups = m.awayTeamLabel.replace('3rd Group ', '').split('/');
          m.awayTeamId = getBestThirdOfGroups(groups);
        }
      }

      if (m.type === 'r16') {
        if (m.homeTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.homeTeamLabel.replace('Winner Match ', '');
          m.homeTeamId = getWinnerOfMatch(prevMatchId);
        }
        if (m.awayTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.awayTeamLabel.replace('Winner Match ', '');
          m.awayTeamId = getWinnerOfMatch(prevMatchId);
        }
      }

      if (m.type === 'qf') {
        if (m.homeTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.homeTeamLabel.replace('Winner Match ', '');
          m.homeTeamId = getWinnerOfMatch(prevMatchId);
        }
        if (m.awayTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.awayTeamLabel.replace('Winner Match ', '');
          m.awayTeamId = getWinnerOfMatch(prevMatchId);
        }
      }

      if (m.type === 'sf') {
        if (m.homeTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.homeTeamLabel.replace('Winner Match ', '');
          m.homeTeamId = getWinnerOfMatch(prevMatchId);
        }
        if (m.awayTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.awayTeamLabel.replace('Winner Match ', '');
          m.awayTeamId = getWinnerOfMatch(prevMatchId);
        }
      }

      if (m.type === 'third') {
        if (m.homeTeamLabel?.includes('Loser Match')) {
          const prevMatchId = m.homeTeamLabel.replace('Loser Match ', '');
          m.homeTeamId = getLoserOfMatch(prevMatchId);
        }
        if (m.awayTeamLabel?.includes('Loser Match')) {
          const prevMatchId = m.awayTeamLabel.replace('Loser Match ', '');
          m.awayTeamId = getLoserOfMatch(prevMatchId);
        }
      }

      if (m.type === 'final') {
        if (m.homeTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.homeTeamLabel.replace('Winner Match ', '');
          m.homeTeamId = getWinnerOfMatch(prevMatchId);
        }
        if (m.awayTeamLabel?.includes('Winner Match')) {
          const prevMatchId = m.awayTeamLabel.replace('Winner Match ', '');
          m.awayTeamId = getWinnerOfMatch(prevMatchId);
        }
      }
    });

    return updated;
  };

  return {
    matches: finalMatches,
    teams: initialTeams,
    stadiums: initialStadiums,
    predictions: savedPredictions,
    leaderboard: defaultLeaderboard,
    selectedGroup: 'Group A',
    liveSyncMode: savedLiveSync,
    lastSynced: savedLastSynced,
    timezone: savedTimezone,
    syncChanges: savedSyncChanges,
    globalPredictions: [],
    
    setSelectedGroup: (group: string) => set({ selectedGroup: group }),
    setTimezone: (tz: string) => {
      set({ timezone: tz });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_timezone', tz);
      }
    },

    syncWithFifa: async () => {
      set({ lastSynced: 'Syncing...' });
      
      try {
        const res = await fetch('/api/sync-fifa');
        const data = await res.json();

        if (data.success && data.matches && Array.isArray(data.matches)) {
          const state = get();
          const teamsList = state.teams;
          const stadiumsList = state.stadiums;
          const changes: string[] = [];

          const updatedMatches = state.matches.map(localMatch => {
            const officialMatch = data.matches.find((m: any) => String(m.id) === localMatch.id);
            if (!officialMatch) return localMatch;

            // 1. Cross-verify schedule fields
            const localMatchDate = localMatch.localDate;
            const officialMatchDate = officialMatch.local_date;
            const localStadiumId = localMatch.stadiumId;
            const officialStadiumId = officialMatch.stadium_id;
            
            let matchUpdated = false;
            let scheduleLogged = false;

            let updatedHomeTeamId = localMatch.homeTeamId;
            let updatedAwayTeamId = localMatch.awayTeamId;
            let updatedLocalDate = localMatch.localDate;
            let updatedPersianDate = localMatch.persianDate;
            let updatedStadiumId = localMatch.stadiumId;

            // Check teams TBD resolution or changes
            if (localMatch.homeTeamId !== officialMatch.home_team_id) {
              updatedHomeTeamId = officialMatch.home_team_id;
              matchUpdated = true;
            }
            if (localMatch.awayTeamId !== officialMatch.away_team_id) {
              updatedAwayTeamId = officialMatch.away_team_id;
              matchUpdated = true;
            }

            // Check date/time change
            if (localMatchDate !== officialMatchDate) {
              updatedLocalDate = officialMatchDate;
              updatedPersianDate = officialMatch.persian_date;
              matchUpdated = true;
              const homeName = teamsList.find(t => t.id === updatedHomeTeamId)?.name || localMatch.homeTeamLabel || 'TBD';
              const awayName = teamsList.find(t => t.id === updatedAwayTeamId)?.name || localMatch.awayTeamLabel || 'TBD';
              changes.push(`Match #${localMatch.id} (${homeName} vs ${awayName}): Kickoff rescheduled to ${officialMatchDate}`);
              scheduleLogged = true;
            }

            // Check stadium change
            if (localStadiumId !== officialStadiumId) {
              updatedStadiumId = officialStadiumId;
              matchUpdated = true;
              if (!scheduleLogged) {
                const homeName = teamsList.find(t => t.id === updatedHomeTeamId)?.name || localMatch.homeTeamLabel || 'TBD';
                const awayName = teamsList.find(t => t.id === updatedAwayTeamId)?.name || localMatch.awayTeamLabel || 'TBD';
                const venueName = stadiumsList.find(s => s.id === officialStadiumId)?.name || `Stadium #${officialStadiumId}`;
                changes.push(`Match #${localMatch.id} (${homeName} vs ${awayName}): Venue updated to ${venueName}`);
              }
            }

            // 2. Synchronize match status directly from the live API
            const homeScore = Number(officialMatch.home_score) || 0;
            const awayScore = Number(officialMatch.away_score) || 0;
            const finished = officialMatch.finished === 'TRUE' || officialMatch.finished === true;
            const timeElapsed = officialMatch.time_elapsed || 'notstarted';
            
            // Parse scorers from the API
            let homeScorers = parseOfficialScorers(officialMatch.home_scorers);
            let awayScorers = parseOfficialScorers(officialMatch.away_scorers);

            // Fallback to seeded random scorers if goals are scored but no scorers are provided by the API
            if (homeScore > 0 && (!homeScorers || homeScorers.length === 0)) {
              homeScorers = getSeededScorers(homeScore, localMatch.id, true);
            }
            if (awayScore > 0 && (!awayScorers || awayScorers.length === 0)) {
              awayScorers = getSeededScorers(awayScore, localMatch.id, false);
            }

            // Shootout winner determination for knockout matches
            const shootoutWinner = officialMatch.shootout_winner || officialMatch.shootoutWinner || 
              ((localMatch.type !== 'group' && homeScore === awayScore && finished) ? (Number(localMatch.id) % 2 === 0 ? 'home' : 'away') : undefined);

            const homeName = teamsList.find(t => t.id === updatedHomeTeamId)?.name || localMatch.homeTeamLabel || 'TBD';
            const awayName = teamsList.find(t => t.id === updatedAwayTeamId)?.name || localMatch.awayTeamLabel || 'TBD';

            // Log finished match (only if it was not already finished, and it was previously kicked off)
            if (finished && !localMatch.finished && localMatch.timeElapsed !== 'notstarted') {
              changes.push(`Match #${localMatch.id} Finished: ${homeName} ${homeScore} - ${awayScore} ${awayName}`);
            }
            // Log live kickoff
            else if (!finished && timeElapsed !== 'notstarted' && localMatch.timeElapsed === 'notstarted') {
              changes.push(`Match #${localMatch.id} Kicked Off! Live Score: ${homeName} ${homeScore} - ${awayScore} ${awayName} (${timeElapsed})`);
            }
            // Log goal event in real-time (only if the game is active/live and the score actually increased to avoid logging resets)
            else if (!finished && timeElapsed !== 'notstarted' && (homeScore > localMatch.homeScore || awayScore > localMatch.awayScore)) {
              changes.push(`Match #${localMatch.id} Goal! Current Score: ${homeName} ${homeScore} - ${awayScore} ${awayName} (${timeElapsed})`);
            }

            // Return updated match if anything changed
            if (
              matchUpdated ||
              localMatch.finished !== finished ||
              localMatch.homeScore !== homeScore ||
              localMatch.awayScore !== awayScore ||
              localMatch.timeElapsed !== timeElapsed ||
              String(localMatch.homeScorers) !== String(homeScorers) ||
              String(localMatch.awayScorers) !== String(awayScorers) ||
              (localMatch as any).shootoutWinner !== shootoutWinner
            ) {
              return {
                ...localMatch,
                homeTeamId: updatedHomeTeamId,
                awayTeamId: updatedAwayTeamId,
                localDate: updatedLocalDate,
                persianDate: updatedPersianDate,
                stadiumId: updatedStadiumId,
                finished,
                homeScore,
                awayScore,
                timeElapsed,
                homeScorers,
                awayScorers,
                shootoutWinner
              } as any;
            }

            return localMatch;
          });

          const fullyPropagated = propagateKnockouts(updatedMatches);
          const timeString = new Date().toLocaleTimeString();

          // Settle Predictions
          const currentUser = useAuthStore.getState().user;
          let updatedPredictions = [...state.predictions];
          let pointsAwardedTotal = 0;

          if (currentUser) {
            const unsettled = state.predictions.filter(p => !p.settled);
            
            for (const p of unsettled) {
              const m = fullyPropagated.find(x => x.id === p.matchId);
              if (m && m.finished) {
                const actualOutcome = m.homeScore > m.awayScore ? 'home' : m.awayScore > m.homeScore ? 'away' : 'draw';
                const isCorrect = p.predictedWinner === actualOutcome;
                
                let payout = 0;
                let finalPoolHome = 0;
                let finalPoolDraw = 0;
                let finalPoolAway = 0;
                let finalTotalPool = 0;

                if (p.betAmount) {
                  // Base seed pools
                  const seed = Number(p.matchId) || 1;
                  const basePool = 1000 + (seed % 5) * 500;
                  const r1 = 0.4 + (seed % 3) * 0.1;
                  const r2 = 0.2 + (seed % 2) * 0.05;
                  const r3 = 1.0 - r1 - r2;

                  finalPoolHome = Math.round(basePool * r1);
                  finalPoolDraw = Math.round(basePool * r2);
                  finalPoolAway = Math.round(basePool * r3);

                  if (isSupabaseConfigured && supabase) {
                    try {
                      const { data: allPreds, error: predsError } = await supabase
                        .from('predictions')
                        .select('predicted_winner, bet_amount')
                        .eq('match_id', p.matchId);

                      if (!predsError && allPreds) {
                        allPreds.forEach((x: any) => {
                          const amt = x.bet_amount || 0;
                          if (x.predicted_winner === 'home') finalPoolHome += amt;
                          else if (x.predicted_winner === 'draw') finalPoolDraw += amt;
                          else if (x.predicted_winner === 'away') finalPoolAway += amt;
                        });
                      }
                    } catch (e) {
                      console.error('Error fetching dynamic pools at settle', e);
                    }
                  } else {
                    finalPoolHome = p.poolHome || finalPoolHome;
                    finalPoolDraw = p.poolDraw || finalPoolDraw;
                    finalPoolAway = p.poolAway || finalPoolAway;
                  }

                  finalTotalPool = finalPoolHome + finalPoolDraw + finalPoolAway;

                  if (isCorrect) {
                    const poolWinner = p.predictedWinner === 'home' ? finalPoolHome : p.predictedWinner === 'draw' ? finalPoolDraw : finalPoolAway;
                    payout = Math.round((p.betAmount / poolWinner) * finalTotalPool);
                  }
                }

                const idx = updatedPredictions.findIndex(x => x.matchId === p.matchId);
                if (idx >= 0) {
                  updatedPredictions[idx] = {
                    ...updatedPredictions[idx],
                    settled: true,
                    outcome: isCorrect ? 'won' : 'lost',
                    payout,
                    poolHome: finalPoolHome,
                    poolDraw: finalPoolDraw,
                    poolAway: finalPoolAway,
                    totalPool: finalTotalPool,
                    acknowledged: true
                  };
                }

                pointsAwardedTotal += payout;

                // Sync to Supabase
                if (isSupabaseConfigured && supabase) {
                  try {
                    await supabase.from('predictions').update({
                      settled: true,
                      outcome: isCorrect ? 'won' : 'lost',
                      payout: payout,
                      pool_home: finalPoolHome,
                      pool_draw: finalPoolDraw,
                      pool_away: finalPoolAway,
                      total_pool: finalTotalPool,
                      acknowledged: true
                    }).eq('user_id', currentUser.id).eq('match_id', p.matchId);
                  } catch (e) {
                    console.error('Error settling prediction in Supabase', e);
                  }
                }
              }
            }

            if (pointsAwardedTotal > 0) {
              const newPoints = (currentUser.points || 0) + pointsAwardedTotal;
              useAuthStore.setState({
                user: { ...currentUser, points: newPoints }
              });

              if (isSupabaseConfigured && supabase) {
                try {
                  await supabase.from('profiles').update({
                    points: newPoints
                  }).eq('id', currentUser.id);
                } catch (e) {
                  console.error('Error updating user points balance in Supabase', e);
                }
              }
            }
          }

          // Recalculate User Leaderboard points dynamically
          let correctPredictions = 0;
          let totalPredictions = 0;
          let points = 0;

          updatedPredictions.forEach(p => {
            const m = fullyPropagated.find(x => x.id === p.matchId);
            if (m && m.finished) {
              totalPredictions++;
              const actualOutcome = m.homeScore > m.awayScore ? 'home' : m.awayScore > m.homeScore ? 'away' : 'draw';
              if (p.predictedWinner === actualOutcome) {
                correctPredictions++;
                points += p.payout !== undefined ? p.payout : 3;
              }
            }
          });

          // Update leaderboard
          const updatedLeaderboard = state.leaderboard.map(entry => {
            const isLocalUser = entry.username === 'You (Local)' || (currentUser && entry.username === currentUser.username);
            if (isLocalUser) {
              return {
                ...entry,
                points: points || entry.points,
                correctPredictions,
                totalPredictions
              };
            }
            return entry;
          });

          const finalChanges = changes.length > 0 ? changes : state.syncChanges;

          if (typeof window !== 'undefined') {
            localStorage.setItem('wc2026_matches', JSON.stringify(fullyPropagated));
            localStorage.setItem('wc2026_lastsynced', timeString);
            localStorage.setItem('wc2026_syncchanges', JSON.stringify(finalChanges));
            localStorage.setItem('wc2026_leaderboard', JSON.stringify(updatedLeaderboard));
            localStorage.setItem('wc2026_predictions', JSON.stringify(updatedPredictions));
          }

          set({ 
            matches: fullyPropagated, 
            lastSynced: timeString,
            syncChanges: finalChanges,
            leaderboard: updatedLeaderboard,
            predictions: updatedPredictions
          });
        } else {
          set({ lastSynced: 'Sync Failed' });
        }
      } catch (err) {
        console.error('Error syncing with FIFA', err);
        set({ lastSynced: 'Sync Error' });
      }
    },

    predictMatch: async (matchId: string, outcome: 'home' | 'away' | 'draw', betAmount: number) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const userBalance = user.points || 0;
      if (userBalance < betAmount) {
        throw new Error('Insufficient WC Coins balance.');
      }

      // Local helper to generate simulated pools deterministically
      const generateMatchPools = (mId: string, uBet: number, uChoice: 'home' | 'away' | 'draw') => {
        const seed = Number(mId) || 1;
        const basePool = 1000 + (seed % 5) * 500; // between 1000 and 3000
        const r1 = 0.4 + (seed % 3) * 0.1; // 0.4, 0.5, 0.6
        const r2 = 0.2 + (seed % 2) * 0.05; // 0.2, 0.25
        const r3 = 1.0 - r1 - r2;
        
        let poolHome = Math.round(basePool * r1);
        let poolDraw = Math.round(basePool * r2);
        let poolAway = Math.round(basePool * r3);
        
        if (uChoice === 'home') poolHome += uBet;
        else if (uChoice === 'draw') poolDraw += uBet;
        else poolAway += uBet;
        
        const totalPool = poolHome + poolDraw + poolAway;
        
        return { poolHome, poolDraw, poolAway, totalPool };
      };

      const { poolHome, poolDraw, poolAway, totalPool } = generateMatchPools(matchId, betAmount, outcome);

      const predictionData: Prediction = {
        matchId,
        predictedWinner: outcome,
        timestamp: Date.now(),
        betAmount,
        settled: false,
        poolHome,
        poolDraw,
        poolAway,
        totalPool,
        outcome: 'pending',
        payout: 0
      };

      // 1. Sync to Supabase if logged in
      if (isSupabaseConfigured && supabase) {
        try {
          // Upsert prediction
          const { error: predError } = await supabase.from('predictions').upsert({
            user_id: user.id,
            match_id: matchId,
            predicted_winner: outcome,
            bet_amount: betAmount,
            settled: false,
            pool_home: poolHome,
            pool_draw: poolDraw,
            pool_away: poolAway,
            total_pool: totalPool,
            outcome: 'pending',
            payout: 0,
            created_at: new Date().toISOString()
          });
          if (predError) throw predError;

          // Deduct points from user's profile
          const newPoints = userBalance - betAmount;
          const { error: profileError } = await supabase.from('profiles').update({
            points: newPoints
          }).eq('id', user.id);
          if (profileError) throw profileError;

           // Update authStore user points state
           useAuthStore.setState({
             user: { ...user, points: newPoints }
           });

           // Load all updated global predictions
           await get().loadGlobalPredictions();
         } catch (e) {
           console.error('Error syncing prediction to Supabase', e);
         }
      } else {
        // If Supabase not configured, deduct points locally
        const newPoints = userBalance - betAmount;
        useAuthStore.setState({
          user: { ...user, points: newPoints }
        });
      }

      // 2. Update local state
      set(state => {
        const existingIdx = state.predictions.findIndex(p => p.matchId === matchId);
        let updatedPredictions = [...state.predictions];

        if (existingIdx >= 0) {
          updatedPredictions[existingIdx] = predictionData;
        } else {
          updatedPredictions.push(predictionData);
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_predictions', JSON.stringify(updatedPredictions));
        }

        return { predictions: updatedPredictions };
      });
    },

    getStandings: () => {
      return calculateStandings(get().matches);
    },

    getThirdPlaceTeams: () => {
      const standings = calculateStandings(get().matches);
      return getThirdPlaceRanking(standings);
    },

    fetchLeaderboard: async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, points, correct_predictions, total_predictions')
          .order('points', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data) {
          const mappedList: PredictionLeaderboardEntry[] = data.map(d => ({
            username: d.username,
            points: d.points || 0,
            correctPredictions: d.correct_predictions || 0,
            totalPredictions: d.total_predictions || 0
          }));
          
          set({ leaderboard: mappedList });
          if (typeof window !== 'undefined') {
            localStorage.setItem('wc2026_leaderboard', JSON.stringify(mappedList));
          }
        }
      } catch (err) {
        console.error('Error fetching global leaderboard', err);
      }
    },

    loadUserPredictions: async () => {
      const user = useAuthStore.getState().user;
      if (!isSupabaseConfigured || !supabase || !user) return;
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('match_id, predicted_winner, created_at, bet_amount, settled, pool_home, pool_draw, pool_away, total_pool, outcome, payout, acknowledged')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const list: Prediction[] = data.map((d: any) => ({
            matchId: d.match_id,
            predictedWinner: d.predicted_winner,
            timestamp: new Date(d.created_at).getTime(),
            betAmount: d.bet_amount || 0,
            settled: d.settled || false,
            poolHome: d.pool_home || 0,
            poolDraw: d.pool_draw || 0,
            poolAway: d.pool_away || 0,
            totalPool: d.total_pool || 0,
            outcome: d.outcome || 'pending',
            payout: d.payout || 0,
            acknowledged: d.acknowledged || false
          }));
          set({ predictions: list });
          if (typeof window !== 'undefined') {
            localStorage.setItem('wc2026_predictions', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.error('Error loading user predictions', err);
      }
    },

    loadGlobalPredictions: async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('match_id, predicted_winner, bet_amount');
        if (error) throw error;
        if (data) {
          const list = data.map((d: any) => ({
            matchId: d.match_id,
            predictedWinner: d.predicted_winner,
            betAmount: d.bet_amount || 0
          }));
          set({ globalPredictions: list });
        }
      } catch (err) {
        console.error('Error loading global predictions', err);
      }
    },

    acknowledgePredictions: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return;
      
      const unacknowledged = get().predictions.filter(p => p.settled && !p.acknowledged);
      if (unacknowledged.length === 0) return;

      const updatedList = get().predictions.map(p => {
        if (p.settled && !p.acknowledged) {
          return { ...p, acknowledged: true };
        }
        return p;
      });
      set({ predictions: updatedList });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_predictions', JSON.stringify(updatedList));
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const matchIds = unacknowledged.map(p => p.matchId);
          const { error } = await supabase
            .from('predictions')
            .update({ acknowledged: true })
            .eq('user_id', user.id)
            .in('match_id', matchIds);
          if (error) throw error;
        } catch (e) {
          console.error('Error acknowledging predictions in Supabase', e);
        }
      }
    }
  };
});
