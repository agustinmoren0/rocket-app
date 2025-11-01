'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, Clock, Edit2, Trash2, X, Activity, CheckCircle2 } from 'lucide-react';
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
  const [events, setEvents] = useState<Event[]>([]);

  // Memoized getCycleDayInfo para optimización con 5M+ usuarios
  const getCycleDayInfo = useCallback((dayNumber: number) => {
    if (!cycleData.isActive) return null;

    const lastPeriod = new Date(cycleData.lastPeriodStart);
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    const daysSince = Math.floor((targetDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSince % cycleData.cycleLengthDays) + 1;

    const isPeriod = cycleDay <= cycleData.periodLengthDays;
    const isFertile = cycleDay >= Math.floor(cycleData.cycleLengthDays / 2) - 5 &&
                     cycleDay <= Math.floor(cycleData.cycleLengthDays / 2) + 2;

    return { isPeriod, isFertile, cycleDay };
  }, [cycleData, currentDate]);

  // Función optimizada para cargar eventos
  const loadEventsFromCalendar = useCallback(() => {
    try {
      const calendar = JSON.parse(localStorage.getItem('habika_calendar') || '{}');
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = calendar[dateStr];

      if (dayData && (dayData.activities || dayData.habits)) {
        const loadedActivities = (dayData.activities || []).map((act: any) => ({
          id: act.id,
          hour: new Date(act.timestamp).getHours(),
          day: currentDate.getDate(),
          title: act.name,
          duration: act.unit === 'hora(s)' ? act.duration * 60 : act.duration,
          color: act.color || '#FF99AC',
          type: 'activity' as const
        }));

        const loadedHabits = (dayData.habits || []).map((hab: any) => ({
          id: hab.id,
          hour: new Date(hab.timestamp || new Date()).getHours(),
          day: currentDate.getDate(),
          title: hab.name,
          duration: hab.duration || 20,
          color: hab.color || '#FFC0A9',
          type: 'habit' as const
        }));

        setEvents([...loadedActivities, ...loadedHabits]);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar eventos:', error);
      setEvents([]);
    }
  }, [currentDate]);

  // Load events from localStorage con optimización
  useEffect(() => {
    loadEventsFromCalendar();

    // Listener para cambios en storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'habika_calendar') {
        loadEventsFromCalendar();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadEventsFromCalendar]);

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
    <main className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0] pb-40">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="text-[#FF99AC] hover:text-[#FFC0A9] transition-colors"
          >
            ← Volver
          </motion.button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#3D2C28]">Calendario</h1>
            <p className="text-sm text-[#A67B6B]">Tu progreso mes a mes</p>
          </div>
          <div className="w-20" />
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 border border-[#FFB4A8]/30 shadow-sm">
          {[
            { key: 'day', label: 'Diario' },
            { key: 'week', label: 'Semanal' },
            { key: 'month', label: 'Mensual' }
          ].map((v) => (
            <motion.button
              key={v.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setView(v.key as any)}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                view === v.key
                  ? 'bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white shadow-md'
                  : 'text-[#3D2C28] hover:bg-[#FFF5F0]'
              }`}
            >
              {v.label}
            </motion.button>
          ))}
        </div>

        {/* Period Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-4 border border-[#FFB4A8]/30 shadow-sm">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPrevPeriod}
            className="p-2 hover:bg-[#FFF5F0] rounded-lg transition-colors text-[#3D2C28]"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <h2 className="text-lg font-bold text-[#3D2C28] capitalize">
            {view === 'day'
              ? `${selectedDay} de ${currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
              : currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            }
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextPeriod}
            className="p-2 hover:bg-[#FFF5F0] rounded-lg transition-colors text-[#3D2C28]"
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        {/* Vista Diaria */}
        {view === 'day' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-[#FFB4A8]/30 shadow-sm space-y-2"
          >
            {Array.from({ length: 24 }).map((_, hour) => {
              const event = events.find(e => e.hour === hour && e.day === selectedDay);
              return (
                <div key={hour} className="flex items-start gap-3 py-3 border-b border-[#FFB4A8]/20 last:border-0">
                  <span className="text-sm text-[#A67B6B] w-16 font-medium">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex-1">
                    {event ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full p-3 rounded-xl text-white text-left transition-all"
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="flex items-center gap-2">
                          {event.type === 'habit' ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <Activity size={16} />
                          )}
                          <p className="font-medium flex-1">{event.title}</p>
                        </div>
                        <p className="text-xs opacity-80 ml-6">{event.duration} min</p>
                      </motion.button>
                    ) : (
                      <div className="h-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Vista Semanal */}
        {view === 'week' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-[#FFB4A8]/30 shadow-sm space-y-3"
          >
            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dayName, i) => {
              const startOfWeek = new Date(currentDate);
              startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + i);

              const dayNumber = dayDate.getDate();
              const dayEvents = events.filter(e => e.day === dayNumber);
              const isExpanded = expandedDays.includes(i);

              return (
                <motion.div
                  key={i}
                  className="border border-[#FFB4A8]/20 rounded-xl overflow-hidden hover:border-[#FFB4A8]/40 transition-colors"
                >
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255, 180, 168, 0.05)' }}
                    onClick={() => toggleDayExpand(i)}
                    className="w-full p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-bold text-[#3D2C28]">
                        {dayName} {dayNumber}
                      </p>
                      <p className="text-sm text-[#A67B6B]">
                        {dayDate.toLocaleDateString('es-ES', { month: 'short' })} · {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-[#FF99AC]" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && dayEvents.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 space-y-2 bg-[#FFF5F0]/50"
                      >
                        {dayEvents.map(event => (
                          <motion.button
                            key={event.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setSelectedEvent(event)}
                            className="w-full p-3 rounded-xl text-white text-left transition-all flex items-center gap-2"
                            style={{ backgroundColor: event.color }}
                          >
                            {event.type === 'habit' ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <Activity size={16} />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-xs opacity-80">{event.hour}:00 · {event.duration} min</p>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Vista Mensual */}
        {view === 'month' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-[#FFB4A8]/30 shadow-sm space-y-6"
          >
            {/* Sección de Hábitos y Actividades */}
            <div>
              <h3 className="text-lg font-bold text-[#3D2C28] mb-4">Hábitos & Actividades</h3>

              {/* Calendar Grid Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                  <div key={day} className="text-center text-sm font-bold text-[#3D2C28] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid - Hábitos y Actividades */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate();
                  const dayEvents = events.filter(e => e.day === day);

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedDay(day);
                        if (dayEvents.length > 0) toggleDayExpand(day);
                      }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative font-medium text-sm ${
                        isToday
                          ? 'bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] text-white shadow-md border-2 border-[#FF99AC]'
                          : selectedDay === day
                          ? 'bg-[#FFF5F0] border-2 border-[#F8C8C2] text-[#3D2C28]'
                          : dayEvents.length > 0
                          ? 'bg-white border-2 border-[#FFB4A8]/40 text-[#3D2C28] hover:bg-[#FFF5F0]'
                          : 'bg-white text-[#3D2C28] border border-[#FFB4A8]/20 hover:bg-[#FFF5F0]'
                      }`}
                    >
                      <span>{day}</span>

                      {/* Indicadores de eventos - Puntos suaves */}
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Sección de Modo Ciclo - Separada visualmente */}
            {cycleData.isActive && (
              <div className="pt-6 border-t border-[#FFB4A8]/20">
                <h3 className="text-lg font-bold text-[#3D2C28] mb-4">Tu Ciclo</h3>

                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                    <div key={day} className="text-center text-sm font-bold text-[#3D2C28] py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid - Modo Ciclo */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-cycle-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate();
                    const cycleInfo = getCycleDayInfo(day);

                    return (
                      <motion.button
                        key={`cycle-${day}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all relative font-medium text-sm ${
                          isToday
                            ? 'border-2 border-[#F8C8C2] text-[#3D2C28]'
                            : 'text-[#3D2C28]'
                        } ${
                          cycleInfo?.isPeriod
                            ? 'bg-[#FDEEEE] border-2 border-[#FCE8E6]'
                            : cycleInfo?.isFertile
                            ? 'bg-white border-2 border-[#F9D68F] shadow-[0_0_0_2px_rgba(249,214,143,0.3)]'
                            : 'bg-white text-[#3D2C28] border border-[#FFB4A8]/20 hover:bg-[#FFF5F0]'
                        } ${isToday ? 'border-[#F8C8C2]' : ''}`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Leyenda del ciclo - Minimalista */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-[#FFF4F2] rounded-xl border border-[#FFB4A8]/20"
                >
                  <p className="text-xs font-semibold text-[#6B5B56] mb-3 uppercase tracking-wide">Leyenda del ciclo</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#FDEEEE] border border-[#FCE8E6]" />
                      <span className="text-[#6B5B56]">Período</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-[#F9D68F]" />
                      <span className="text-[#6B5B56]">Ventana fértil</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Eventos del día seleccionado */}
            <AnimatePresence>
              {expandedDays.includes(selectedDay) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 pt-6 border-t border-[#FFB4A8]/20 space-y-3"
                >
                  <h3 className="font-bold text-[#3D2C28] mb-3">
                    {selectedDay} de {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                  </h3>
                  {events.filter(e => e.day === selectedDay).map((event) => (
                    <motion.button
                      key={event.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full p-4 rounded-xl flex items-center gap-3 text-white text-left transition-all"
                      style={{ backgroundColor: event.color }}
                    >
                      {event.type === 'habit' ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Activity size={18} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm opacity-80">{event.hour}:00 · {event.duration} min</p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal Editar/Eliminar mejorado */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#FFB4A8]/30 shadow-lg"
            >
              {/* Header con close button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {selectedEvent.type === 'habit' ? (
                    <div className="p-2 bg-[#FFF5F0] rounded-lg">
                      <CheckCircle2 size={20} className="text-[#FF99AC]" />
                    </div>
                  ) : (
                    <div className="p-2 bg-[#FFF5F0] rounded-lg">
                      <Activity size={20} className="text-[#FFC0A9]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-[#3D2C28]">{selectedEvent.title}</h3>
                    <p className="text-xs text-[#A67B6B]">
                      {selectedEvent.type === 'habit' ? 'Hábito' : 'Actividad'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-[#FFF5F0] rounded-lg transition-colors text-[#3D2C28]"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Información detallada */}
              <div className="bg-[#FFF5F0] rounded-xl p-4 mb-6 space-y-2">
                <div className="flex items-center gap-2 text-[#3D2C28]">
                  <Clock size={16} className="text-[#FF99AC]" />
                  <span className="text-sm font-medium">
                    {selectedEvent.hour.toString().padStart(2, '0')}:00 · {selectedEvent.duration} min
                  </span>
                </div>
                {selectedEvent.type === 'habit' && (
                  <div className="text-xs text-[#A67B6B]">
                    Hábito registrado
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedEvent(null);
                    if (selectedEvent.type === 'habit') {
                      router.push(`/biblioteca?edit=${selectedEvent.id}`);
                    } else {
                      router.push(`/editar-actividad/${selectedEvent.id}`);
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-[#FFB4A8] text-[#3D2C28] font-medium flex items-center justify-center gap-2 hover:bg-[#FFF5F0] transition-colors"
                >
                  <Edit2 size={18} />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={18} />
                  Eliminar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </main>
  );
}
