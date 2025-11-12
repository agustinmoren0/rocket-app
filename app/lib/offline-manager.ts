/**
 * Offline-First Manager
 * Handles network state, queuing changes during offline periods,
 * and syncing when connection is restored
 */

import { supabase } from './supabase'
import { emitSyncStatus } from './supabase-sync'

export interface OfflineOperation {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
  retries: number
}

const OFFLINE_OPERATIONS_KEY = 'habika_offline_operations'
const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

class OfflineManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  private queue: OfflineOperation[] = []
  private isProcessing: boolean = false
  private retryTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    if (typeof window === 'undefined') return // SSR safety
    this.loadQueue()
    this.setupListeners()
  }

  /**
   * Setup online/offline event listeners
   */
  private setupListeners() {
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  /**
   * Handle when device comes online
   */
  private handleOnline() {
    console.log('📡 Device came online')
    this.isOnline = true
    emitSyncStatus('syncing', 'Sincronizando cambios pendientes...')
    this.processQueue()
  }

  /**
   * Handle when device goes offline
   */
  private handleOffline() {
    console.log('📡 Device went offline')
    this.isOnline = false
    emitSyncStatus('pending', 'Sin conexión - cambios en cola')
  }

  /**
   * Check if currently online
   */
  public getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Add operation to queue for later sync
   */
  public queueOperation(
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ): void {
    const operation: OfflineOperation = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    }

    this.queue.push(operation)
    this.saveQueue()

    console.log(`📝 Queued ${type} on ${table}:`, operation.id)
  }

  /**
   * Process all queued operations
   */
  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) {
      return
    }

    this.isProcessing = true

    try {
      // First, clear any operations that have failed too many times
      const beforeCount = this.queue.length
      this.queue = this.queue.filter((op) => op.retries < MAX_RETRIES)
      const clearedCount = beforeCount - this.queue.length

      if (clearedCount > 0) {
        console.log(`🗑️ Removed ${clearedCount} operations that failed ${MAX_RETRIES} times`)
        this.saveQueue()
      }

      const operations = [...this.queue]

      for (const operation of operations) {
        await this.processOperation(operation)
      }

      // Clear successful operations (marked for deletion after processing)
      this.queue = this.queue.filter((op) => op.retries < MAX_RETRIES)
      this.saveQueue()

      if (this.queue.length === 0) {
        emitSyncStatus('synced')
        console.log('✅ All queued operations synced')
      } else {
        console.log(`⚠️ ${this.queue.length} operations failed, will retry`)
        emitSyncStatus('pending', `${this.queue.length} cambios pendientes`)
      }
    } catch (error) {
      console.error('Error processing queue:', error)
      emitSyncStatus('error', 'Error al sincronizar')
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Validate operation data before syncing
   */
  private isValidOperation(operation: OfflineOperation): boolean {
    const { table, data } = operation

    // Activities must have unit field (not null)
    if (table === 'activities') {
      if (!data.unit || data.unit === null || data.unit === undefined) {
        console.warn(`🗑️ Removing invalid activity operation ${operation.id} - missing unit`)
        return false
      }
    }

    // Habits must have UUID id (not string like "habit_1234")
    if (table === 'habits') {
      if (!data.id || typeof data.id !== 'string' || data.id.startsWith('habit_')) {
        console.warn(`🗑️ Removing invalid habit operation ${operation.id} - invalid ID format`)
        return false
      }
    }

    return true
  }

  /**
   * Process single operation with retry logic
   */
  private async processOperation(operation: OfflineOperation): Promise<void> {
    try {
      const { type, table, data } = operation

      // Validate operation data
      if (!this.isValidOperation(operation)) {
        // Skip invalid operations
        this.queue = this.queue.filter((op) => op.id !== operation.id)
        return
      }

      let error

      if (type === 'create' || type === 'update') {
        const result = await supabase.from(table).upsert(data)
        error = result.error
      } else if (type === 'delete') {
        const result = await supabase.from(table).delete().eq('id', data.id)
        error = result.error
      }

      if (error) {
        throw error
      }

      // Remove from queue on success
      this.queue = this.queue.filter((op) => op.id !== operation.id)
      console.log(`✅ Synced operation ${operation.id}`)
    } catch (error) {
      operation.retries++
      console.error(`❌ Operation failed (retry ${operation.retries}/${MAX_RETRIES}):`, error)

      if (operation.retries >= MAX_RETRIES) {
        console.error(`⚠️ Operation ${operation.id} reached max retries`)
      } else {
        // Schedule retry
        this.scheduleRetry(operation)
      }
    }
  }

  /**
   * Schedule retry with exponential backoff
   */
  private scheduleRetry(operation: OfflineOperation): void {
    const existingTimer = this.retryTimers.get(operation.id)
    if (existingTimer) clearTimeout(existingTimer)

    const delay = RETRY_DELAY * Math.pow(2, operation.retries - 1)
    const timer = setTimeout(() => {
      this.processOperation(operation)
      this.retryTimers.delete(operation.id)
    }, delay)

    this.retryTimers.set(operation.id, timer)
  }

  /**
   * Get queue size (number of pending operations)
   */
  public getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Get all queued operations
   */
  public getQueue(): OfflineOperation[] {
    return [...this.queue]
  }

  /**
   * Clear queue (useful for testing or recovering from stale data)
   */
  public clearQueue(): void {
    const count = this.queue.length
    this.queue = []
    this.saveQueue()
    this.retryTimers.forEach((timer) => clearTimeout(timer))
    this.retryTimers.clear()
    if (count > 0) {
      console.log(`🗑️ Cleared ${count} stale operations from queue`)
      emitSyncStatus('synced', 'Cola limpiada')
    }
  }

  /**
   * Clear only failed operations (those with retries)
   */
  public clearFailedOperations(): void {
    const beforeCount = this.queue.length
    this.queue = this.queue.filter((op) => op.retries === 0)
    this.saveQueue()
    const clearedCount = beforeCount - this.queue.length
    if (clearedCount > 0) {
      console.log(`🗑️ Cleared ${clearedCount} failed operations from queue`)
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    localStorage.setItem(OFFLINE_OPERATIONS_KEY, JSON.stringify(this.queue))
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_OPERATIONS_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
        console.log(`📝 Loaded ${this.queue.length} queued operations from storage`)
      }
    } catch (error) {
      console.error('Error loading offline queue:', error)
      this.queue = []
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager()
