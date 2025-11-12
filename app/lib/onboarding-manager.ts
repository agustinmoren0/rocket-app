/**
 * Onboarding Manager
 * Handles checking and updating onboarding completion status
 * Uses both localStorage (for offline) and Supabase (for persistence across devices)
 */

import { supabase } from './supabase'

/**
 * Check if user has completed onboarding
 * First checks localStorage for speed, then verifies with Supabase if authenticated
 */
export async function hasCompletedOnboarding(userId?: string): Promise<boolean> {
  // Fast check: localStorage
  const localFlag = localStorage.getItem('hasOnboarded') === 'true'
  console.log('🔍 hasCompletedOnboarding check:', { userId, localFlag })

  // If local flag is already true, return immediately
  if (localFlag) {
    console.log('✅ Onboarding already completed (localStorage)')
    return true
  }

  // If authenticated, check Supabase even if localStorage says false
  if (userId && typeof userId === 'string' && userId.trim().length > 0) {
    try {
      console.log('📡 Checking onboarding status in Supabase for user:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, display_name')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.warn('⚠️ Supabase query error:', error.message)
        // If no profile exists, they haven't completed onboarding
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No user_profiles record found - onboarding required')
          return false
        }
        // Other errors, fallback to localStorage
        return localFlag
      }

      if (data && data.onboarding_completed) {
        console.log('✅ Onboarding completed in Supabase, updating localStorage')
        localStorage.setItem('hasOnboarded', 'true')
        return true
      } else {
        console.log('❌ Onboarding NOT completed in Supabase')
        return false
      }
    } catch (err) {
      console.error('❌ Error checking onboarding in Supabase:', err)
      // On error, be conservative and require onboarding
      return localFlag
    }
  }

  return localFlag
}

/**
 * Mark onboarding as completed for a user
 * Saves to both localStorage and Supabase
 */
export async function markOnboardingComplete(
  userId: string,
  displayName: string
): Promise<boolean> {
  try {
    // Always save to localStorage first
    localStorage.setItem('hasOnboarded', 'true')

    // Try to save to Supabase
    if (!userId || typeof userId !== 'string') {
      console.warn('⚠️ Cannot persist onboarding to Supabase: invalid user ID')
      return true // Still return true since localStorage was updated
    }

    // Create or update user profile
    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        display_name: displayName,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (error) {
      console.warn('⚠️ Error saving onboarding status to Supabase:', error.message)
      // Still return true since localStorage was saved
      return true
    }

    console.log('✅ Onboarding marked complete in both localStorage and Supabase')
    return true
  } catch (err) {
    console.error('❌ Error marking onboarding complete:', err)
    return false
  }
}

/**
 * Clear onboarding flag (for logout or reset)
 */
export function clearOnboardingFlag(): void {
  localStorage.removeItem('hasOnboarded')
  console.log('🧹 Onboarding flag cleared from localStorage')
}
