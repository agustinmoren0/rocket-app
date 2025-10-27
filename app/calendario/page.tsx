'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarioPage() {
  const router = useRouter();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Calendario 📅</h1>
          <div className="w-20" />
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-xl rounded-2xl p-1 border border-white/40">
          {['day', 'week', 'month'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                view === v
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              {v === 'day' ? 'Diario' : v === 'week' ? 'Semanal' : 'Mensual'}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/40">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-white/50 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-white/50 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        {view === 'month' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth();

                return (
                  <button
                    key={day}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white/50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-sm">{day}</span>
                    {Math.random() > 0.7 && (
                      <div className="w-1 h-1 rounded-full bg-green-500 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
