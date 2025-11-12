'use client'

import { useEffect, useState } from 'react'
import { useInitialSync } from '../hooks/useInitialSync'
import { useUser } from '../context/UserContext'

/**
 * UI Component that displays sync status
 * Shows loading spinner during initial sync after login
 * Shows success/error messages
 */
export function SyncStatus() {
  const { isSyncing, isComplete, syncedTables, error } = useInitialSync()
  const { isLoading: isAuthLoading } = useUser()
  const [visible, setVisible] = useState(false)

  // Show sync status for 3 seconds after complete
  useEffect(() => {
    if (isComplete && !error) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, error])

  // Always show if there's an error
  if (error) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
        <p className="font-semibold">❌ Error de sincronización</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  // Show spinner during sync
  if (isSyncing && !isAuthLoading) {
    return (
      <div className="fixed bottom-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded z-50 flex items-center gap-2">
        <div className="animate-spin">⏳</div>
        <span>Sincronizando datos...</span>
      </div>
    )
  }

  // Show success message briefly
  if (visible && isComplete && !error) {
    return (
      <div className="fixed bottom-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-50 animate-fade-out">
        <p className="font-semibold">✅ Sincronización completa</p>
        <p className="text-sm">{syncedTables.length} tablas actualizadas</p>
      </div>
    )
  }

  return null
}
