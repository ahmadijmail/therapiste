import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data stays fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Cache time: How long data stays in cache after becoming unused
      gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
      // Network timeout for queries
      networkMode: 'online',
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors (401, 403)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on specific Supabase errors
        if (error?.code === 'PGRST116') { // No rows found
          return false;
        }
        console.log(`Query retry ${failureCount} for error:`, error?.message);
        // Retry up to 2 times for other errors with exponential backoff
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (when app comes back to foreground)
      refetchOnWindowFocus: false,
      // Background refetch interval
      refetchInterval: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth queries
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Rooms queries
  rooms: {
    all: ['rooms'] as const,
    list: (filters?: any) => ['rooms', 'list', filters] as const,
    featured: ['rooms', 'featured'] as const,
    detail: (id: string) => ['rooms', 'detail', id] as const,
  },
  
  // User profile queries
  profile: {
    current: ['profile', 'current'] as const,
    subscription: ['profile', 'subscription'] as const,
  },
  
  // Sessions queries
  sessions: {
    all: ['sessions'] as const,
    byRoom: (roomId: string) => ['sessions', 'room', roomId] as const,
    messages: (sessionId: string) => ['sessions', sessionId, 'messages'] as const,
  },
} as const; 