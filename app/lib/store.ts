// lib/store.ts - Sistema de datos con localStorage + emociones + categorías + temas

export type Category = '🎨 Creatividad' | '💼 Trabajo' | '📚 Aprendizaje' | '💪 Energía' | '🧘 Equilibrio' | '👥 Social' | '🎮 Ocio';

export const CATEGORIES: Category[] = [
  '🎨 Creatividad',
  '💼 Trabajo',
  '📚 Aprendizaje',
  '💪 Energía',
  '🧘 Equilibrio',
  '👥 Social',
  '🎮 Ocio',
];

export type Theme = 'ocean' | 'forest' | 'sunset' | 'lavender' | 'mono';

export const THEMES = {
  ocean: {
    name: 'Océano',
    emoji: '🌊',
    // Colores principales
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    // Gradientes
    gradient: 'from-sky-500 via-cyan-500 to-blue-500',
    gradientSubtle: 'from-sky-100 to-cyan-100',
    // Fondos
    bg: 'from-sky-100 via-cyan-50 to-blue-100',
    bgCard: 'bg-sky-50/90',
    bgCardSecondary: 'bg-cyan-50/80',
    bgHover: 'hover:bg-sky-100',
    // Acentos
    accent: 'text-sky-700',
    accentLight: 'text-sky-500',
    accentBg: 'bg-sky-100',
    border: 'border-sky-200',
    ring: 'ring-sky-500',
    // Botones
    button: 'bg-sky-600 hover:bg-sky-700',
    buttonSecondary: 'bg-cyan-600 hover:bg-cyan-700',
  },
  forest: {
    name: 'Bosque',
    emoji: '🌲',
    primary: '#10b981',
    secondary: '#059669',
    gradient: 'from-emerald-500 via-green-500 to-teal-600',
    gradientSubtle: 'from-emerald-100 to-green-100',
    bg: 'from-emerald-100 via-green-50 to-teal-100',
    bgCard: 'bg-emerald-50/90',
    bgCardSecondary: 'bg-green-50/80',
    bgHover: 'hover:bg-emerald-100',
    accent: 'text-emerald-700',
    accentLight: 'text-emerald-500',
    accentBg: 'bg-emerald-100',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    buttonSecondary: 'bg-green-600 hover:bg-green-700',
  },
  sunset: {
    name: 'Atardecer',
    emoji: '🌅',
    primary: '#f59e0b',
    secondary: '#ef4444',
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    gradientSubtle: 'from-orange-100 to-red-100',
    bg: 'from-orange-100 via-amber-50 to-red-100',
    bgCard: 'bg-orange-50/90',
    bgCardSecondary: 'bg-red-50/80',
    bgHover: 'hover:bg-orange-100',
    accent: 'text-orange-700',
    accentLight: 'text-orange-500',
    accentBg: 'bg-orange-100',
    border: 'border-orange-200',
    ring: 'ring-orange-500',
    button: 'bg-orange-600 hover:bg-orange-700',
    buttonSecondary: 'bg-red-600 hover:bg-red-700',
  },
  lavender: {
    name: 'Lavanda',
    emoji: '💜',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    gradientSubtle: 'from-violet-100 to-indigo-100',
    bg: 'from-violet-100 via-purple-50 to-indigo-100',
    bgCard: 'bg-violet-50/90',
    bgCardSecondary: 'bg-purple-50/80',
    bgHover: 'hover:bg-violet-100',
    accent: 'text-violet-700',
    accentLight: 'text-violet-500',
    accentBg: 'bg-violet-100',
    border: 'border-violet-200',
    ring: 'ring-violet-500',
    button: 'bg-violet-600 hover:bg-violet-700',
    buttonSecondary: 'bg-indigo-600 hover:bg-indigo-700',
  },
  mono: {
    name: 'Monocromo',
    emoji: '⚫',
    primary: '#18181b',
    secondary: '#52525b',
    gradient: 'from-zinc-700 via-slate-800 to-neutral-900',
    gradientSubtle: 'from-zinc-100 to-slate-100',
    bg: 'from-zinc-100 via-slate-50 to-neutral-100',
    bgCard: 'bg-zinc-50/90',
    bgCardSecondary: 'bg-slate-50/80',
    bgHover: 'hover:bg-zinc-100',
    accent: 'text-zinc-900',
    accentLight: 'text-zinc-600',
    accentBg: 'bg-zinc-100',
    border: 'border-zinc-300',
    ring: 'ring-zinc-500',
    button: 'bg-zinc-800 hover:bg-zinc-900',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-800',
  },
};

export type Activity = {
  date: string;
  minutes: number;
  note: string;
  emotion?: string;
  category?: Category;
};

export type WeekData = {
  startDate: string;
  activeDays: boolean[];
  totalMinutes: number;
  activities: Activity[];
};

export type UserData = {
  name: string;
  onboardingDone: boolean;
  currentWeek: WeekData;
  previousWeek?: WeekData;
  theme: Theme;
  zenMode: boolean;
};

const STORAGE_KEY = 'rocket.data';

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

function initData(): UserData {
  return {
    name: 'Usuario',
    onboardingDone: false,
    theme: 'lavender',
    zenMode: false,
    currentWeek: {
      startDate: getWeekStart(),
      activeDays: [false, false, false, false, false, false, false],
      totalMinutes: 0,
      activities: [],
    },
  };
}

export function loadData(): UserData {
  if (typeof window === 'undefined') return initData();

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initData();

  try {
    const data: UserData = JSON.parse(stored);

    // Migración: agregar theme y zenMode si no existen
    if (!data.theme) data.theme = 'lavender';
    if (data.zenMode === undefined) data.zenMode = false;

    const currentStart = getWeekStart();
    if (data.currentWeek.startDate !== currentStart) {
      data.previousWeek = data.currentWeek;
      data.currentWeek = {
        startDate: currentStart,
        activeDays: [false, false, false, false, false, false, false],
        totalMinutes: 0,
        activities: [],
      };
    }

    return data;
  } catch {
    return initData();
  }
}

export function saveData(data: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addActivity(minutes: number, note: string, emotion?: string, category?: Category): void {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];

  const weekStart = new Date(data.currentWeek.startDate);
  const todayDate = new Date(today);
  const dayIndex = Math.floor((todayDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

  if (dayIndex >= 0 && dayIndex < 7) {
    data.currentWeek.activeDays[dayIndex] = true;
  }

  data.currentWeek.totalMinutes += minutes;
  data.currentWeek.activities.push({ date: today, minutes, note, emotion, category });

  saveData(data);
}

export function setTheme(theme: Theme): void {
  const data = loadData();
  data.theme = theme;
  saveData(data);
}

export function toggleZenMode(): void {
  const data = loadData();
  data.zenMode = !data.zenMode;
  saveData(data);
}

export function getWeekProgress(): number {
  const data = loadData();
  const activeDays = data.currentWeek.activeDays.filter(Boolean).length;
  return Math.round((activeDays / 7) * 100);
}

export function getImprovement(): number {
  const data = loadData();
  if (!data.previousWeek) return 0;

  const currentActive = data.currentWeek.activeDays.filter(Boolean).length;
  const previousActive = data.previousWeek.activeDays.filter(Boolean).length;

  if (previousActive === 0) return 0;
  return Math.round(((currentActive - previousActive) / previousActive) * 100);
}

export function completeOnboarding(name: string): void {
  const data = loadData();
  data.name = name;
  data.onboardingDone = true;
  saveData(data);
}

export function getCurrentStreak(): number {
  const data = loadData();
  const days = data.currentWeek.activeDays;

  let streak = 0;
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  for (let i = todayIndex; i >= 0; i--) {
    if (days[i]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function getBestStreak(): number {
  const data = loadData();
  let maxStreak = 0;
  let currentStreak = 0;

  for (const active of data.currentWeek.activeDays) {
    if (active) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

export function getMostFrequentEmotion(): string | null {
  const data = loadData();
  const emotions = data.currentWeek.activities
    .map(a => a.emotion)
    .filter(Boolean) as string[];

  if (emotions.length === 0) return null;

  const counts: Record<string, number> = {};
  emotions.forEach(e => counts[e] = (counts[e] || 0) + 1);

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function getCategoryBreakdown(): { category: Category; minutes: number; percentage: number; color: string }[] {
  const data = loadData();
  const activitiesWithCategory = data.currentWeek.activities.filter(a => a.category);

  if (activitiesWithCategory.length === 0) return [];

  const totals: Record<string, number> = {};
  activitiesWithCategory.forEach(a => {
    totals[a.category!] = (totals[a.category!] || 0) + a.minutes;
  });

  const totalMinutes = Object.values(totals).reduce((a, b) => a + b, 0);

  const colors: Record<Category, string> = {
    '🎨 Creatividad': '#8b5cf6',
    '💼 Trabajo': '#3b82f6',
    '📚 Aprendizaje': '#10b981',
    '💪 Energía': '#f59e0b',
    '🧘 Equilibrio': '#06b6d4',
    '👥 Social': '#ec4899',
    '🎮 Ocio': '#6366f1',
  };

  return Object.entries(totals)
    .map(([category, minutes]) => ({
      category: category as Category,
      minutes,
      percentage: Math.round((minutes / totalMinutes) * 100),
      color: colors[category as Category],
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

// Cambiar nombre de usuario
export function setUserName(name: string) {
  const data = loadData();
  data.name = name;
  saveData(data);
}

// Borrar todos los datos
export function clearAllData() {
  if (typeof window === 'undefined') return;

  // Lista completa de todas las claves de localStorage que usa HABIKA
  const keysToRemove = [
    // Main storage
    STORAGE_KEY,
    // User data
    'habika_username',
    // Activities
    'habika_activities',
    'habika_activities_today',
    // Habits
    'habika_custom_habits',
    'habika_completions',
    'habika_streaks',
    // Reflections
    'habika_reflections',
    // Cycle data
    'habika_cycle_data',
    'habika_period_history',
    // Favorites
    'habika_favorite_pages',
    // Calendar data (pattern: habika_calendar_YYYY-MM-DD)
    'habika_calendar',
  ];

  // Remove all known keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Also remove all dynamic calendar keys (habika_calendar_YYYY-MM-DD pattern)
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('habika_calendar_')) {
      localStorage.removeItem(key);
    }
  });
}

// ==========================================
// SINCRONIZACIÓN CON CALENDARIO
// ==========================================

export function syncHabitToCalendar(habit: any): void {
  if (typeof window === 'undefined') return;

  try {
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
    const today = new Date();

    // Sincrónizar hábito para los próximos 30 días basado en su frecuencia
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      let shouldAddHabit = false;

      if (habit.frequency === 'diario' || habit.frequency === 'daily') {
        shouldAddHabit = true;
      } else if (habit.frequency === 'semanal' || habit.frequency === 'weekly') {
        // Verificar si el día está en daysOfWeek (0=lunes, 6=domingo)
        const dayOfWeek = date.getDay();
        const mondayAdjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertir a lunes=0
        shouldAddHabit = habit.daysOfWeek?.includes(mondayAdjustedDay) || habit.selectedDays?.includes(mondayAdjustedDay);
      } else if (habit.frequency === 'mensual' || habit.frequency === 'monthly') {
        // Verificar si la fecha está en selectedDates
        const dayOfMonth = date.getDate();
        shouldAddHabit = habit.selectedDates?.includes(dayOfMonth);
      }

      if (shouldAddHabit) {
        if (!calendar[dateStr]) {
          calendar[dateStr] = { activities: [], habits: [] };
        }
        if (!calendar[dateStr].habits) {
          calendar[dateStr].habits = [];
        }

        // Evitar duplicados
        const habitExists = calendar[dateStr].habits.some((h: any) => h.id === habit.id);
        if (!habitExists) {
          calendar[dateStr].habits.push({
            id: habit.id,
            name: habit.name,
            duration: habit.minutes || habit.duration || 20,
            color: habit.color || '#FFC0A9',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    localStorage.setItem('habika_calendar', JSON.stringify(calendar));
  } catch (error) {
    console.error('❌ Error syncing habit to calendar:', error);
  }
}

export function removeHabitFromCalendar(habitId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

    Object.keys(calendar).forEach(dateStr => {
      if (calendar[dateStr].habits) {
        calendar[dateStr].habits = calendar[dateStr].habits.filter((h: any) => h.id !== habitId);
      }
    });

    localStorage.setItem('habika_calendar', JSON.stringify(calendar));
  } catch (error) {
    console.error('❌ Error removing habit from calendar:', error);
  }
}

// ==========================================
// HÁBITOS PERSONALIZADOS
// ==========================================

interface CustomHabit {
  id: string;
  name: string;
  description: string;
  minutes: number;
  frequency: 'daily' | 'weekly' | '3x-week' | 'flexible';
  category: string;
  createdAt: string;
}

export function getCustomHabits(): CustomHabit[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('habika_custom_habits');
  return stored ? JSON.parse(stored) : [];
}

export function saveCustomHabit(habit: Omit<CustomHabit, 'id' | 'createdAt'>): CustomHabit {
  const newHabit: CustomHabit = {
    ...habit,
    id: `custom_${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  const current = getCustomHabits();
  const updated = [...current, newHabit];
  localStorage.setItem('habika_custom_habits', JSON.stringify(updated));

  return newHabit;
}

export function deleteCustomHabit(id: string): void {
  const current = getCustomHabits();
  const updated = current.filter(h => h.id !== id);
  localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
}

export function getAllHabits(): CustomHabit[] {
  // Para futuro: combinar hábitos custom con predefinidos
  return getCustomHabits();
}
