import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UseInstallPromptReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  handleInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

/**
 * Hook para manejar la instalación de PWA (Add to Home Screen)
 * Detecta si la app puede ser instalada y proporciona métodos para triggerar la instalación
 *
 * Características:
 * - Detección automática de dispositivos iOS
 * - Manejo de beforeinstallprompt event
 * - Tracking de instalación completada
 * - Persistencia de estado de dismissal
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detectar si ya está instalado como PWA
    const isAppInstalled =
      (window.navigator as any).standalone === true ||
      (window as any).navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isAppInstalled);

    // Si ya está instalado, no mostrar prompt
    if (isAppInstalled) {
      return;
    }

    // Manejar el evento beforeinstallprompt (Chrome, Edge, Opera en Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Recordar que el usuario vio el prompt
      localStorage.setItem('install-prompt-shown', new Date().toISOString());
    };

    // Manejar cuando la app ya fue instalada
    const handleAppInstalled = () => {
      console.log('✅ PWA instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem('app-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Triggers el prompt de instalación
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt no está disponible');
      return;
    }

    try {
      // Mostrar el prompt de instalación nativo
      await deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la app');
        setIsInstallable(false);
        setDeferredPrompt(null);
        localStorage.setItem('install-accepted', 'true');
      } else {
        console.log('❌ Usuario rechazó instalar la app');
        // Recordar que rechazó para no molestar por un tiempo
        localStorage.setItem('install-dismissed', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error al mostrar install prompt:', error);
    }
  }, [deferredPrompt]);

  // Descartar el prompt manualmente
  const dismissPrompt = useCallback(() => {
    setIsInstallable(false);
    setDeferredPrompt(null);
    localStorage.setItem('install-dismissed', new Date().toISOString());
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    deferredPrompt,
    handleInstall,
    dismissPrompt,
  };
}
