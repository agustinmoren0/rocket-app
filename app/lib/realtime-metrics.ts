/**
 * Realtime Metrics Instrumentation
 * Tracks latency, success rates, and sync status for monitoring and diagnostics
 */

import { supabase } from './supabase'

export interface SyncMetric {
  id: string
  event_type: string
  table_name: string
  device_id: string
  user_id: string
  latency_ms: number // Time from event to UI update
  sync_status: 'success' | 'failed' | 'retried'
  retry_count: number
  payload_size_bytes: number
  timestamp: string
}

export interface MetricsReport {
  period: string
  total_events: number
  successful_events: number
  failed_events: number
  success_rate: number
  average_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  total_payload_bytes: number
  average_payload_bytes: number
  by_table: Record<string, MetricsReport>
}

class RealtimeMetrics {
  private eventTimestamps: Map<string, number> = new Map()
  private metrics: SyncMetric[] = []
  private batchSize = 10 // Batch metrics before writing

  /**
   * Record event start time for latency measurement
   */
  public recordEventStart(eventId: string): void {
    this.eventTimestamps.set(eventId, Date.now())
  }

  /**
   * Record successful sync event
   */
  public recordSuccessfulSync(
    eventType: string,
    tableName: string,
    deviceId: string,
    userId: string,
    payloadSize: number,
    eventId?: string
  ): void {
    const startTime = eventId ? this.eventTimestamps.get(eventId) : undefined
    const latency = startTime ? Date.now() - startTime : 0

    const metric: SyncMetric = {
      id: `${tableName}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      event_type: eventType,
      table_name: tableName,
      device_id: deviceId,
      user_id: userId,
      latency_ms: latency,
      sync_status: 'success',
      retry_count: 0,
      payload_size_bytes: payloadSize,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metric)

    // Log to console if latency is high
    if (latency > 1000) {
      console.warn(`⚠️ High latency for ${tableName}: ${latency}ms`)
    }

    // Clear timestamp
    if (eventId) {
      this.eventTimestamps.delete(eventId)
    }

    // Write batch if threshold reached
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics()
    }
  }

  /**
   * Record failed sync event
   */
  public recordFailedSync(
    eventType: string,
    tableName: string,
    deviceId: string,
    userId: string,
    payloadSize: number,
    retryCount: number = 0
  ): void {
    const metric: SyncMetric = {
      id: `${tableName}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      event_type: eventType,
      table_name: tableName,
      device_id: deviceId,
      user_id: userId,
      latency_ms: -1, // Failed, no latency
      sync_status: 'failed',
      retry_count: retryCount,
      payload_size_bytes: payloadSize,
      timestamp: new Date().toISOString(),
    }

    this.metrics.push(metric)
    console.error(`❌ Sync failed for ${tableName}:${eventType} (retry ${retryCount})`)

    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics()
    }
  }

  /**
   * Flush accumulated metrics to database
   */
  public async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return

    try {
      const metricsToWrite = [...this.metrics]
      this.metrics = [] // Clear local buffer

      // Write metrics in batches to avoid single large insert
      const batchSize = 50
      for (let i = 0; i < metricsToWrite.length; i += batchSize) {
        const batch = metricsToWrite.slice(i, i + batchSize)

        const { error } = await supabase.from('sync_logs').insert(
          batch.map((m) => ({
            event_type: m.event_type,
            table_name: m.table_name,
            record_id: m.id,
            device_id: m.device_id,
            user_id: m.user_id,
            timestamp: m.timestamp,
            metadata: {
              latency_ms: m.latency_ms,
              sync_status: m.sync_status,
              retry_count: m.retry_count,
              payload_size_bytes: m.payload_size_bytes,
            },
          }))
        )

        if (error) {
          console.error('❌ Error writing metrics:', error)
          // Re-add failed metrics to buffer
          this.metrics.push(...batch)
          return
        }
      }

      console.log(`📊 Flushed ${metricsToWrite.length} metrics to database`)
    } catch (error) {
      console.error('❌ Error flushing metrics:', error)
    }
  }

  /**
   * Get metrics report for a time period
   */
  public async getMetricsReport(
    userId: string,
    startTime: Date,
    endTime: Date,
    tableName?: string
  ): Promise<MetricsReport> {
    try {
      let query = supabase
        .from('sync_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startTime.toISOString())
        .lte('timestamp', endTime.toISOString())

      if (tableName) {
        query = query.eq('table_name', tableName)
      }

      const { data: logs, error } = await query

      if (error) {
        console.error('❌ Error fetching metrics:', error)
        return this.createEmptyReport()
      }

      if (!logs || logs.length === 0) {
        return this.createEmptyReport()
      }

      return this.analyzeMetrics(logs, startTime, endTime, tableName)
    } catch (error) {
      console.error('❌ Error getting metrics report:', error)
      return this.createEmptyReport()
    }
  }

  /**
   * Analyze metrics and calculate report
   */
  private analyzeMetrics(
    logs: any[],
    startTime: Date,
    endTime: Date,
    tableName?: string
  ): MetricsReport {
    const period = `${startTime.toISOString()} to ${endTime.toISOString()}`

    const successLogs = logs.filter((l) => l.metadata?.sync_status === 'success')
    const failedLogs = logs.filter((l) => l.metadata?.sync_status === 'failed')

    // Calculate latencies (only for successful events)
    const latencies = successLogs
      .map((l) => l.metadata?.latency_ms || 0)
      .filter((l) => l > 0)
      .sort((a, b) => a - b)

    const totalLatency = latencies.reduce((sum, l) => sum + l, 0)
    const averageLatency = latencies.length > 0 ? totalLatency / latencies.length : 0

    const p95Index = Math.floor(latencies.length * 0.95)
    const p99Index = Math.floor(latencies.length * 0.99)

    const report: MetricsReport = {
      period,
      total_events: logs.length,
      successful_events: successLogs.length,
      failed_events: failedLogs.length,
      success_rate: logs.length > 0 ? (successLogs.length / logs.length) * 100 : 0,
      average_latency_ms: averageLatency,
      p95_latency_ms: latencies[p95Index] || 0,
      p99_latency_ms: latencies[p99Index] || 0,
      total_payload_bytes: logs.reduce((sum, l) => sum + (l.metadata?.payload_size_bytes || 0), 0),
      average_payload_bytes: logs.length > 0 ? logs.reduce((sum, l) => sum + (l.metadata?.payload_size_bytes || 0), 0) / logs.length : 0,
      by_table: {},
    }

    // Group by table
    const byTable: Record<string, any[]> = {}
    logs.forEach((log) => {
      if (!byTable[log.table_name]) {
        byTable[log.table_name] = []
      }
      byTable[log.table_name].push(log)
    })

    // Analyze per table
    for (const [tbl, tableLogs] of Object.entries(byTable)) {
      const tableSuccessLogs = tableLogs.filter((l) => l.metadata?.sync_status === 'success')
      const tableLatencies = tableSuccessLogs
        .map((l) => l.metadata?.latency_ms || 0)
        .filter((l) => l > 0)
        .sort((a, b) => a - b)

      const tableLatencySum = tableLatencies.reduce((sum, l) => sum + l, 0)
      const tableTotalPayload = tableLogs.reduce((sum, l) => sum + (l.metadata?.payload_size_bytes || 0), 0)
      const tableP95Index = Math.floor(tableLatencies.length * 0.95)
      const tableP99Index = Math.floor(tableLatencies.length * 0.99)

      report.by_table[tbl] = {
        period,
        total_events: tableLogs.length,
        successful_events: tableSuccessLogs.length,
        failed_events: tableLogs.length - tableSuccessLogs.length,
        success_rate: tableLogs.length > 0 ? (tableSuccessLogs.length / tableLogs.length) * 100 : 0,
        average_latency_ms: tableLatencies.length > 0 ? tableLatencySum / tableLatencies.length : 0,
        p95_latency_ms: tableLatencies[tableP95Index] || 0,
        p99_latency_ms: tableLatencies[tableP99Index] || 0,
        total_payload_bytes: tableTotalPayload,
        average_payload_bytes: tableLogs.length > 0 ? tableTotalPayload / tableLogs.length : 0,
        by_table: {},
      }
    }

    return report
  }

  /**
   * Get health score (0-100) based on metrics
   */
  public async getHealthScore(userId: string): Promise<number> {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const report = await this.getMetricsReport(userId, oneHourAgo, now)

    let score = 100

    // Deduct for low success rate (target: 95%+)
    if (report.success_rate < 95) {
      score -= (95 - report.success_rate) * 0.5
    }

    // Deduct for high latency (target: <500ms average)
    if (report.average_latency_ms > 500) {
      score -= Math.min((report.average_latency_ms - 500) / 100, 15)
    }

    // Deduct for high p99 latency (target: <2000ms)
    if (report.p99_latency_ms > 2000) {
      score -= Math.min((report.p99_latency_ms - 2000) / 200, 10)
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Create empty report
   */
  private createEmptyReport(): MetricsReport {
    return {
      period: 'unknown',
      total_events: 0,
      successful_events: 0,
      failed_events: 0,
      success_rate: 0,
      average_latency_ms: 0,
      p95_latency_ms: 0,
      p99_latency_ms: 0,
      total_payload_bytes: 0,
      average_payload_bytes: 0,
      by_table: {},
    }
  }

  /**
   * Force flush all pending metrics
   */
  public async forceFlush(): Promise<void> {
    if (this.metrics.length > 0) {
      await this.flushMetrics()
    }
  }

  /**
   * Get pending metrics count
   */
  public getPendingMetricsCount(): number {
    return this.metrics.length
  }

  /**
   * Clear in-memory metrics (for testing)
   */
  public clearMetrics(): void {
    this.metrics = []
    this.eventTimestamps.clear()
  }
}

// Singleton instance
export const realtimeMetrics = new RealtimeMetrics()
