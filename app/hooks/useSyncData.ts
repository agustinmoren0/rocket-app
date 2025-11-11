'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUser } from '@/app/context/UserContext'
import { syncToSupabase, fetchFromSupabase, getLocalData, updateLocalStorage } from '@/app/lib/supabase-sync'

/**
 * Hook that automatically syncs data between localStorage and Supabase
 * Syncs when:
 * - User is Premium (authenticated)
 * - Window regains focus
 * - Network comes online
 * - Every 60 seconds in background
 */
export function useSyncData() {
  const { isPremium, user } = useUser()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)

  const performSync = useCallback(async () => {
    if (!isPremium || !user || isSyncingRef.current) {
      return
    }

    isSyncingRef.current = true

    try {
      // Get local data
      const localData = getLocalData()

      // Sync local changes to Supabase
      await syncToSupabase({
        userId: user.id,
        data: {
          habits: localData.habits,
          completions: localData.completions,
          activities: localData.activities,
          cycleData: localData.cycleData,
          reflections: localData.reflections,
          userSettings: localData.settings,
        },
      })

      // Fetch latest from Supabase
      const result = await fetchFromSupabase(user.id)
      if (result.success && result.data) {
        // Update localStorage with latest data
        updateLocalStorage(result.data)
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      isSyncingRef.current = false
    }
  }, [isPremium, user])

  // Setup sync triggers
  useEffect(() => {
    if (!isPremium) return

    // Sync on window focus
    const handleFocus = () => {
      console.log('🔄 Window focused - syncing...')
      performSync()
    }

    // Sync on online event
    const handleOnline = () => {
      console.log('🔄 Network online - syncing...')
      performSync()
    }

    // Sync periodically (every 60 seconds)
    const startPeriodicSync = () => {
      syncTimeoutRef.current = setInterval(() => {
        console.log('🔄 Periodic sync...')
        performSync()
      }, 60000) // 60 seconds
    }

    // Initial sync
    performSync()
    startPeriodicSync()

    // Listen for focus and online events
    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)

    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current)
      }
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
    }
  }, [isPremium, performSync])
}
