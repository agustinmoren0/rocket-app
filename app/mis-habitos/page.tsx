'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, MinusCircle, Circle, Plus, MoreVertical, Edit2, Trash2,
  PauseCircle, Play, Flame, Target, ChevronRight, SkipForward
} from 'lucide-react';
import { shouldShowHabitToday, getHabitStatus, markHabitComplete } from '../lib/habitLogic';
import confetti from 'canvas-confetti';

export default function MisHabitosPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'formar' | 'dejar' | 'todos'>('formar');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [swipedHabit, setSwipedHabit] = useState<string | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored);
  };

  const filteredHabits = habits.filter((h) => {
    if (filter === 'todos') return true;
    if (filter === 'formar') return h.type === 'formar' || !h.type;
    if (filter === 'dejar') return h.type === 'dejar';
    return true;
  }).filter((h) => h.status === 'active');

  const todayHabits = filteredHabits.filter(
    (h) => h.status === 'active' && shouldShowHabitToday(h)
  );

  const handleComplete = (habitId: string) => {
    markHabitComplete(habitId, 'completed');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    loadHabits();
  };

  const handleSkip = (habitId: string) => {
    if (confirm('¿Marcar como omitido hoy?\nEsto no romperá tu racha.')) {
      markHabitComplete(habitId, 'skipped', 'Omitido por el usuario');
      loadHabits();
    }
  };

  const handlePause = (habitId: string) => {
    const reason = prompt(
      '¿Por qué pausas este hábito?\nEj: vacaciones, enfermedad, cambio de rutina...'
    );
    if (!reason) return;

    const updated = habits.map((h) =>
      h.id === habitId
        ? {
          ...h,
          status: 'paused',
          pausedAt: new Date().toISOString(),
          pausedReason: reason,
        }
        : h
    );

    setHabits(updated);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
    setShowActionMenu(null);
  };

  const handleResume = (habitId: string) => {
    const updated = habits.map((h) =>
      h.id === habitId
        ? { ...h, status: 'active', pausedAt: undefined, pausedReason: undefined }
        : h
    );

    setHabits(updated);
    localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
  };

  const handleDelete = (habitId: string) => {
    if (confirm('¿Eliminar este hábito?\nSe perderá todo el historial.')) {
      const updated = habits.filter((h) => h.id !== habitId);
      setHabits(updated);
      localStorage.setItem('habika_custom_habits', JSON.stringify(updated));
      setShowActionMenu(null);
    }
  };

  const getStatusIcon = (habit: any) => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const status = getHabitStatus(habit, completions[habit.id] || []);

    if (status === 'completed') {
      return <CheckCircle2 size={24} className="text-emerald-500" />;
    }
    if (status === 'skipped') {
      return <MinusCircle size={24} className="text-amber-500" />;
    }
    return <Circle size={24} className="text-slate-300" />;
  };

  const handleTouchStart = (e: React.TouchEvent, habitId: string) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, habitId: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      setSwipedHabit(habitId);
    } else if (diff < -50) {
      setSwipedHabit(null);
    }
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-32 pt-20 lg:pt-8 lg:pb-8`}>
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mis Hábitos
          </h1>
          <p className={`text-sm ${currentTheme.textMuted}`}>
            {todayHabits.length} hábitos para hoy
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'formar', label: 'A Formar', count: habits.filter((h) => h.status === 'active' && (!h.type || h.type === 'formar')).length },
            { id: 'dejar', label: 'A Dejar', count: habits.filter((h) => h.status === 'active' && h.type === 'dejar').length },
            { id: 'todos', label: 'Todos', count: habits.filter((h) => h.status === 'active').length },
          ].map((filterOption) => (
            <motion.button
              key={filterOption.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === filterOption.id
                  ? `${currentTheme.gradient} text-white shadow-lg`
                  : `${currentTheme.bgCard} text-slate-700 border ${currentTheme.border}`
              }`}
            >
              {filterOption.label}
              <span className={`ml-2 text-sm ${
                filter === filterOption.id ? 'text-white/80' : 'text-slate-500'
              }`}>
                {filterOption.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Empty State */}
        {filteredHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${currentTheme.bgCard} rounded-3xl p-12 text-center border ${currentTheme.border}`}
          >
            <div className={`w-20 h-20 rounded-full ${currentTheme.primary} flex items-center justify-center mx-auto mb-4`}>
              <Target size={40} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No hay hábitos aquí
            </h2>
            <p className={`text-sm ${currentTheme.textMuted} mb-6`}>
              Comienza creando tu primer hábito
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/biblioteca')}
              className={`${currentTheme.gradient} text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2`}
            >
              <Plus size={20} />
              Crear hábito
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredHabits.map((habit, index) => {
                const completions = JSON.parse(
                  localStorage.getItem('habika_completions') || '{}'
                );
                const status = getHabitStatus(habit, completions[habit.id] || []);
                const showToday = shouldShowHabitToday(habit);
                const isActive = showActionMenu === habit.id || swipedHabit === habit.id;

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onTouchStart={(e) => handleTouchStart(e, habit.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, habit.id)}
                    className={`relative overflow-hidden ${currentTheme.bgCard} rounded-2xl border ${currentTheme.border} transition-all`}
                  >
                    {/* Swipe Actions Background */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4 bg-red-500/20">
                        <button className="p-2 bg-red-500 text-white rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}

                    {/* Content */}
                    <div className={`relative p-4 flex items-center gap-4 transition-all ${isActive ? 'translate-x-full' : ''}`}>
                      {/* Status Button */}
                      {habit.status === 'active' && showToday && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleComplete(habit.id)}
                          disabled={status === 'completed'}
                          className="flex-shrink-0 focus:outline-none"
                        >
                          {getStatusIcon(habit)}
                        </motion.button>
                      )}

                      {habit.status === 'paused' && (
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <PauseCircle size={20} className="text-amber-600" />
                        </div>
                      )}

                      {/* Habit Info */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/habito/${habit.id}`)}
                      >
                        <h3 className={`font-semibold transition-all ${
                          status === 'completed'
                            ? 'text-slate-500 line-through'
                            : 'text-slate-900'
                        }`}>
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                          <span>{habit.duration || 15} min</span>
                          {habit.streak > 0 && (
                            <span className="flex items-center gap-1">
                              <Flame size={12} className="text-orange-500" />
                              {habit.streak} días
                            </span>
                          )}
                          {habit.frequency === 'semanal' && (
                            <span className={`px-2 py-0.5 ${currentTheme.gradientSubtle} rounded-full text-purple-700`}>
                              Semanal
                            </span>
                          )}
                          {!showToday && habit.status === 'active' && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              No hoy
                            </span>
                          )}
                        </div>

                        {habit.status === 'paused' && habit.pausedReason && (
                          <p className="text-xs text-amber-700 mt-2 bg-amber-50 px-2 py-1 rounded">
                            {habit.pausedReason}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(
                            showActionMenu === habit.id ? null : habit.id
                          );
                        }}
                        className={`p-2 ${currentTheme.bgHover} rounded-lg flex-shrink-0`}
                      >
                        <MoreVertical size={20} className={currentTheme.textMuted} />
                      </motion.button>
                    </div>

                    {/* Action Menu */}
                    <AnimatePresence>
                      {showActionMenu === habit.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-200 flex gap-2 flex-wrap px-4 py-3"
                        >
                          {habit.status === 'active' && showToday && status === 'pending' && (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSkip(habit.id)}
                              className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-fit"
                            >
                              <SkipForward size={16} />
                              Omitir
                            </motion.button>
                          )}

                          {habit.status === 'active' ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePause(habit.id)}
                              className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-fit"
                            >
                              <PauseCircle size={16} />
                              Pausar
                            </motion.button>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleResume(habit.id)}
                              className="flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-fit"
                            >
                              <Play size={16} />
                              Reanudar
                            </motion.button>
                          )}

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/editar-habito/${habit.id}`)}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-fit"
                          >
                            <Edit2 size={16} />
                            Editar
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(habit.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Create Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/biblioteca')}
        className={`fixed bottom-28 right-6 w-14 h-14 rounded-full ${currentTheme.gradient} text-white shadow-lg flex items-center justify-center z-40 lg:hidden`}
      >
        <Plus size={24} />
      </motion.button>
    </main>
  );
}
