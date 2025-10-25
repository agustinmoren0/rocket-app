/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/page.tsx con este código completo
UI rediseñada: centrada, minimalista, glassmorphism
*/

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CircularProgress from './components/CircularProgress';
import InsightCard from './components/InsightCard';
import StreakCard from './components/StreakCard';
import ShareButton from './components/ShareButton';
import { loadData, getWeekProgress, getImprovement, getCurrentStreak, getBestStreak } from './lib/store';

export default function Home() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(() => loadData());
  const [showActivities, setShowActivities] = useState(false);

  useEffect(() => {
    const userData = loadData();

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
  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header minimalista centrado */}
      <header className="max-w-2xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hola, {data.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/perfil"
          className="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-all"
        >
          <span className="text-lg">⚙️</span>
        </Link>
      </header>

      {/* Quick links */}
      <div className="max-w-2xl mx-auto px-6 mb-6 flex gap-3 animate-fadeIn">
        <Link
          href="/balance"
          className="flex-1 h-12 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-white transition-all"
        >
          <span>📊</span>
          Tu Balance
        </Link>
        <Link
          href="/historial"
          className="flex-1 h-12 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-white transition-all"
        >
          <span>📅</span>
          Historial
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-5 pb-24">
        {/* Progreso principal - Card flotante */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Tu semana</h2>
            <Link href="/historial" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Historial →
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <CircularProgress percentage={progress} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{activeDays}/7</p>
              <p className="text-sm text-slate-500 mt-1">Días activos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{data.currentWeek.totalMinutes}</p>
              <p className="text-sm text-slate-500 mt-1">Minutos</p>
            </div>
          </div>

          {improvement !== 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className={`text-lg font-bold ${improvement > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {improvement > 0 ? '+' : ''}{improvement}% vs semana pasada
              </p>
            </div>
          )}
        </section>

        {/* Racha */}
        <div className="animate-slideUp" style={{animationDelay: '0.1s'}}>
          <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} />
        </div>

        {/* Rocket Insights */}
        <div className="animate-slideUp" style={{animationDelay: '0.15s'}}>
          <InsightCard {...insight} />
        </div>

        {/* Actividades O Empty state */}
        {data.currentWeek.activities.length > 0 ? (
          <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 animate-slideUp" style={{animationDelay: '0.2s'}}>
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-slate-800">
                Actividades recientes
              </h2>
              <span className="text-slate-400 text-xl">{showActivities ? '−' : '+'}</span>
            </button>

            {showActivities && (
              <div className="mt-4 space-y-3 animate-fadeIn">
                {data.currentWeek.activities.slice(-5).reverse().map((act, i) => {
                  const actualIndex = data.currentWeek.activities.length - 1 - i;
                  return (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                      {act.emotion && (
                        <span className="text-2xl flex-shrink-0">{act.emotion}</span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600">
                          {act.minutes}m
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 line-clamp-2">{act.note}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(act.date)}
                        </p>
                      </div>
                      <Link
                        href={`/editar?date=${act.date}&index=${actualIndex}`}
                        className="text-indigo-600 text-xs hover:text-indigo-700 font-medium"
                      >
                        Editar
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <div className="bg-gradient-to-br from-slate-50/80 to-indigo-50/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center animate-slideUp" style={{animationDelay: '0.2s'}}>
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Empezá tu semana
            </h3>
            <p className="text-slate-600 mb-6">
              Cada día es una oportunidad para avanzar.
            </p>
          </div>
        )}

        {/* Botones de acción - flotantes */}
        <div className="space-y-3 animate-slideUp" style={{animationDelay: '0.25s'}}>
          <ShareButton
            name={data.name}
            progress={progress}
            activeDays={activeDays}
            minutes={data.currentWeek.totalMinutes}
            streak={currentStreak}
          />

          <Link
            href="/reflexion"
            className="block w-full h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <span className="mr-2 text-xl">+</span>
            Registrar actividad
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[date.getDay()];
}
