'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import BottomNav from '@/app/components/BottomNav';

export default function HistorialPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([]);

  const weeks = [
    { id: 1, range: 'Semana del 1 al 7 de Noviembre', progress: 85, days: [
      { day: 'Lunes', completed: true, activities: 3 },
      { day: 'Martes', completed: true, activities: 2 },
      { day: 'Miércoles', completed: false, activities: 0 },
    ]},
    { id: 2, range: 'Semana del 25 al 31 de Octubre', progress: 60, days: [
      { day: 'Lunes', completed: true, activities: 2 },
      { day: 'Martes', completed: false, activities: 0 },
    ]},
  ];

  const toggleWeek = (id: number) => {
    setExpandedWeeks(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-slate-600">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Historial Semanal 📊</h1>
          <div className="w-20" />
        </div>

        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week.id} className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 overflow-hidden">
              <button
                onClick={() => toggleWeek(week.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">{week.range}</h3>
                  <p className="text-sm text-red-500 font-medium mt-1">
                    {week.progress}% de Progreso
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">{week.progress}%</span>
                  </div>
                  {expandedWeeks.includes(week.id) ?
                    <ChevronUp className="text-slate-600" /> :
                    <ChevronDown className="text-slate-600" />
                  }
                </div>
              </button>

              {expandedWeeks.includes(week.id) && (
                <div className="px-5 pb-5 space-y-2">
                  {week.days.map((day, i) => (
                    <div key={i} className="p-4 bg-white/50 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{day.day}</p>
                        <p className="text-sm text-slate-600">{day.activities} actividades</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        day.completed ? 'bg-green-500' : 'bg-slate-300'
                      }`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
          <p className="text-sm text-slate-700 italic text-center">
            "La constancia es la llave que abre la puerta a la creatividad. ¡Sigue construyendo tu camino, un día a la vez!"
          </p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
