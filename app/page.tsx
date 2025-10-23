'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ONB_KEY = 'rocket.onboardingDone';

export default function Home() {
  const router = useRouter();

  // Redirección automática al onboarding si el usuario nunca lo completó
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem(ONB_KEY) === '1';
    if (!done) router.replace('/onboarding');
  }, [router]);

  // Vista principal del dashboard
  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-6 space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Tu progreso semanal</h1>
        <div className="flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-indigo-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">+15%</span>
          </div>
          <p className="text-slate-600 mt-2">Mejora respecto a la semana pasada</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-indigo-50 py-3">
            <p className="text-sm text-slate-500">Días activos</p>
            <p className="text-xl font-semibold text-indigo-700">4/7</p>
          </div>
          <div className="rounded-2xl bg-indigo-50 py-3">
            <p className="text-sm text-slate-500">Minutos creativos</p>
            <p className="text-xl font-semibold text-indigo-700">240</p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-4">
          <h2 className="font-semibold text-indigo-700 mb-1">Rocket Insights ✨</h2>
          <p className="text-slate-700 text-sm">
            Creaste más antes del mediodía. ¡Parece tu hora ideal ☀️!
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/summary"
            className="block w-full h-12 rounded-full bg-indigo-600 text-white font-medium flex items-center justify-center shadow-sm"
          >
            Ver resumen semanal
          </Link>
          <Link
            href="/reflexion"
            className="block w-full h-12 rounded-full bg-slate-100 text-slate-800 font-medium flex items-center justify-center shadow-sm"
          >
            Escribir reflexión del día
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          🚀 Rocket te ayuda a visualizar tu progreso real, sin culpa.
        </p>
      </div>
    </main>
  );
}
