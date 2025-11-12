import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with fallback for build time (will fail gracefully at runtime if env vars missing)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Validate at runtime when actually needed (not during build)
export function validateSupabaseConfig(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase environment variables are not configured. Cloud sync features will not work.')
    return false
  }
  return true
}

// Type definitions for database
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string
          email: string
          avatar_url?: string
          theme: string
          zen_mode: boolean
          created_at: string
          updated_at: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          frequency: string
          status: string
          created_at: string
          updated_at: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          name: string
          duration: number
          category: string
          date: string
          created_at: string
          updated_at: string
        }
      }
      cycle_data: {
        Row: {
          id: string
          user_id: string
          is_active: boolean
          last_period_start?: string
          created_at: string
          updated_at: string
        }
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          date: string
          content: string
          mood?: string
          created_at: string
          updated_at: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
