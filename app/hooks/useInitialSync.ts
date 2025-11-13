/**
 * Hook para sincronización inicial después de login
 * Se ejecuta automáticamente cuando un usuario se autentica
 */

import { useEffect, useState, useCallback } from 'react'
import { performInitialSync, recordSyncTime } from '../lib/initial-sync'
import { useUser } from '../context/UserContext'

export interface SyncState {
  isSyncing: boolean
  isComplete: boolean
  syncedTables: string[]
  error: string | null
  lastSyncTime: string | null
}

const initialState: SyncState = {
  isSyncing: false,
  isComplete: false,
  syncedTables: [],
  error: null,
  lastSyncTime: null,
}

/**
 * Hook que maneja sincronización inicial
 * Se ejecuta solo después de login y solo una vez
 */
export function useInitialSync() {
  const { user, isLoading } = useUser()
  const [syncState, setSyncState] = useState<SyncState>(initialState)

  // Flag to track if sync has been attempted for this user
  const [lastSyncedUserId, setLastSyncedUserId] = useState<string | null>(null)

  const performSync = useCallback(async (userId: string) => {
    // Skip if we already synced for this user in this session
    if (lastSyncedUserId === userId) {
      return
    }

    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      error: null,
    }))

    try {
      // Get or create device ID
      let deviceId = localStorage.getItem('device_id')
      if (!deviceId) {
        deviceId = `device_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('device_id', deviceId)
      }

      // Perform initial sync
      const result = await performInitialSync({ userId, deviceId })

      if (result.success) {
        recordSyncTime()

        setSyncState({
          isSyncing: false,
          isComplete: true,
          syncedTables: result.syncedTables,
          error: null,
          lastSyncTime: new Date().toISOString(),
        })

        console.log('✅ Initial sync completed successfully')

        // Emit event so components can reload data (fixes race condition)
        window.dispatchEvent(new CustomEvent('habika-initial-sync-complete', {
          detail: { syncedTables: result.syncedTables }
        }))

        // Mark this user as synced
        setLastSyncedUserId(userId)
      } else {
        throw new Error(result.error || 'Unknown sync error')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        error: message,
      }))

      console.error('❌ Initial sync failed:', message)
    }
  }, [lastSyncedUserId])

  // Trigger sync after user logs in
  useEffect(() => {
    if (!isLoading && user?.id) {
      performSync(user.id)
    }
  }, [user?.id, isLoading, performSync])

  return syncState
}
