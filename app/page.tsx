// app/page.tsx - Dashboard principal
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CircularProgress from './components/CircularProgress';
import InsightCard from './components/InsightCard';
import { loadData, getWeekProgress, getImprovement } from './lib/store';

export default function Home() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    const userData = loadData();
    
    // Redirigir a onboarding si no lo completó
    if (!userData.onboardingDone) {
      router.replace('/onboarding');
      return;
    }
    
    setData(userData);
    setLoaded(true);
  }, [router]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </main>
    );
  }

  const progress = getWeekProgress();
  const improvement = getImprovement();
  const activeDays = data.currentWeek.activeDays.filter(Boolean).length;

  // Insight inteligente basado en actividad
  const getInsight = () => {
    if (activeDays >= 5) return {
      icon: '🚀',
      title: '¡Despegue total!',
      description: 'Estás en racha. Tu constancia es increíble.'
    };
    if (activeDays >= 3) return {
      icon: '☀️',
      title: 'Ritmo saludable',
      description: 'Mantenés un flujo constante y sostenible.'
    };
    return {
      icon: '🌱',
      title: 'Empezando tu semana',
      description: 'Cada día cuenta. Seguí avanzando a tu ritmo.'
    };
  };

  const insight = getInsight();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            ¡Hola, {data.name}!
          </h1>
        </div>
        <button className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </button>
      </header>

      <div className="px-6 space-y-6 pb-24">
        {/* Progreso semanal */}
        <section className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Progreso Semanal</h2>
            <Link href="/summary" className="text-sm font-medium text-indigo-600">
              Ver resumen →
            </Link>
          </div>
          
          <div className="flex justify-center py-4">
            <CircularProgress percentage={progress} />
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">Días activos</p>
            <p className="text-3xl font-bold text-indigo-600">{activeDays}/7</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">Minutos creativos</p>
            <p className="text-3xl font-bold text-indigo-600">
              {data.currentWeek.totalMinutes}
            </p>
          </div>
        </div>

        {/* Mejora */}
        {improvement !== 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500 mb-1">Mejora</p>
            <p className={`text-2xl font-bold ${improvement > 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {improvement > 0 ? '+' : ''}{improvement}%
            </p>
          </div>
        )}

        {/* Rocket Insights */}
        <InsightCard {...insight} />

        {/* CTA */}
        <Link
          href="/reflexion"
          className="block w-full h-14 rounded-full bg-indigo-600 text-white font-medium flex items-center justify-center shadow-lg"
        >
          <span className="mr-2">+</span>
          Registrar actividad
        </Link>
      </div>
    </main>
  );
}
