import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Helper function to check subscription status
export const checkSubscriptionStatus = async (userId: string) => {
  const profile = await getUserProfile(userId);
  
  if (profile.subscription_status === 'trial') {
    const trialEndsAt = new Date(profile.trial_ends_at || '');
    const now = new Date();
    const isTrialExpired = trialEndsAt < now;
    
    return {
      status: isTrialExpired ? 'expired' : 'trial',
      canAccessPremium: !isTrialExpired,
      daysRemaining: isTrialExpired ? 0 : Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
  
  if (profile.subscription_status === 'active') {
    const subscriptionEndsAt = new Date(profile.subscription_ends_at || '');
    const now = new Date();
    const isSubscriptionExpired = subscriptionEndsAt < now;
    
    return {
      status: isSubscriptionExpired ? 'expired' : 'active',
      canAccessPremium: !isSubscriptionExpired,
      daysRemaining: isSubscriptionExpired ? 0 : Math.ceil((subscriptionEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
  
  return {
    status: profile.subscription_status,
    canAccessPremium: false,
    daysRemaining: 0
  };
}; 