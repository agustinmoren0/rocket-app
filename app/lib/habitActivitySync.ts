/**
 * habitActivitySync.ts
 *
 * Sistema avanzado de sincronización bidireccional entre hábitos y actividades
 * Asegura que:
 * 1. Completar un hábito crea una "actividad virtual"
 * 2. Registrar una actividad puede marcar un hábito como completado
 * 3. Los datos permanecen consistentes en todas las vistas
 */

interface HabitCompletion {
  date: string;            // YYYY-MM-DD
  status: 'completed' | 'skipped' | 'pending';
  timestamp: string;       // ISO timestamp
  notes?: string;
  linkedActivityId?: string;
}

interface SyncedActivity {
  id: string;
  name: string;
  duration: number;
  unit: string;
  categoria: string;
  color: string;
  notes: string;
  timestamp: string;
  createdAt: string;
  // Campos de sincronización
  linkedHabitId?: string;
  linkedHabitName?: string;
  markedAsHabit?: boolean;
}

/**
 * MARK: Completar un hábito (con sincronización automática)
 * Cuando el usuario marca un hábito como completado:
 * 1. Registra en habika_completions
 * 2. Crea una "actividad virtual" en el calendario
 * 3. Actualiza el estado de racha (streak)
 *
 * VALIDACIONES:
 * - No permite marcar hábitos en fechas futuras
 * - Evita duplicados en el mismo día
 * - Sincroniza ambos sistemas (completedDates y habika_completions)
 */
export function markHabitAsCompleted(
  habitId: string,
  date: string,
  notes: string = ''
): void {
  if (typeof window === 'undefined') return;

  try {
    const today = date || new Date().toISOString().split('T')[0];

    // VALIDACIÓN 1: No permitir fechas futuras
    const selectedDate = new Date(today);
    selectedDate.setHours(0, 0, 0, 0);
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);

    if (selectedDate > nowDate) {
      console.warn(`❌ No se permite marcar hábitos en fechas futuras: ${today}`);
      return;
    }

    // 1. Registrar en habika_completions
    const completions = JSON.parse(
      localStorage.getItem('habika_completions') || '{}'
    );

    if (!completions[habitId]) {
      completions[habitId] = [];
    }

    // VALIDACIÓN 2: Verificar que no esté duplicado
    const existingIndex = completions[habitId].findIndex(
      (c: HabitCompletion) => c.date === today
    );

    const completion: HabitCompletion = {
      date: today,
      status: 'completed',
      timestamp: new Date().toISOString(),
      notes,
    };

    if (existingIndex >= 0) {
      completions[habitId][existingIndex] = completion;
    } else {
      completions[habitId].push(completion);
    }

    localStorage.setItem('habika_completions', JSON.stringify(completions));

    // 2. Actualizar completedDates en el hábito original
    const habits = JSON.parse(
      localStorage.getItem('habika_custom_habits') || '[]'
    );
    const habitIndex = habits.findIndex((h: any) => h.id === habitId);

    if (habitIndex >= 0) {
      if (!habits[habitIndex].completedDates) {
        habits[habitIndex].completedDates = [];
      }

      if (!habits[habitIndex].completedDates.includes(today)) {
        habits[habitIndex].completedDates.push(today);
      }

      localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    }

    // 3. Crear actividad virtual en el calendario
    syncCompletedHabitToCalendar(habitId, today, notes);

    // 4. Actualizar racha
    updateStreakAfterCompletion(habitId, today);

    console.log(
      `✓ Hábito ${habitId} marcado como completado para ${today}`
    );
  } catch (error) {
    console.error('❌ Error marking habit as completed:', error);
  }
}

/**
 * MARK: Desmarcar un hábito como completado
 */
export function unmarkHabitAsCompleted(habitId: string, date: string): void {
  if (typeof window === 'undefined') return;

  try {
    const today = date || new Date().toISOString().split('T')[0];

    // 1. Remover de habika_completions
    const completions = JSON.parse(
      localStorage.getItem('habika_completions') || '{}'
    );

    if (completions[habitId]) {
      completions[habitId] = completions[habitId].filter(
        (c: HabitCompletion) => c.date !== today
      );

      if (completions[habitId].length === 0) {
        delete completions[habitId];
      }
    }

    localStorage.setItem('habika_completions', JSON.stringify(completions));

    // 2. Remover de completedDates del hábito
    const habits = JSON.parse(
      localStorage.getItem('habika_custom_habits') || '[]'
    );
    const habitIndex = habits.findIndex((h: any) => h.id === habitId);

    if (habitIndex >= 0 && habits[habitIndex].completedDates) {
      habits[habitIndex].completedDates = habits[
        habitIndex
      ].completedDates.filter((d: string) => d !== today);

      localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    }

    // 3. Remover del calendario
    removeCompletedHabitFromCalendar(habitId, today);

    console.log(`✓ Marca removida del hábito ${habitId} para ${today}`);
  } catch (error) {
    console.error('❌ Error unmarking habit:', error);
  }
}

/**
 * MARK: Registrar una actividad (con sincronización opcional de hábito)
 * Cuando se registra una actividad:
 * 1. Se guarda en habika_activities_today y habika_calendar
 * 2. Si está asociada a un hábito, también marca el hábito como completado
 */
export function registerActivityWithHabitSync(
  activity: SyncedActivity,
  linkedHabitId?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Guardar actividad en habika_activities_today
    const activitiesData = JSON.parse(
      localStorage.getItem('habika_activities_today') || '{}'
    );

    if (!activitiesData[today]) {
      activitiesData[today] = [];
    }

    // Preparar actividad con información de sincronización
    const activityToSave = {
      ...activity,
      linkedHabitId,
      timestamp: new Date().toISOString(),
    };

    activitiesData[today].push(activityToSave);
    localStorage.setItem('habika_activities_today', JSON.stringify(activitiesData));

    // 2. Sincronizar al calendario
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

    if (!calendar[today]) {
      calendar[today] = { activities: [], habits: [] };
    }

    calendar[today].activities.push({
      id: activity.id,
      name: activity.name,
      duration: activity.duration,
      unit: activity.unit,
      color: activity.color,
      timestamp: activity.timestamp,
      linkedHabitId,
    });

    localStorage.setItem('habika_calendar', JSON.stringify(calendar));

    // 3. Si hay un hábito asociado, marcarlo como completado
    if (linkedHabitId) {
      markHabitAsCompleted(linkedHabitId, today, `Completado por: ${activity.name}`);
    }

    console.log(
      `✓ Actividad "${activity.name}" registrada${linkedHabitId ? ` y vinculada a hábito ${linkedHabitId}` : ''}`
    );
  } catch (error) {
    console.error('❌ Error registering activity with sync:', error);
  }
}

/**
 * MARK: Sincronizar hábito completado al calendario
 * Crea una "actividad virtual" cuando se marca un hábito
 */
export function syncCompletedHabitToCalendar(
  habitId: string,
  date: string,
  notes: string = ''
): void {
  if (typeof window === 'undefined') return;

  try {
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
    const habits = JSON.parse(
      localStorage.getItem('habika_custom_habits') || '[]'
    );

    const habit = habits.find((h: any) => h.id === habitId);
    if (!habit) {
      console.warn(`Hábito ${habitId} no encontrado`);
      return;
    }

    if (!calendar[date]) {
      calendar[date] = { activities: [], habits: [] };
    }

    // Crear entrada de hábito completado
    const habitEntry = {
      id: habitId,
      name: habit.name,
      duration: habit.minutes || habit.duration || 20,
      color: habit.color || '#FFC0A9',
      timestamp: new Date().toISOString(),
      completed: true,
      markedAsHabit: true,
      notes,
    };

    // Evitar duplicados
    const existingIndex = calendar[date].habits.findIndex(
      (h: any) => h.id === habitId && h.markedAsHabit
    );

    if (existingIndex >= 0) {
      calendar[date].habits[existingIndex] = habitEntry;
    } else {
      calendar[date].habits.push(habitEntry);
    }

    localStorage.setItem('habika_calendar', JSON.stringify(calendar));

    console.log(`✓ Hábito completado sincronizado al calendario para ${date}`);
  } catch (error) {
    console.error('❌ Error syncing completed habit to calendar:', error);
  }
}

/**
 * MARK: Remover hábito completado del calendario
 */
export function removeCompletedHabitFromCalendar(
  habitId: string,
  date: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

    if (calendar[date] && calendar[date].habits) {
      calendar[date].habits = calendar[date].habits.filter(
        (h: any) => !(h.id === habitId && h.markedAsHabit)
      );
    }

    localStorage.setItem('habika_calendar', JSON.stringify(calendar));

    console.log(`✓ Hábito completado removido del calendario para ${date}`);
  } catch (error) {
    console.error('❌ Error removing completed habit from calendar:', error);
  }
}

/**
 * MARK: Obtener historial de completiones de un hábito
 */
export function getHabitCompletionHistory(habitId: string): HabitCompletion[] {
  if (typeof window === 'undefined') return [];

  try {
    const completions = JSON.parse(
      localStorage.getItem('habika_completions') || '{}'
    );

    return completions[habitId] || [];
  } catch (error) {
    console.error('❌ Error getting habit completion history:', error);
    return [];
  }
}

/**
 * MARK: Verificar si un hábito fue completado en una fecha específica
 */
export function isHabitCompletedOnDate(habitId: string, date: string): boolean {
  const history = getHabitCompletionHistory(habitId);
  return history.some(
    (c: HabitCompletion) =>
      c.date === date && c.status === 'completed'
  );
}

/**
 * MARK: Obtener racha actual de un hábito
 */
export function getCurrentStreak(habitId: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const history = getHabitCompletionHistory(habitId);
    if (history.length === 0) return 0;

    // Ordenar por fecha descendente
    const sortedHistory = [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const completion of sortedHistory) {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Si está completado hoy o ayer, continuar con el streak
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('❌ Error calculating current streak:', error);
    return 0;
  }
}

/**
 * MARK: Obtener mejor racha de un hábito
 */
export function getLongestStreak(habitId: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const history = getHabitCompletionHistory(habitId);
    if (history.length === 0) return 0;

    const sortedHistory = [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((c) => c.status === 'completed');

    let maxStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedHistory.length; i++) {
      const prevDate = new Date(sortedHistory[i - 1].date);
      const currDate = new Date(sortedHistory[i].date);

      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    return maxStreak;
  } catch (error) {
    console.error('❌ Error calculating longest streak:', error);
    return 0;
  }
}

/**
 * MARK: Actualizar racha después de completar un hábito
 */
export function updateStreakAfterCompletion(
  habitId: string,
  date: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const streaks = JSON.parse(localStorage.getItem('habika_streaks') || '{}');

    if (!streaks[habitId]) {
      streaks[habitId] = {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      };
    }

    const current = getCurrentStreak(habitId);
    const longest = getLongestStreak(habitId);

    streaks[habitId] = {
      ...streaks[habitId],
      currentStreak: current,
      longestStreak: longest,
      lastCompletedDate: date,
    };

    localStorage.setItem('habika_streaks', JSON.stringify(streaks));

    console.log(
      `✓ Racha actualizada: ${current} días actual, ${longest} días mejor`
    );
  } catch (error) {
    console.error('❌ Error updating streak:', error);
  }
}

/**
 * MARK: Obtener estadísticas de un hábito
 */
export function getHabitStats(habitId: string): {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  lastCompletedDate: string | null;
} {
  try {
    const history = getHabitCompletionHistory(habitId);
    const completions = history.filter(
      (c: HabitCompletion) => c.status === 'completed'
    ).length;

    const streaks = JSON.parse(localStorage.getItem('habika_streaks') || '{}');
    const streakData = streaks[habitId] || {};

    // Calcular tasa de completación (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const relevantCompletions = history.filter(
      (c: HabitCompletion) =>
        new Date(c.date) >= thirtyDaysAgo && c.status === 'completed'
    ).length;

    const completionRate = Math.round((relevantCompletions / 30) * 100);

    return {
      totalCompletions: completions,
      currentStreak: streakData.currentStreak || getCurrentStreak(habitId),
      longestStreak: streakData.longestStreak || getLongestStreak(habitId),
      completionRate,
      lastCompletedDate: streakData.lastCompletedDate || null,
    };
  } catch (error) {
    console.error('❌ Error getting habit stats:', error);
    return {
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      lastCompletedDate: null,
    };
  }
}

/**
 * MARK: Sincronizar todos los hábitos completados con actividades para un período
 * Útil para reconciliar datos después de cambios
 */
export function reconcileHabitActivityData(): void {
  if (typeof window === 'undefined') return;

  try {
    const habits = JSON.parse(
      localStorage.getItem('habika_custom_habits') || '[]'
    );
    const completions = JSON.parse(
      localStorage.getItem('habika_completions') || '{}'
    );

    // Para cada hábito, asegurar que completedDates y habika_completions estén sincronizados
    habits.forEach((habit: any) => {
      if (!completions[habit.id]) {
        completions[habit.id] = [];
      }

      // Sincronizar completedDates hacia habika_completions
      if (habit.completedDates && Array.isArray(habit.completedDates)) {
        habit.completedDates.forEach((date: string) => {
          const exists = completions[habit.id].some(
            (c: HabitCompletion) => c.date === date
          );

          if (!exists) {
            completions[habit.id].push({
              date,
              status: 'completed',
              timestamp: new Date().toISOString(),
            });
          }
        });
      }

      // Sincronizar habika_completions hacia completedDates
      const completionDates = completions[habit.id]
        .filter((c: HabitCompletion) => c.status === 'completed')
        .map((c: HabitCompletion) => c.date);

      habit.completedDates = [
        ...new Set([...(habit.completedDates || []), ...completionDates]),
      ];
    });

    localStorage.setItem('habika_custom_habits', JSON.stringify(habits));
    localStorage.setItem('habika_completions', JSON.stringify(completions));

    console.log('✓ Datos de hábitos y actividades reconciliados');
  } catch (error) {
    console.error('❌ Error reconciling habit activity data:', error);
  }
}

/**
 * MARK: Validar y limpiar datos huérfanos
 * Cuando un hábito es eliminado, limpiar sus datos de completión asociados
 */
export function cleanupOrphanedCompletionData(habitId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const completions = JSON.parse(
      localStorage.getItem('habika_completions') || '{}'
    );

    // Remover datos de completación para este hábito
    if (completions[habitId]) {
      delete completions[habitId];
      localStorage.setItem('habika_completions', JSON.stringify(completions));
      console.log(`✓ Datos de completación limpiados para hábito ${habitId}`);
    }

    // También remover del calendario
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
    Object.keys(calendar).forEach(dateStr => {
      if (calendar[dateStr].habits) {
        calendar[dateStr].habits = calendar[dateStr].habits.filter(
          (h: any) => h.id !== habitId
        );
      }
    });
    localStorage.setItem('habika_calendar', JSON.stringify(calendar));
  } catch (error) {
    console.error('❌ Error cleaning up orphaned data:', error);
  }
}

/**
 * MARK: Validar unidades de actividades
 * Asegurar que todas las actividades tengan unidades válidas
 */
export function validateActivityUnits(): void {
  if (typeof window === 'undefined') return;

  try {
    const validUnits = ['min', 'hora(s)', 'km', 'veces', 'km/h', 'metros'];
    const activitiesToday = JSON.parse(
      localStorage.getItem('habika_activities_today') || '{}'
    );

    let fixedCount = 0;

    Object.keys(activitiesToday).forEach(dateStr => {
      if (Array.isArray(activitiesToday[dateStr])) {
        activitiesToday[dateStr].forEach((activity: any) => {
          if (!validUnits.includes(activity.unit)) {
            // Defaultear a 'min' si no es válida
            activity.unit = 'min';
            fixedCount++;
          }
        });
      }
    });

    if (fixedCount > 0) {
      localStorage.setItem(
        'habika_activities_today',
        JSON.stringify(activitiesToday)
      );
      console.log(`✓ ${fixedCount} actividades con unidades inválidas corregidas`);
    }
  } catch (error) {
    console.error('❌ Error validating activity units:', error);
  }
}

/**
 * MARK: Generar IDs únicos para actividades
 * Asegurar que no haya duplicados de IDs
 */
export function ensureUniqueActivityIds(): void {
  if (typeof window === 'undefined') return;

  try {
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
    const activitiesToday = JSON.parse(
      localStorage.getItem('habika_activities_today') || '{}'
    );

    let fixedCount = 0;
    const seenIds = new Set();

    // Recorrer calendario y renumbrar IDs duplicados
    Object.keys(calendar).forEach(dateStr => {
      if (calendar[dateStr].activities) {
        calendar[dateStr].activities = calendar[dateStr].activities.map(
          (activity: any) => {
            if (seenIds.has(activity.id)) {
              const newId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              seenIds.add(newId);
              fixedCount++;
              return { ...activity, id: newId };
            }
            seenIds.add(activity.id);
            return activity;
          }
        );
      }
    });

    if (fixedCount > 0) {
      localStorage.setItem('habika_calendar', JSON.stringify(calendar));
      console.log(`✓ ${fixedCount} IDs de actividades duplicados corregidos`);
    }
  } catch (error) {
    console.error('❌ Error ensuring unique activity IDs:', error);
  }
}

/**
 * MARK: Sincronizar actividades diarias con calendario a medianoche
 * Función para ejecutar en un worker o cron en medianoche
 */
export function syncActivitiesToCalendarAtMidnight(): void {
  if (typeof window === 'undefined') return;

  try {
    const activitiesToday = JSON.parse(
      localStorage.getItem('habika_activities_today') || '{}'
    );
    const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');

    let syncedCount = 0;

    Object.keys(activitiesToday).forEach(dateStr => {
      if (Array.isArray(activitiesToday[dateStr])) {
        if (!calendar[dateStr]) {
          calendar[dateStr] = { activities: [], habits: [] };
        }

        activitiesToday[dateStr].forEach((activity: any) => {
          // Verificar si ya está en el calendario
          const exists = calendar[dateStr].activities.some(
            (a: any) => a.id === activity.id
          );

          if (!exists) {
            calendar[dateStr].activities.push({
              id: activity.id,
              name: activity.name,
              duration: activity.duration,
              unit: activity.unit,
              color: activity.color || '#FFD0B0',
              timestamp: activity.timestamp,
            });
            syncedCount++;
          }
        });
      }
    });

    if (syncedCount > 0) {
      localStorage.setItem('habika_calendar', JSON.stringify(calendar));
      console.log(`✓ ${syncedCount} actividades sincronizadas al calendario`);
    }
  } catch (error) {
    console.error('❌ Error syncing activities to calendar at midnight:', error);
  }
}

/**
 * MARK: Ejecutar todas las validaciones y limpiezas
 * Función para ejecutar periódicamente (ej: al abrir la app)
 */
export function runFullDataValidation(): void {
  if (typeof window === 'undefined') return;

  console.log('🔍 Ejecutando validación completa de datos...');

  try {
    // 1. Validar y limpiar unidades
    validateActivityUnits();

    // 2. Asegurar IDs únicos
    ensureUniqueActivityIds();

    // 3. Sincronizar actividades con calendario
    syncActivitiesToCalendarAtMidnight();

    // 4. Reconciliar hábitos y completaciones
    reconcileHabitActivityData();

    console.log('✓ Validación completa de datos completada');
  } catch (error) {
    console.error('❌ Error during full data validation:', error);
  }
}
