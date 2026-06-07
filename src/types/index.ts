export interface Team {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  flag: string;
  fifaCode: string;
  iso2: string;
  group: string;
}

export interface Stadium {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  fifaName: string;
  city: string;
  cityEn: string;
  cityFa: string;
  country: string;
  countryEn: string;
  countryFa: string;
  capacity: number;
  region: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homeScorers: string[] | null;
  awayScorers: string[] | null;
  group: string;
  matchday: string;
  localDate: string;
  persianDate: string;
  stadiumId: string;
  finished: boolean;
  timeElapsed: string; // "notstarted", "ft", "ht", "90", etc.
  type: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
  homeTeamLabel?: string;
  awayTeamLabel?: string;
}

export interface GroupStandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamFlag: string;
  fifaCode: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStandings {
  [groupLetter: string]: GroupStandingRow[];
}

export interface Prediction {
  matchId: string;
  predictedWinner: 'home' | 'away' | 'draw';
  timestamp: number;
}

export interface PredictionLeaderboardEntry {
  username: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
}
