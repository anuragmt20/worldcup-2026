'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, Loader2, Trophy, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const { signUp, signIn, error, loading, clearError, user } = useAuthStore();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Clear errors when toggling modes
  useEffect(() => {
    clearError();
  }, [isSignUpMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUpMode) {
      const success = await signUp(email, username, password);
      if (success) router.push('/');
    } else {
      const success = await signIn(email, password);
      if (success) router.push('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-4 py-12">
      {/* Auth Card Container */}
      <div className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-950 p-8 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Back to Home Button */}
        <Link 
          href="/" 
          className="absolute left-6 top-6 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </Link>

        {/* Logo / Brand Header */}
        <div className="text-center pt-4 space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/35 mb-2">
            <Trophy className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wide">
            {isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
            {isSignUpMode 
              ? 'Join the World Cup predictor community and play with friends' 
              : 'Sign in to record predictions, sync scores, and check the leaderboard'
            }
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (Only in signup mode) */}
          {isSignUpMode && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 pl-10 text-slate-200"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 pl-10 text-slate-200"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 px-4 py-2.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500/50 pl-10 text-slate-200"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 text-xs uppercase tracking-wider transition-all duration-205 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isSignUpMode ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-900/60">
          {isSignUpMode ? (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setIsSignUpMode(false)}
                className="text-emerald-400 font-bold hover:underline bg-transparent border-none focus:outline-none cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New to the predictor?{' '}
              <button 
                onClick={() => setIsSignUpMode(true)}
                className="text-emerald-400 font-bold hover:underline bg-transparent border-none focus:outline-none cursor-pointer"
              >
                Create Account
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
