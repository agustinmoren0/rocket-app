/**
 * Sync Event Logger
 * Logs all sync events to sync_logs table for debugging and auditing
 */

import { supabase } from './supabase'

export interface SyncLogEntry {
  event_type: string
  table_name: string
  record_id: string
  device_id: string
  user_id: string
  timestamp?: string
}

/**
 * Log a sync event to the database
 */
export async function logSyncEvent(data: SyncLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('sync_logs').insert({
      event_type: data.event_type,
      table_name: data.table_name,
      record_id: data.record_id,
      device_id: data.device_id,
      user_id: data.user_id,
      timestamp: data.timestamp || new Date().toISOString(),
    })

    if (error) {
      console.error('❌ Failed to log sync event:', error.message)
      return
    }

    console.log(`✅ Logged ${data.event_type} on ${data.table_name}:${data.record_id}`)
  } catch (err) {
    console.error('❌ Error logging sync event:', err)
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
