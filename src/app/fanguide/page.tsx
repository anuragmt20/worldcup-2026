'use client';

import React from 'react';
import { Compass, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FanGuideRedirectPage() {
  const officialUrl = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026';

  const guideChapters = [
    { title: 'Stadium Security', desc: 'Read official rules regarding permitted items, bag size regulations, and entry procedures.' },
    { title: 'Host City Guides', desc: 'Find maps, transportation links, fan festivals, and local attractions for all 16 host cities.' }
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center space-y-8">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
        <Compass className="h-8 w-8 text-emerald-400" />
      </div>

      {/* Slogan */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Official Fan Guide</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Access host city transport guides, local accommodations, safety guidelines, and event schedules to plan your ultimate 2026 matchday experience.
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
          Go to Official Fan Guide
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Guide details */}
      <div className="text-left pt-8 space-y-4">
        <h3 className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase border-b border-slate-900 pb-2">Guide Chapters</h3>
        
        <div className="space-y-4">
          {guideChapters.map((chap, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
              <h4 className="text-xs font-black text-slate-200 uppercase">{chap.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{chap.desc}</p>
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
