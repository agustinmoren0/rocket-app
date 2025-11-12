/**
 * Storage Cleanup Utilities
 * Cleans invalid data from localStorage and offline queue
 */

import { offlineManager } from './offline-manager'

export function cleanupInvalidData(): {
  activitiesCleaned: number
  operationsCleaned: number
  totalCleaned: number
} {
  console.log('🧹 Starting storage cleanup...')

  let totalCleaned = 0

  // 1. Clean activities without unit from localStorage
  const activitiesKey = 'habika_activities'
  const activitiesStr = localStorage.getItem(activitiesKey)
  let activitiesCleaned = 0

  if (activitiesStr) {
    try {
      const activities = JSON.parse(activitiesStr)
      if (Array.isArray(activities)) {
        const beforeCount = activities.length
        const cleaned = activities.filter(
          (a) => a.unit && a.unit !== null && a.unit !== undefined
        )
        activitiesCleaned = beforeCount - cleaned.length
        if (activitiesCleaned > 0) {
          localStorage.setItem(activitiesKey, JSON.stringify(cleaned))
          console.log(`🗑️ Removed ${activitiesCleaned} activities without unit`)
          totalCleaned += activitiesCleaned
        }
      }
    } catch (e) {
      console.error('Error cleaning activities:', e)
    }
  }

  // 2. Clean offline queue - remove invalid operations
  const operationsCleaned = offlineManager.clearInvalidOperations() || 0
  totalCleaned += operationsCleaned

  console.log(`✅ Cleanup complete: ${totalCleaned} invalid records removed`)

  return {
    activitiesCleaned,
    operationsCleaned,
    totalCleaned,
  }
}

/**
 * Export cleanup function to window for manual execution
 * Usage in browser console: window.habika.cleanupStorage()
 */
if (typeof window !== 'undefined') {
  (window as any).habika = (window as any).habika || {}
  ;(window as any).habika.cleanupStorage = cleanupInvalidData
}
