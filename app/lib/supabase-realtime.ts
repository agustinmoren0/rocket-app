/**
 * Supabase Realtime Subscriptions
 * Handles real-time sync for habits and habit_completions
 * Integrates with offline-first architecture
 */

import { supabase } from './supabase'
import { emitSyncStatus } from './supabase-sync'
import { logSyncEvent } from './sync-logger'

export interface RealtimeSubscription {
  channel: string
  unsubscribe: () => void
}

class RealtimeManager {
  private subscriptions: Map<string, any> = new Map()
  private isActive: boolean = false
  private userId: string | null = null

  /**
   * Start realtime subscriptions for a user
   */
  public async startRealtime(userId: string): Promise<void> {
    if (this.isActive && this.userId === userId) {
      console.log('✅ Realtime already active for user:', userId)
      return
    }

    this.userId = userId
    console.log('📡 Starting Realtime subscriptions for user:', userId)

    try {
      // Subscribe to habits changes
      this.subscribeToHabits(userId)

      // Subscribe to habit_completions changes
      this.subscribeToCompletions(userId)

      // Subscribe to activities changes
      this.subscribeToActivities(userId)

      // Subscribe to reflections changes
      this.subscribeToReflections(userId)

      // Subscribe to cycle_data changes
      this.subscribeToCycleData(userId)

      // Subscribe to calendar changes
      this.subscribeToCalendar(userId)

      this.isActive = true
      emitSyncStatus('synced', 'Sincronización en tiempo real activa')
      console.log('✅ Realtime subscriptions started')
    } catch (error) {
      console.error('❌ Failed to start realtime:', error)
      emitSyncStatus('error', 'Error al iniciar sincronización en tiempo real')
      this.isActive = false
    }
  }

  /**
   * Subscribe to habits table changes
   */
  private subscribeToHabits(userId: string): void {
    const channel = supabase
      .channel(`habits:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // All events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('📝 Habit change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'habits',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitHabitUpdate(payload)

          // Update local cache if needed
          this.handleHabitChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Habits subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to habits changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Habits subscription closed')
        }
      })

    this.subscriptions.set(`habits:${userId}`, channel)
  }

  /**
   * Subscribe to habit_completions table changes
   */
  private subscribeToCompletions(userId: string): void {
    const channel = supabase
      .channel(`completions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('✅ Completion change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'habit_completions',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitCompletionUpdate(payload)

          // Update local cache
          this.handleCompletionChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Completions subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to completions changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Completions subscription closed')
        }
      })

    this.subscriptions.set(`completions:${userId}`, channel)
  }

  /**
   * Subscribe to activities table changes
   */
  private subscribeToActivities(userId: string): void {
    const channel = supabase
      .channel(`activities:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('📋 Activity change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'activities',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitActivityUpdate(payload)

          // Update local cache
          this.handleActivityChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Activities subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to activities changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Activities subscription closed')
        }
      })

    this.subscriptions.set(`activities:${userId}`, channel)
  }

  /**
   * Subscribe to reflections table changes
   */
  private subscribeToReflections(userId: string): void {
    const channel = supabase
      .channel(`reflections:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reflections',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('✍️ Reflection change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'reflections',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitReflectionUpdate(payload)

          // Update local cache
          this.handleReflectionChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Reflections subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to reflections changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Reflections subscription closed')
        }
      })

    this.subscriptions.set(`reflections:${userId}`, channel)
  }

  /**
   * Handle habit changes from other devices
   */
  private handleHabitChange(payload: any): void {
    const eventType = payload.eventType
    const habit = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on habit:`, habit.id)

    // Emit custom event for Dashboard to listen
    window.dispatchEvent(
      new CustomEvent('habitUpdated', {
        detail: {
          eventType,
          habit,
          timestamp: new Date().toISOString(),
        },
      })
    )

    // Could also update localStorage cache here if needed
    // but we keep it as source of truth for offline support
  }

  /**
   * Handle completion changes from other devices
   */
  private handleCompletionChange(payload: any): void {
    const eventType = payload.eventType
    const completion = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on completion:`, completion.id)

    // Emit custom event for Dashboard to listen
    window.dispatchEvent(
      new CustomEvent('completionUpdated', {
        detail: {
          eventType,
          completion,
          timestamp: new Date().toISOString(),
        },
      })
    )
  }

  /**
   * Emit habit update event
   */
  private emitHabitUpdate(payload: any): void {
    const message = `Hábito ${payload.eventType === 'DELETE' ? 'eliminado' : payload.eventType === 'INSERT' ? 'creado' : 'actualizado'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Emit completion update event
   */
  private emitCompletionUpdate(payload: any): void {
    const message = `Registro ${payload.eventType === 'DELETE' ? 'eliminado' : payload.eventType === 'INSERT' ? 'creado' : 'actualizado'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Handle activity changes from other devices
   */
  private handleActivityChange(payload: any): void {
    const eventType = payload.eventType
    const activity = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on activity:`, activity.id)

    // Emit custom event for Activities page to listen
    window.dispatchEvent(
      new CustomEvent('activityUpdated', {
        detail: {
          eventType,
          activity,
          timestamp: new Date().toISOString(),
        },
      })
    )
  }

  /**
   * Handle reflection changes from other devices
   */
  private handleReflectionChange(payload: any): void {
    const eventType = payload.eventType
    const reflection = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on reflection:`, reflection.id)

    // Emit custom event for Reflections page to listen
    window.dispatchEvent(
      new CustomEvent('reflectionUpdated', {
        detail: {
          eventType,
          reflection,
          timestamp: new Date().toISOString(),
        },
      })
    )
  }

  /**
   * Emit activity update event
   */
  private emitActivityUpdate(payload: any): void {
    const message = `Actividad ${payload.eventType === 'DELETE' ? 'eliminada' : payload.eventType === 'INSERT' ? 'creada' : 'actualizada'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Emit reflection update event
   */
  private emitReflectionUpdate(payload: any): void {
    const message = `Reflexión ${payload.eventType === 'DELETE' ? 'eliminada' : payload.eventType === 'INSERT' ? 'creada' : 'actualizada'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Subscribe to cycle_data table changes
   */
  private subscribeToCycleData(userId: string): void {
    const channel = supabase
      .channel(`cycle_data:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cycle_data',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('🔴 Cycle data change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'cycle_data',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitCycleUpdate(payload)

          // Update local cache
          this.handleCycleChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Cycle data subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to cycle data changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Cycle data subscription closed')
        }
      })

    this.subscriptions.set(`cycle_data:${userId}`, channel)
  }

  /**
   * Subscribe to calendar events table changes
   */
  private subscribeToCalendar(userId: string): void {
    const channel = supabase
      .channel(`calendar:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          console.log('📅 Calendar event change received:', payload.eventType, payload.new)

          // Log the sync event
          await logSyncEvent({
            event_type: payload.eventType,
            table_name: 'calendar_events',
            record_id: payload.new?.id || payload.old?.id,
            device_id: this.getDeviceId(),
            user_id: userId,
          })

          // Emit visual update signal
          this.emitCalendarUpdate(payload)

          // Update local cache
          this.handleCalendarChange(payload)
        }
      )
      .subscribe(async (status: any) => {
        console.log('📡 Calendar subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to calendar changes')
        } else if (status === 'CLOSED') {
          console.log('⚠️ Calendar subscription closed')
        }
      })

    this.subscriptions.set(`calendar:${userId}`, channel)
  }

  /**
   * Handle cycle data changes from other devices
   */
  private handleCycleChange(payload: any): void {
    const eventType = payload.eventType
    const cycleData = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on cycle_data:`, cycleData.id)

    // Emit custom event for Modo Ciclo page to listen
    window.dispatchEvent(
      new CustomEvent('cycleUpdated', {
        detail: {
          eventType,
          cycleData,
          timestamp: new Date().toISOString(),
        },
      })
    )
  }

  /**
   * Handle calendar changes from other devices
   */
  private handleCalendarChange(payload: any): void {
    const eventType = payload.eventType
    const calendarEvent = payload.new || payload.old

    console.log(`🔄 Processing ${eventType} on calendar:`, calendarEvent.id)

    // Emit custom event for Calendario page to listen
    window.dispatchEvent(
      new CustomEvent('calendarUpdated', {
        detail: {
          eventType,
          calendarEvent,
          timestamp: new Date().toISOString(),
        },
      })
    )
  }

  /**
   * Emit cycle update event
   */
  private emitCycleUpdate(payload: any): void {
    const message = `Ciclo ${payload.eventType === 'DELETE' ? 'eliminado' : payload.eventType === 'INSERT' ? 'registrado' : 'actualizado'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Emit calendar update event
   */
  private emitCalendarUpdate(payload: any): void {
    const message = `Evento ${payload.eventType === 'DELETE' ? 'eliminado' : payload.eventType === 'INSERT' ? 'creado' : 'actualizado'}`
    emitSyncStatus('synced', message)
  }

  /**
   * Stop all realtime subscriptions
   */
  public async stopRealtime(): Promise<void> {
    console.log('🛑 Stopping Realtime subscriptions')

    for (const [key, channel] of this.subscriptions.entries()) {
      try {
        await supabase.removeChannel(channel)
        console.log(`✅ Unsubscribed from ${key}`)
      } catch (error) {
        console.error(`❌ Failed to unsubscribe from ${key}:`, error)
      }
    }

    this.subscriptions.clear()
    this.isActive = false
    this.userId = null
  }

  /**
   * Check if realtime is active
   */
  public getIsActive(): boolean {
    return this.isActive
  }

  /**
   * Get a unique device ID for logging
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager()
