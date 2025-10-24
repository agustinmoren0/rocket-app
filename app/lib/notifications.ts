// app/lib/notifications.ts - Sistema de notificaciones push

const REMINDER_KEY = 'rocket.reminder';

export type ReminderPreference = {
  enabled: boolean;
  hour: number; // 0-23
};

// Pedir permiso de notificaciones
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Mostrar notificación
export function showNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'rocket-reminder',
      requireInteraction: false,
    });
  }
}

// Programar recordatorio diario
export function scheduleReminder(hour: number, minute: number) {
  // Calcular tiempo hasta la próxima hora programada
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hour, minute, 0, 0);

  // Si ya pasó hoy, programar para mañana
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  const timeUntilReminder = scheduled.getTime() - now.getTime();

  // Programar notificación
  setTimeout(() => {
    showNotification(
      '🚀 Rocket - Momento de crear',
      '¿Ya dedicaste tiempo a tu proyecto hoy? Registrá tu progreso.'
    );

    // Re-programar para el día siguiente
    scheduleReminder(hour, minute);
  }, timeUntilReminder);
}

// Guardar preferencia
export function saveReminderPreference(enabled: boolean, hour: number) {
  const pref: ReminderPreference = { enabled, hour };
  localStorage.setItem(REMINDER_KEY, JSON.stringify(pref));
}

// Cargar preferencia
export function loadReminderPreference(): ReminderPreference {
  if (typeof window === 'undefined') {
    return { enabled: false, hour: 18 };
  }

  const stored = localStorage.getItem(REMINDER_KEY);
  if (!stored) {
    return { enabled: false, hour: 18 };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { enabled: false, hour: 18 };
  }
}
