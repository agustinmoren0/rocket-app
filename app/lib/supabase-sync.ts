import { supabase } from './supabase'

export type SyncState = 'synced' | 'syncing' | 'pending' | 'error'

interface SyncOptions {
  userId: string
  data: {
    habits?: any[]
    completions?: any[]
    activities?: any[]
    cycleData?: any
    reflections?: any[]
    userSettings?: any
  }
}

interface ConflictData {
  local: any
  remote: any
  field: string
}

/**
 * Emits a sync status event that can be listened to by SyncStatus component
 */
export function emitSyncStatus(state: SyncState, message?: string) {
  window.dispatchEvent(
    new CustomEvent('sync-status', {
      detail: { state, message },
    })
  )
}

/**
 * Uploads local data to Supabase
 */
export async function syncToSupabase(options: SyncOptions) {
  const { userId, data } = options

  try {
    emitSyncStatus('syncing', 'Sincronizando cambios...')

    // Sync habits
    if (data.habits && data.habits.length > 0) {
      for (const habit of data.habits) {
        const { error } = await supabase
          .from('habits')
          .upsert({
            id: habit.id,
            user_id: userId,
            name: habit.name,
            frequency: habit.frequency,
            status: habit.status,
            streak: habit.streak || 0,
            created_at: habit.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Error syncing habit:', error)
          throw error
        }
      }
    }

    // Sync completions
    if (data.completions && data.completions.length > 0) {
      for (const completion of data.completions) {
        const { error } = await supabase
          .from('habit_completions')
          .upsert({
            id: completion.id,
            habit_id: completion.habitId,
            user_id: userId,
            completion_date: completion.date,
            status: completion.status || 'completed',
            created_at: completion.createdAt || new Date().toISOString(),
          })

        if (error) {
          console.error('Error syncing completion:', error)
          throw error
        }
      }
    }

    // Sync activities
    if (data.activities && data.activities.length > 0) {
      for (const activity of data.activities) {
        const { error } = await supabase
          .from('activities')
          .upsert({
            id: activity.id,
            user_id: userId,
            name: activity.name,
            duration: activity.duration,
            category: activity.category,
            date: activity.date,
            created_at: activity.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Error syncing activity:', error)
          throw error
        }
      }
    }

    // Sync cycle data
    if (data.cycleData) {
      const { error } = await supabase
        .from('cycle_data')
        .upsert({
          user_id: userId,
          is_active: data.cycleData.isActive || false,
          last_period_start: data.cycleData.lastPeriodStart,
          created_at: data.cycleData.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error syncing cycle data:', error)
        throw error
      }
    }

    // Sync reflections
    if (data.reflections && data.reflections.length > 0) {
      for (const reflection of data.reflections) {
        const { error } = await supabase
          .from('reflections')
          .upsert({
            id: reflection.id,
            user_id: userId,
            date: reflection.date,
            content: reflection.content,
            mood: reflection.mood,
            created_at: reflection.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (error) {
          console.error('Error syncing reflection:', error)
          throw error
        }
      }
    }

    // Sync user settings
    if (data.userSettings) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          notifications_enabled: data.userSettings.notificationsEnabled ?? true,
          created_at: data.userSettings.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error syncing user settings:', error)
        throw error
      }
    }

    emitSyncStatus('synced')
    console.log('✅ Data synced to Supabase successfully')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'
    emitSyncStatus('error', message)
    console.error('❌ Sync error:', error)
    return { success: false, error: message }
  }
}

/**
 * Downloads data from Supabase and merges with local data
 */
export async function fetchFromSupabase(userId: string) {
  try {
    emitSyncStatus('syncing', 'Descargando datos...')

    const [
      { data: habits },
      { data: completions },
      { data: activities },
      { data: cycleData },
      { data: reflections },
      { data: settings },
    ] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId),
      supabase.from('habit_completions').select('*').eq('user_id', userId),
      supabase.from('activities').select('*').eq('user_id', userId),
      supabase.from('cycle_data').select('*').eq('user_id', userId).single(),
      supabase.from('reflections').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    ])

    emitSyncStatus('synced')

    return {
      success: true,
      data: {
        habits: habits || [],
        completions: completions || [],
        activities: activities || [],
        cycleData: cycleData || null,
        reflections: reflections || [],
        settings: settings || null,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed'
    emitSyncStatus('error', message)
    console.error('❌ Fetch error:', error)
    return { success: false, error: message, data: null }
  }
}

/**
 * Resolves conflicts using last-write-wins strategy
 */
export function resolveConflict(conflict: ConflictData): any {
  const localTimestamp = new Date(conflict.local.updated_at || conflict.local.createdAt).getTime()
  const remoteTimestamp = new Date(
    conflict.remote.updated_at || conflict.remote.createdAt
  ).getTime()

  // Last-write-wins: return the data that was updated most recently
  if (remoteTimestamp > localTimestamp) {
    console.log(
      `⚔️ Conflict resolved for ${conflict.field}: using remote version (newer)`
    )
    return conflict.remote
  } else {
    console.log(
      `⚔️ Conflict resolved for ${conflict.field}: using local version (newer)`
    )
    return conflict.local
  }
}

/**
 * Get all local data from localStorage
 */
export function getLocalData() {
  return {
    habits: JSON.parse(localStorage.getItem('habika_custom_habits') || '[]'),
    completions: JSON.parse(localStorage.getItem('habika_completions') || '[]'),
    activities: JSON.parse(localStorage.getItem('habika_activities') || '[]'),
    cycleData: JSON.parse(localStorage.getItem('habika_cycle_data') || 'null'),
    reflections: JSON.parse(localStorage.getItem('habika_reflections') || '[]'),
    settings: {
      theme: localStorage.getItem('habika_theme') || 'lavender',
      zenMode: localStorage.getItem('habika_zen_mode') === 'true',
    },
  }
}

/**
 * Update localStorage with synced data
 */
export function updateLocalStorage(data: any) {
  if (data.habits) {
    localStorage.setItem('habika_custom_habits', JSON.stringify(data.habits))
  }
  if (data.completions) {
    localStorage.setItem('habika_completions', JSON.stringify(data.completions))
  }
  if (data.activities) {
    localStorage.setItem('habika_activities', JSON.stringify(data.activities))
  }
  if (data.cycleData) {
    localStorage.setItem('habika_cycle_data', JSON.stringify(data.cycleData))
  }
  if (data.reflections) {
    localStorage.setItem('habika_reflections', JSON.stringify(data.reflections))
  }
}
