'use client'

// Forzar actualización de PWA
export async function forceUpdatePWA() {
  if (typeof window === 'undefined') return;

  try {
    // 1. Desregistrar todos los service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // 2. Limpiar todos los caches
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );

    // 3. Recargar la página (hard reload)
    window.location.reload();
  } catch (error) {
    console.error('Error al actualizar PWA:', error);
    // Fallback: reload normal
    window.location.reload();
  }
}

// Verificar si hay actualización disponible
export async function checkForUpdates(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    await registration.update();
    return !!registration.waiting;
  } catch {
    return false;
  }
}
