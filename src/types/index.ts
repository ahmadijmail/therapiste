// ============================================================================
// DATABASE MODELS
// ============================================================================

export interface User {
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
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  step_id: string;
  question_id: string;
  response_data: Record<string, any>;
  created_at: string;
}

export interface Room {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  type: RoomType;
  is_premium: boolean;
  is_active: boolean;
  config: RoomConfig;
  created_at: string;
  updated_at: string;
}

export interface RoomSession {
  id: string;
  user_id: string;
  room_id: string;
  status: SessionStatus;
  session_data: Record<string, any>;
  game_progress: Record<string, any>;
  current_step: number;
  total_steps?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  room?: Room;
  messages?: Message[];
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, any>;
  tokens_used?: number;
  created_at: string;
}

export interface UserEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  session_id: string;
  analysis_type: string;
  results: Record<string, any>;
  confidence_score?: number;
  created_at: string;
}

// ============================================================================
// ENUMS & UNION TYPES
// ============================================================================

export type RoomType = 'game' | 'conversation' | 'analysis';
export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type MessageRole = 'user' | 'assistant' | 'system';
export type Language = 'en' | 'ar';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

// ============================================================================
// ROOM CONFIGURATION TYPES
// ============================================================================

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface RoomConfig {
  systemPrompt: LocalizedText;
  gameConfig?: GameConfig;
  conversationConfig?: ConversationConfig;
  analysisConfig?: AnalysisConfig;
}

export interface GameConfig {
  questions: GameQuestion[];
  totalSteps: number;
  analysisPrompt: string;
  resultCategories: string[];
  resultTemplate?: string;
  assessmentFrameworks?: string[];
  totalQuestions?: number;
  estimatedDuration?: string;
  resultDepth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface GameQuestion {
  id: string;
  text: LocalizedText;
  type: 'text' | 'multiple_choice' | 'scale' | 'boolean';
  options?: string[];
  analysisKey: string;
  required?: boolean;
}

export interface ConversationConfig {
  maxMessages: number;
  enableEmotionDetection: boolean;
  enableCrisisDetection: boolean;
  suggestedTopics: {
    en: string[];
    ar: string[];
  };
}

export interface AnalysisConfig {
  moodCategories: string[];
  assessmentQuestions: AssessmentQuestion[];
  generateRecommendations: boolean;
  trackMoodHistory: boolean;
}

export interface AssessmentQuestion {
  id: string;
  text: LocalizedText;
  type?: 'text' | 'scale' | 'multiple_choice';
  options?: string[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  questions: OnboardingQuestion[];
  canSkip?: boolean;
}

export interface OnboardingQuestion {
  id: string;
  text: LocalizedText;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  options?: OnboardingOption[];
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface OnboardingOption {
  id: string;
  text: LocalizedText;
  icon?: string;
  value: any;
}

export interface OnboardingState {
  currentStep: number;
  responses: Record<string, any>;
  completed: boolean;
  loading: boolean;
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatState {
  sessions: Record<string, RoomSession>;
  activeSessionId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  typing: boolean;
  error: string | null;
}

export interface SendMessageParams {
  sessionId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionParams {
  roomId: string;
  initialMessage?: string;
}

// ============================================================================
// ROOM TYPES
// ============================================================================

export interface RoomState {
  rooms: Room[];
  featuredRooms: Room[];
  loading: boolean;
  error: string | null;
  filters: RoomFilters;
}

export interface RoomFilters {
  type?: RoomType;
  isPremium?: boolean;
  language?: Language;
  searchQuery?: string;
}

export interface RoomRecommendation {
  room: Room;
  reason: LocalizedText;
  priority: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface UserAnalytics {
  totalSessions: number;
  completedSessions: number;
  favoriteRoomType: RoomType;
  averageSessionDuration: number;
  moodTrends: MoodTrend[];
  usagePattern: UsagePattern;
}

export interface MoodTrend {
  date: string;
  mood: string;
  score: number;
}

export interface UsagePattern {
  dailyUsage: Record<string, number>;
  weeklyUsage: Record<string, number>;
  peakHours: number[];
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface SubscriptionState {
  status: SubscriptionStatus;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  canAccessPremium: boolean;
  daysRemaining?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: LocalizedText[];
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  sessionReminders: boolean;
  dailyCheckins: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  crashReporting: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField {
  name: string;
  label: LocalizedText;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  placeholder?: LocalizedText;
  required?: boolean;
  validation?: ValidationRule[];
  options?: Array<{ label: LocalizedText; value: any }>;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: LocalizedText;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: LocalizedText;
  message: LocalizedText;
  action?: {
    label: LocalizedText;
    onPress: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// AI/LLM TYPES
// ============================================================================

export interface AIResponse {
  content: string;
  tokens_used: number;
  model: string;
  confidence?: number;
  emotion_detected?: string;
  crisis_detected?: boolean;
  recommendations?: string[];
}

export interface AIRequestParams {
  messages: Array<{ role: MessageRole; content: string }>;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  userId: string;
  sessionId: string;
  roomType: RoomType;
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './database';
export * from './supabase'; 