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

export type Theme = 'ocean' | 'forest' | 'sunset' | 'lavender';

export const THEMES = {
  ocean: {
    name: 'Océano',
    emoji: '🌊',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    gradient: 'from-sky-400 to-cyan-500',
    bg: 'from-sky-50 via-white to-cyan-50',
  },
  forest: {
    name: 'Bosque',
    emoji: '🌲',
    primary: '#10b981',
    secondary: '#059669',
    gradient: 'from-emerald-400 to-green-500',
    bg: 'from-emerald-50 via-white to-green-50',
  },
  sunset: {
    name: 'Atardecer',
    emoji: '🌅',
    primary: '#f59e0b',
    secondary: '#ef4444',
    gradient: 'from-orange-400 to-red-500',
    bg: 'from-orange-50 via-white to-red-50',
  },
  lavender: {
    name: 'Lavanda',
    emoji: '💜',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    gradient: 'from-violet-400 to-indigo-500',
    bg: 'from-violet-50 via-white to-indigo-50',
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
