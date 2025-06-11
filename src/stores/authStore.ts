import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getCurrentUser, getUserProfile, checkSubscriptionStatus } from '../lib/supabase';
import type { 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials, 
  User,
  SubscriptionState 
} from '../types';

interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshSubscription: () => Promise<SubscriptionState>;
  
  // Subscription helpers
  subscription: SubscriptionState;
  canAccessPremiumFeatures: () => boolean;
  getRemainingTrialDays: () => number;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: false,
      initialized: false,
      subscription: {
        status: 'trial',
        canAccessPremium: false,
        daysRemaining: 0,
      },

      // Initialize auth state
      initialize: async () => {
        const { initialized } = get();
        
        // Don't initialize if already initialized
        if (initialized) {
          return;
        }
        
        try {
          set({ loading: true });
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const profile = await getUserProfile(session.user.id);
            const subscriptionStatus = await checkSubscriptionStatus(session.user.id);
            
            set({
              user: profile,
              session,
              subscription: subscriptionStatus,
              initialized: true,
            });
          } else {
            set({ 
              user: null, 
              session: null, 
              initialized: true 
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null, 
            session: null, 
            initialized: true 
          });
        } finally {
          set({ loading: false });
        }
      },

      // Sign in
      signIn: async (credentials: LoginCredentials) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword(credentials);
          
          if (error) throw error;
          
          if (data.user) {
            const profile = await getUserProfile(data.user.id);
            const subscriptionStatus = await checkSubscriptionStatus(data.user.id);
            
            set({
              user: profile,
              session: data.session,
              subscription: subscriptionStatus,
            });
          }
        } catch (error) {
          console.error('Sign in error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Sign up
      signUp: async (credentials: RegisterCredentials) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                full_name: credentials.full_name,
              },
            },
          });
          
          if (error) throw error;
          
          // Note: User profile will be created automatically via database trigger
          if (data.user && data.session) {
            // Wait a moment for the trigger to create the profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const profile = await getUserProfile(data.user.id);
            const subscriptionStatus = await checkSubscriptionStatus(data.user.id);
            
            set({
              user: profile,
              session: data.session,
              subscription: subscriptionStatus,
            });
          }
        } catch (error) {
          console.error('Sign up error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ loading: true });
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({
            user: null,
            session: null,
            subscription: {
              status: 'trial',
              canAccessPremium: false,
              daysRemaining: 0,
            },
          });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user found');
          
          set({ loading: true });
          
          const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          
          set({ user: data });
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Complete onboarding
      completeOnboarding: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user found');
          
          await get().updateProfile({ onboarding_completed: true });
        } catch (error) {
          console.error('Complete onboarding error:', error);
          throw error;
        }
      },

      // Refresh subscription status
      refreshSubscription: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user found');
          
          const subscriptionStatus = await checkSubscriptionStatus(user.id);
          set({ subscription: subscriptionStatus });
          
          return subscriptionStatus;
        } catch (error) {
          console.error('Refresh subscription error:', error);
          throw error;
        }
      },

      // Helper: Check if user can access premium features
      canAccessPremiumFeatures: () => {
        const { subscription } = get();
        return subscription.canAccessPremium;
      },

      // Helper: Get remaining trial days
      getRemainingTrialDays: () => {
        const { subscription } = get();
        return subscription.daysRemaining || 0;
      },
    }),
    {
      name: 'therapiste-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        subscription: state.subscription,
        initialized: state.initialized,
        // Explicitly exclude loading from being persisted
      }),
    }
  )
);

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    try {
      const profile = await getUserProfile(session.user.id);
      const subscriptionStatus = await checkSubscriptionStatus(session.user.id);
      
      useAuthStore.setState({
        user: profile,
        session,
        subscription: subscriptionStatus,
      });
    } catch (error) {
      console.error('Auth state change error:', error);
    }
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      session: null,
      subscription: {
        status: 'trial',
        canAccessPremium: false,
        daysRemaining: 0,
      },
    });
  }
}); 