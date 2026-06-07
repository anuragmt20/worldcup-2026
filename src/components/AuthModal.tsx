'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signUp, signIn, error, loading, clearError } = useAuthStore();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // Clear errors when toggling modes or closing
  useEffect(() => {
    clearError();
  }, [isSignUpMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUpMode) {
      const success = await signUp(email, username, password);
      if (success) onClose();
    } else {
      const success = await signIn(email, password);
      if (success) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-2xl glass-panel bg-slate-950 p-6 border border-slate-800 shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wide">
            {isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUpMode ? 'Join the World Cup predictor community' : 'Sign in to sync your match predictions'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 mb-5 text-xs text-rose-400">
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
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3 text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-emerald-500/10 cursor-pointer mt-2"
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
        <div className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-900/60">
          {isSignUpMode ? (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setIsSignUpMode(false)}
                className="text-emerald-400 font-bold hover:underline bg-transparent border-none focus:outline-none"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New to the predictor?{' '}
              <button 
                onClick={() => setIsSignUpMode(true)}
                className="text-emerald-400 font-bold hover:underline bg-transparent border-none focus:outline-none"
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
