'use client'

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '@/app/hooks/useInstallPrompt';

/**
 * Componente para mostrar prompt de instalación de PWA
 *
 * Características:
 * - Detecta si la app puede ser instalada
 * - Muestra banner con botón de instalación
 * - Detecta dispositivos iOS y muestra instrucciones alternativas
 * - Solo muestra una vez por sesión (configurable)
 * - Responsive y accesible
 */
export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isInstallable, isInstalled, isIOS, handleInstall, dismissPrompt } = useInstallPrompt();

  useEffect(() => {
    // Solo montar en cliente para evitar hydration mismatch
    setIsMounted(true);

    // Decidir si mostrar el prompt
    if (isInstallable && !isInstalled) {
      // No mostrar si ya fue instalada o rechazada recientemente
      const dismissed = localStorage.getItem('install-dismissed');
      if (dismissed) {
        // Si fue rechazada hace menos de 7 días, no mostrar
        const dismissedDate = new Date(dismissed);
        const now = new Date();
        const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          return;
        }
      }

      // Pequeño delay para mejorar UX (no mostrar inmediatamente)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  if (!isMounted || isInstalled || !showPrompt) {
    return null;
  }

  if (isIOS) {
    // Instrucciones especiales para iOS
    return (
      <div
        className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-lg border border-[#FFB4A8]/20 p-4 z-40 animate-in slide-in-from-bottom-4"
        role="region"
        aria-label="Instrucciones de instalación para iOS"
      >
        <div className="flex gap-3">
          <Smartphone className="w-6 h-6 text-[#FF8C66] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-[#3D2C28] mb-2">Instala nuestra app</h3>
            <p className="text-xs text-[#6B9B9E] mb-3">
              Toca el botón de compartir y selecciona "Añadir a pantalla de inicio"
            </p>
            <button
              onClick={() => {
                setShowPrompt(false);
                dismissPrompt();
              }}
              className="text-xs text-[#FF8C66] font-semibold hover:text-[#FF7A54] transition-colors"
            >
              Entendido
            </button>
          </div>
          <button
            onClick={() => {
              setShowPrompt(false);
              dismissPrompt();
            }}
            className="text-[#A67B6B] hover:text-[#8B5D52] transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome - Mostrar botón de instalación
  return (
    <div
      className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] rounded-2xl shadow-lg p-4 z-40 animate-in slide-in-from-bottom-4"
      role="region"
      aria-label="Prompt de instalación de aplicación"
    >
      <div className="flex items-center gap-3">
        <Download className="w-6 h-6 text-white flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Instala Rocket</h3>
          <p className="text-sm text-white/90">Accede más rápido desde tu pantalla de inicio</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setShowPrompt(false);
              dismissPrompt();
            }}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-[#FF8C66] bg-white hover:bg-white/90 transition-all duration-300 hover:scale-105"
            aria-label="No gracias"
          >
            No
          </button>
          <button
            onClick={async () => {
              await handleInstall();
              setShowPrompt(false);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-105 border border-white/30"
            aria-label="Instalar aplicación"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
