/**
 * Data migration utilities for moving from localStorage to Supabase
 * Implements offline-first strategy with fallback support
 */

import { supabase } from './supabase'
import { getLocalData, updateLocalStorage, emitSyncStatus } from './supabase-sync'

export interface MigrationStatus {
  isComplete: boolean
  totalRecords: number
  migratedRecords: number
  failedRecords: number
  lastError?: string
  timestamp: string
}

export interface MigrationStats {
  habits: number
  completions: number
  activities: number
  cycleData: boolean
  reflections: number
  settings: boolean
  totalTime: number
}

/**
 * Checks if data has already been migrated to Supabase
 */
export async function isMigrationComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // If user profile exists in Supabase, migration is complete
    if (data) return true

    // If error is "not found", migration hasn't started
    if (error?.code === 'PGRST116') return false

    // Any other error, assume incomplete (fail safe)
    return false
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}

/**
 * Creates initial user profile in Supabase
 */
export async function createUserProfile(
  userId: string,
  displayName: string,
  email: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_profiles').insert({
      id: userId,
      display_name: displayName,
      email: email,
      theme: localStorage.getItem('habika_theme') || 'lavender',
      zen_mode: localStorage.getItem('habika_zen_mode') === 'true',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error creating user profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return false
  }
}

/**
 * Migrates all local data to Supabase
 * Uses offline-first strategy: uploads data but keeps localStorage as cache
 */
export async function migrateAllData(userId: string): Promise<MigrationStats> {
  const startTime = Date.now()
  emitSyncStatus('syncing', 'Migrando datos a la nube...')

  const stats: MigrationStats = {
    habits: 0,
    completions: 0,
    activities: 0,
    cycleData: false,
    reflections: 0,
    settings: false,
    totalTime: 0,
  }

  try {
    const localData = getLocalData()

    // Migrate habits
    if (localData.habits.length > 0) {
      console.log(`📤 Migrating ${localData.habits.length} habits...`)
      stats.habits = await migrateHabits(userId, localData.habits)
    }

    // Migrate habit completions
    if (localData.completions.length > 0) {
      console.log(`📤 Migrating ${localData.completions.length} completions...`)
      stats.completions = await migrateCompletions(userId, localData.completions)
    }

    // Migrate activities
    if (localData.activities.length > 0) {
      console.log(`📤 Migrating ${localData.activities.length} activities...`)
      stats.activities = await migrateActivities(userId, localData.activities)
    }

    // Migrate cycle data
    if (localData.cycleData) {
      console.log(`📤 Migrating cycle data...`)
      stats.cycleData = await migrateCycleData(userId, localData.cycleData)
    }

    // Migrate reflections
    if (localData.reflections.length > 0) {
      console.log(`📤 Migrating ${localData.reflections.length} reflections...`)
      stats.reflections = await migrateReflections(userId, localData.reflections)
    }

    // Migrate settings
    if (localData.settings) {
      console.log(`📤 Migrating user settings...`)
      stats.settings = await migrateSettings(userId, localData.settings)
    }

    stats.totalTime = Date.now() - startTime

    emitSyncStatus('synced')
    console.log('✅ Migration complete:', stats)

    return stats
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Migration failed'
    emitSyncStatus('error', message)
    console.error('❌ Migration error:', error)
    stats.totalTime = Date.now() - startTime
    return stats
  }
}

/**
 * Migrate habits to Supabase
 */
async function migrateHabits(userId: string, habits: any[]): Promise<number> {
  let migratedCount = 0

  for (const habit of habits) {
    try {
      const { error } = await supabase.from('habits').upsert({
        id: habit.id || crypto.randomUUID(),
        user_id: userId,
        name: habit.name,
        description: habit.description || null,
        frequency: habit.frequency || 'diario',
        status: habit.status || 'active',
        streak: habit.streak || 0,
        // P5 Fix: Map startTime/endTime to start_time/end_time
        // P5.3 Fix: Format time strings as HH:MM:SS for PostgreSQL TIME type
        start_time: habit.startTime ? `${habit.startTime}:00` : null,
        end_time: habit.endTime ? `${habit.endTime}:00` : null,
        created_at: habit.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,name'  // ← Handle UNIQUE(user_id, name) constraint
      })

      if (!error) migratedCount++
    } catch (err) {
      console.error(`Error migrating habit ${habit.name}:`, err)
    }
  }

  return migratedCount
}

/**
 * Migrate habit completions to Supabase
 */
async function migrateCompletions(userId: string, completions: any[]): Promise<number> {
  let migratedCount = 0

  for (const completion of completions) {
    try {
      const { error } = await supabase.from('habit_completions').upsert({
        id: completion.id || crypto.randomUUID(),
        habit_id: completion.habitId,
        user_id: userId,
        completion_date: completion.date,
        status: completion.status || 'completed',
        created_at: completion.createdAt || new Date().toISOString(),
      })

      if (!error) migratedCount++
    } catch (err) {
      console.error(`Error migrating completion:`, err)
    }
  }

  return migratedCount
}

/**
 * Migrate activities to Supabase
 */
async function migrateActivities(userId: string, activities: any[]): Promise<number> {
  let migratedCount = 0

  for (const activity of activities) {
    try {
      const { error } = await supabase.from('activities').upsert({
        id: activity.id || crypto.randomUUID(),
        user_id: userId,
        name: activity.name,
        duration: activity.duration || 0,
        unit: activity.unit || 'min',
        category: activity.category,
        color: activity.color || null,
        date: activity.date,
        notes: activity.notes || null,
        created_at: activity.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (!error) migratedCount++
    } catch (err) {
      console.error(`Error migrating activity:`, err)
    }
  }

  return migratedCount
}

/**
 * Migrate cycle data to Supabase
 */
async function migrateCycleData(userId: string, cycleData: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('cycle_data').upsert({
      user_id: userId,
      is_active: cycleData.isActive || false,
      last_period_start: cycleData.lastPeriodStart || null,
      cycle_length_days: cycleData.cycleLengthDays || null,
      period_length_days: cycleData.periodLengthDays || null,
      created_at: cycleData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'  // ← Handle UNIQUE(user_id) constraint
    })

    return !error
  } catch (err) {
    console.error('Error migrating cycle data:', err)
    return false
  }
}

/**
 * Migrate reflections to Supabase
 */
async function migrateReflections(userId: string, reflections: any[]): Promise<number> {
  let migratedCount = 0

  for (const reflection of reflections) {
    try {
      const { error } = await supabase.from('reflections').upsert({
        id: reflection.id || crypto.randomUUID(),
        user_id: userId,
        date: reflection.date,
        content: reflection.content,
        mood: reflection.mood || null,
        tags: reflection.tags || [],
        created_at: reflection.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (!error) migratedCount++
    } catch (err) {
      console.error(`Error migrating reflection:`, err)
    }
  }

  return migratedCount
}

/**
 * Migrate user settings to Supabase
 */
async function migrateSettings(userId: string, settings: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_settings').upsert({
      user_id: userId,
      notifications_enabled: settings.notificationsEnabled ?? true,
      data_synced_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return !error
  } catch (err) {
    console.error('Error migrating settings:', err)
    return false
  }
}

/**
 * Verifies migration by comparing local and remote data counts
 */
export async function verifyMigration(userId: string): Promise<{
  verified: boolean
  local: MigrationStats
  remote: MigrationStats
  mismatches: string[]
}> {
  const localData = getLocalData()
  const mismatches: string[] = []

  // Get remote counts
  const [
    { count: remoteHabits },
    { count: remoteCompletions },
    { count: remoteActivities },
    { data: remoteCycleData },
    { count: remoteReflections },
    { data: remoteSettings },
  ] = await Promise.all([
    supabase.from('habits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('habit_completions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('activities').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('cycle_data').select('*').eq('user_id', userId).single(),
    supabase.from('reflections').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).single(),
  ])

  const local = {
    habits: localData.habits.length,
    completions: localData.completions.length,
    activities: localData.activities.length,
    cycleData: !!localData.cycleData,
    reflections: localData.reflections.length,
    settings: !!localData.settings,
    totalTime: 0,
  }

  const remote = {
    habits: remoteHabits || 0,
    completions: remoteCompletions || 0,
    activities: remoteActivities || 0,
    cycleData: !!remoteCycleData,
    reflections: remoteReflections || 0,
    settings: !!remoteSettings,
    totalTime: 0,
  }

  // Check for mismatches
  if (local.habits !== remote.habits) {
    mismatches.push(`Habits: ${local.habits} local vs ${remote.habits} remote`)
  }
  if (local.completions !== remote.completions) {
    mismatches.push(`Completions: ${local.completions} local vs ${remote.completions} remote`)
  }
  if (local.activities !== remote.activities) {
    mismatches.push(`Activities: ${local.activities} local vs ${remote.activities} remote`)
  }
  if (local.reflections !== remote.reflections) {
    mismatches.push(`Reflections: ${local.reflections} local vs ${remote.reflections} remote`)
  }

  const verified = mismatches.length === 0

  return { verified, local, remote, mismatches }
}
