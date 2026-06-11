import { Match, Stadium } from '../types';

export function getMatchDateObject(match: Match, stadiums: Stadium[]): Date {
  const stadium = stadiums.find(s => s.id === match.stadiumId);
  const region = stadium ? stadium.region : 'Eastern';
  
  // parse "06/11/2026 13:00" -> month=06, day=11, year=2026, hour=13, min=00
  const [datePart, timePart] = match.localDate.split(' ');
  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');
  
  let offset = '-04:00'; // Eastern (EDT) default
  if (region === 'Central') offset = '-05:00';
  else if (region === 'Western') offset = '-07:00';
  
  // construct ISO string
  const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00${offset}`;
  return new Date(isoStr);
}

export const COUNTRY_TIMEZONES: { [key: string]: { zone: string; label: string } } = {
  'India': { zone: 'Asia/Kolkata', label: 'IST' },
  'United States': { zone: 'America/New_York', label: 'EDT' },
  'Brazil': { zone: 'America/Sao_Paulo', label: 'BRT' },
  'United Kingdom': { zone: 'Europe/London', label: 'BST' },
  'Germany': { zone: 'Europe/Berlin', label: 'CEST' },
  'South Africa': { zone: 'Africa/Johannesburg', label: 'SAST' },
  'United Arab Emirates': { zone: 'Asia/Dubai', label: 'GST' },
  'Indonesia': { zone: 'Asia/Jakarta', label: 'WIB' },
  'China': { zone: 'Asia/Shanghai', label: 'CST' },
  'Japan': { zone: 'Asia/Tokyo', label: 'JST' },
  'Australia': { zone: 'Australia/Sydney', label: 'AEST' },
  'New Zealand': { zone: 'Pacific/Auckland', label: 'NZST' },
  // Legacy / shorthand fallbacks
  'IST': { zone: 'Asia/Kolkata', label: 'IST' },
  'EDT': { zone: 'America/New_York', label: 'EDT' },
  'CDT': { zone: 'America/Chicago', label: 'CDT' },
  'PDT': { zone: 'America/Los_Angeles', label: 'PDT' },
  'UTC': { zone: 'UTC', label: 'UTC' },
  'BST': { zone: 'Europe/London', label: 'BST' },
};

export function formatMatchDateTime(match: Match, timezone: string, stadiums: Stadium[]) {
  const dateObj = getMatchDateObject(match, stadiums);
  
  let timeZoneId = 'Asia/Kolkata'; // Default to India
  let fallbackLabel = 'IST';
  
  const mapping = COUNTRY_TIMEZONES[timezone];
  if (mapping) {
    timeZoneId = mapping.zone;
    fallbackLabel = mapping.label;
  } else if (timezone === 'Local') {
    try {
      timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      fallbackLabel = 'Local';
    } catch (e) {
      timeZoneId = 'Asia/Kolkata';
      fallbackLabel = 'IST';
    }
  }
  
  let label = fallbackLabel;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      timeZoneName: 'short'
    }).formatToParts(dateObj);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (tzPart) {
      label = tzPart.value;
    }
  } catch (e) {
    console.error('Error resolving dynamic timezone name', e);
  }
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZoneId
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timeZoneId
  });
  
  return {
    time: timeFormatter.format(dateObj),
    date: dateFormatter.format(dateObj).toUpperCase()
  };
}
