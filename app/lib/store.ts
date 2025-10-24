// app/lib/store.ts
export type Activity = { id: string; title?: string; note?: string; date: string };

const KEY = 'rocket.activities.v1';

export function loadActivities(): Activity[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveActivities(list: Activity[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list));
}
