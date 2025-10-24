/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá app/components/InstallButton.tsx
2. Pegá este código
*/

'use client'

import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Capturar evento de instalación (solo Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }

    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  if (isInstalled) {
    return (
      <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-green-50">
        <span className="text-2xl">✅</span>
        <div className="flex-1 text-left">
          <p className="font-medium text-green-700">App instalada</p>
          <p className="text-sm text-green-600">Ya podés usarla desde tu pantalla de inicio</p>
        </div>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100"
      >
        <span className="text-2xl">📱</span>
        <div className="flex-1 text-left">
          <p className="font-medium text-slate-800">Agregar a pantalla de inicio</p>
          <p className="text-sm text-slate-500">Usá Rocket como app nativa</p>
        </div>
      </button>

      {/* Modal iOS */}
      {showInstructions && isIOS && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end z-50 animate-fadeIn"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-6 w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6" />

            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Instalá Rocket en iOS
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1</span>
                </div>
                <div>
                  <p className="text-slate-800 font-medium">Tocá el ícono de compartir</p>
                  <p className="text-sm text-slate-500">En la barra inferior de Safari</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2</span>
                </div>
                <div>
                  <p className="text-slate-800 font-medium">Seleccioná "Agregar a pantalla de inicio"</p>
                  <p className="text-sm text-slate-500">Scrolleá hacia abajo en el menú</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3</span>
                </div>
                <div>
                  <p className="text-slate-800 font-medium">Confirmá</p>
                  <p className="text-sm text-slate-500">¡Listo! Rocket aparecerá en tu pantalla</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full h-12 rounded-full bg-indigo-600 text-white font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
