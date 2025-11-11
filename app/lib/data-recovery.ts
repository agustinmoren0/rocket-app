/**
 * Data Recovery & Error Handling Utilities
 * Safely parse corrupted JSON and provide fallback values
 */

import { Activity, Habit, CycleData, Reflection } from '@/app/types';

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T, description: string = 'data'): T {
  if (!jsonStr) {
    console.warn(`⚠️ ${description} is empty or null, using fallback`);
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return parsed as T;
  } catch (error) {
    console.error(`❌ Failed to parse ${description}:`, error);
    console.warn(`⚠️ Using fallback for ${description}`);
    return fallback;
  }
}

/**
 * Safe localStorage retrieval with fallback
 */
export function safeGetFromStorage<T>(key: string, fallback: T, description?: string): T {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, fallback, description || key);
  } catch (error) {
    console.error(`❌ Failed to retrieve ${key} from storage:`, error);
    return fallback;
  }
}

/**
 * Default fallback values
 */
export const FALLBACK_ACTIVITY: Partial<Activity> = {
  id: 'temp_activity',
  name: 'Actividad sin título',
  duration: 0,
  unit: 'min',
  categoria: 'otro',
  color: '#6B9B9E',
  notes: '',
  timestamp: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export const FALLBACK_HABIT: Partial<Habit> = {
  id: 'temp_habit',
  name: 'Hábito sin título',
  icon: 'Heart',
  color: '#6B9B9E',
  frequency: 'diario',
  goalValue: 1,
  goalUnit: 'veces',
  status: 'active',
  createdAt: new Date().toISOString(),
};

export const FALLBACK_CYCLE: CycleData = {
  isActive: false,
  lastPeriodStart: new Date().toISOString(),
  cycleLengthDays: 28,
  periodLengthDays: 5,
  currentPhase: 'menstrual',
  currentDay: 1,
  nextPeriodDate: new Date().toISOString(),
  fertilityWindow: { start: '', end: '' },
  symptoms: {},
};

export const FALLBACK_REFLECTION: Partial<Reflection> = {
  id: 'temp_reflection',
  date: new Date().toISOString().split('T')[0],
  mood: 'good',
  achievements: '',
  learnings: '',
  improvements: '',
  createdAt: new Date().toISOString(),
};

/**
 * Validate and repair activity data
 */
export function validateAndRepairActivity(data: any): Partial<Activity> {
  if (!data || typeof data !== 'object') {
    return FALLBACK_ACTIVITY;
  }

  return {
    id: typeof data.id === 'string' ? data.id : FALLBACK_ACTIVITY.id,
    name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Actividad',
    duration: typeof data.duration === 'number' && data.duration > 0 ? data.duration : 0,
    unit: ['min', 'hs'].includes(data.unit) ? data.unit : 'min',
    categoria: typeof data.categoria === 'string' ? data.categoria : 'otro',
    color: typeof data.color === 'string' ? data.color : '#6B9B9E',
    notes: typeof data.notes === 'string' ? data.notes : '',
    timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
  };
}

/**
 * Validate and repair habit data
 */
export function validateAndRepairHabit(data: any): Partial<Habit> {
  if (!data || typeof data !== 'object') {
    return FALLBACK_HABIT;
  }

  const validFrequencies = ['diario', 'semanal', 'mensual', 'personalizado', 'daily', 'weekly', 'monthly', 'flexible'];
  const validStatuses = ['active', 'paused', 'completed'];

  return {
    id: typeof data.id === 'string' ? data.id : FALLBACK_HABIT.id,
    name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Hábito',
    icon: typeof data.icon === 'string' ? data.icon : 'Heart',
    color: typeof data.color === 'string' ? data.color : '#6B9B9E',
    type: typeof data.type === 'string' ? data.type : 'formar',
    frequency: validFrequencies.includes(data.frequency) ? data.frequency : 'diario',
    goalValue: typeof data.goalValue === 'number' && data.goalValue > 0 ? data.goalValue : 1,
    goalUnit: typeof data.goalUnit === 'string' ? data.goalUnit : 'veces',
    status: validStatuses.includes(data.status) ? data.status : 'active',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
    completedDates: Array.isArray(data.completedDates) ? data.completedDates : [],
    daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek : [],
    datesOfMonth: Array.isArray(data.datesOfMonth) ? data.datesOfMonth : [],
  };
}

/**
 * Validate and repair cycle data
 */
export function validateAndRepairCycleData(data: any): CycleData {
  if (!data || typeof data !== 'object') {
    return FALLBACK_CYCLE;
  }

  const cycleLengthDays = typeof data.cycleLengthDays === 'number' && data.cycleLengthDays >= 21 && data.cycleLengthDays <= 35
    ? data.cycleLengthDays
    : 28;

  const periodLengthDays = typeof data.periodLengthDays === 'number' && data.periodLengthDays >= 2 && data.periodLengthDays <= 8
    ? data.periodLengthDays
    : 5;

  // Ensure period is shorter than cycle
  const validPeriodLength = Math.min(periodLengthDays, cycleLengthDays - 1);

  return {
    isActive: typeof data.isActive === 'boolean' ? data.isActive : false,
    lastPeriodStart: typeof data.lastPeriodStart === 'string' ? data.lastPeriodStart : new Date().toISOString(),
    cycleLengthDays: cycleLengthDays,
    periodLengthDays: validPeriodLength,
    currentPhase: ['menstrual', 'follicular', 'ovulatory', 'luteal'].includes(data.currentPhase) ? data.currentPhase : 'menstrual',
    currentDay: typeof data.currentDay === 'number' && data.currentDay > 0 ? data.currentDay : 1,
    nextPeriodDate: typeof data.nextPeriodDate === 'string' ? data.nextPeriodDate : new Date().toISOString(),
    fertilityWindow: data.fertilityWindow && typeof data.fertilityWindow === 'object'
      ? data.fertilityWindow
      : { start: '', end: '' },
    symptoms: data.symptoms && typeof data.symptoms === 'object' ? data.symptoms : {},
  };
}

/**
 * Validate and repair reflection data
 */
export function validateAndRepairReflection(data: any): Partial<Reflection> {
  if (!data || typeof data !== 'object') {
    return FALLBACK_REFLECTION;
  }

  const validMoods = ['great', 'good', 'okay', 'tough'];

  return {
    id: typeof data.id === 'string' ? data.id : `reflection_${Date.now()}`,
    date: typeof data.date === 'string' ? data.date : new Date().toISOString().split('T')[0],
    mood: validMoods.includes(data.mood) ? data.mood : 'good',
    achievements: typeof data.achievements === 'string' ? data.achievements : '',
    learnings: typeof data.learnings === 'string' ? data.learnings : '',
    improvements: typeof data.improvements === 'string' ? data.improvements : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
  };
}

/**
 * Safe array parsing with repair
 */
export function safeParseArray<T>(
  jsonStr: string | null | undefined,
  repairFn: (item: any) => T,
  fallback: T[] = [],
  description: string = 'array'
): T[] {
  const parsed = safeJsonParse(jsonStr, fallback, description);

  if (!Array.isArray(parsed)) {
    console.warn(`⚠️ ${description} is not an array, returning fallback`);
    return fallback;
  }

  try {
    return parsed.map((item, index) => {
      try {
        return repairFn(item);
      } catch (error) {
        console.warn(`⚠️ Could not repair item ${index} in ${description}:`, error);
        // Return a repaired version with minimal data
        return repairFn({});
      }
    });
  } catch (error) {
    console.error(`❌ Error processing ${description}:`, error);
    return fallback;
  }
}

/**
 * Check data integrity
 */
export function checkDataIntegrity(key: string, validator: (data: any) => boolean): boolean {
  try {
    const item = localStorage.getItem(key);
    if (!item) return true; // Empty is ok

    const parsed = JSON.parse(item);
    const isValid = validator(parsed);

    if (!isValid) {
      console.warn(`⚠️ Data integrity check failed for ${key}`);
    }

    return isValid;
  } catch (error) {
    console.error(`❌ Data integrity check error for ${key}:`, error);
    return false;
  }
}
