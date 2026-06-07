'use client';

import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  points: number;
  correctPredictions: number;
  totalPredictions: number;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  initialize: () => void;
  signUp: (email: string, username: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Load local user session if any
  let localUser: UserProfile | null = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('wc2026_local_user');
      if (stored) localUser = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading local user', e);
    }
  }

  // Sync profile details from Supabase database
  const fetchProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, we will create one
        return null;
      } else if (error) {
        throw error;
      }

      if (data) {
        return {
          id: data.id,
          email,
          username: data.username,
          points: data.points || 0,
          correctPredictions: data.correct_predictions || 0,
          totalPredictions: data.total_predictions || 0,
        };
      }
    } catch (err: any) {
      console.error('Error fetching profile', err);
    }
    return null;
  };

  return {
    user: localUser,
    loading: false,
    error: null,
    isInitialized: false,

    initialize: () => {
      if (get().isInitialized) return;

      if (!isSupabaseConfigured || !supabase) {
        set({ isInitialized: true });
        return;
      }

      set({ loading: true });

      // Listen to auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || '');
          if (profile) {
            set({ user: profile, loading: false });
          } else {
            set({ 
              user: {
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.email?.split('@')[0] || 'User',
                points: 0,
                correctPredictions: 0,
                totalPredictions: 0
              },
              loading: false 
            });
          }
          
          // Dynamically import to prevent circular dependency
          const store = (await import('./store')).useTournamentStore;
          store.getState().loadUserPredictions();
          store.getState().fetchLeaderboard();
        } else {
          set({ user: null, loading: false });
        }
      });

      set({ isInitialized: true });
    },

    signUp: async (email, username, password) => {
      set({ loading: true, error: null });

      if (!isSupabaseConfigured || !supabase) {
        // Mock signup locally
        const mockUser: UserProfile = {
          id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email,
          username,
          points: 0,
          correctPredictions: 0,
          totalPredictions: 0
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_local_user', JSON.stringify(mockUser));
          // Insert into local store leaderboard if needed
          const storedLeaderboard = localStorage.getItem('wc2026_leaderboard');
          let leaderboard = [];
          if (storedLeaderboard) {
            leaderboard = JSON.parse(storedLeaderboard);
          }
          const userIdx = leaderboard.findIndex((p: any) => p.username === 'You (Local)');
          if (userIdx >= 0) {
            leaderboard[userIdx].username = username;
          }
          localStorage.setItem('wc2026_leaderboard', JSON.stringify(leaderboard));
        }

        set({ user: mockUser, loading: false });
        return true;
      }

      try {
        // Sign up user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData?.user) {
          // Create user profile in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                username,
                points: 0,
                correct_predictions: 0,
                total_predictions: 0,
              }
            ]);

          if (profileError) throw profileError;

          const newUserProfile: UserProfile = {
            id: authData.user.id,
            email,
            username,
            points: 0,
            correctPredictions: 0,
            totalPredictions: 0
          };

          set({ user: newUserProfile, loading: false });
          return true;
        }
      } catch (err: any) {
        set({ error: err.message || 'Error signing up', loading: false });
        return false;
      }

      set({ loading: false });
      return false;
    },

    signIn: async (email, password) => {
      set({ loading: true, error: null });

      if (!isSupabaseConfigured || !supabase) {
        // Mock signin locally
        const mockUser: UserProfile = {
          id: 'mock-user-local',
          email,
          username: email.split('@')[0],
          points: 0,
          correctPredictions: 0,
          totalPredictions: 0
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('wc2026_local_user', JSON.stringify(mockUser));
        }

        set({ user: mockUser, loading: false });
        return true;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          const profile = await fetchProfile(data.user.id, email);
          if (profile) {
            set({ user: profile, loading: false });
            return true;
          }
        }
      } catch (err: any) {
        set({ error: err.message || 'Error signing in', loading: false });
        return false;
      }

      set({ loading: false });
      return false;
    },

    signOut: async () => {
      set({ loading: true });

      if (!isSupabaseConfigured || !supabase) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wc2026_local_user');
        }
        set({ user: null, loading: false });
        return;
      }

      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null, loading: false });
      } catch (err: any) {
        console.error('Error signing out', err);
        set({ loading: false });
      }
    },

    clearError: () => set({ error: null })
  };
});
