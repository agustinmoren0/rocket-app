'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/app/context/UserContext'
import styles from '@/app/styles/sync-status.module.css'

export type SyncState = 'synced' | 'pending' | 'error' | 'syncing'

interface SyncStatusProps {
  className?: string
}

export default function SyncStatus({ className = '' }: SyncStatusProps) {
  const [syncState, setSyncState] = useState<SyncState>('synced')
  const [message, setMessage] = useState('')
  const { isPremium } = useUser()

  useEffect(() => {
    if (!isPremium) return

    // Listen for sync status events
    const handleSyncStatus = (event: CustomEvent<{ state: SyncState; message?: string }>) => {
      setSyncState(event.detail.state)
      setMessage(event.detail.message || '')
    }

    window.addEventListener('sync-status', handleSyncStatus as EventListener)

    return () => {
      window.removeEventListener('sync-status', handleSyncStatus as EventListener)
    }
  }, [isPremium])

  if (!isPremium) {
    return null
  }

  const statusConfig = {
    synced: {
      icon: '🟢',
      label: 'Sincronizado',
      title: 'Todos los cambios están sincronizados',
    },
    syncing: {
      icon: '🔄',
      label: 'Sincronizando...',
      title: 'Sincronizando cambios con el servidor',
    },
    pending: {
      icon: '🟡',
      label: 'Pendiente',
      title: 'Esperando sincronizar cambios',
    },
    error: {
      icon: '🔴',
      label: 'Error',
      title: message || 'Error al sincronizar',
    },
  }

  const config = statusConfig[syncState]

  return (
    <div
      className={`${styles.syncStatus} ${styles[syncState]} ${className}`}
      title={config.title}
      role="status"
      aria-live="polite"
      aria-label={`Estado de sincronización: ${config.label}`}
    >
      <span className={styles.icon}>{config.icon}</span>
      <span className={styles.label}>{config.label}</span>
    </div>
  )
}
