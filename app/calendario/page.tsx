'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import BottomNav from '../components/BottomNav';

export default function CalendarioPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  // Mock events para demo
  const mockEvents = [
    { hour: 9, title: 'Correr', duration: 30, color: 'bg-green-500' },
    { hour: 14, title: 'Meditar', duration: 20, color: 'bg-purple-500' },
    { hour: 18, title: 'Leer', duration: 40, color: 'bg-blue-500' },
  ];

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-slate-600">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Calendario 📅</h1>
          <div className="w-20" />
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 bg-white/60 backdrop-blur-xl rounded-2xl p-1 border border-white/40">
          {[
            { key: 'day', label: 'Diario' },
            { key: 'week', label: 'Semanal' },
            { key: 'month', label: 'Mensual' }
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key as any)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                view === v.key ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/40">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-white/50 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900 capitalize">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-white/50 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Vista Diaria */}
        {view === 'day' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 space-y-2">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="flex items-start gap-3 py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 w-16">
                  {hour.toString().padStart(2, '0')}:00
                </span>
                <div className="flex-1">
                  {mockEvents.find(e => e.hour === hour) ? (
                    <div className={`p-3 rounded-lg ${mockEvents.find(e => e.hour === hour)?.color} text-white`}>
                      <p className="font-medium">{mockEvents.find(e => e.hour === hour)?.title}</p>
                      <p className="text-xs opacity-80">{mockEvents.find(e => e.hour === hour)?.duration} min</p>
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vista Semanal */}
        {view === 'week' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 mb-2">{day}</p>
                  <button className="w-full aspect-square rounded-xl bg-white/50 hover:bg-white flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">{i + 20}</span>
                    {Math.random() > 0.5 && (
                      <div className="flex gap-1 mt-1">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <div className="w-1 h-1 rounded-full bg-purple-500" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vista Mensual */}
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
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      isToday ? 'bg-indigo-600 text-white font-bold' :
                      selectedDay === day ? 'bg-indigo-100 text-indigo-600' :
                      'bg-white/50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-sm">{day}</span>
                    {Math.random() > 0.7 && (
                      <div className="flex gap-0.5 mt-1">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <div className="w-1 h-1 rounded-full bg-purple-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actividades del día seleccionado */}
            {selectedDay && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 mb-3">
                  Actividades del {selectedDay} de {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                </h3>
                {mockEvents.map((event, i) => (
                  <div key={i} className="p-4 bg-white/50 rounded-xl flex items-center gap-3">
                    <Clock size={18} className="text-slate-500" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-600">{event.hour}:00 - {event.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
