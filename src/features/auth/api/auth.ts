import { supabase } from '../../../lib/supabase';
import type { LoginCredentials, RegisterCredentials, User } from '../../../types';

// Sign up with email and password
export const signUp = async (credentials: RegisterCredentials) => {
  try {
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

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign up failed',
    };
  }
};

// Sign in with email and password
export const signIn = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return {
      success: true,
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'therapiste://reset-password',
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    };
  }
};

// Update password
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password updated successfully',
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Password update failed',
    };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session',
    };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed',
    };
  }
};

// Check if user exists
export const checkUserExists = async (email: string) => {
  try {
    // Note: This is a simple check - in production you might want a different approach
    const result = await signIn({ email, password: 'dummy' });
    
    // If we get a specific "Invalid login credentials" error, user exists
    // If we get "User not found" or similar, user doesn't exist
    return {
      exists: result.error?.includes('Invalid') || false,
    };
  } catch (error) {
    return {
      exists: false,
    };
  }
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Trial management
export const startTrial = async (userId: string) => {
  try {
    const trialStartsAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3-day trial

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'trial',
        trial_started_at: trialStartsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Start trial error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start trial',
    };
  }
};

// Check trial status
export const checkTrialStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('trial_started_at, trial_ends_at, subscription_status')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (data.subscription_status !== 'trial') {
      return {
        isTrialActive: false,
        daysRemaining: 0,
      };
    }

    const now = new Date();
    const trialEnds = new Date(data.trial_ends_at || '');
    const daysRemaining = Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      isTrialActive: daysRemaining > 0,
      daysRemaining,
      trialEndsAt: data.trial_ends_at,
    };
  } catch (error) {
    console.error('Check trial status error:', error);
    return {
      isTrialActive: false,
      daysRemaining: 0,
    };
  }
}; 