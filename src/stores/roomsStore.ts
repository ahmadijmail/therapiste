import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { 
  Room, 
  RoomState, 
  RoomFilters, 
  RoomRecommendation,
  Language,
  RoomType 
} from '../types';

interface RoomsStore extends RoomState {
  // Actions
  fetchRooms: () => Promise<void>;
  fetchFeaturedRooms: () => Promise<void>;
  getRecommendations: () => Promise<RoomRecommendation[]>;
  updateFilters: (filters: Partial<RoomFilters>) => void;
  clearFilters: () => void;
  getRoomBySlug: (slug: string) => Room | undefined;
  canAccessRoom: (room: Room) => boolean;
  
  // Computed
  filteredRooms: Room[];
  freeRooms: Room[];
  premiumRooms: Room[];
}

export const useRoomsStore = create<RoomsStore>((set, get) => ({
  // Initial state
  rooms: [],
  featuredRooms: [],
  loading: false,
  error: null,
  filters: {},

  // Fetch all rooms
  fetchRooms: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ rooms: data || [] });
    } catch (error) {
      console.error('Fetch rooms error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rooms' });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch featured rooms (free rooms for discovery)
  fetchFeaturedRooms: async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .eq('is_premium', false)
        .limit(3)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ featuredRooms: data || [] });
    } catch (error) {
      console.error('Fetch featured rooms error:', error);
    }
  },

  // Get personalized room recommendations
  getRecommendations: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      // Basic recommendation logic - can be enhanced with ML/AI later
      const { rooms } = get();
      const language = user.preferred_language;
      
      const recommendations: RoomRecommendation[] = [];

      // Always recommend general chat for new users
      const generalChat = rooms.find(r => r.slug === 'general_chat');
      if (generalChat) {
        recommendations.push({
          room: generalChat,
          reason: {
            en: "Perfect for your first conversation with our AI therapist",
            ar: "مثالي لمحادثتك الأولى مع المعالج الذكي"
          },
          priority: 10
        });
      }

      // Recommend Chinese Cube for personality insights
      const chineseCube = rooms.find(r => r.slug === 'chinese_cube');
      if (chineseCube) {
        recommendations.push({
          room: chineseCube,
          reason: {
            en: "Discover insights about your personality through this engaging game",
            ar: "اكتشف رؤى حول شخصيتك من خلال هذه اللعبة الممتعة"
          },
          priority: 8
        });
      }

      // Recommend mood analysis for regular check-ins
      const moodAnalysis = rooms.find(r => r.slug === 'mood_analysis');
      if (moodAnalysis) {
        recommendations.push({
          room: moodAnalysis,
          reason: {
            en: "Check in with your emotions and track your mental health",
            ar: "تابع مشاعرك وراقب صحتك النفسية"
          },
          priority: 7
        });
      }

      // Sort by priority
      return recommendations.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Get recommendations error:', error);
      return [];
    }
  },

  // Update filters
  updateFilters: (newFilters: Partial<RoomFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} });
  },

  // Get room by slug
  getRoomBySlug: (slug: string) => {
    const { rooms } = get();
    return rooms.find(room => room.slug === slug);
  },

  // Check if user can access room
  canAccessRoom: (room: Room) => {
    if (!room.is_premium) return true;
    
    const { canAccessPremiumFeatures } = useAuthStore.getState();
    return canAccessPremiumFeatures();
  },

  // Computed: Filtered rooms
  get filteredRooms() {
    const { rooms, filters } = get();
    let filtered = rooms;

    if (filters.type) {
      filtered = filtered.filter(room => room.type === filters.type);
    }

    if (filters.isPremium !== undefined) {
      filtered = filtered.filter(room => room.is_premium === filters.isPremium);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(room => 
        room.name_en.toLowerCase().includes(query) ||
        room.name_ar.toLowerCase().includes(query) ||
        room.description_en?.toLowerCase().includes(query) ||
        room.description_ar?.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  // Computed: Free rooms
  get freeRooms() {
    const { rooms } = get();
    return rooms.filter(room => !room.is_premium);
  },

  // Computed: Premium rooms
  get premiumRooms() {
    const { rooms } = get();
    return rooms.filter(room => room.is_premium);
  },
}));

// Helper function to get localized room name
export const getRoomName = (room: Room, language: Language = 'en') => {
  return language === 'ar' ? room.name_ar : room.name_en;
};

// Helper function to get localized room description
export const getRoomDescription = (room: Room, language: Language = 'en') => {
  const description = language === 'ar' ? room.description_ar : room.description_en;
  return description || '';
};

// Helper function to get room type display name
export const getRoomTypeDisplayName = (type: RoomType, language: Language = 'en') => {
  const typeNames = {
    game: { en: 'Game', ar: 'لعبة' },
    conversation: { en: 'Chat', ar: 'محادثة' },
    analysis: { en: 'Analysis', ar: 'تحليل' }
  };
  
  return typeNames[type][language];
}; 