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

export function formatMatchDateTime(match: Match, timezone: string, stadiums: Stadium[]) {
  const dateObj = getMatchDateObject(match, stadiums);
  
  let timeZoneId: string | undefined = undefined;
  let label = '';
  
  switch (timezone) {
    case 'EDT':
      timeZoneId = 'America/New_York';
      label = 'EDT';
      break;
    case 'CDT':
      timeZoneId = 'America/Chicago';
      label = 'CDT';
      break;
    case 'PDT':
      timeZoneId = 'America/Los_Angeles';
      label = 'PDT';
      break;
    case 'UTC':
      timeZoneId = 'UTC';
      label = 'UTC';
      break;
    case 'BST':
      timeZoneId = 'Europe/London';
      label = 'BST';
      break;
    case 'IST':
      timeZoneId = 'Asia/Kolkata';
      label = 'IST';
      break;
    case 'Local':
    default:
      // Browser local timezone
      try {
        timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: timeZoneId,
          timeZoneName: 'short'
        }).formatToParts(dateObj);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        label = tzPart ? tzPart.value : 'Local';
      } catch (e) {
        timeZoneId = undefined;
        label = 'Local';
      }
      break;
  }
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZoneId
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timeZoneId
  });
  
  return {
    time: `${timeFormatter.format(dateObj)} ${label}`,
    date: dateFormatter.format(dateObj).toUpperCase()
  };
}
