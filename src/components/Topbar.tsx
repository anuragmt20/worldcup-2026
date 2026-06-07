'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, ChevronDown, Menu, Ticket, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { useTournamentStore } from '../lib/store';


interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user, initialize, signOut } = useAuthStore();
  const { timezone, setTimezone } = useTournamentStore();
  const [localTz, setLocalTz] = useState('Local');

  // Initialize auth listener & local timezone name
  useEffect(() => {
    initialize();

    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short'
      }).formatToParts(new Date());
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      if (tzPart) {
        setLocalTz(tzPart.value);
      }
    } catch (e) {
      console.error('Error resolving local timezone', e);
    }
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Matches', path: '/matches' },
    { name: 'Teams', path: '/teams' },
    { name: 'Groups', path: '/groups' },
    { name: 'Stadiums', path: '/stadiums' },
    { name: 'Stats', path: '/stats' },
    { name: 'News', path: '/news' },
    { name: 'Tickets', path: '/tickets' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-900/60 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 xl:px-8">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-4 xl:hidden">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-900 border border-slate-800 p-0.5 shadow-sm">
            <img 
              src="/images/logo.svg" 
              alt="FIFA World Cup 2026 Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-sm font-extrabold tracking-widest text-white uppercase">FIFA 2026</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden xl:flex items-center gap-5">
        {navLinks.map((link) => {
          const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));

          return (
            <Link
              key={link.name}
              href={link.path}
              className={`
                relative text-sm font-medium transition-colors duration-200 py-2
                ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}
              `}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4 xl:gap-6">
        {/* Search button */}
        <button className="hidden sm:block rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors duration-150">
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Timezone Selector */}
        <div className="flex items-center gap-1.5 relative text-slate-400 hover:text-white transition-colors duration-155 py-1.5 px-2.5 rounded-lg hover:bg-slate-900/40">
          <Globe className="h-4 w-4 text-emerald-400" />
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-transparent text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white focus:outline-none cursor-pointer appearance-none pr-5"
          >
            <option value="Local" className="bg-slate-950 text-slate-200">{localTz} (Local)</option>
            <option value="IST" className="bg-slate-950 text-slate-200">IST (UTC+5:30)</option>
            <option value="EDT" className="bg-slate-950 text-slate-200">EDT (UTC-4)</option>
            <option value="CDT" className="bg-slate-950 text-slate-200">CDT (UTC-5)</option>
            <option value="PDT" className="bg-slate-950 text-slate-200">PDT (UTC-7)</option>
            <option value="UTC" className="bg-slate-950 text-slate-200">UTC (GMT)</option>
            <option value="BST" className="bg-slate-950 text-slate-200">BST (UTC+1)</option>
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
        </div>

        {/* User Auth Action */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/40 border border-slate-850 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full animate-fadeIn">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <User className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-slate-200 max-w-[50px] sm:max-w-[80px] truncate">{user.username}</span>
              <span className="hidden sm:inline text-[10px] font-black text-emerald-400 uppercase tracking-widest">{user.points} pts</span>
            </div>
            
            <button 
              onClick={signOut}
              title="Sign Out"
              className="text-slate-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link 
            href="/auth"
            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-emerald-400 px-3 sm:px-4.5 py-1.5 sm:py-2 transition-all cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Sign In</span>
          </Link>
        )}

        {/* Tickets Call To Action */}
        <Link 
          href="/tickets" 
          className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.03]"
        >
          <Ticket className="h-4 w-4" />
          Tickets
        </Link>
      </div>


    </header>
  );
}
