// Manual database types (will be replaced by generated types later)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          onboarding_completed: boolean;
          preferred_language: 'en' | 'ar';
          subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
          trial_started_at?: string;
          trial_ends_at?: string;
          subscription_started_at?: string;
          subscription_ends_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          onboarding_completed?: boolean;
          preferred_language?: 'en' | 'ar';
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled';
          trial_started_at?: string;
          trial_ends_at?: string;
          subscription_started_at?: string;
          subscription_ends_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          onboarding_completed?: boolean;
          preferred_language?: 'en' | 'ar';
          subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled';
          trial_started_at?: string;
          trial_ends_at?: string;
          subscription_started_at?: string;
          subscription_ends_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_ar: string;
          description_en?: string;
          description_ar?: string;
          type: 'game' | 'conversation' | 'analysis';
          is_premium: boolean;
          is_active: boolean;
          config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_ar: string;
          description_en?: string;
          description_ar?: string;
          type: 'game' | 'conversation' | 'analysis';
          is_premium?: boolean;
          is_active?: boolean;
          config: any;
        };
        Update: {
          id?: string;
          slug?: string;
          name_en?: string;
          name_ar?: string;
          description_en?: string;
          description_ar?: string;
          type?: 'game' | 'conversation' | 'analysis';
          is_premium?: boolean;
          is_active?: boolean;
          config?: any;
        };
      };
      room_sessions: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          status: 'active' | 'completed' | 'abandoned';
          session_data: any;
          game_progress: any;
          current_step: number;
          total_steps?: number;
          completed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          status?: 'active' | 'completed' | 'abandoned';
          session_data?: any;
          game_progress?: any;
          current_step?: number;
          total_steps?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          status?: 'active' | 'completed' | 'abandoned';
          session_data?: any;
          game_progress?: any;
          current_step?: number;
          total_steps?: number;
          completed_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: any;
          tokens_used?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: any;
          tokens_used?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          metadata?: any;
          tokens_used?: number;
        };
      };
      onboarding_responses: {
        Row: {
          id: string;
          user_id: string;
          step_id: string;
          question_id: string;
          response_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_id: string;
          question_id: string;
          response_data: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_id?: string;
          question_id?: string;
          response_data?: any;
        };
      };
      user_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: any;
          session_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data?: any;
          session_id?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: any;
          session_id?: string;
        };
      };
      analysis_results: {
        Row: {
          id: string;
          session_id: string;
          analysis_type: string;
          results: any;
          confidence_score?: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          analysis_type: string;
          results: any;
          confidence_score?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          analysis_type?: string;
          results?: any;
          confidence_score?: number;
        };
      };
    };
  };
}

// Utility types for better DX
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Database convenience types
export type UserProfile = Tables<'user_profiles'>;
export type Room = Tables<'rooms'>;
export type RoomSession = Tables<'room_sessions'>;
export type Message = Tables<'messages'>;
export type OnboardingResponse = Tables<'onboarding_responses'>;
export type UserEvent = Tables<'user_events'>;
export type AnalysisResult = Tables<'analysis_results'>;

// Insert types
export type UserProfileInsert = Inserts<'user_profiles'>;
export type RoomInsert = Inserts<'rooms'>;
export type RoomSessionInsert = Inserts<'room_sessions'>;
export type MessageInsert = Inserts<'messages'>;
export type OnboardingResponseInsert = Inserts<'onboarding_responses'>;
export type UserEventInsert = Inserts<'user_events'>;
export type AnalysisResultInsert = Inserts<'analysis_results'>;

// Update types
export type UserProfileUpdate = Updates<'user_profiles'>;
export type RoomUpdate = Updates<'rooms'>;
export type RoomSessionUpdate = Updates<'room_sessions'>;
export type MessageUpdate = Updates<'messages'>;
export type OnboardingResponseUpdate = Updates<'onboarding_responses'>;
export type UserEventUpdate = Updates<'user_events'>;
export type AnalysisResultUpdate = Updates<'analysis_results'>; 