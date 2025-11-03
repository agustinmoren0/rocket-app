'use client'

import { WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.back();
    } else {
      alert('Aún sin conexión. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} className="text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Sin conexión
        </h1>
        <p className="text-slate-600 mb-6">
          No te preocupes, HABIKA funciona sin conexión. Tus datos se sincronizarán cuando vuelvas a estar online.
        </p>
        <button
          onClick={handleRetry}
          className="w-full py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
