'use client'
import { useMemo } from 'react';
import { loadData } from '@/app/lib/store';

export default function SummaryPage() {
  const data = loadData();
  const activities = data.currentWeek.activities;
  const byDay = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach(a => {
      const d = new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' });
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [activities]);

  return (
    <main className="min-h-dvh bg-slate-50 p-6">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Tu Flow de la semana</h1>

        <section className="rounded-2xl bg-white border p-5">
          <h2 className="font-medium mb-4">Resumen de tu actividad</h2>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['L','M','X','J','V','S','D'].map((d) => {
              const key = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).formatToParts(new Date(`2020-01-0${(d==='D'?7:d==='S'?6:d==='V'?5:d==='J'?4:d==='X'?3:d==='M'?2:1)}`)).find(p=>p.type==='weekday')?.value ?? d;
              const v = byDay[key] || 0;
              return (
                <div key={d} className="flex flex-col items-center gap-2">
                  <div className="w-8 h-16 rounded-full bg-indigo-100 overflow-hidden">
                    <div style={{height: `${Math.min(100, v*20)}%`}} className="w-full bg-indigo-500 mt-auto" />
                  </div>
                  <span className="text-xs text-slate-500">{d}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white border p-5 space-y-3">
          <h2 className="font-medium">Rocket Insights ✨</h2>
          <p className="text-slate-700">• Despegue total el jueves — tu día de mayor flujo creativo.</p>
          <p className="text-slate-700">• Constancia que florece — 3 días seguidos activos.</p>
          <p className="text-slate-700">• Vaya mejora — +30% vs. semana pasada.</p>
        </section>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Mi progreso', text: 'Mi semana creativa en Rocket', url: location.href }).catch(()=>{});
            } else {
              alert('En tu dispositivo podés compartir esta página desde el menú.');
            }
          }}
          className="w-full h-12 rounded-full bg-indigo-600 text-white font-medium shadow-sm"
        >
          Compartir mi progreso
        </button>
      </div>
    </main>
  );
}
