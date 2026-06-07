'use client';

import React from 'react';
import { PlayCircle, Tv, Sparkles, ExternalLink } from 'lucide-react';

export default function VideosPage() {
  const officialYoutubeUrl = 'https://www.youtube.com/@fifa';

  const videosList = [
    {
      title: 'FIFA World Cup 2026 Host Cities Official Announcement',
      youtubeId: 'V9wG4Fq99Zc', // Real FIFA YouTube video ID placeholder
      duration: '4:15',
      category: 'Announcements',
      views: '1.2M views'
    },
    {
      title: 'We Are 26 - Official Brand Launch Highlights',
      youtubeId: 'z2YkQh2PuxU',
      duration: '3:40',
      category: 'Brand Launch',
      views: '840K views'
    },
    {
      title: 'FIFA World Cup Historic Matches: Greatest Moments',
      youtubeId: 'U-m5W4P7x0Q',
      duration: '12:30',
      category: 'Historic Highlights',
      views: '3.4M views'
    },
    {
      title: 'Top 10 Goals in FIFA World Cup History',
      youtubeId: 'f0gSMI45Lmg',
      duration: '8:45',
      category: 'Best Goals',
      views: '5.2M views'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">Video Highlights Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Watch official matches, host announcements, and historical goals</p>
        </div>

        {/* Redirect button */}
        <a 
          href={officialYoutubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 text-xs uppercase tracking-wider transition-colors"
        >
          <PlayCircle className="h-4.5 w-4.5" />
          Visit FIFA YouTube
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videosList.map((video) => (
          <div key={video.youtubeId} className="flex flex-col rounded-xl overflow-hidden glass-panel border border-slate-900 shadow-lg space-y-4 pb-4">
            
            {/* Embedded YouTube Player */}
            <div className="relative aspect-video w-full bg-black border-b border-slate-900">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Video Meta */}
            <div className="px-5 space-y-2">
              <div className="flex items-center gap-2.5 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">{video.category}</span>
                <span>&bull;</span>
                <span>{video.duration}</span>
                <span>&bull;</span>
                <span>{video.views}</span>
              </div>

              <h3 className="text-sm font-black text-slate-200 tracking-wide leading-snug hover:text-emerald-400 transition-colors">
                {video.title}
              </h3>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
