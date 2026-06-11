'use client';

import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out after 2.2s
    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    // Fully remove after 2.8s
    const removeTimer = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% 40%, rgba(10,20,10,1) 0%, #060918 70%)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Background glow rings */}
      <div className="absolute" style={{
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)',
        animation: 'splash-pulse 2s ease-in-out infinite',
      }} />
      <div className="absolute" style={{
        width: '340px', height: '340px', borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.12)',
        animation: 'splash-expand 2.2s ease-out forwards',
      }} />
      <div className="absolute" style={{
        width: '420px', height: '420px', borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.06)',
        animation: 'splash-expand 2.2s 0.15s ease-out forwards',
      }} />

      {/* Text content */}
      <div style={{
        textAlign: 'center',
        animation: 'splash-text 0.7s 0.2s ease-out forwards',
        opacity: 0,
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#c9a84c',
          marginBottom: '10px',
        }}>
          Welcome to
        </div>

        {/* Main title */}
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          World Cup
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #f0c040 0%, #c9a84c 50%, #f0c040 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontStyle: 'italic',
          }}>
            Eleven
          </span>
        </div>

        {/* Sub label */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(200,210,230,0.45)',
          marginTop: '12px',
        }}>
          FIFA World Cup 2026™
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        position: 'absolute', bottom: '48px',
        width: '160px', height: '2px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #c9a84c, #f0c040)',
          borderRadius: '999px',
          animation: 'splash-bar 2s ease-out forwards',
        }} />
      </div>

      <style>{`
        @keyframes splash-text {
          0%   { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-bar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes splash-expand {
          0%   { opacity: 0; transform: scale(0.7); }
          60%  { opacity: 1; }
          100% { opacity: 0.4; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
