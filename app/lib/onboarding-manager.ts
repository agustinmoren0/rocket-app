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

  // If authenticated and no local flag, check Supabase
  if (userId && !localFlag) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single()

      if (!error && data?.onboarding_completed) {
        // Update localStorage cache since they completed onboarding
        localStorage.setItem('hasOnboarded', 'true')
        return true
      }
    } catch (err) {
      console.warn('⚠️ Error checking onboarding status in Supabase:', err)
      // Fallback to localStorage flag if Supabase check fails
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
