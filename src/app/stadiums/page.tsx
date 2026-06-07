'use client';

import React, { useState } from 'react';
import { MapPin, Users, Calendar, Flag, Compass, ChevronRight } from 'lucide-react';
import { useTournamentStore } from '@/lib/store';
import { Stadium } from '@/types';

export default function StadiumsPage() {
  const { stadiums, matches, teams } = useTournamentStore();
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>('1');

  const selectedStadium = stadiums.find(s => s.id === selectedStadiumId) || stadiums[0];

  const getTeam = (id: string) => teams.find(t => t.id === id);

  // Filter matches played at the selected stadium
  const stadiumMatches = matches.filter(m => m.stadiumId === selectedStadium.id);

  // Stylized relative coordinates for North America SVG Map
  // Map dimensions are 500x350
  const mapCoordinates: { [id: string]: { x: number; y: number; name: string } } = {
    '1': { x: 230, y: 310, name: 'Mexico City' },
    '2': { x: 190, y: 290, name: 'Guadalajara' },
    '3': { x: 220, y: 270, name: 'Monterrey' },
    '4': { x: 260, y: 220, name: 'Dallas' },
    '5': { x: 270, y: 240, name: 'Houston' },
    '6': { x: 265, y: 175, name: 'Kansas City' },
    '7': { x: 340, y: 205, name: 'Atlanta' },
    '8': { x: 380, y: 265, name: 'Miami' },
    '9': { x: 410, y: 120, name: 'Boston' },
    '10': { x: 395, y: 140, name: 'Philadelphia' },
    '11': { x: 400, y: 130, name: 'New York/New Jersey' },
    '12': { x: 375, y: 120, name: 'Toronto' },
    '13': { x: 130, y: 70, name: 'Vancouver' },
    '14': { x: 140, y: 90, name: 'Seattle' },
    '15': { x: 110, y: 160, name: 'San Francisco' },
    '16': { x: 135, y: 190, name: 'Los Angeles' },
  };

  const getCountryBadgeColor = (country: string) => {
    if (country.toLowerCase() === 'united states') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (country.toLowerCase() === 'mexico') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20'; // Canada
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Stadium Venues & Map</h1>
        <p className="text-sm text-slate-400 mt-1">Discover the 16 official host stadiums across Canada, Mexico, and the USA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Map & Details */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Interactive SVG Map Card */}
          <div className="rounded-xl glass-panel p-6 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-emerald-400" /> Host Cities Map
            </h3>

            {/* Stylized North America host cities SVG Map */}
            <div className="relative aspect-[500/350] w-full rounded-lg bg-slate-950/40 border border-slate-900 overflow-hidden">
              <svg 
                viewBox="0 0 500 350" 
                className="w-full h-full text-slate-800"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Stylized background lines / mesh */}
                <path d="M 0,0 L 500,350 M 0,350 L 500,0 M 250,0 L 250,350 M 0,175 L 500,175" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                
                {/* Stylized borders outline mockup */}
                {/* Canada/USA boundary */}
                <path d="M 120,80 L 370,80 M 370,80 L 370,120 L 420,120" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                {/* USA/Mexico boundary */}
                <path d="M 150,220 L 250,250 L 270,255" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

                {/* City Coordinates Markers */}
                {Object.keys(mapCoordinates).map((stadiumId) => {
                  const coord = mapCoordinates[stadiumId];
                  const isSelected = selectedStadiumId === stadiumId;
                  const stadiumInfo = stadiums.find(s => s.id === stadiumId);

                  let markerColor = 'fill-slate-600 hover:fill-slate-400';
                  if (isSelected) {
                    markerColor = 'fill-emerald-400 filter drop-shadow-[0_0_8px_#00FF87]';
                  } else if (stadiumInfo?.countryEn.toLowerCase() === 'united states') {
                    markerColor = 'fill-blue-500/80 hover:fill-blue-400';
                  } else if (stadiumInfo?.countryEn.toLowerCase() === 'mexico') {
                    markerColor = 'fill-emerald-600/80 hover:fill-emerald-400';
                  } else {
                    markerColor = 'fill-red-500/80 hover:fill-red-400';
                  }

                  return (
                    <g 
                      key={stadiumId} 
                      className="cursor-pointer"
                      onClick={() => setSelectedStadiumId(stadiumId)}
                    >
                      {/* Pulse effect for selected city */}
                      {isSelected && (
                        <circle 
                          cx={coord.x} 
                          cy={coord.y} 
                          r="12" 
                          className="fill-emerald-400/20 animate-ping"
                        />
                      )}
                      
                      {/* Main Coordinate Dot */}
                      <circle 
                        cx={coord.x} 
                        cy={coord.y} 
                        r={isSelected ? '6' : '4.5'} 
                        className={`transition-all duration-200 ${markerColor}`}
                      />

                      {/* City Name Text Label */}
                      <text 
                        x={coord.x} 
                        y={coord.y - 9} 
                        textAnchor="middle" 
                        className={`text-[8px] font-black uppercase tracking-wider select-none ${isSelected ? 'fill-emerald-400' : 'fill-slate-500'}`}
                      >
                        {coord.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Selected Stadium Details */}
          <div className="rounded-xl glass-panel p-6 space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">VENUE PROFILE</div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide">{selectedStadium.name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{selectedStadium.city}, {selectedStadium.countryEn}</span>
                </div>
              </div>

              <div className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider shrink-0 ${getCountryBadgeColor(selectedStadium.countryEn)}`}>
                {selectedStadium.countryEn}
              </div>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tournament Capacity</span>
                <div className="text-lg font-black text-slate-200 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-400" />
                  {selectedStadium.capacity.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Regional Division</span>
                <div className="text-lg font-black text-slate-200 flex items-center gap-1.5">
                  <Flag className="h-4 w-4 text-emerald-400" />
                  {selectedStadium.region}
                </div>
              </div>
            </div>

            {/* Stadium Hosted matches */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Hosted Matches ({stadiumMatches.length})
              </h3>
              
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                {stadiumMatches.map(match => {
                  const homeTeam = getTeam(match.homeTeamId);
                  const awayTeam = getTeam(match.awayTeamId);

                  return (
                    <div key={match.id} className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/40 border border-slate-900/60 text-xs">
                      <div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Match #{match.id} &bull; Group {match.group}</div>
                        <div className="font-bold text-slate-200 mt-1 flex items-center gap-1.5 uppercase">
                          {homeTeam ? (
                            <>
                              <img src={homeTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                              <span>{homeTeam.fifaCode}</span>
                            </>
                          ) : <span className="italic">{match.homeTeamLabel || 'TBD'}</span>}
                          <span className="text-slate-500">VS</span>
                          {awayTeam ? (
                            <>
                              <img src={awayTeam.flag} alt="" className="h-3 w-4.5 object-cover rounded shadow-sm" />
                              <span>{awayTeam.fifaCode}</span>
                            </>
                          ) : <span className="italic">{match.awayTeamLabel || 'TBD'}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-bold text-slate-400">
                        {match.finished ? (
                          <span className="text-emerald-400 font-extrabold">{match.homeScore} - {match.awayScore}</span>
                        ) : (
                          <span>{match.localDate.split(' ')[0]}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Venue Catalog List */}
        <div className="lg:col-span-5 space-y-4 max-h-[580px] overflow-y-auto pr-2">
          {stadiums.map((stadium) => {
            const isSelected = selectedStadiumId === stadium.id;
            const stadiumMatchesCount = matches.filter(m => m.stadiumId === stadium.id).length;

            return (
              <div
                key={stadium.id}
                onClick={() => setSelectedStadiumId(stadium.id)}
                className={`
                  flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border
                  ${isSelected
                    ? 'bg-slate-900/60 border-emerald-500 shadow-md shadow-emerald-500/5'
                    : 'glass-panel border-slate-900/60 hover:border-slate-800'
                  }
                `}
              >
                {/* Thumbnail */}
                <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-slate-950 border border-slate-900 shrink-0">
                  <img src="/images/stadium_placeholder.png" alt="" className="h-full w-full object-cover opacity-70" />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {stadium.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{stadium.city}, {stadium.countryEn}</span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Capacity: {stadium.capacity.toLocaleString()} &bull; {stadiumMatchesCount} matches
                  </div>
                </div>

                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
