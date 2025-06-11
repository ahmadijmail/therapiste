import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import type { Room, RoomFilters } from '../types';

// Get all rooms
export function useRooms(filters?: RoomFilters) {
  return useQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: async (): Promise<Room[]> => {
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.isPremium !== undefined) {
        query = query.eq('is_premium', filters.isPremium);
      }
      
      if (filters?.searchQuery) {
        query = query.or(
          `name_en.ilike.%${filters.searchQuery}%,name_ar.ilike.%${filters.searchQuery}%,description_en.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get featured rooms (first 3 rooms)
export function useFeaturedRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.featured,
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Get specific room by ID
export function useRoom(roomId: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(roomId),
    queryFn: async (): Promise<Room | null> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Get room by slug
export function useRoomBySlug(slug: string) {
  return useQuery({
    queryKey: ['rooms', 'slug', slug],
    queryFn: async (): Promise<Room | null> => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Refresh rooms mutation
export function useRefreshRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Invalidate all room queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
    },
  });
}

// Helper hook to get room recommendations (mock for now)
export function useRoomRecommendations() {
  const { data: rooms } = useRooms();

  return useQuery({
    queryKey: ['rooms', 'recommendations'],
    queryFn: async () => {
      if (!rooms) return [];
      
      // Mock recommendation logic - in real app this would be more sophisticated
      return rooms
        .filter(room => !room.is_premium)
        .slice(0, 2)
        .map(room => ({
          room,
          reason: {
            en: `Perfect for your current needs`,
            ar: `مثالي لاحتياجاتك الحالية`
          },
          priority: Math.floor(Math.random() * 100)
        }))
        .sort((a, b) => b.priority - a.priority);
    },
    enabled: !!rooms,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
} 