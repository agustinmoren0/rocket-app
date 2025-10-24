// app/onboarding/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding, loadData } from '../lib/store';

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
    title: 'Todo listo para despegar',
    subtitle: 'Visualizá tu progreso y desatá tu creatividad.',
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const data = loadData();
    if (data.onboardingDone) router.replace('/');
  }, [router]);

  function handleNext() {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else if (step === slides.length - 1) {
      setStep(slides.length); // pantalla de nombre
    }
  }

  function handleFinish() {
    const finalName = name.trim() || 'Usuario';
    completeOnboarding(finalName);
    router.replace('/');
  }

  // Pantalla de captura de nombre
  if (step === slides.length) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <span className="text-6xl mb-6 block">🚀</span>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              ¿Cómo te llamás?
            </h1>
            <p className="text-slate-600">
              Así te vamos a saludar cada día
            </p>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full h-14 px-5 rounded-2xl bg-white border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none text-center text-lg"
            autoFocus
          />
        </div>

        <button
          onClick={handleFinish}
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg"
        >
          Empezar mi semana
        </button>
      </main>
    );
  }

  // Slides de onboarding
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 py-10 flex flex-col">
      {/* Dots */}
      <div className="flex justify-center gap-2 mb-10">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === step ? 'bg-indigo-600' : 'bg-indigo-200'
            }`}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col justify-center text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight px-4">
          {slides[step].title}
        </h1>
        <p className="text-slate-600 max-w-sm mx-auto">
          {slides[step].subtitle}
        </p>
      </div>

      {/* Botones */}
      <div className="space-y-4 pb-6">
        <button
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg"
        >
          Continuar
        </button>
        
        {step < slides.length - 1 && (
          <button 
            onClick={() => setStep(slides.length)}
            className="text-slate-600 underline"
          >
            Saltar onboarding
          </button>
        )}
      </div>
    </main>
  );
}
