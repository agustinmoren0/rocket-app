/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/lib/store.ts COMPLETO con este código
*/

// lib/store.ts - Sistema de datos con localStorage + emociones

export type Activity = {
  date: string; // "2025-10-23"
  minutes: number;
  note: string;
  emotion?: string; // 😊 😐 😔 😤 🔥 etc
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
  const diff = day === 0 ? -6 : 1 - day;
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

// Registrar actividad del día CON EMOCIÓN
export function addActivity(minutes: number, note: string, emotion?: string): void {
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
  data.currentWeek.activities.push({ date: today, minutes, note, emotion });

  saveData(data);
  console.log('✅ Actividad guardada:', data);
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

// Calcular racha de días consecutivos
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

// Calcular mejor racha histórica
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

// Obtener emoción más frecuente de la semana
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
