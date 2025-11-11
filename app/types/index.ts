/**
 * Central type definitions for the entire app
 * Eliminates the need for 'any' types and improves type safety
 */

// ===== ACTIVITIES =====
export interface Activity {
  id: string;
  name: string;
  duration: number;
  unit: 'min' | 'hs';
  categoria: string;
  color: string;
  date: string;
  notes?: string;
  timestamp: string;
  createdAt: string;
}

export interface ActivityData {
  [date: string]: Activity[];
}

// ===== HABITS =====
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  type?: string;
  goalValue: number;
  goalUnit: string;
  frequency: 'diario' | 'semanal' | 'mensual' | 'personalizado' | 'daily' | 'weekly' | 'monthly' | 'flexible';
  frequencyInterval?: number;
  status: 'active' | 'paused' | 'completed';
  startTime?: string;
  endTime?: string;
  createdAt: string;
  completedDates?: string[];
  daysOfWeek?: number[];
  datesOfMonth?: number[];
  isPreset?: boolean;
  minutes?: number;
}

export interface CompletionData {
  [habitId: string]: string[];
}

// ===== CYCLE =====
export interface CyclePhase {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  suggestions: string[];
  energy: string;
  mood: string;
}

export interface CycleData {
  isActive: boolean;
  lastPeriodStart: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentPhase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  currentDay: number;
  nextPeriodDate: string;
  fertilityWindow: { start: string; end: string };
  symptoms: { [date: string]: string[] };
}

export interface PeriodHistory {
  date: string;
  timestamp: string;
}

// ===== REFLECTIONS =====
export interface Reflection {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'tough';
  achievements: string;
  learnings: string;
  improvements: string;
  createdAt: string;
}

// ===== CALENDAR =====
export interface CalendarActivity {
  id: string;
  name: string;
  duration: number;
  unit: 'min' | 'hs';
  categoria: string;
  color: string;
  notes: string;
  timestamp: string;
  type: string;
}

export interface CalendarDay {
  activities: CalendarActivity[];
  habits?: string[];
  notes?: string;
}

export interface CalendarData {
  [date: string]: CalendarDay;
}

// ===== STREAK =====
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
  isOnFire: boolean;
  isBroken: boolean;
  graceAvailable: boolean;
  daysUntilBroken: number;
}

// ===== FAVORITES =====
export interface FavoritePage {
  icon: React.ReactNode;
  label: string;
  path: string;
  hotkey: string;
}

// ===== FORMS =====
export interface RegisterActivityForm {
  name: string;
  minutes: number;
  unit: 'min' | 'hs';
  category: string;
  date: string;
  notes?: string;
}

export interface CreateHabitForm {
  name: string;
  icon: string;
  color: string;
  type: string;
  goalValue: number;
  goalUnit: string;
  frequency: string;
  frequencyInterval?: number;
  selectedDays?: number[];
  selectedDates?: number[];
  startTime?: string;
  endTime?: string;
}

export interface EditHabitForm {
  name: string;
  targetValue: number;
  targetUnit: 'min' | 'hs';
  targetPeriod: string;
  frequency: 'daily' | 'weekly' | '3x-week' | 'flexible';
}

// ===== API/COMPONENT PROPS =====
export interface ModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  isOpen?: boolean;
}

export interface FormErrorProps {
  errors: ValidationError[];
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  message?: string;
}

// ===== UTILITY =====
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
