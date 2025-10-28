export const shouldShowHabitToday = (habit: any): boolean => {
  if (habit.status !== 'active') return false;

  const today = new Date().getDay();

  if (habit.frequency === 'diario') return true;

  if (habit.frequency === 'semanal' && habit.daysOfWeek) {
    return habit.daysOfWeek.includes(today);
  }

  return true;
};

export const getHabitStatus = (
  habit: any,
  completions: any[]
): 'completed' | 'pending' | 'skipped' => {
  const today = new Date().toISOString().split('T')[0];
  const todayCompletion = completions.find((c) => c.date === today);

  if (todayCompletion) {
    return todayCompletion.status || 'completed';
  }

  // If it's after 23:55 and not completed, it's skipped
  const now = new Date();
  if (now.getHours() === 23 && now.getMinutes() >= 55) {
    return 'skipped';
  }

  return 'pending';
};

export const markHabitComplete = (
  habitId: string,
  status: 'completed' | 'skipped',
  notes?: string
) => {
  const completions = JSON.parse(
    localStorage.getItem('habika_completions') || '{}'
  );
  const habitCompletions = completions[habitId] || [];
  const today = new Date().toISOString().split('T')[0];

  // Remove existing completion for today
  const filtered = habitCompletions.filter((c: any) => c.date !== today);

  // Add new completion
  filtered.push({
    date: today,
    status,
    timestamp: new Date().toISOString(),
    notes: notes || '',
  });

  completions[habitId] = filtered;
  localStorage.setItem('habika_completions', JSON.stringify(completions));

  // Update habit stats
  updateHabitStats(habitId);
};

const updateHabitStats = (habitId: string) => {
  const habits = JSON.parse(
    localStorage.getItem('habika_custom_habits') || '[]'
  );
  const completions = JSON.parse(
    localStorage.getItem('habika_completions') || '{}'
  );
  const habitCompletions = completions[habitId] || [];

  const completed = habitCompletions.filter(
    (c: any) => c.status === 'completed'
  );
  const streak = calculateCurrentStreak(completed);
  const bestStreak = calculateBestStreak(completed);

  const updated = habits.map((h: any) => {
    if (h.id === habitId) {
      return {
        ...h,
        streak,
        bestStreak: Math.max(bestStreak, h.bestStreak || 0),
        totalCompletions: completed.length,
      };
    }
    return h;
  });

  localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
};

const calculateCurrentStreak = (completions: any[]): number => {
  if (completions.length === 0) return 0;

  const sorted = completions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const completion of sorted) {
    const date = new Date(completion.date);
    date.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff === streak + 1) {
      // Grace day
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const calculateBestStreak = (completions: any[]): number => {
  if (completions.length === 0) return 0;

  const sorted = completions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);

    const daysDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1 || daysDiff === 2) {
      // Grace day
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
};
