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
  timezone: string;
  setSelectedGroup: (group: string) => void;
  toggleLiveSync: () => Promise<void>;
  syncWithFifa: () => Promise<void>;
  simulateMatch: (matchId: string, homeScore: number, awayScore: number, homePenalties?: number, awayPenalties?: number) => void;
  manualPlayMatch: (matchId: string, homeScore: number, awayScore: number) => void;
  simulateGroupStage: () => void;
  simulateKnockouts: () => void;
  simulateEntireTournament: () => void;
  resetTournament: () => void;
  predictMatch: (matchId: string, outcome: 'home' | 'away' | 'draw') => Promise<void>;
  getStandings: () => GroupStandings;
  getThirdPlaceTeams: () => any[];
  fetchLeaderboard: () => Promise<void>;
  loadUserPredictions: () => Promise<void>;
  setTimezone: (tz: string) => void;
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

export const useTournamentStore = create<TournamentState>((set, get) => {
  const initialTeams = getTeams();
  const initialStadiums = getStadiums();
  const initialMatches = getMatches();

  let savedMatches: Match[] = [];
  let savedPredictions: Prediction[] = [];
  let savedLeaderboard: PredictionLeaderboardEntry[] = [];
  let savedLiveSync = false;
  let savedLastSynced: string | null = null;
  let savedTimezone = 'Local';

  if (typeof window !== 'undefined') {
    try {
      const storedMatches = localStorage.getItem('wc2026_matches');
      if (storedMatches) savedMatches = JSON.parse(storedMatches);

      const storedPredictions = localStorage.getItem('wc2026_predictions');
      if (storedPredictions) savedPredictions = JSON.parse(storedPredictions);

      const storedLeaderboard = localStorage.getItem('wc2026_leaderboard');
      if (storedLeaderboard) savedLeaderboard = JSON.parse(storedLeaderboard);
      
      const storedLiveSync = localStorage.getItem('wc2026_livesync');
      if (storedLiveSync) savedLiveSync = JSON.parse(storedLiveSync);

      savedLastSynced = localStorage.getItem('wc2026_lastsynced');

      const storedTimezone = localStorage.getItem('wc2026_timezone');
      if (storedTimezone) savedTimezone = storedTimezone;
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
    
    setSelectedGroup: (group: string) => set({ selectedGroup: group }),
    setTimezone: (tz: string) => {
      set({ timezone: tz });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_timezone', tz);
      }
    },
    
    toggleLiveSync: async () => {
      const currentMode = get().liveSyncMode;
      const nextMode = !currentMode;
      
      set({ liveSyncMode: nextMode });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_livesync', JSON.stringify(nextMode));
      }

      if (nextMode) {
        await get().syncWithFifa();
      } else {
        get().resetTournament();
      }
    },

    syncWithFifa: async () => {
      set({ lastSynced: 'Syncing...' });
      
      try {
        const res = await fetch('/api/sync-fifa');
        const data = await res.json();

        if (data.success) {
          set(state => {
            let updatedMatches = [...state.matches];

            if (data.autoSyncByDate) {
              // Time-based calendar sync fallback:
              // Mark any match in the past as played with seeded scores
              const now = new Date();
              
              updatedMatches = state.matches.map(m => {
                const matchDate = new Date(m.localDate);
                // If match date is in the past
                if (matchDate.getTime() < now.getTime()) {
                  const h = getSeededScore(m.id, true);
                  const a = getSeededScore(m.id, false);
                  const isDraw = h === a;
                  const isKnockout = m.type !== 'group';
                  
                  let timeElapsed = 'ft';
                  let shootoutWinner: 'home' | 'away' | undefined = undefined;

                  if (isKnockout && isDraw) {
                    shootoutWinner = Number(m.id) % 2 === 0 ? 'home' : 'away';
                    timeElapsed = `ft (pen. 5-4)`;
                  }

                  return {
                    ...m,
                    homeScore: h,
                    awayScore: a,
                    homeScorers: generateScorers(h),
                    awayScorers: generateScorers(a),
                    finished: true,
                    timeElapsed,
                    shootoutWinner
                  };
                }
                return m;
              });
            } else if (data.matches && Array.isArray(data.matches)) {
              // If we received an explicit list of official results, merge them!
              data.matches.forEach((liveMatch: any) => {
                const matchIdx = updatedMatches.findIndex(m => m.id === String(liveMatch.id));
                if (matchIdx >= 0) {
                  updatedMatches[matchIdx] = {
                    ...updatedMatches[matchIdx],
                    homeScore: Number(liveMatch.homeScore),
                    awayScore: Number(liveMatch.awayScore),
                    finished: liveMatch.finished,
                    timeElapsed: liveMatch.timeElapsed || 'ft',
                    homeScorers: liveMatch.homeScorers || null,
                    awayScorers: liveMatch.awayScorers || null,
                  };
                }
              });
            }

            const fullyPropagated = propagateKnockouts(updatedMatches);
            const timeString = new Date().toLocaleTimeString();

            if (typeof window !== 'undefined') {
              localStorage.setItem('wc2026_matches', JSON.stringify(fullyPropagated));
              localStorage.setItem('wc2026_lastsynced', timeString);
            }

            return { 
              matches: fullyPropagated, 
              lastSynced: timeString 
            };
          });
        } else {
          set({ lastSynced: 'Sync Failed' });
        }
      } catch (err) {
        console.error('Error syncing with FIFA', err);
        set({ lastSynced: 'Sync Error' });
      }
    },

    simulateMatch: (matchId: string, homeScore: number, awayScore: number, homePenalties?: number, awayPenalties?: number) => {
      set(state => {
        const updatedMatches = state.matches.map(m => {
          if (m.id === matchId) {
            const isDraw = homeScore === awayScore;
            const isKnockout = m.type !== 'group';
            
            let timeElapsed = 'ft';
            let shootoutWinner: 'home' | 'away' | undefined = undefined;

            if (isKnockout && isDraw) {
              if (homePenalties !== undefined && awayPenalties !== undefined) {
                shootoutWinner = homePenalties > awayPenalties ? 'home' : 'away';
                timeElapsed = `ft (pen. ${homePenalties}-${awayPenalties})`;
              } else {
                const homePens = 4 + Math.floor(Math.random() * 2);
                const awayPens = homePens + (Math.random() > 0.5 ? 1 : -1);
                const finalHomePens = Math.max(0, homePens);
                const finalAwayPens = Math.max(0, awayPens === homePens ? awayPens + 1 : awayPens);
                shootoutWinner = finalHomePens > finalAwayPens ? 'home' : 'away';
                timeElapsed = `ft (pen. ${finalHomePens}-${finalAwayPens})`;
              }
            }

            return {
              ...m,
              homeScore,
              awayScore,
              homeScorers: generateScorers(homeScore),
              awayScorers: generateScorers(awayScore),
              finished: true,
              timeElapsed,
              shootoutWinner,
              homePenalties,
              awayPenalties
            } as any;
          }
          return m;
        });

        const fullyPropagated = propagateKnockouts(updatedMatches);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_matches', JSON.stringify(fullyPropagated));
        }

        // Handle points tracking if prediction exists
        const userPrediction = state.predictions.find(p => p.matchId === matchId);
        let updatedLeaderboard = [...state.leaderboard];
        if (userPrediction) {
          const actualOutcome = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';
          const isCorrect = userPrediction.predictedWinner === actualOutcome;
          
          updatedLeaderboard = state.leaderboard.map(entry => {
            const currentUser = useAuthStore.getState().user;
            const isCurrentUser = entry.username === 'You (Local)' || (currentUser && entry.username === currentUser.username);
            
            if (isCurrentUser) {
              return {
                ...entry,
                totalPredictions: entry.totalPredictions + 1,
                correctPredictions: entry.correctPredictions + (isCorrect ? 1 : 0),
                points: entry.points + (isCorrect ? 3 : 0)
              };
            }
            return {
              ...entry,
              points: entry.points + (Math.random() > 0.75 ? 3 : 0)
            };
          });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('wc2026_leaderboard', JSON.stringify(updatedLeaderboard));
          }
        }

        return { matches: fullyPropagated, leaderboard: updatedLeaderboard };
      });
    },

    manualPlayMatch: (matchId: string, homeScore: number, awayScore: number) => {
      get().simulateMatch(matchId, homeScore, awayScore);
    },

    simulateGroupStage: () => {
      set(state => {
        const groupMatches = state.matches.map(m => {
          if (m.type === 'group' && !m.finished) {
            const h = generateRealisticScore();
            const a = generateRealisticScore();
            return {
              ...m,
              homeScore: h,
              awayScore: a,
              homeScorers: generateScorers(h),
              awayScorers: generateScorers(a),
              finished: true,
              timeElapsed: 'ft'
            };
          }
          return m;
        });

        const fullyPropagated = propagateKnockouts(groupMatches);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_matches', JSON.stringify(fullyPropagated));
        }

        return { matches: fullyPropagated };
      });
    },

    simulateKnockouts: () => {
      set(state => {
        let updated = [...state.matches];
        const rounds: Array<'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'> = ['r32', 'r16', 'qf', 'sf', 'third', 'final'];

        rounds.forEach(round => {
          updated = propagateKnockouts(updated);
          
          updated = updated.map(m => {
            if (m.type === round && !m.finished && m.homeTeamId !== '0' && m.awayTeamId !== '0') {
              const h = generateRealisticScore();
              const a = generateRealisticScore();
              const isDraw = h === a;
              
              let timeElapsed = 'ft';
              let shootoutWinner: 'home' | 'away' | undefined = undefined;

              if (isDraw) {
                shootoutWinner = Math.random() > 0.5 ? 'home' : 'away';
                const homePens = 4 + Math.floor(Math.random() * 2);
                const awayPens = shootoutWinner === 'home' ? homePens - 1 : homePens + 1;
                timeElapsed = `ft (pen. ${homePens}-${awayPens})`;
              }

              return {
                ...m,
                homeScore: h,
                awayScore: a,
                homeScorers: generateScorers(h),
                awayScorers: generateScorers(a),
                finished: true,
                timeElapsed,
                shootoutWinner
              } as any;
            }
            return m;
          });
        });

        const fullyPropagated = propagateKnockouts(updated);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_matches', JSON.stringify(fullyPropagated));
        }

        return { matches: fullyPropagated };
      });
    },

    simulateEntireTournament: () => {
      get().simulateGroupStage();
      get().simulateKnockouts();
    },

    resetTournament: () => {
      set(state => {
        const resetMatches = initialMatches.map(m => ({
          ...m,
          homeScore: 0,
          awayScore: 0,
          homeScorers: null,
          awayScorers: null,
          finished: false,
          timeElapsed: 'notstarted',
          homeTeamId: m.type === 'group' ? m.homeTeamId : '0',
          awayTeamId: m.type === 'group' ? m.awayTeamId : '0'
        }));

        if (typeof window !== 'undefined') {
          localStorage.removeItem('wc2026_matches');
          localStorage.removeItem('wc2026_predictions');
          
          const localUser = useAuthStore.getState().user;
          const resetLeaderboard = defaultLeaderboard.map(e => {
            const isLocalUser = e.username === 'You (Local)' || (localUser && e.username === localUser.username);
            if (isLocalUser) {
              return { ...e, points: 0, correctPredictions: 0, totalPredictions: 0 };
            }
            return e;
          });
          localStorage.setItem('wc2026_leaderboard', JSON.stringify(resetLeaderboard));
        }

        return {
          matches: resetMatches,
          predictions: [],
          leaderboard: defaultLeaderboard.map(e => e.username === 'You (Local)' ? { ...e, points: 0, correctPredictions: 0, totalPredictions: 0 } : e)
        };
      });
    },

    predictMatch: async (matchId: string, outcome: 'home' | 'away' | 'draw') => {
      const user = useAuthStore.getState().user;

      // 1. Sync to Supabase if logged in
      if (isSupabaseConfigured && supabase && user) {
        try {
          await supabase.from('predictions').upsert({
            user_id: user.id,
            match_id: matchId,
            predicted_winner: outcome,
            created_at: new Date().toISOString()
          });

          // Fetch updated profile stats if database trigger updates points
          // To keep it simple, we also update points locally
        } catch (e) {
          console.error('Error syncing prediction to Supabase', e);
        }
      }

      // 2. Update local state
      set(state => {
        const existingIdx = state.predictions.findIndex(p => p.matchId === matchId);
        let updatedPredictions = [...state.predictions];

        if (existingIdx >= 0) {
          updatedPredictions[existingIdx] = {
            matchId,
            predictedWinner: outcome,
            timestamp: Date.now()
          };
        } else {
          updatedPredictions.push({
            matchId,
            predictedWinner: outcome,
            timestamp: Date.now()
          });
        }

        // Recalculate leaderboard
        const match = state.matches.find(m => m.id === matchId);
        let updatedLeaderboard = [...state.leaderboard];

        if (match && match.finished) {
          const actualOutcome = match.homeScore > match.awayScore ? 'home' : match.awayScore > match.homeScore ? 'away' : 'draw';
          const isCorrect = outcome === actualOutcome;

          updatedLeaderboard = state.leaderboard.map(entry => {
            const isLocalUser = entry.username === 'You (Local)' || (user && entry.username === user.username);
            if (isLocalUser) {
              return {
                ...entry,
                totalPredictions: entry.totalPredictions + 1,
                correctPredictions: entry.correctPredictions + (isCorrect ? 1 : 0),
                points: entry.points + (isCorrect ? 3 : 0)
              };
            }
            return entry;
          });
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_predictions', JSON.stringify(updatedPredictions));
          localStorage.setItem('wc2026_leaderboard', JSON.stringify(updatedLeaderboard));
        }

        return { predictions: updatedPredictions, leaderboard: updatedLeaderboard };
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
          .select('match_id, predicted_winner, created_at')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const list: Prediction[] = data.map((d: any) => ({
            matchId: d.match_id,
            predictedWinner: d.predicted_winner,
            timestamp: new Date(d.created_at).getTime()
          }));
          set({ predictions: list });
          if (typeof window !== 'undefined') {
            localStorage.setItem('wc2026_predictions', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.error('Error loading user predictions', err);
      }
    }
  };
});
