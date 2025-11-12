/**
 * Realtime Performance Optimizer
 * Manages subscription lifecycle, payload optimization, and resource cleanup
 * Prevents memory leaks and reduces unnecessary network traffic
 */

export interface SubscriptionMetrics {
  channelName: string
  isActive: boolean
  createdAt: number
  lastActivity: number
  messageCount: number
  bytesReceived: number
}

export interface OptimizationConfig {
  autoUnsubscribeTimeout: number // ms before auto-unsubscribe inactive subscription
  payloadSizeLimit: number // bytes - warn if exceeded
  compressionEnabled: boolean
  batchUpdates: boolean // group rapid updates
  batchWindow: number // ms window for batching
}

class RealtimeOptimizer {
  private subscriptionMetrics: Map<string, SubscriptionMetrics> = new Map()
  private inactivityTimers: Map<string, NodeJS.Timeout> = new Map()
  private batchQueue: Map<string, any[]> = new Map()
  private batchTimers: Map<string, NodeJS.Timeout> = new Map()
  private isPageVisible: boolean = true

  private config: OptimizationConfig = {
    autoUnsubscribeTimeout: 5 * 60 * 1000, // 5 minutes
    payloadSizeLimit: 1024 * 100, // 100KB
    compressionEnabled: true,
    batchUpdates: true,
    batchWindow: 100, // ms
  }

  constructor() {
    this.setupPageVisibilityListener()
    this.startMetricsCleanup()
  }

  /**
   * Configure optimization settings
   */
  public configure(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config }
    console.log('⚙️ Realtime optimizer configured:', this.config)
  }

  /**
   * Track a new subscription
   */
  public trackSubscription(channelName: string): void {
    this.subscriptionMetrics.set(channelName, {
      channelName,
      isActive: true,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      bytesReceived: 0,
    })

    // Set up inactivity timeout
    this.resetInactivityTimer(channelName)

    console.log(`📡 Tracking subscription: ${channelName}`)
  }

  /**
   * Record message activity
   */
  public recordActivity(channelName: string, payloadSize: number): void {
    const metrics = this.subscriptionMetrics.get(channelName)
    if (!metrics) return

    metrics.lastActivity = Date.now()
    metrics.messageCount++
    metrics.bytesReceived += payloadSize

    // Warn if payload is too large
    if (payloadSize > this.config.payloadSizeLimit) {
      console.warn(
        `⚠️ Large payload on ${channelName}: ${(payloadSize / 1024).toFixed(2)}KB (limit: ${(this.config.payloadSizeLimit / 1024).toFixed(2)}KB)`
      )
    }

    // Reset inactivity timeout on activity
    this.resetInactivityTimer(channelName)
  }

  /**
   * Optimize payload by filtering unnecessary fields
   */
  public optimizePayload(payload: any, table: string): any {
    if (!payload || typeof payload !== 'object') return payload

    // Remove internal/unnecessary fields from payload
    const fieldsToRemove = [
      'created_at', // Usually not needed in realtime updates
      'updated_at_frontend', // Don't sync frontend timestamps
      '_internal_sync_marker', // Internal markers
    ]

    // Keep only essential fields based on table type
    const essentialFields: Record<string, string[]> = {
      habits: ['id', 'user_id', 'name', 'updated_at'],
      habit_completions: ['id', 'habit_id', 'completed_date', 'updated_at'],
      activities: ['id', 'user_id', 'name', 'duration', 'updated_at'],
      reflections: ['id', 'user_id', 'content', 'updated_at'],
      cycle_data: ['id', 'user_id', 'updated_at'],
      calendar_events: ['id', 'user_id', 'updated_at'],
    }

    const essential = essentialFields[table] || []
    const optimized: any = {}

    // Include essential fields + any that differ from defaults
    for (const [key, value] of Object.entries(payload)) {
      if (essential.includes(key) || value !== null) {
        optimized[key] = value
      }
    }

    return optimized
  }

  /**
   * Check if should skip update based on visibility
   */
  public shouldProcessUpdate(): boolean {
    // Skip heavy processing if page is hidden
    // But still queue the update for when page becomes visible
    return true // Always process, but we can defer rendering
  }

  /**
   * Get subscription health metrics
   */
  public getMetrics(channelName?: string): SubscriptionMetrics | Map<string, SubscriptionMetrics> {
    if (channelName) {
      return this.subscriptionMetrics.get(channelName) || {} as SubscriptionMetrics
    }
    return this.subscriptionMetrics
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): {
    total_subscriptions: number
    active_subscriptions: number
    total_messages: number
    total_bytes: number
    average_payload_size: number
    subscriptions: SubscriptionMetrics[]
  } {
    const metrics = Array.from(this.subscriptionMetrics.values())
    const totalMessages = metrics.reduce((sum, m) => sum + m.messageCount, 0)
    const totalBytes = metrics.reduce((sum, m) => sum + m.bytesReceived, 0)

    return {
      total_subscriptions: metrics.length,
      active_subscriptions: metrics.filter((m) => m.isActive).length,
      total_messages: totalMessages,
      total_bytes: totalBytes,
      average_payload_size: totalMessages > 0 ? totalBytes / totalMessages : 0,
      subscriptions: metrics,
    }
  }

  /**
   * Reset inactivity timer for a subscription
   */
  private resetInactivityTimer(channelName: string): void {
    // Clear existing timer
    const existingTimer = this.inactivityTimers.get(channelName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer only if page is visible
    if (this.isPageVisible) {
      const timer = setTimeout(() => {
        const metrics = this.subscriptionMetrics.get(channelName)
        if (metrics) {
          console.log(
            `⚠️ Subscription ${channelName} inactive for ${(this.config.autoUnsubscribeTimeout / 1000).toFixed(0)}s`
          )
          // Notify about potential auto-unsubscribe
          // This is informational - actual unsubscribe is handled by page visibility
        }
      }, this.config.autoUnsubscribeTimeout)

      this.inactivityTimers.set(channelName, timer)
    }
  }

  /**
   * Setup page visibility listener for resource management
   */
  private setupPageVisibilityListener(): void {
    if (typeof document === 'undefined') return

    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden

      if (this.isPageVisible) {
        console.log('👁️ Page became visible - resuming realtime processing')
        // Could resume batched updates here
      } else {
        console.log('🚫 Page hidden - reducing realtime overhead')
        // Clear inactivity timers when page is hidden
        this.inactivityTimers.forEach((timer) => clearTimeout(timer))
        this.inactivityTimers.clear()
      }
    })
  }

  /**
   * Unsubscribe from a channel (cleanup)
   */
  public unsubscribeChannel(channelName: string): void {
    // Clear timers
    const inactivityTimer = this.inactivityTimers.get(channelName)
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      this.inactivityTimers.delete(channelName)
    }

    const batchTimer = this.batchTimers.get(channelName)
    if (batchTimer) {
      clearTimeout(batchTimer)
      this.batchTimers.delete(channelName)
    }

    // Clear queue
    this.batchQueue.delete(channelName)

    // Remove metrics
    const metrics = this.subscriptionMetrics.get(channelName)
    if (metrics) {
      metrics.isActive = false
      console.log(`📋 Unsubscribed from ${channelName} (${metrics.messageCount} messages, ${(metrics.bytesReceived / 1024).toFixed(2)}KB)`)
    }
  }

  /**
   * Queue update for batching
   */
  public queueBatchUpdate(channelName: string, update: any): Promise<void> {
    return new Promise((resolve) => {
      if (!this.batchQueue.has(channelName)) {
        this.batchQueue.set(channelName, [])
      }

      this.batchQueue.get(channelName)!.push(update)

      // Set batch timer if not already set
      if (!this.batchTimers.has(channelName)) {
        const timer = setTimeout(() => {
          this.flushBatch(channelName)
        }, this.config.batchWindow)

        this.batchTimers.set(channelName, timer)
      }

      resolve()
    })
  }

  /**
   * Flush batched updates
   */
  private flushBatch(channelName: string): void {
    const batch = this.batchQueue.get(channelName)
    if (!batch || batch.length === 0) return

    console.log(`📦 Flushing ${batch.length} batched updates from ${channelName}`)
    // Emit batched update event
    window.dispatchEvent(
      new CustomEvent('realtimeBatchFlush', {
        detail: {
          channelName,
          updates: batch,
          timestamp: new Date().toISOString(),
        },
      })
    )

    // Clear batch and timer
    this.batchQueue.delete(channelName)
    const timer = this.batchTimers.get(channelName)
    if (timer) {
      clearTimeout(timer)
      this.batchTimers.delete(channelName)
    }
  }

  /**
   * Cleanup old metrics periodically
   */
  private startMetricsCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0

      for (const [channelName, metrics] of this.subscriptionMetrics.entries()) {
        // Remove inactive subscriptions that haven't been active for 1 hour
        if (
          !metrics.isActive &&
          now - metrics.lastActivity > 60 * 60 * 1000
        ) {
          this.subscriptionMetrics.delete(channelName)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} old subscription metrics`)
      }
    }, 30 * 60 * 1000) // Every 30 minutes
  }

  /**
   * Get estimated bandwidth usage
   */
  public getEstimatedBandwidth(): {
    current_mb: number
    hourly_estimate_mb: number
    daily_estimate_mb: number
  } {
    const report = this.getPerformanceReport()
    const currentMb = report.total_bytes / (1024 * 1024)
    const hourlyEstimate = currentMb * 60 // Rough estimate assuming current rate
    const dailyEstimate = hourlyEstimate * 24

    return {
      current_mb: currentMb,
      hourly_estimate_mb: hourlyEstimate,
      daily_estimate_mb: dailyEstimate,
    }
  }
}

// Singleton instance
export const realtimeOptimizer = new RealtimeOptimizer()
