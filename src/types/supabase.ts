import { SupabaseClient } from '@supabase/supabase-js';

// Supabase client type
export type SupabaseClientType = SupabaseClient<any, 'public', any>;

// Auth types
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  aud: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    [key: string]: any;
  };
  identities?: AuthIdentity[];
  created_at: string;
  updated_at?: string;
}

export interface AuthIdentity {
  id: string;
  user_id: string;
  identity_data?: {
    [key: string]: any;
  };
  provider: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Real-time types
export interface RealtimePayload<T = any> {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  new: T;
  old: T;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

// Storage types
export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

export interface StorageOptions {
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

// Edge Function types
export interface EdgeFunctionResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// RPC (Remote Procedure Call) types
export interface RpcParams {
  [key: string]: any;
}

// Supabase error types
export interface SupabaseError {
  message: string;
  details: string;
  hint: string;
  code: string;
} 