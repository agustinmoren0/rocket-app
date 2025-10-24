/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/page.tsx con este código completo
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            ¡Hola, {data.name}!
          </h1>
        </div>
        <Link
          href="/perfil"
          className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200"
        >
          <span className="text-xl">👤</span>
        </Link>
      </header>

      <Link
        href="/historial"
        className="mx-6 mb-4 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        📊 Ver historial completo
      </Link>

      <div className="px-6 space-y-6 pb-24">
        {/* Progreso semanal */}
        <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Progreso Semanal</h2>
            <Link href="/summary" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Ver resumen →
            </Link>
          </div>

          <div className="flex justify-center py-4">
            <CircularProgress percentage={progress} />
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 animate-slideUp" style={{animationDelay: '0.1s'}}>
            <p className="text-sm text-slate-500 mb-1">Días activos</p>
            <p className="text-3xl font-bold text-indigo-600">{activeDays}/7</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 animate-slideUp" style={{animationDelay: '0.15s'}}>
            <p className="text-sm text-slate-500 mb-1">Minutos creativos</p>
            <p className="text-3xl font-bold text-indigo-600">
              {data.currentWeek.totalMinutes}
            </p>
          </div>
        </div>

        {/* Mejora */}
        {improvement !== 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 animate-slideUp" style={{animationDelay: '0.2s'}}>
            <p className="text-sm text-slate-500 mb-1">Mejora</p>
            <p className={`text-2xl font-bold ${improvement > 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {improvement > 0 ? '+' : ''}{improvement}%
            </p>
          </div>
        )}

        {/* Racha */}
        <div className="animate-slideUp" style={{animationDelay: '0.25s'}}>
          <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} />
        </div>

        {/* Rocket Insights */}
        <div className="animate-slideUp" style={{animationDelay: '0.3s'}}>
          <InsightCard {...insight} />
        </div>

        {/* Lista de actividades recientes */}
        {data.currentWeek.activities.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp" style={{animationDelay: '0.35s'}}>
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-slate-800">
                Actividades recientes
              </h2>
              <span className="text-slate-400">{showActivities ? '−' : '+'}</span>
            </button>

            {showActivities && (
              <div className="mt-4 space-y-3 animate-fadeIn">
                {data.currentWeek.activities.slice(-5).reverse().map((act, i) => {
                  const actualIndex = data.currentWeek.activities.length - 1 - i;
                  return (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
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
                        className="text-indigo-600 text-xs hover:text-indigo-700"
                      >
                        Editar
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Compartir progreso */}
        <div className="animate-slideUp" style={{animationDelay: '0.38s'}}>
          <ShareButton
            name={data.name}
            progress={progress}
            activeDays={activeDays}
            minutes={data.currentWeek.totalMinutes}
            streak={currentStreak}
          />
        </div>

        {/* CTA */}
        <Link
          href="/reflexion"
          className="block w-full h-14 rounded-full bg-indigo-600 text-white font-medium flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:shadow-xl animate-scaleIn"
          style={{animationDelay: '0.4s'}}
        >
          <span className="mr-2">+</span>
          Registrar actividad
        </Link>
      </div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[date.getDay()];
}
