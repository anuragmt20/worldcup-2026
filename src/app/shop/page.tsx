'use client';

import React from 'react';
import { ShoppingBag, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShopRedirectPage() {
  const officialUrl = 'https://store.fifa.com';

  const shopCategories = [
    { title: 'National Jerseys', desc: 'Buy official tournament jerseys, training wear, and fan kits for all 48 participating countries.' },
    { title: 'Accessories & Souvenirs', desc: 'Collect official match balls, tournament mascot plushies, keychains, and 2026 cups.' }
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center space-y-8">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 shadow-lg shadow-purple-500/5">
        <ShoppingBag className="h-8 w-8 text-purple-400" />
      </div>

      {/* Slogan */}
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Official FIFA Store</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Shop official FIFA World Cup 2026 jerseys, matches, flags, mascot merchandise, and commemorative accessories from the official shop portal.
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
          Go to Official FIFA Store
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Categories */}
      <div className="text-left pt-8 space-y-4">
        <h3 className="text-[10px] font-extrabold tracking-widest text-slate-500 uppercase border-b border-slate-900 pb-2">Merchandise Categories</h3>
        
        <div className="space-y-4">
          {shopCategories.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
              <h4 className="text-xs font-black text-slate-200 uppercase">{cat.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
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
