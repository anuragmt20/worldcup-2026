'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, ChevronDown, Menu, Ticket, LogIn, LogOut, User, Coins, X, Check } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { useTournamentStore } from '../lib/store';


interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user, initialize, signOut, claimWelcomeGift, dailyCheckIn } = useAuthStore();
  const { timezone, setTimezone } = useTournamentStore();
  const [localTz, setLocalTz] = useState('Local');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize auth listener & local timezone name
  useEffect(() => {
    initialize();
    setMounted(true);

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
    <>
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
              <option value="India" className="bg-slate-950 text-slate-200">India</option>
              <option value="United States" className="bg-slate-950 text-slate-200">United States</option>
              <option value="Brazil" className="bg-slate-950 text-slate-200">Brazil</option>
              <option value="United Kingdom" className="bg-slate-950 text-slate-200">United Kingdom</option>
              <option value="Germany" className="bg-slate-950 text-slate-200">Germany</option>
              <option value="South Africa" className="bg-slate-950 text-slate-200">South Africa</option>
              <option value="United Arab Emirates" className="bg-slate-950 text-slate-200">United Arab Emirates</option>
              <option value="Indonesia" className="bg-slate-950 text-slate-200">Indonesia</option>
              <option value="China" className="bg-slate-950 text-slate-200">China</option>
              <option value="Japan" className="bg-slate-950 text-slate-200">Japan</option>
              <option value="Australia" className="bg-slate-950 text-slate-200">Australia</option>
              <option value="New Zealand" className="bg-slate-950 text-slate-200">New Zealand</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>

          {/* WC Coins Badge — always visible */}
          {mounted && user ? (
            /* Signed-in: opens shop */
            <div
              onClick={() => setIsShopOpen(true)}
              className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-850 hover:border-amber-500/40 hover:bg-slate-900/60 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none animate-fadeIn group"
            >
              <Coins className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="text-amber-400 font-extrabold">{user.points || 0} WC</span>
            </div>
          ) : (
            /* Signed-out: shows 0 WC, clicking goes to sign-in */
            <Link
              href="/auth"
              title="Sign in to claim WC coins"
              className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/60 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none group"
            >
              <Coins className="h-3.5 w-3.5 text-amber-500/60 group-hover:text-amber-500 group-hover:scale-110 transition-all" />
              <span className="text-amber-400/60 group-hover:text-amber-400 font-extrabold transition-colors">0 WC</span>
            </Link>
          )}

          {/* User Auth Action */}
          {mounted && user ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/40 border border-slate-850 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full animate-fadeIn">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-xs font-bold text-slate-200 max-w-[50px] sm:max-w-[80px] truncate">{user.username}</span>
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

      {/* Points Shop Modal */}
      {isShopOpen && user && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-950 p-6 border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6">
            {/* Close button */}
            <button
              onClick={() => setIsShopOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center flex flex-col gap-1.5 pt-2">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Coins className="h-6 w-6 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">WC Points Shop</h2>
              <p className="text-xs text-slate-400">Claim free daily rewards and welcome gifts to predict matches!</p>
            </div>

            {/* Balance Card */}
            <div className="rounded-xl bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 text-center">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Your Current Balance</span>
              <div className="text-3xl font-black text-amber-400 mt-1">{user.points || 0} <span className="text-sm font-bold">WC</span></div>
            </div>

            {/* Welcome Reward Option */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-850 p-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide">Welcome Reward</h3>
                <p className="text-[10px] text-slate-450">Claim a one-time welcome bonus of 250 WC Coins.</p>
              </div>
              {user.hasClaimedWelcome ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Claimed
                </span>
              ) : (
                <button
                  onClick={() => claimWelcomeGift()}
                  className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3.5 py-2 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Claim 250 WC
                </button>
              )}
            </div>

            {/* 10-Day Daily Check-In */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-850 p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide">Daily Streak Check-In</h3>
                  <p className="text-[10px] text-slate-450">Check in every day to get 100 WC. Day 10 gets 1000 WC!</p>
                </div>
                <span className="text-[10px] font-black text-amber-400">Streak: {user.checkInStreak || 0}/10 days</span>
              </div>

              {/* 10-Day Grid */}
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, index) => {
                  const dayNum = index + 1;
                  const isCompleted = (user.checkInStreak || 0) >= dayNum;
                  const isActive = (user.checkInStreak || 0) === dayNum - 1;
                  const isLastDay = dayNum === 10;

                  return (
                    <div
                      key={dayNum}
                      className={`
                        relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all select-none
                        ${isCompleted
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400'
                          : isActive
                            ? 'bg-amber-500/10 border-amber-500/80 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                            : 'bg-slate-950 border-slate-900 text-slate-500'
                        }
                      `}
                    >
                      <span className="text-[8px] font-black uppercase tracking-wider">Day {dayNum}</span>
                      <span className="text-[9px] font-extrabold mt-1">
                        {isLastDay ? '+1K' : '+100'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Check in Action */}
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const hasCheckedInToday = user.lastCheckInDate === todayStr;
                const nextDayNum = ((user.checkInStreak || 0) % 10) + 1;
                const nextReward = nextDayNum === 10 ? 1000 : 100;

                return hasCheckedInToday ? (
                  <button
                    disabled
                    className="w-full rounded-lg bg-slate-800 text-slate-500 text-xs font-bold py-2.5 transition-colors uppercase tracking-wider cursor-not-allowed border border-slate-850"
                  >
                    Checked In Today &bull; Back Tomorrow
                  </button>
                ) : (
                  <button
                    onClick={() => dailyCheckIn()}
                    className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2.5 transition-colors uppercase tracking-wider shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    Check In Day {nextDayNum} (+{nextReward} WC)
                  </button>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
