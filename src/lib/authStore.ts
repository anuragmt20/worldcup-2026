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
  hasClaimedWelcome?: boolean;
  checkInStreak?: number;
  lastCheckInDate?: string | null;
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
  claimWelcomeGift: () => Promise<void>;
  dailyCheckIn: () => Promise<void>;
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
          hasClaimedWelcome: data.has_claimed_welcome || false,
          checkInStreak: data.check_in_streak || 0,
          lastCheckInDate: data.last_check_in_date || null
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
        // Sign up user in Supabase Auth with metadata so database trigger handles profile creation
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });

        if (authError) throw authError;

        if (authData?.user) {
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

    clearError: () => set({ error: null }),

    claimWelcomeGift: async () => {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser: UserProfile = {
        ...currentUser,
        points: (currentUser.points || 0) + 250,
        hasClaimedWelcome: true
      };

      set({ user: updatedUser });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_local_user', JSON.stringify(updatedUser));
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('profiles').update({
            points: updatedUser.points,
            has_claimed_welcome: true
          }).eq('id', currentUser.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating profile in Supabase', e);
        }
      }
    },

    dailyCheckIn: async () => {
      const currentUser = get().user;
      if (!currentUser) return;

      const todayStr = new Date().toISOString().split('T')[0];
      const lastCheckIn = currentUser.lastCheckInDate;
      
      let streak = currentUser.checkInStreak || 0;
      let newStreak = 1;
      let reward = 100;

      if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn);
        const todayDate = new Date(todayStr);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Continuous check-in
          newStreak = streak + 1;
          if (newStreak > 10) newStreak = 1;
          reward = newStreak === 10 ? 1000 : 100;
        } else if (diffDays === 0) {
          // Already checked in today
          return;
        } else {
          // Missed check-in
          newStreak = 1;
          reward = 100;
        }
      } else {
        // First check-in
        newStreak = 1;
        reward = 100;
      }

      const updatedUser: UserProfile = {
        ...currentUser,
        points: (currentUser.points || 0) + reward,
        checkInStreak: newStreak,
        lastCheckInDate: todayStr
      };

      set({ user: updatedUser });
      if (typeof window !== 'undefined') {
        localStorage.setItem('wc2026_local_user', JSON.stringify(updatedUser));
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('profiles').update({
            points: updatedUser.points,
            check_in_streak: newStreak,
            last_check_in_date: todayStr
          }).eq('id', currentUser.id);
          if (error) throw error;
        } catch (e) {
          console.error('Error updating check-in in Supabase', e);
        }
      }
    }
  };
});
