// app/summary/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WeekChart from '../components/WeekChart';
import { loadData, type Activity } from '../lib/store';

export default function SummaryPage() {
  const router = useRouter();
  const [data, setData] = useState(() => loadData());

  useEffect(() => {
    setData(loadData());
  }, []);

  const activeDays = data.currentWeek.activeDays.filter(Boolean).length;
  const bestDay = getBestDay(data.currentWeek.activities);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Tu Flow de la semana
        </h1>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
        >
          ✕
        </button>
      </header>

      <div className="px-6 space-y-6 pb-12">
        {/* Gráfico semanal */}
        <section className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-2">
            Resumen de tu actividad
          </h2>
          <p className="text-sm text-slate-500 mb-4">Últimos 7 días</p>
          
          <WeekChart activeDays={data.currentWeek.activeDays} />
        </section>

        {/* Insights */}
        <div className="space-y-4">
          {bestDay && (
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  ¡Despegue total el {bestDay.day}!
                </h3>
                <p className="text-sm text-slate-600">
                  Tu día de mayor flujo creativo con {bestDay.minutes} minutos.
                </p>
              </div>
            </div>
          )}

          {activeDays >= 3 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
              <span className="text-3xl">🌱</span>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  Constancia que florece
                </h3>
                <p className="text-sm text-slate-600">
                  Has mantenido un ritmo constante durante {activeDays} días seguidos.
                </p>
              </div>
            </div>
          )}

          {data.currentWeek.totalMinutes >= 300 && (
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
              <span className="text-3xl">✨</span>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">
                  ¡Vaya mejora!
                </h3>
                <p className="text-sm text-slate-600">
                  Acumulaste {data.currentWeek.totalMinutes} minutos creativos esta semana.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actividades */}
        {data.currentWeek.activities.length > 0 && (
          <section className="bg-white rounded-3xl shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              Tus actividades
            </h2>
            <div className="space-y-3">
              {data.currentWeek.activities.slice(-5).reverse().map((act, i) => (
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Compartir (futuro) */}
        <button className="w-full h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg">
          Compartir mi progreso
        </button>
      </div>
    </main>
  );
}

// Helpers
function getBestDay(activities: Activity[]) {
  if (activities.length === 0) return null;
  
  const dayTotals = activities.reduce((acc, act) => {
    acc[act.date] = (acc[act.date] || 0) + act.minutes;
    return acc;
  }, {} as Record<string, number>);
  
  const best = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;
  
  return {
    day: formatDate(best[0]),
    minutes: best[1]
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[date.getDay()];
}
