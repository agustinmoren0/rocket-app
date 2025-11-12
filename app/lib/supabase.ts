import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: SupabaseClient | null = null

// Lazy-initialized Supabase client - only created when actually needed
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Export a proxy object that matches the expected interface
export const supabase = {
  auth: {
    getSession: async () => {
      const client = getSupabaseClient()
      if (!client) {
        return { data: { session: null }, error: new Error('Supabase not configured') }
      }
      return client.auth.getSession()
    },
    signUp: async (options: any) => {
      const client = getSupabaseClient()
      if (!client) {
        return { data: null, error: new Error('Supabase not configured') }
      }
      return client.auth.signUp(options)
    },
    signInWithPassword: async (credentials: any) => {
      const client = getSupabaseClient()
      if (!client) {
        return { data: null, error: new Error('Supabase not configured') }
      }
      return client.auth.signInWithPassword(credentials)
    },
    signOut: async () => {
      const client = getSupabaseClient()
      if (!client) {
        return { error: new Error('Supabase not configured') }
      }
      return client.auth.signOut()
    },
    onAuthStateChange: (callback: any) => {
      const client = getSupabaseClient()
      if (!client) {
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      }
      return client.auth.onAuthStateChange(callback)
    },
  } as any,
  from: (table: string) => {
    const client = getSupabaseClient()
    if (!client) {
      return {
        select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      } as any
    }
    return client.from(table)
  },
  channel: (name: string) => {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase not configured - realtime subscriptions unavailable')
    }
    return client.channel(name)
  },
} as any

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
