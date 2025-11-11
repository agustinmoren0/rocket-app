/**
 * Advanced Streak Logic with 1-Day Grace Period
 *
 * Features:
 * - Calculates current streak based on habit completions
 * - Tracks longest streak ever achieved
 * - Provides 1-day grace period for missed days
 * - Preserves streak on 2-day gap if grace period not used
 * - Returns visual indicators for UI
 */

import { notifyDataChange } from './storage-utils';

export interface StreakData {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  gracePeriodUsed: boolean;
  gracePeriodUsedDate: string | null;
  brokenOn?: string;
}

export interface StreakStatus {
  isOnFire: boolean; // Current streak > 0
  isBroken: boolean; // Streak just broke
  graceAvailable: boolean; // Grace period can still be used
  daysUntilBroken: number; // Days until streak breaks (0 = today, 1 = tomorrow)
}

/**
 * Get all completions for a habit from localStorage
 */
function getHabitCompletions(habitId: string): string[] {
  const completions = localStorage.getItem('habika_completions');
  if (!completions) return [];

  try {
    const data = JSON.parse(completions);
    return data[habitId] || [];
  } catch {
    return [];
  }
}

/**
 * Get streak data for a specific habit
 */
function getStreakData(habitId: string): StreakData {
  const streakData = localStorage.getItem('habika_streaks');
  if (!streakData) {
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      gracePeriodUsed: false,
      gracePeriodUsedDate: null,
    };
  }

  try {
    const data = JSON.parse(streakData);
    return (
      data[habitId] || {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        gracePeriodUsed: false,
        gracePeriodUsedDate: null,
      }
    );
  } catch {
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      gracePeriodUsed: false,
      gracePeriodUsedDate: null,
    };
  }
}

/**
 * Save streak data to localStorage
 */
function saveStreakData(habitId: string, data: StreakData): void {
  const streakData = localStorage.getItem('habika_streaks');
  const allStreaks = streakData ? JSON.parse(streakData) : {};

  allStreaks[habitId] = data;
  localStorage.setItem('habika_streaks', JSON.stringify(allStreaks));
  notifyDataChange();
}

/**
 * Normalize date to start of day (00:00:00)
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Get days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const normalized1 = normalizeDate(date1);
  const normalized2 = normalizeDate(date2);
  const diffTime = Math.abs(normalized2.getTime() - normalized1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate current streak for a habit
 * Considers:
 * - Daily completions
 * - Grace period (1 missed day can be recovered)
 * - Frequency (daily vs weekly)
 */
export function calculateStreak(habitId: string): StreakStatus {
  const completions = getHabitCompletions(habitId);
  const streakData = getStreakData(habitId);
  const today = normalizeDate(new Date());

  // If no completions, streak is 0
  if (completions.length === 0) {
    return {
      isOnFire: false,
      isBroken: false,
      graceAvailable: true,
      daysUntilBroken: 1,
    };
  }

  // Convert completion dates to normalized dates
  const completionDates = completions
    .map((dateStr) => normalizeDate(new Date(dateStr)))
    .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

  const lastCompletedDate = completionDates[0];
  const daysSinceLastCompletion = daysBetween(lastCompletedDate, today);

  // Completed today or yesterday
  if (daysSinceLastCompletion <= 1) {
    // Build streak backwards from most recent completion
    let currentStreak = 1;
    let checkDate = new Date(lastCompletedDate);
    checkDate.setDate(checkDate.getDate() - 1);

    for (const completionDate of completionDates.slice(1)) {
      const daysDiff = daysBetween(completionDate, checkDate);

      if (daysDiff === 0) {
        // Same day as previous check - shouldn't happen
        continue;
      } else if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
        checkDate = new Date(completionDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (daysDiff === 2 && !streakData.gracePeriodUsed) {
        // 1 day gap and grace period available
        currentStreak += 2;
        streakData.gracePeriodUsed = true;
        streakData.gracePeriodUsedDate = new Date(today).toISOString();
        checkDate = new Date(completionDate);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Gap too large or grace period already used
        break;
      }
    }

    streakData.currentStreak = currentStreak;
    streakData.lastCompletedDate = lastCompletedDate.toISOString();

    // Update longest streak if current is higher
    if (currentStreak > streakData.longestStreak) {
      streakData.longestStreak = currentStreak;
    }

    saveStreakData(habitId, streakData);

    return {
      isOnFire: true,
      isBroken: false,
      graceAvailable: !streakData.gracePeriodUsed,
      daysUntilBroken: 2 - daysSinceLastCompletion, // 1 if completed yesterday, 2 if today
    };
  }

  // 2 or more days since last completion
  // Check if grace period can save the streak
  if (daysSinceLastCompletion === 2 && !streakData.gracePeriodUsed) {
    // Grace period available - streak still intact
    streakData.gracePeriodUsed = true;
    streakData.gracePeriodUsedDate = today.toISOString();
    saveStreakData(habitId, streakData);

    return {
      isOnFire: true,
      isBroken: false,
      graceAvailable: false,
      daysUntilBroken: 0,
    };
  }

  // Streak is broken
  if (streakData.currentStreak > 0) {
    streakData.brokenOn = new Date(today).toISOString();
  }
  streakData.currentStreak = 0;
  streakData.gracePeriodUsed = false;
  saveStreakData(habitId, streakData);

  return {
    isOnFire: false,
    isBroken: true,
    graceAvailable: false,
    daysUntilBroken: 0,
  };
}

/**
 * Record a habit completion
 */
export function recordCompletion(habitId: string): void {
  const today = normalizeDate(new Date()).toISOString();

  // Get existing completions
  const completions = localStorage.getItem('habika_completions');
  const allCompletions = completions ? JSON.parse(completions) : {};

  if (!allCompletions[habitId]) {
    allCompletions[habitId] = [];
  }

  // Check if already completed today
  const alreadyCompletedToday = allCompletions[habitId].some(
    (dateStr: string) =>
      normalizeDate(new Date(dateStr)).toISOString() === today
  );

  if (!alreadyCompletedToday) {
    allCompletions[habitId].push(today);
    localStorage.setItem('habika_completions', JSON.stringify(allCompletions));
    notifyDataChange();
  }

  // Recalculate streak
  calculateStreak(habitId);
}

/**
 * Reset grace period for a habit (e.g., when manually marking as completed)
 */
export function resetGracePeriod(habitId: string): void {
  const streakData = getStreakData(habitId);
  streakData.gracePeriodUsed = false;
  streakData.gracePeriodUsedDate = null;
  saveStreakData(habitId, streakData);
}

/**
 * Get current streak display data
 */
export function getStreakDisplay(habitId: string) {
  const streakData = getStreakData(habitId);
  const status = calculateStreak(habitId);

  return {
    current: streakData.currentStreak,
    longest: streakData.longestStreak,
    status,
    hasGrace: status.graceAvailable,
    daysUntilBroken: status.daysUntilBroken,
  };
}

/**
 * Get visual indicator for streak
 */
export function getStreakIndicator(habitId: string): {
  emoji: string;
  label: string;
  color: string;
} {
  const streakData = getStreakData(habitId);
  const status = calculateStreak(habitId);

  if (streakData.currentStreak === 0) {
    return { emoji: '⭕', label: 'Sin racha', color: 'text-slate-400' };
  }

  if (streakData.currentStreak >= 30) {
    return { emoji: '🔥', label: `${streakData.currentStreak} días`, color: 'text-red-600' };
  }

  if (streakData.currentStreak >= 7) {
    return { emoji: '⚡', label: `${streakData.currentStreak} días`, color: 'text-yellow-600' };
  }

  if (status.graceAvailable && status.daysUntilBroken === 0) {
    return { emoji: '⏰', label: `${streakData.currentStreak} días (gracia)`, color: 'text-orange-600' };
  }

  return { emoji: '✨', label: `${streakData.currentStreak} días`, color: 'text-blue-600' };
}
