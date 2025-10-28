'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, Clock, Edit2, Trash2, X, Droplet, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCycle } from '../context/CycleContext';
import BottomNav from '../components/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  hour: number;
  day: number;
  title: string;
  duration: number;
  color: string;
  type: 'activity' | 'habit';
}

export default function CalendarioPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { cycleData } = useCycle();
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  // Helper function to get cycle info for a specific day
  const getCycleDayInfo = (dayNumber: number) => {
    if (!cycleData.isActive) return null;

    const lastPeriod = new Date(cycleData.lastPeriodStart);
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    const daysSince = Math.floor((targetDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSince % cycleData.cycleLengthDays) + 1;

    const isPeriod = cycleDay <= cycleData.periodLengthDays;
    const isFertile = cycleDay >= Math.floor(cycleData.cycleLengthDays / 2) - 5 &&
                     cycleDay <= Math.floor(cycleData.cycleLengthDays / 2) + 2;

    return { isPeriod, isFertile, cycleDay };
  };

  // Mock events
  const [events, setEvents] = useState<Event[]>([
    { id: '1', hour: 9, day: 26, title: 'Correr', duration: 30, color: 'bg-green-500', type: 'activity' },
    { id: '2', hour: 14, day: 26, title: 'Meditar', duration: 20, color: 'bg-purple-500', type: 'habit' },
    { id: '3', hour: 18, day: 27, title: 'Leer', duration: 40, color: 'bg-blue-500', type: 'activity' },
  ]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const goToNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDay(newDate.getDate());
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToPrevPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDay(newDate.getDate());
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
    setSelectedEvent(null);
  };

  const toggleDayExpand = (day: number) => {
    setExpandedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-slate-600">
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendario</h1>
            <p className="text-sm text-slate-600">Tu progreso mes a mes</p>
          </div>
          <div className="w-20" />
        </div>

        {/* View Selector */}
        <div className={`flex gap-2 mb-6 ${currentTheme.bgCard} rounded-2xl p-1 border border-white/40`}>
          {[
            { key: 'day', label: 'Diario' },
            { key: 'week', label: 'Semanal' },
            { key: 'month', label: 'Mensual' }
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key as any)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                view === v.key ? `bg-indigo-600 text-white` : 'text-slate-600'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Period Navigation */}
        <div className={`flex items-center justify-between mb-6 ${currentTheme.bgCard} rounded-2xl p-4 border border-white/40`}>
          <button onClick={goToPrevPeriod} className="p-2 hover:bg-white/50 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-900 capitalize">
            {view === 'day'
              ? `${selectedDay} de ${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
              : currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            }
          </h2>
          <button onClick={goToNextPeriod} className="p-2 hover:bg-white/50 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Vista Diaria */}
        {view === 'day' && (
          <div className={`${currentTheme.bgCard} rounded-2xl p-6 border border-white/40 space-y-2`}>
            {Array.from({ length: 24 }).map((_, hour) => {
              const event = events.find(e => e.hour === hour && e.day === selectedDay);
              return (
                <div key={hour} className="flex items-start gap-3 py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500 w-16">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex-1">
                    {event ? (
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full p-3 rounded-lg ${event.color} text-white text-left hover:opacity-90 transition-opacity`}
                      >
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs opacity-80">{event.duration} min</p>
                      </button>
                    ) : (
                      <div className="h-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vista Semanal */}
        {view === 'week' && (
          <div className={`${currentTheme.bgCard} rounded-2xl p-6 border border-white/40 space-y-3`}>
            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dayName, i) => {
              // Calcular la fecha específica de cada día de la semana
              const startOfWeek = new Date(currentDate);
              startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + i);

              const dayNumber = dayDate.getDate();
              const dayEvents = events.filter(e => e.day === dayNumber);
              const isExpanded = expandedDays.includes(i);

              return (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleDayExpand(i)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-900">
                        {dayName} {dayNumber}
                      </p>
                      <p className="text-sm text-slate-600">
                        {dayDate.toLocaleDateString('es-ES', { month: 'short' })} - {dayEvents.length} actividades
                      </p>
                    </div>
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </button>

                  {isExpanded && dayEvents.length > 0 && (
                    <div className="px-4 pb-4 space-y-2">
                      {dayEvents.map(event => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`w-full p-3 rounded-lg ${event.color} text-white text-left`}
                        >
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs opacity-80">{event.hour}:00 - {event.duration} min</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Vista Mensual */}
        {view === 'month' && (
          <div className={`${currentTheme.bgCard} rounded-2xl p-6 border border-white/40`}>
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
                const isToday = day === new Date().getDate();
                const dayEvents = events.filter(e => e.day === day);
                const cycleInfo = getCycleDayInfo(day);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      if (dayEvents.length > 0) toggleDayExpand(day);
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${
                      isToday ? `${currentTheme.gradient} text-white font-bold` :
                      selectedDay === day ? 'bg-indigo-100 text-indigo-600' :
                      cycleInfo?.isPeriod ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                      cycleInfo?.isFertile ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' :
                      'bg-white/50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-sm">{day}</span>

                    {/* Indicador de eventos */}
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-green-500" />
                        ))}
                      </div>
                    )}

                    {/* Indicador de ciclo */}
                    {cycleInfo?.isPeriod && (
                      <div className="absolute top-1 right-1">
                        <Droplet size={12} className="text-red-500 fill-red-500" />
                      </div>
                    )}
                    {cycleInfo?.isFertile && (
                      <div className="absolute top-1 right-1">
                        <Sparkles size={12} className="text-amber-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda del ciclo */}
            {cycleData.isActive && (
              <div className="mt-6 p-4 bg-rose-50 rounded-xl">
                <p className="text-sm font-medium text-slate-900 mb-3">Leyenda del ciclo:</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-red-500 fill-red-500" />
                    <span className="text-slate-700">Periodo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-slate-700">Ventana fértil</span>
                  </div>
                </div>
              </div>
            )}

            {/* Eventos del día seleccionado */}
            {expandedDays.includes(selectedDay) && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 mb-3">
                  {selectedDay} de {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                </h3>
                {events.filter(e => e.day === selectedDay).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full p-4 rounded-xl flex items-center gap-3 ${event.color} text-white text-left`}
                  >
                    <Clock size={18} />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm opacity-80">{event.hour}:00 - {event.duration} min</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Editar/Eliminar */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className={`${currentTheme.bgCard} rounded-3xl p-6 max-w-sm w-full border border-white/40`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                {selectedEvent.hour}:00 - {selectedEvent.duration} minutos
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    // Redirigir según tipo
                    if (selectedEvent.type === 'habit') {
                      router.push(`/biblioteca?edit=${selectedEvent.id}`);
                    } else {
                      router.push(`/editar-actividad/${selectedEvent.id}`);
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-200 font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 size={18} />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </main>
  );
}
