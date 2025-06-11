import { useAuthStore } from '../stores/authStore';

export const useAuthGuard = () => {
  const { user, initialized, loading } = useAuthStore();

  return {
    isAuthenticated: !!user,
    isOnboardingCompleted: user?.onboarding_completed || false,
    isLoading: loading || !initialized,
    user,
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthGuard();
  
  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading,
  };
};

export const useAuthRedirect = () => {
  const { user, initialized } = useAuthStore();

  const getRedirectPath = () => {
    if (!initialized) return null;

    if (!user) {
      return '/auth';
    } else if (!user.onboarding_completed) {
      return '/onboarding';
    } else {
      return '/(tabs)';
    }
  };

  return { getRedirectPath };
}; 