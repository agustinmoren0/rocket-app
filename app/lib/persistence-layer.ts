/**
 * Persistence Layer
 * Handles dual-layer persistence: localStorage (offline-first) + Supabase (authenticated users)
 * Ensures realtime sync works for authenticated users across devices
 */

import { supabase } from './supabase'
import { offlineManager } from './offline-manager'
import { logSyncEvent } from './sync-logger'

export interface PersistenceOptions {
  table: string
  data: any
  userId?: string
  deviceId: string
}

export interface PersistenceResult {
  success: boolean
  stored: 'local' | 'both' // 'local' = localStorage only, 'both' = localStorage + Supabase
  error?: string
  recordId?: string
}

/**
 * Persist data to both localStorage and Supabase (if authenticated)
 * This is the main entry point for all data persistence
 */
export async function persistData(options: PersistenceOptions): Promise<PersistenceResult> {
  const { table, data, userId, deviceId } = options

  try {
    // Always save to localStorage first (offline-first principle)
    const localSuccess = await persistToLocal(table, data)
    if (!localSuccess) {
      return {
        success: false,
        stored: 'local',
        error: 'Failed to persist to localStorage',
      }
    }

    // If user is authenticated, also persist to Supabase
    if (userId) {
      const supbaseSuccess = await persistToSupabase(table, data, userId, deviceId)

      return {
        success: true,
        stored: 'both',
        recordId: data.id,
        error: supbaseSuccess ? undefined : 'Queued for later sync (network issue)',
      }
    }

    // Unauthenticated users only have localStorage
    return {
      success: true,
      stored: 'local',
      recordId: data.id,
    }
  } catch (error) {
    console.error(`❌ Persistence error for ${table}:`, error)
    return {
      success: false,
      stored: 'local',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Persist to localStorage (always works, offline-first)
 */
async function persistToLocal(table: string, data: any): Promise<boolean> {
  try {
    const key = `habika_${table}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')

    // Handle both single items and arrays
    let updated: any[]
    if (Array.isArray(existing)) {
      const index = existing.findIndex((item) => item.id === data.id)
      if (index >= 0) {
        existing[index] = { ...existing[index], ...data, updated_at: new Date().toISOString() }
      } else {
        existing.push({ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
      updated = existing
    } else {
      // Object storage (like completions by date)
      updated = { ...existing, ...data }
    }

    localStorage.setItem(key, JSON.stringify(updated))
    console.log(`✅ Persisted to localStorage: ${table}/${data.id}`)
    return true
  } catch (error) {
    console.error(`❌ Local persistence error for ${table}:`, error)
    return false
  }
}

/**
 * Persist to Supabase (for authenticated users)
 * Uses offline queue if network is unavailable
 */
async function persistToSupabase(
  table: string,
  data: any,
  userId: string,
  deviceId: string
): Promise<boolean> {
  try {
    // Ensure required fields
    const record = {
      ...data,
      user_id: userId,
      device_id: deviceId,
      updated_at: new Date().toISOString(),
    }

    // Try to insert/update
    const { data: result, error } = await supabase.from(table).upsert([record], {
      onConflict: 'id',
    })

    if (error) {
      // On network error, queue for later
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.warn(`⚠️ Network error for ${table}, queuing for later sync`)
        offlineManager.queueOperation('update', table, record)
        return true // Return true since we queued it
      }
      throw error
    }

    // Log the sync event
    await logSyncEvent({
      event_type: 'UPSERT',
      table_name: table,
      record_id: data.id,
      device_id: deviceId,
      user_id: userId,
    })

    console.log(`✅ Persisted to Supabase: ${table}/${data.id}`)
    return true
  } catch (error) {
    console.error(`❌ Supabase persistence error for ${table}:`, error)
    // Queue for later if we're in offline mode
    offlineManager.queueOperation('update', table, {
      ...data,
      user_id: userId,
      device_id: deviceId,
    })
    return false
  }
}

/**
 * Update a record (for existing items)
 */
export async function updateRecord(options: PersistenceOptions): Promise<PersistenceResult> {
  return persistData(options)
}

/**
 * Delete a record from both layers
 */
export async function deleteRecord(
  table: string,
  recordId: string,
  userId?: string,
  deviceId?: string
): Promise<PersistenceResult> {
  try {
    // Delete from localStorage
    const key = `habika_${table}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')

    let updated: any
    if (Array.isArray(existing)) {
      updated = existing.filter((item) => item.id !== recordId)
    } else {
      updated = existing
      delete updated[recordId]
    }

    localStorage.setItem(key, JSON.stringify(updated))

    // Delete from Supabase if authenticated
    if (userId && deviceId) {
      const { error } = await supabase.from(table).delete().eq('id', recordId).eq('user_id', userId)

      if (error) {
        console.error(`❌ Error deleting from Supabase: ${error.message}`)
        // Queue deletion
        offlineManager.queueOperation('delete', table, { id: recordId, user_id: userId })
      } else {
        // Log deletion
        await logSyncEvent({
          event_type: 'DELETE',
          table_name: table,
          record_id: recordId,
          device_id: deviceId,
          user_id: userId,
        })
      }
    }

    console.log(`✅ Deleted from storage: ${table}/${recordId}`)
    return {
      success: true,
      stored: userId ? 'both' : 'local',
      recordId,
    }
  } catch (error) {
    console.error(`❌ Delete error for ${table}:`, error)
    return {
      success: false,
      stored: 'local',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Load records from storage (prefers localStorage for speed)
 */
export async function loadRecords(
  table: string,
  userId?: string
): Promise<any[]> {
  try {
    // Load from localStorage (always available, fastest)
    const key = `habika_${table}`
    const local = JSON.parse(localStorage.getItem(key) || '[]')

    // If not authenticated, return local only
    if (!userId) {
      return Array.isArray(local) ? local : [local]
    }

    // If authenticated, could optionally sync with Supabase here
    // For now, return local (realtime will update it)
    return Array.isArray(local) ? local : [local]
  } catch (error) {
    console.error(`❌ Error loading records from ${table}:`, error)
    return []
  }
}

/**
 * Get persistence status (for debugging/monitoring)
 */
export function getPersistenceStatus(): {
  isOnline: boolean
  isAuthenticated: boolean
  localStorageSize: number
  queueSize: number
} {
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isAuthenticated: !!localStorage.getItem('supabase.auth.token'), // Simple check
    localStorageSize: new Blob(Object.values(localStorage)).size,
    queueSize: offlineManager.getQueueSize(),
  }
}
