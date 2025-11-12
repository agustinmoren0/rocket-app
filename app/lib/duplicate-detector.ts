/**
 * Duplicate Detection and Data Reconciliation
 * Prevents duplicates from multi-device syncing and handles conflicts
 * Tracks device IDs and timestamps for intelligent conflict resolution
 */

import { supabase } from './supabase'

export interface DuplicateCheck {
  table: string
  record_id: string
  device_id: string
  timestamp: string
  is_duplicate: boolean
  reason?: string
}

export interface ConflictResolution {
  record_id: string
  table: string
  winner: 'remote' | 'local' | 'merge'
  reason: string
  resolved_at: string
}

class DuplicateDetector {
  // In-memory cache of recently seen events (5 minute window)
  private recentEvents: Map<string, { timestamp: number; deviceId: string }> = new Map()
  private readonly RECENT_WINDOW_MS = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Clean up old entries every minute
    setInterval(() => this.cleanupOldEntries(), 60 * 1000)
  }

  /**
   * Check if an event is likely a duplicate
   */
  async checkForDuplicate(
    table: string,
    recordId: string,
    deviceId: string,
    timestamp: string
  ): Promise<boolean> {
    const eventKey = `${table}:${recordId}:${deviceId}`
    const eventTime = new Date(timestamp).getTime()
    const now = Date.now()

    // Check in-memory cache first (very fast)
    if (this.recentEvents.has(eventKey)) {
      const cached = this.recentEvents.get(eventKey)!
      const timeDiff = now - cached.timestamp

      // If we've seen this exact event within 5 minutes, it's a duplicate
      if (timeDiff < this.RECENT_WINDOW_MS && cached.deviceId === deviceId) {
        console.log(`⚠️ Duplicate detected (cached): ${table}:${recordId} from ${deviceId}`)
        return true
      }
    }

    // Check against sync_logs for other devices creating the same record
    try {
      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('table_name', table)
        .eq('record_id', recordId)
        .neq('device_id', deviceId) // Different device
        .gte('timestamp', new Date(eventTime - 10000).toISOString()) // Within 10 seconds
        .lte('timestamp', new Date(eventTime + 10000).toISOString())
        .order('timestamp', { ascending: true })
        .limit(1)

      if (error) {
        console.warn('⚠️ Error checking sync logs:', error.message)
        return false // Assume not duplicate on query failure
      }

      // If another device created this record very close in time, it might be a duplicate
      if (logs && logs.length > 0) {
        const otherLog = logs[0]
        const timeDiff = Math.abs(
          new Date(timestamp).getTime() - new Date(otherLog.timestamp).getTime()
        )

        // If within 5 seconds and both are INSERTs, likely a duplicate
        if (timeDiff < 5000 && otherLog.event_type === 'INSERT') {
          console.log(
            `⚠️ Potential duplicate detected: ${table}:${recordId} from ${otherLog.device_id} (${timeDiff}ms apart)`
          )

          // Log as duplicate
          await this.logDuplicate(table, recordId, deviceId, 'other_device_created_similar_record')

          return true
        }
      }

      // Add to in-memory cache
      this.recentEvents.set(eventKey, { timestamp: now, deviceId })

      return false
    } catch (error) {
      console.error('❌ Duplicate detection error:', error)
      return false
    }
  }

  /**
   * Resolve conflict between two versions of the same record
   * Uses: last_write_wins (most recent timestamp), with device_id as tiebreaker
   */
  async resolveConflict(
    table: string,
    recordId: string,
    localData: any,
    remoteData: any,
    localDeviceId: string
  ): Promise<ConflictResolution> {
    const localTime = localData.updated_at || localData.created_at
    const remoteTime = remoteData.updated_at || remoteData.created_at

    const localTimeMs = new Date(localTime).getTime()
    const remoteTimeMs = new Date(remoteTime).getTime()
    const timeDiff = Math.abs(localTimeMs - remoteTimeMs)

    let winner: 'remote' | 'local' | 'merge'
    let reason: string

    if (timeDiff > 1000) {
      // If more than 1 second apart, use last-write-wins
      if (remoteTimeMs > localTimeMs) {
        winner = 'remote'
        reason = 'remote_more_recent'
      } else {
        winner = 'local'
        reason = 'local_more_recent'
      }
    } else {
      // If within 1 second, use device_id as tiebreaker (deterministic)
      if (remoteData.device_id > localDeviceId) {
        winner = 'remote'
        reason = 'timestamp_tie_device_id_wins'
      } else {
        winner = 'local'
        reason = 'timestamp_tie_local_device_id_wins'
      }
    }

    const resolution: ConflictResolution = {
      record_id: recordId,
      table,
      winner,
      reason,
      resolved_at: new Date().toISOString(),
    }

    // Log conflict resolution
    await this.logConflictResolution(resolution)

    console.log(`🔄 Conflict resolved for ${table}:${recordId} - winner: ${winner} (${reason})`)

    return resolution
  }

  /**
   * Merge two record versions intelligently
   * Keeps non-conflicting fields from both, winner for conflicting fields
   */
  mergeRecords(localData: any, remoteData: any, winner: 'local' | 'remote'): any {
    const merged = { ...remoteData }

    // For all fields in local, check if they differ from remote
    for (const [key, localValue] of Object.entries(localData)) {
      if (key === 'id' || key === 'user_id') continue // Skip ID fields

      const remoteValue = remoteData[key]

      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        // Conflicting field - use winner's version
        if (winner === 'local') {
          merged[key] = localValue
        }
        // If remote wins, we keep remote's value (already in merged)
      }
    }

    return merged
  }

  /**
   * Log duplicate detection
   */
  private async logDuplicate(
    table: string,
    recordId: string,
    deviceId: string,
    reason: string
  ): Promise<void> {
    try {
      // Insert into sync_logs with duplicate marker
      await supabase.from('sync_logs').insert({
        event_type: 'DUPLICATE',
        table_name: table,
        record_id: recordId,
        device_id: deviceId,
        user_id: await this.getCurrentUserId(),
        timestamp: new Date().toISOString(),
      })

      console.log(`📋 Logged duplicate: ${table}:${recordId}`)
    } catch (error) {
      console.error('❌ Error logging duplicate:', error)
    }
  }

  /**
   * Log conflict resolution
   */
  private async logConflictResolution(resolution: ConflictResolution): Promise<void> {
    try {
      await supabase.from('sync_logs').insert({
        event_type: 'CONFLICT_RESOLVED',
        table_name: resolution.table,
        record_id: resolution.record_id,
        device_id: 'conflict-resolver', // System event
        user_id: await this.getCurrentUserId(),
        timestamp: resolution.resolved_at,
        metadata: {
          winner: resolution.winner,
          reason: resolution.reason,
        },
      })

      console.log(`📋 Logged conflict resolution for ${resolution.table}:${resolution.record_id}`)
    } catch (error) {
      console.error('❌ Error logging conflict resolution:', error)
    }
  }

  /**
   * Validate data consistency across devices
   * Checks for orphaned records, missing references, etc.
   */
  async validateDataConsistency(userId: string, table: string): Promise<{
    valid: boolean
    issues: string[]
    timestamp: string
  }> {
    const issues: string[] = []

    try {
      // Get all records for this user in the table
      const { data: records, error: recordError } = await supabase
        .from(table)
        .select('id, user_id, created_at, updated_at')
        .eq('user_id', userId)

      if (recordError) {
        issues.push(`Failed to fetch records: ${recordError.message}`)
        return { valid: false, issues, timestamp: new Date().toISOString() }
      }

      if (!records) {
        return { valid: true, issues: [], timestamp: new Date().toISOString() }
      }

      // Check for duplicate IDs (shouldn't happen, but good to verify)
      const ids = records.map((r: any) => r.id)
      const uniqueIds = new Set(ids)

      if (ids.length !== uniqueIds.size) {
        issues.push(`Found duplicate IDs in ${table}`)
      }

      // Check for orphaned records (should have valid user_id)
      const orphaned = records.filter((r: any) => !r.user_id)
      if (orphaned.length > 0) {
        issues.push(`Found ${orphaned.length} orphaned records in ${table}`)
      }

      // Check for future timestamps (likely clock skew)
      const now = Date.now()
      const futureRecords = records.filter(
        (r: any) => new Date(r.created_at).getTime() > now + 60000
      ) // More than 1 minute in future
      if (futureRecords.length > 0) {
        issues.push(`Found ${futureRecords.length} records with future timestamps`)
      }

      console.log(`✅ Consistency check for ${table}: ${issues.length > 0 ? issues.join(', ') : 'OK'}`)

      return {
        valid: issues.length === 0,
        issues,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`❌ Consistency check error for ${table}:`, error)
      return {
        valid: false,
        issues: [`Error during consistency check: ${error instanceof Error ? error.message : String(error)}`],
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Get duplicate statistics for a user
   */
  async getDuplicateStats(userId: string): Promise<{
    total_duplicates: number
    by_table: Record<string, number>
    last_24h: number
    last_7d: number
  }> {
    try {
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const { data: logs, error } = await supabase
        .from('sync_logs')
        .select('table_name, timestamp')
        .eq('user_id', userId)
        .eq('event_type', 'DUPLICATE')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('❌ Error fetching duplicate stats:', error)
        return { total_duplicates: 0, by_table: {}, last_24h: 0, last_7d: 0 }
      }

      if (!logs) {
        return { total_duplicates: 0, by_table: {}, last_24h: 0, last_7d: 0 }
      }

      const stats = {
        total_duplicates: logs.length,
        by_table: {} as Record<string, number>,
        last_24h: 0,
        last_7d: 0,
      }

      logs.forEach((log: any) => {
        stats.by_table[log.table_name] = (stats.by_table[log.table_name] || 0) + 1

        const logTime = new Date(log.timestamp)
        if (logTime >= last24h) stats.last_24h++
        if (logTime >= last7d) stats.last_7d++
      })

      return stats
    } catch (error) {
      console.error('❌ Error getting duplicate stats:', error)
      return { total_duplicates: 0, by_table: {}, last_24h: 0, last_7d: 0 }
    }
  }

  /**
   * Clean up old entries from in-memory cache
   */
  private cleanupOldEntries(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, value] of this.recentEvents.entries()) {
      if (now - value.timestamp > this.RECENT_WINDOW_MS) {
        this.recentEvents.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old entries from duplicate cache`)
    }
  }

  /**
   * Get current user ID from session
   */
  private async getCurrentUserId(): Promise<string> {
    try {
      const { data } = await supabase.auth.getSession()
      return data.session?.user?.id || 'unknown'
    } catch {
      return 'unknown'
    }
  }
}

// Singleton instance
export const duplicateDetector = new DuplicateDetector()
