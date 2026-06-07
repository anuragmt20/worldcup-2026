'use client';

import React from 'react';
import { Newspaper, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewsRedirectPage() {
  const officialUrl = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/news';

  const mockArticles = [
    {
      title: 'Host Cities Prepare for Historic 2026 Tournament',
      desc: 'Stadium preparations and local transport infrastructure projects pick up speed across 16 North American host cities.',
      date: 'June 7, 2026'
    },
    {
      title: 'FIFA Officials Complete Final Venue Inspection Tour',
      desc: 'All 16 venues have passed structural audits and turf grass standards reviews ahead of the opening game.',
      date: 'June 5, 2026'
    }
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center space-y-8">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-lg shadow-blue-500/5">
        <Newspaper className="h-8 w-8 text-blue-400" />
      </div>

      {/* Slogan */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Official Tournament News</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Read breaking announcements, official schedules, ticketing news, and matchday reports directly on the FIFA World Cup news portal.
        </p>
      </div>

      {/* Redirect Button */}
      <div>
        <a 
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.03]"
        >
          Go to Official FIFA News
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Preview Articles */}
      <div className="text-left pt-8 space-y-4">
        <h3 className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase border-b border-slate-900 pb-2">Recent Announcements</h3>
        
        <div className="space-y-4">
          {mockArticles.map((art, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
              <div className="text-[9px] font-bold text-slate-500">{art.date}</div>
              <h4 className="text-xs font-black text-slate-200 uppercase">{art.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{art.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

    </div>
  );
}
