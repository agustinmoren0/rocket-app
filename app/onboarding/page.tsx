'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadData, completeOnboarding } from '@/app/lib/store';

type Slide = { title: string; subtitle: string };

const slides: Slide[] = [
  {
    title: 'No te midas, enténdete.',
    subtitle: 'Rocket te ayuda a ver tu progreso creativo, no a juzgarlo.',
  },
  {
    title: 'Rocket te muestra tu progreso real.',
    subtitle: 'Sin tareas, sin culpa.',
  },
  {
    title: 'Todo listo para despegar 🚀',
    subtitle: 'Visualizá tu progreso y desatá tu creatividad.',
  },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const r = useRouter();

  useEffect(() => {
    const data = loadData();
    if (data.onboardingDone) {
      r.replace('/'); // si ya lo hizo, va directo al dashboard
    }
  }, [r]);

  function finish() {
    completeOnboarding('Usuario');
    r.replace('/');
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-50 to-white px-6 py-10 flex flex-col">
      {/* dots */}
      <div className="flex justify-center gap-2 mb-10">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 w-2 rounded-full ${idx===i ? 'bg-indigo-600' : 'bg-indigo-300'}`}
          />
        ))}
      </div>

      {/* copy */}
      <div className="mt-auto text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{slides[i].title}</h1>
        <p className="text-slate-600 max-w-xs mx-auto">{slides[i].subtitle}</p>
      </div>

      {/* actions */}
      <div className="mt-auto grid gap-4 pb-6">
        {i < slides.length - 1 ? (
          <>
            <button
              onClick={() => setI((v) => Math.min(v + 1, slides.length - 1))}
              className="h-12 rounded-full bg-indigo-600 text-white font-medium shadow-sm"
            >
              Continuar
            </button>
            <button onClick={finish} className="text-slate-800 underline">
              Saltar onboarding
            </button>
          </>
        ) : (
          <button onClick={finish} className="h-12 rounded-full bg-indigo-600 text-white font-medium shadow-sm">
            Empezar mi semana
          </button>
        )}
      </div>
    </main>
  );
}
