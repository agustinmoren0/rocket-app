/**
 * Sync Event Logger
 * Logs all sync events to sync_logs table for debugging and auditing
 */

import { supabase } from './supabase'

export interface SyncLogEntry {
  event_type: string
  table_name: string
  record_id: string
  device_id?: string // Optional, doesn't exist in actual schema
  user_id: string
  timestamp?: string
}

/**
 * Log a sync event to the database
 * NOTE: sync_logs table schema uses 'action' not 'event_type',
 * and 'data_snapshot' (JSONB) instead of individual fields.
 * For now, sync logging is disabled until the table schema is clarified.
 */
export async function logSyncEvent(data: SyncLogEntry): Promise<void> {
  try {
    // TODO: Re-enable once sync_logs table schema is confirmed
    // The actual schema appears to be:
    // - action (TEXT) - not event_type
    // - table_name (TEXT)
    // - data_snapshot (JSONB) - not individual columns
    // - synced_at (TIMESTAMP) - server-generated

    console.log(`📝 [sync-logger] Would log ${data.event_type} on ${data.table_name}:${data.record_id}`)
    // Silently skip for now - this prevents errors from breaking persistence
  } catch (err) {
    console.error('❌ Error in logSyncEvent:', err)
  }
}

/**
 * Get recent sync logs for a user
 */
export async function getSyncLogs(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Failed to fetch sync logs:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('❌ Error fetching sync logs:', err)
    return []
  }
}

/**
 * Clear old sync logs (older than N days)
 */
export async function clearOldSyncLogs(userId: string, daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { error } = await supabase
      .from('sync_logs')
      .delete()
      .eq('user_id', userId)
      .lt('timestamp', cutoffDate.toISOString())

    if (error) {
      console.error('❌ Failed to clear old logs:', error.message)
      return
    }

    console.log(`✅ Cleared sync logs older than ${daysOld} days`)
  } catch (err) {
    console.error('❌ Error clearing sync logs:', err)
  }
}
