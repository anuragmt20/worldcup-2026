'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-900 bg-gradient-to-b from-slate-950/20 to-slate-950/80 px-6 py-12 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">

          {/* Left Text Content */}
          <div className="relative z-10 lg:col-span-7 space-y-6">
            {/* World Cup Title */}
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl xl:text-6.5xl leading-none">
              FIFA WORLD CUP <span className="text-primary">2026™</span>
            </h1>

            {/* Dates */}
            <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-300 tracking-wide">
              <Calendar className="h-5 w-5 text-primary" />
              <span>11 JUNE – 19 JULY 2026</span>
            </div>

            {/* Host Countries Flags */}
            <div className="flex flex-wrap gap-4 pt-2">
              {/* USA */}
              <div className="flex items-center gap-3 rounded-full bg-slate-900/50 border border-slate-800/80 backdrop-blur px-4 py-2 hover:border-slate-700/80 transition-colors">
                <img
                  src="https://flagcdn.com/w40/us.png"
                  alt="USA Flag"
                  className="h-4.5 w-7 rounded object-cover shadow-sm"
                />
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">USA</span>
              </div>

              {/* Mexico */}
              <div className="flex items-center gap-3 rounded-full bg-slate-900/50 border border-slate-800/80 backdrop-blur px-4 py-2 hover:border-slate-700/80 transition-colors">
                <img
                  src="https://flagcdn.com/w40/mx.png"
                  alt="Mexico Flag"
                  className="h-4.5 w-7 rounded object-cover shadow-sm"
                />
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Mexico</span>
              </div>

              {/* Canada */}
              <div className="flex items-center gap-3 rounded-full bg-slate-900/50 border border-slate-800/80 backdrop-blur px-4 py-2 hover:border-slate-700/80 transition-colors">
                <img
                  src="https://flagcdn.com/w40/ca.png"
                  alt="Canada Flag"
                  className="h-4.5 w-7 rounded object-cover shadow-sm"
                />
                <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">Canada</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/matches"
                className="inline-flex items-center gap-2.5 rounded-full bg-slate-900/70 border border-slate-800 hover:border-primary/50 text-white font-bold px-7 py-3.5 text-xs tracking-wider uppercase backdrop-blur transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/5"
              >
                Explore World Cup 2026
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Trophy Image & Watermark */}
          <div className="relative lg:col-span-5 flex justify-center lg:justify-end">
            {/* 2026 Watermark Background */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none text-[180px] sm:text-[240px] xl:text-[280px] font-black tracking-tighter text-slate-900/35 z-0">
              2026
            </div>

            {/* Trophy Image wrapper */}
            <div className="relative z-10 w-[240px] sm:w-[280px] xl:w-[320px] aspect-[3/4] flex justify-center items-center animate-trophy">
              <Image
                src="/images/trophy.png"
                alt="FIFA World Cup Trophy"
                fill
                priority
                className="object-contain"
                sizes="(max-w-780px) 240px, 320px"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
