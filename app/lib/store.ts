// lib/store.ts - Sistema de datos con localStorage

export type Activity = {
  date: string; // "2025-10-23"
  minutes: number;
  note: string;
};

export type WeekData = {
  startDate: string; // "2025-10-20"
  activeDays: boolean[]; // [true, false, true, ...]
  totalMinutes: number;
  activities: Activity[];
};

export type UserData = {
  name: string;
  onboardingDone: boolean;
  currentWeek: WeekData;
  previousWeek?: WeekData;
};

const STORAGE_KEY = 'rocket.data';

// Obtener semana actual (lunes a domingo)
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Si es domingo, retrocede 6 días
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

// Inicializar datos vacíos
function initData(): UserData {
  return {
    name: 'Usuario',
    onboardingDone: false,
    currentWeek: {
      startDate: getWeekStart(),
      activeDays: [false, false, false, false, false, false, false],
      totalMinutes: 0,
      activities: [],
    },
  };
}

// Cargar datos
export function loadData(): UserData {
  if (typeof window === 'undefined') return initData();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initData();
  
  try {
    const data: UserData = JSON.parse(stored);
    
    // Si cambió la semana, mover currentWeek a previousWeek
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

// Guardar datos
export function saveData(data: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Registrar actividad del día
export function addActivity(minutes: number, note: string): void {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  
  // Calcular índice del día (0 = lunes, 6 = domingo)
  const weekStart = new Date(data.currentWeek.startDate);
  const todayDate = new Date(today);
  const dayIndex = Math.floor((todayDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dayIndex >= 0 && dayIndex < 7) {
    data.currentWeek.activeDays[dayIndex] = true;
  }
  
  data.currentWeek.totalMinutes += minutes;
  data.currentWeek.activities.push({ date: today, minutes, note });
  
  saveData(data);
}

// Calcular % de progreso semanal
export function getWeekProgress(): number {
  const data = loadData();
  const activeDays = data.currentWeek.activeDays.filter(Boolean).length;
  return Math.round((activeDays / 7) * 100);
}

// Obtener mejora respecto a semana anterior
export function getImprovement(): number {
  const data = loadData();
  if (!data.previousWeek) return 0;
  
  const currentActive = data.currentWeek.activeDays.filter(Boolean).length;
  const previousActive = data.previousWeek.activeDays.filter(Boolean).length;
  
  if (previousActive === 0) return 0;
  return Math.round(((currentActive - previousActive) / previousActive) * 100);
}

// Completar onboarding
export function completeOnboarding(name: string): void {
  const data = loadData();
  data.name = name;
  data.onboardingDone = true;
  saveData(data);
}
