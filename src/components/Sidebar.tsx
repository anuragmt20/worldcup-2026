'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Trophy, 
  Users, 
  List, 
  MapPin, 
  TrendingUp, 
  Newspaper, 
  PlayCircle, 
  Compass, 
  Ticket, 
  ShoppingBag,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Match Schedule', path: '/matches', icon: Calendar },
    { name: 'Results', path: '/results', icon: Trophy },
    { name: 'Participating Teams', path: '/teams', icon: Users },
    { name: 'Group Standings', path: '/groups', icon: List },
    { name: 'Stadiums', path: '/stadiums', icon: MapPin },
    { name: 'Match Prediction', path: '/predict', icon: TrendingUp },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'Videos', path: '/videos', icon: PlayCircle },
    { name: 'Fan Guide', path: '/fanguide', icon: Compass },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
  ];

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-transform duration-300 xl:static xl:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header / Logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-900">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            {/* World cup official emblem logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-slate-900 border border-slate-800 p-0.5 shadow-sm hover:border-emerald-500/30 transition-colors duration-200">
              <img 
                src="/images/logo.svg" 
                alt="FIFA World Cup 2026 Official Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">FIFA</div>
              <div className="text-sm font-bold tracking-tight text-white uppercase">World Cup <span className="text-emerald-400">2026</span></div>
            </div>
          </Link>
          <button 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 xl:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  group flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'active-nav-glow bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>


        {/* Footer Brand Banner */}
        <div className="relative p-6 mt-auto overflow-hidden border-t border-slate-900 bg-slate-950/40">
          <div className="relative z-10">
            <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">WE ARE</div>
            <div className="text-3xl font-extrabold tracking-tighter text-white">
              26<span className="text-emerald-400">.</span>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">UNITED AS ONE.</div>
          </div>

          {/* Curved wave colorful stripes at the very bottom left matching screenshot */}
          <div className="absolute bottom-0 left-0 right-0 h-4 flex overflow-hidden">
            <div className="w-1/4 h-full bg-blue-600 skew-x-12 origin-bottom"></div>
            <div className="w-1/4 h-full bg-emerald-400 -skew-x-12 origin-bottom"></div>
            <div className="w-1/4 h-full bg-yellow-400 skew-x-12 origin-bottom"></div>
            <div className="w-1/4 h-full bg-red-600 -skew-x-12 origin-bottom"></div>
          </div>
        </div>
      </aside>
    </>
  );
}
