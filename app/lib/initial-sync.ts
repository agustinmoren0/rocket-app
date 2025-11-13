/**
 * Initial Sync Manager
 * Handles intelligent data synchronization on login
 * Merges cloud data with local data using last-write-wins strategy
 */

import { supabase } from './supabase'
import { notifyDataChange } from './storage-utils'

export interface InitialSyncOptions {
  userId: string
  deviceId: string
}

export interface SyncConflict {
  table: string
  recordId: string
  local: any
  remote: any
  resolution: 'local' | 'remote'
}

/**
 * Execute initial synchronization after login
 * Downloads all user data from Supabase and merges with local
 */
export async function performInitialSync(options: InitialSyncOptions): Promise<{
  success: boolean
  syncedTables: string[]
  conflicts: SyncConflict[]
  error?: string
}> {
  const { userId, deviceId } = options

  console.log('🔄 Starting initial sync...')

  try {
    const conflicts: SyncConflict[] = []
    const syncedTables: string[] = []

    // Sync activities
    const activitiesResult = await syncTable({
      table: 'activities',
      userId,
      deviceId,
      conflicts,
    })
    if (activitiesResult) {
      syncedTables.push('activities')
      // Convert habika_activities (flat list) to habika_activities_today (by date)
      const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]')
      const activitiesByDate: { [date: string]: any[] } = {}
      activities.forEach((act: any) => {
        const date = act.date || new Date().toISOString().split('T')[0]
        if (!activitiesByDate[date]) {
          activitiesByDate[date] = []
        }
        activitiesByDate[date].push(act)
      })
      localStorage.setItem('habika_activities_today', JSON.stringify(activitiesByDate))
      console.log(`📅 Converted activities to by-date format: ${Object.keys(activitiesByDate).length} dates`)
    }

    // Sync cycle data
    const cycleResult = await syncTable({
      table: 'cycle_data',
      userId,
      deviceId,
      conflicts,
    })
    if (cycleResult) syncedTables.push('cycle_data')

    // Sync period history
    const periodResult = await syncTable({
      table: 'period_history',
      userId,
      deviceId,
      conflicts,
    })
    if (periodResult) syncedTables.push('period_history')

    // Sync habits (if table exists)
    const habitsResult = await syncTable({
      table: 'habits',
      userId,
      deviceId,
      conflicts,
    })
    if (habitsResult) syncedTables.push('habits')

    // Sync habit completions (if table exists)
    const completionsResult = await syncTable({
      table: 'habit_completions',
      userId,
      deviceId,
      conflicts,
    })
    if (completionsResult) syncedTables.push('habit_completions')

    // Sync reflections (if table exists)
    const reflectionsResult = await syncTable({
      table: 'reflections',
      userId,
      deviceId,
      conflicts,
    })
    if (reflectionsResult) syncedTables.push('reflections')

    // Notify listeners that data has changed
    notifyDataChange()

    console.log(
      `✅ Initial sync complete. Synced: ${syncedTables.join(', ')}. Conflicts: ${conflicts.length}`
    )

    return {
      success: true,
      syncedTables,
      conflicts,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Initial sync failed:', message)
    return {
      success: false,
      syncedTables: [],
      conflicts: [],
      error: message,
    }
  }
}

/**
 * Sync a single table: merge remote data with local using smart conflict resolution
 */
async function syncTable(options: {
  table: string
  userId: string
  deviceId: string
  conflicts: SyncConflict[]
}): Promise<boolean> {
  const { table, userId, deviceId, conflicts } = options

  try {
    // Get local data (handle special keys for habits)
    const localKey = table === 'habits' ? 'habika_custom_habits' : `habika_${table}`
    const localDataStr = localStorage.getItem(localKey)
    const localData = localDataStr ? JSON.parse(localDataStr) : []
    const localArray = Array.isArray(localData) ? localData : [localData].filter(Boolean)

    // Fetch remote data from Supabase
    let remoteData: any[] = []
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)

      if (error) {
        // Table might not exist or user has no data - that's OK
        console.log(`ℹ️ No data in ${table} or table not accessible:`, error.message)
        return false
      }

      remoteData = Array.isArray(data) ? data : data ? [data] : []
    } catch (e) {
      // Network error or table doesn't exist - use local only
      console.log(`⚠️ Could not fetch ${table} from Supabase, using local data only`)
      return false
    }

    // Merge local and remote data
    const merged = mergeData(localArray, remoteData, { table, userId, conflicts })

    // Update localStorage with merged data
    localStorage.setItem(localKey, JSON.stringify(merged))

    console.log(`✅ Synced ${table}: ${merged.length} records (${localArray.length} local + ${remoteData.length} remote)`)

    return true
  } catch (error) {
    console.error(`❌ Error syncing ${table}:`, error)
    return false
  }
}

/**
 * Smart merge strategy:
 * 1. Keep all local records not on remote (local-only)
 * 2. Keep all remote records not on local (remote-only)
 * 3. For records present in both, use last-write-wins (based on updated_at)
 */
function mergeData(
  local: any[],
  remote: any[],
  options: { table: string; userId: string; conflicts: SyncConflict[] }
): any[] {
  const { table, conflicts } = options

  // Create maps for O(1) lookup
  const localMap = new Map(local.map((item) => [item.id, item]))
  const remoteMap = new Map(remote.map((item) => [item.id, item]))

  const merged = new Map<string, any>()

  // Process all local records
  for (const [id, localRecord] of localMap) {
    if (remoteMap.has(id)) {
      // Record exists in both - use last-write-wins
      const remoteRecord = remoteMap.get(id)!
      const localTime = new Date(localRecord.updated_at || localRecord.created_at || 0).getTime()
      const remoteTime = new Date(remoteRecord.updated_at || remoteRecord.created_at || 0).getTime()

      if (remoteTime > localTime) {
        // Remote is newer
        merged.set(id, remoteRecord)
        conflicts.push({
          table,
          recordId: id,
          local: localRecord,
          remote: remoteRecord,
          resolution: 'remote',
        })
        console.log(`⚔️ Conflict in ${table}/${id}: used remote (newer)`)
      } else {
        // Local is newer or equal (prefer local to preserve user's most recent work)
        merged.set(id, localRecord)
        conflicts.push({
          table,
          recordId: id,
          local: localRecord,
          remote: remoteRecord,
          resolution: 'local',
        })
        console.log(`⚔️ Conflict in ${table}/${id}: used local (newer or equal)`)
      }
    } else {
      // Only in local - keep it
      merged.set(id, localRecord)
    }
  }

  // Add all remote records not in local
  for (const [id, remoteRecord] of remoteMap) {
    if (!localMap.has(id)) {
      merged.set(id, remoteRecord)
    }
  }

  return Array.from(merged.values())
}

/**
 * Reset local data to remote (useful for "sync from cloud" option)
 */
export async function resetLocalToRemote(userId: string, table: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error(`Error fetching ${table}:`, error)
      return false
    }

    const localKey = `habika_${table}`
    localStorage.setItem(localKey, JSON.stringify(data || []))

    console.log(`✅ Reset ${table} from cloud`)
    return true
  } catch (error) {
    console.error(`Error resetting ${table}:`, error)
    return false
  }
}

/**
 * Get sync status for UI display
 */
export function getSyncStatus(): {
  isOnline: boolean
  lastSyncTime: string | null
} {
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTime: localStorage.getItem('habika_last_sync'),
  }
}

/**
 * Record sync completion time
 */
export function recordSyncTime(): void {
  localStorage.setItem('habika_last_sync', new Date().toISOString())
}
