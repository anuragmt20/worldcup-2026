'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight, ChevronLeft, Users } from 'lucide-react';
import { useTournamentStore } from '../lib/store';

export default function StadiumsCard() {
  const { stadiums } = useTournamentStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide stadiums every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.min(stadiums.length, 5));
    }, 5000);
    return () => clearInterval(timer);
  }, [stadiums.length]);

  const featuredStadiums = stadiums.slice(0, 5); // Display first 5 stadiums in carousel
  const currentStadium = featuredStadiums[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? featuredStadiums.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === featuredStadiums.length - 1 ? 0 : prev + 1));
  };

  if (!currentStadium) return null;

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel glass-panel-hover p-6">
      
      {/* Header */}
      <Link href="/stadiums" className="flex items-center justify-between mb-4 group cursor-pointer select-none">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-5 w-5 text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
          <h3 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase group-hover:text-emerald-400 transition-colors duration-200">STADIUMS</h3>
        </div>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all duration-200" />
      </Link>

      <p className="text-xs text-slate-400 mb-6">
        World Cup 2026 Venues
      </p>

      {/* Stadium Card Showcase */}
      <div className="flex-1 relative group/carousel overflow-hidden rounded-xl bg-slate-950 border border-slate-900">
        
        {/* Stadium Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/stadium_placeholder.png" 
            alt={currentStadium.name} 
            className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover/carousel:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Carousel Slide Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-5">
          <h4 className="text-sm font-black text-slate-100 uppercase tracking-wide leading-tight">
            {currentStadium.name}
          </h4>
          
          <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>{currentStadium.city}, {currentStadium.country}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>Capacity: {currentStadium.capacity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <button 
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/65 border border-slate-800 text-slate-400 hover:text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/65 border border-slate-800 text-slate-400 hover:text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute top-4 right-4 z-20 flex gap-1">
          {featuredStadiums.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${idx === currentIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-slate-700'}
              `}
            />
          ))}
        </div>

      </div>

      {/* Footer link */}
      <Link 
        href="/stadiums"
        className="mt-6 flex items-center justify-between border-t border-slate-900 pt-4 text-xs font-bold text-slate-400 hover:text-white group transition-colors"
      >
        <span>Explore All Venues</span>
        <ChevronRight className="h-4.5 w-4.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
      </Link>

    </div>
  );
}
