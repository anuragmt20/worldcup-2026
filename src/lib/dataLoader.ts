import { Team, Stadium, Match } from '../types';
import footballTeams from '../data/football.teams.json';
import footballStadiums from '../data/football.stadiums.json';
import footballMatches from '../data/football.matches.json';

// Get clean and typed teams from JSON source
export const getTeams = (): Team[] => {
  return footballTeams.map((t: any) => ({
    id: t.id,
    name: t.name_en,
    nameEn: t.name_en,
    nameFa: t.name_fa,
    flag: t.flag || `https://flagcdn.com/w80/${t.iso2.toLowerCase()}.png`,
    fifaCode: t.fifa_code,
    iso2: t.iso2,
    group: t.groups,
  }));
};

// Get clean and typed stadiums from JSON source
export const getStadiums = (): Stadium[] => {
  return footballStadiums.map((s: any) => ({
    id: s.id,
    name: s.name_en,
    nameEn: s.name_en,
    nameFa: s.name_fa,
    fifaName: s.fifa_name,
    city: s.city_en,
    cityEn: s.city_en,
    cityFa: s.city_fa,
    country: s.country_en,
    countryEn: s.country_en,
    countryFa: s.country_fa,
    capacity: Number(s.capacity) || 0,
    region: s.region,
  }));
};

// Get clean and typed matches from JSON source
export const getMatches = (): Match[] => {
  return footballMatches.map((m: any) => {
    let homeScorers: string[] | null = null;
    let awayScorers: string[] | null = null;
    
    if (m.home_scorers && m.home_scorers !== 'null' && m.home_scorers !== 'None') {
      homeScorers = Array.isArray(m.home_scorers) ? m.home_scorers : [m.home_scorers];
    }
    if (m.away_scorers && m.away_scorers !== 'null' && m.away_scorers !== 'None') {
      awayScorers = Array.isArray(m.away_scorers) ? m.away_scorers : [m.away_scorers];
    }

    return {
      id: m.id,
      homeTeamId: m.home_team_id,
      awayTeamId: m.away_team_id,
      homeScore: Number(m.home_score) || 0,
      awayScore: Number(m.away_score) || 0,
      homeScorers,
      awayScorers,
      group: m.group,
      matchday: m.matchday,
      localDate: m.local_date,
      persianDate: m.persian_date,
      stadiumId: m.stadium_id,
      finished: m.finished === 'TRUE' || m.finished === true,
      timeElapsed: m.time_elapsed,
      type: m.type as any,
      homeTeamLabel: m.home_team_label,
      awayTeamLabel: m.away_team_label,
    };
  });
};
