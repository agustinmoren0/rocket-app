/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá app/historial/page.tsx
2. Pegá este código
*/

'use client'

import { useRouter } from 'next/navigation';
import { loadData } from '../lib/store';

export default function HistorialPage() {
  const router = useRouter();
  const data = loadData();

  const weeks = [
    {
      label: 'Semana actual',
      data: data.currentWeek,
      isActive: true
    }
  ];

  if (data.previousWeek) {
    weeks.push({
      label: 'Semana pasada',
      data: data.previousWeek,
      isActive: false
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800">
          Historial
        </h1>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50"
        >
          ✕
        </button>
      </header>

      <div className="px-6 space-y-4 pb-12">
        {weeks.map((week, i) => {
          const activeDays = week.data.activeDays.filter(Boolean).length;
          const progress = Math.round((activeDays / 7) * 100);

          return (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp"
              style={{animationDelay: `${i * 0.1}s`}}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{week.label}</h3>
                  <p className="text-sm text-slate-500">
                    {formatWeekRange(week.data.startDate)}
                  </p>
                </div>
                {week.isActive && (
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    En curso
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{progress}%</p>
                  <p className="text-xs text-slate-500">Completado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{activeDays}/7</p>
                  <p className="text-xs text-slate-500">Días activos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{week.data.totalMinutes}</p>
                  <p className="text-xs text-slate-500">Minutos</p>
                </div>
              </div>

              {/* Mini gráfico de burbujas */}
              <div className="flex justify-around items-end h-16 px-2 bg-slate-50 rounded-2xl py-2">
                {week.data.activeDays.map((active, j) => (
                  <div key={j} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full ${active ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span className="text-xs text-slate-400">
                      {['L','M','X','J','V','S','D'][j]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {weeks.length === 1 && (
          <div className="text-center py-8">
            <p className="text-slate-500">
              Seguí registrando actividades para ver tu historial 📊
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function formatWeekRange(startDate: string): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
}
