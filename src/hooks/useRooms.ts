import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import type { Room, RoomFilters, RoomType, Language, RoomRecommendation } from '../types';
import React from 'react';

// ============================================================================
// MAIN ROOMS HOOKS
// ============================================================================

/**
 * Hook to fetch all rooms with optional filtering
 * @param filters - Optional filters to apply to the rooms query
 * @returns React Query result with rooms data
 */
export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: async (): Promise<Room[]> => {
      try {
        console.log('🏠 Fetching rooms with filters:', filters);
        
        let query = supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true);

        // Apply filters with improved logic
        if (filters?.type) {
          query = query.eq('type', filters.type);
        }
        
        if (filters?.isPremium !== undefined) {
          query = query.eq('is_premium', filters.isPremium);
        }
        
        if (filters?.searchQuery?.trim()) {
          const searchTerm = filters.searchQuery.trim();
          query = query.or(
            `name_en.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%,description_ar.ilike.%${searchTerm}%`
          );
        }

        // Always order by creation date for consistency
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Supabase error in useRooms:', error);
          throw new Error(`Failed to fetch rooms: ${error.message}`);
        }
        
        const rooms = data || [];
        console.log('✅ Rooms fetched successfully:', rooms.length);
        
        // Validate room data structure
        const validatedRooms = rooms.filter(room => 
          room.id && 
          room.slug && 
          room.name_en && 
          room.type
        );

        if (validatedRooms.length !== rooms.length) {
          console.warn('⚠️ Some rooms were filtered out due to invalid data');
        }

        return validatedRooms;
      } catch (error) {
        console.error('❌ Error in useRooms queryFn:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime)
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for rooms query`);
      // Don't retry on authentication errors
      if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
        return false;
      }
      return failureCount < 3; // Retry up to 3 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to fetch featured rooms (premium and free samples)
 * @param limit - Number of featured rooms to fetch (default: 3)
 * @returns React Query result with featured rooms
 */
export function useFeaturedRooms(limit: number = 3) {
  return useQuery({
    queryKey: queryKeys.rooms.featured,
    queryFn: async (): Promise<Room[]> => {
      try {
        console.log('⭐ Fetching featured rooms...');
        
        // Fetch a mix of premium and free rooms
        const { data: freeRooms, error: freeError } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .eq('is_premium', false)
          .order('created_at', { ascending: false })
          .limit(Math.ceil(limit * 0.6)); // 60% free rooms

        if (freeError) throw freeError;

        const { data: premiumRooms, error: premiumError } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .eq('is_premium', true)
          .order('created_at', { ascending: false })
          .limit(Math.floor(limit * 0.4)); // 40% premium rooms

        if (premiumError) throw premiumError;

        // Combine and shuffle for variety
        const allFeatured = [...(freeRooms || []), ...(premiumRooms || [])]
          .sort(() => Math.random() - 0.5)
          .slice(0, limit);

        console.log('✅ Featured rooms fetched:', allFeatured.length);
        return allFeatured;
      } catch (error) {
        console.error('❌ Featured rooms error:', error);
        throw new Error(`Failed to fetch featured rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

  });
}

/**
 * Hook to fetch rooms with infinite scrolling/pagination
 * @param filters - Optional filters to apply
 * @param pageSize - Number of items per page (default: 10)
 */
export function useInfiniteRooms(filters?: RoomFilters, pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: ['rooms', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        let query = supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true);

        // Apply filters
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.isPremium !== undefined) query = query.eq('is_premium', filters.isPremium);
        if (filters?.searchQuery?.trim()) {
          const searchTerm = filters.searchQuery.trim();
          query = query.or(
            `name_en.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%`
          );
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

        if (error) throw error;

        return {
          data: data || [],
          nextPage: data && data.length === pageSize ? pageParam + 1 : undefined,
          totalCount: count || 0,
        };
             } catch (error) {
         console.error('❌ Infinite rooms error:', error);
         throw error instanceof Error ? error : new Error('Unknown error in infinite rooms');
       }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // 5 minutes for infinite queries
    initialPageParam: 0,
  });
}

// ============================================================================
// INDIVIDUAL ROOM HOOKS
// ============================================================================

/**
 * Hook to fetch a specific room by ID
 * @param roomId - The room ID to fetch
 * @returns React Query result with room data
 */
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: async (): Promise<Room | null> => {
      try {
        if (!roomId) return null;

        console.log(`🏠 Fetching room details for ID: ${roomId}`);
        
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .eq('is_active', true)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`⚠️ Room not found: ${roomId}`);
            return null;
          }
          throw error;
        }
        
        console.log(`✅ Room fetched: ${data.slug}`);
        return data;
      } catch (error) {
        console.error(`❌ Error fetching room ${roomId}:`, error);
        throw error;
      }
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch a room by its slug
 * @param slug - The room slug to fetch
 * @returns React Query result with room data
 */
export function useRoomBySlug(slug: string) {
  return useQuery({
    queryKey: ['rooms', 'slug', slug],
    queryFn: async (): Promise<Room | null> => {
      try {
        if (!slug) return null;

        console.log(`🏠 Fetching room by slug: ${slug}`);
        
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`⚠️ Room not found: ${slug}`);
            return null;
          }
          throw error;
        }
        
        console.log(`✅ Room fetched by slug: ${data.name_en}`);
        return data;
      } catch (error) {
        console.error(`❌ Error fetching room by slug ${slug}:`, error);
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// ============================================================================
// ROOM COLLECTIONS & CATEGORIZATION
// ============================================================================

/**
 * Hook to fetch rooms grouped by type
 * @returns React Query result with rooms grouped by type
 */
export function useRoomsByType() {
  const { data: rooms, ...rest } = useRooms();

  const groupedRooms = rooms?.reduce((acc, room) => {
    if (!acc[room.type]) {
      acc[room.type] = [];
    }
    acc[room.type].push(room);
    return acc;
  }, {} as Record<RoomType, Room[]>) || {
    game: [],
    conversation: [],
    analysis: []
  } as Record<RoomType, Room[]>;

  return {
    data: groupedRooms,
    gameRooms: groupedRooms.game || [],
    conversationRooms: groupedRooms.conversation || [],
    analysisRooms: groupedRooms.analysis || [],
    ...rest,
  };
}

/**
 * Hook to fetch premium vs free rooms
 * @returns React Query result with rooms categorized by premium status
 */
export function useRoomsByAccess() {
  const { data: rooms, ...rest } = useRooms();

  const freeRooms = rooms?.filter(room => !room.is_premium) || [];
  const premiumRooms = rooms?.filter(room => room.is_premium) || [];

  return {
    data: { freeRooms, premiumRooms },
    freeRooms,
    premiumRooms,
    ...rest,
  };
}

// ============================================================================
// ROOM RECOMMENDATIONS
// ============================================================================

/**
 * Enhanced room recommendations hook with better logic
 * @param userId - User ID for personalized recommendations
 * @param userPreferences - User preferences for better recommendations
 * @returns React Query result with room recommendations
 */
export function useRoomRecommendations(
  userId?: string,
  userPreferences?: { language?: Language; preferredTypes?: RoomType[] }
) {
  const { data: rooms } = useRooms();

  return useQuery({
    queryKey: ['rooms', 'recommendations', userId, userPreferences],
    queryFn: async (): Promise<RoomRecommendation[]> => {
      if (!rooms || rooms.length === 0) return [];
      
      console.log('🎯 Generating room recommendations...');
      
      const recommendations: RoomRecommendation[] = [];
      
      // Prioritize free rooms for new users
      const freeRooms = rooms.filter(room => !room.is_premium);
      
      // Always recommend general conversation for beginners
      const generalChat = rooms.find(r => r.slug === 'general_chat' || r.type === 'conversation');
      if (generalChat) {
        recommendations.push({
          room: generalChat,
          reason: {
            en: "Perfect for starting your mental health journey",
            ar: "مثالي لبدء رحلة الصحة النفسية"
          },
          priority: 10
        });
      }

      // Recommend interactive games for engagement
      const gameRooms = rooms.filter(r => r.type === 'game' && !r.is_premium);
      if (gameRooms.length > 0) {
        const randomGame = gameRooms[Math.floor(Math.random() * gameRooms.length)];
        recommendations.push({
          room: randomGame,
          reason: {
            en: "Interactive way to explore your thoughts and feelings",
            ar: "طريقة تفاعلية لاستكشاف أفكارك ومشاعرك"
          },
          priority: 8
        });
      }

      // Recommend analysis tools
      const analysisRooms = rooms.filter(r => r.type === 'analysis' && !r.is_premium);
      if (analysisRooms.length > 0) {
        const randomAnalysis = analysisRooms[Math.floor(Math.random() * analysisRooms.length)];
        recommendations.push({
          room: randomAnalysis,
          reason: {
            en: "Gain insights into your mental state and patterns",
            ar: "احصل على رؤى حول حالتك النفسية وأنماطك"
          },
          priority: 6
        });
      }

      // Add variety with premium rooms (if user has access)
      const premiumRooms = rooms.filter(r => r.is_premium);
      if (premiumRooms.length > 0) {
        const randomPremium = premiumRooms[Math.floor(Math.random() * premiumRooms.length)];
        recommendations.push({
          room: randomPremium,
          reason: {
            en: "Advanced features for deeper therapeutic insights",
            ar: "ميزات متقدمة لرؤى علاجية أعمق"
          },
          priority: 4
        });
      }

      console.log(`✅ Generated ${recommendations.length} recommendations`);
      return recommendations.sort((a, b) => b.priority - a.priority);
    },
    enabled: !!rooms && rooms.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ============================================================================
// MUTATIONS & ACTIONS
// ============================================================================

/**
 * Hook to refresh/invalidate room queries
 * @returns Mutation to refresh room data
 */
export function useRefreshRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('🔄 Refreshing all room queries...');
      
      // Invalidate all room-related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      ]);
      
      console.log('✅ Room queries refreshed');
    },
    onSuccess: () => {
      console.log('✅ Room refresh completed successfully');
    },
    onError: (error) => {
      console.error('❌ Room refresh failed:', error);
    },
  });
}

/**
 * Hook to prefetch a room by ID
 * @returns Function to prefetch room data
 */
export function usePrefetchRoom() {
  const queryClient = useQueryClient();

  return async (roomId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.rooms.detail(roomId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .eq('is_active', true)
          .single();
        
                 if (error && error.code !== 'PGRST116') throw error instanceof Error ? error : new Error('Failed to prefetch room');
        return data || null;
      },
      staleTime: 1000 * 60 * 30,
    });
  };
}

// ============================================================================
// UTILITY HOOKS & HELPERS
// ============================================================================

/**
 * Hook to get room statistics
 * @returns Room statistics and counts
 */
export function useRoomStats() {
  const { data: rooms } = useRooms();

  const stats = {
    total: rooms?.length || 0,
    free: rooms?.filter(r => !r.is_premium).length || 0,
    premium: rooms?.filter(r => r.is_premium).length || 0,
    byType: {
      game: rooms?.filter(r => r.type === 'game').length || 0,
      conversation: rooms?.filter(r => r.type === 'conversation').length || 0,
      analysis: rooms?.filter(r => r.type === 'analysis').length || 0,
    },
  };

  return stats;
}

/**
 * Hook to search rooms with debounced query
 * @param searchQuery - Search term
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Debounced search results
 */
export function useSearchRooms(searchQuery: string, debounceMs: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  return useRooms({ searchQuery: debouncedQuery });
} 