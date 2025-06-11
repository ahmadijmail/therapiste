import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase,  getUserProfile, checkSubscriptionStatus } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import type { LoginCredentials, RegisterCredentials, User, SubscriptionState } from '../types';

// Get current user session
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get current user profile
export function useUser() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      if (!session?.user?.id) return null;
      return await getUserProfile(session.user.id);
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get user subscription status
export function useSubscription() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: queryKeys.profile.subscription,
    queryFn: async (): Promise<SubscriptionState> => {
      if (!session?.user?.id) {
        return {
          status: 'trial',
          canAccessPremium: false,
          daysRemaining: 0,
        };
      }
      return await checkSubscriptionStatus(session.user.id);
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.subscription });
      
      // Navigate to main app
      router.replace('/(protected)/(tabs)');
    },
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });
}

// Sign up mutation
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
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
      
      // Wait for database trigger to create profile
      if (data.user && data.session) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.subscription });
      
      // Navigate to main app
      router.replace('/(protected)/(tabs)');
    },
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Navigate to auth screen
      router.replace('/auth');
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!session?.user?.id) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedUser) => {
      // Update the user query cache
      queryClient.setQueryData(queryKeys.auth.user, updatedUser);
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
}

// Complete onboarding mutation
export function useCompleteOnboarding() {
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async () => {
      return updateProfile.mutateAsync({ onboarding_completed: true });
    },
    onSuccess: () => {
      // Navigate to main app after onboarding
      router.replace('/(protected)/(tabs)');
    },
  });
}

// Refresh subscription mutation
export function useRefreshSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Simply invalidate the subscription query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.subscription });
    },
  });
}

// Helper hook for checking if user can access premium features
export function useCanAccessPremium() {
  const { data: subscription } = useSubscription();
  return subscription?.canAccessPremium ?? false;
}

// Helper hook for getting remaining trial days
export function useRemainingTrialDays() {
  const { data: subscription } = useSubscription();
  return subscription?.daysRemaining ?? 0;
} 