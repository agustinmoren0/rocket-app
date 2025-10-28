'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, MoreVertical, Edit2, Trash2, PauseCircle,
  Play, Flame, Target, ChevronRight, Circle, CheckCircle2,
  MinusCircle, SkipForward
} from 'lucide-react';
import { shouldShowHabitToday, getHabitStatus, markHabitComplete } from '../lib/habitLogic';

export default function MisHabitosPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('active');
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored);
  };

  const filteredHabits = habits.filter((h) => {
    if (filter === 'all') return true;
    if (filter === 'active') return h.status === 'active';
    if (filter === 'paused') return h.status === 'paused';
    return true;
  });

  const todayHabits = filteredHabits.filter(
    (h) => h.status === 'active' && shouldShowHabitToday(h)
  );

  const handleComplete = (habitId: string) => {
    markHabitComplete(habitId, 'completed');
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
      return <CheckCircle2 size={24} className="text-green-500" />;
    }
    if (status === 'skipped') {
      return <MinusCircle size={24} className="text-amber-500" />;
    }
    return <Circle size={24} className="text-slate-300" />;
  };

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-32 pt-20 lg:pt-8 lg:pb-8`}>
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Mis Hábitos
          </h1>
          <p className="text-slate-600">
            {todayHabits.length} hábitos para hoy
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'active', label: 'Activos', count: habits.filter((h) => h.status === 'active').length },
            { id: 'paused', label: 'Pausados', count: habits.filter((h) => h.status === 'paused').length },
            { id: 'all', label: 'Todos', count: habits.length },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === filterOption.id
                  ? `${currentTheme.gradient} text-white shadow-lg`
                  : `${currentTheme.bgCard} text-slate-700 border ${currentTheme.border}`
              }`}
            >
              {filterOption.label}
              <span
                className={`ml-2 text-sm ${
                  filter === filterOption.id ? 'text-white/80' : 'text-slate-500'
                }`}
              >
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        {/* Habit List */}
        {filteredHabits.length === 0 ? (
          <div
            className={`${currentTheme.bgCard} rounded-3xl p-12 text-center border ${currentTheme.border}`}
          >
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Target size={40} className="text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {filter === 'paused' ? 'Sin hábitos pausados' : 'No hay hábitos aquí'}
            </h2>
            <p className="text-slate-600 mb-6">
              {filter === 'paused'
                ? 'Cuando pauses un hábito, aparecerá aquí'
                : 'Comienza creando tu primer hábito'}
            </p>
            {filter !== 'paused' && (
              <button
                onClick={() => router.push('/biblioteca')}
                className={`px-6 py-3 ${currentTheme.gradient} text-white rounded-xl font-medium`}
              >
                Crear hábito
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit) => {
              const completions = JSON.parse(
                localStorage.getItem('habika_completions') || '{}'
              );
              const status = getHabitStatus(habit, completions[habit.id] || []);
              const showToday = shouldShowHabitToday(habit);

              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border} relative`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox/Status */}
                    {habit.status === 'active' && showToday && (
                      <button
                        onClick={() => handleComplete(habit.id)}
                        disabled={status === 'completed'}
                        className="flex-shrink-0"
                      >
                        {getStatusIcon(habit)}
                      </button>
                    )}

                    {habit.status === 'paused' && (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <PauseCircle size={20} className="text-amber-600" />
                      </div>
                    )}

                    {/* Info */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/habito/${habit.id}`)}
                    >
                      <h3
                        className={`font-semibold ${
                          status === 'completed'
                            ? 'text-slate-500 line-through'
                            : 'text-slate-900'
                        }`}
                      >
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>{habit.duration} min</span>
                        {habit.streak > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame size={12} className="text-orange-500" />
                            {habit.streak} días
                          </span>
                        )}
                        {habit.frequency === 'semanal' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
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

                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(
                          showActionMenu === habit.id ? null : habit.id
                        );
                      }}
                      className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0"
                    >
                      <MoreVertical size={20} className="text-slate-400" />
                    </button>
                  </div>

                  {/* Action Menu */}
                  <AnimatePresence>
                    {showActionMenu === habit.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-200 flex gap-2"
                      >
                        {habit.status === 'active' && showToday && status === 'pending' && (
                          <button
                            onClick={() => handleSkip(habit.id)}
                            className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <SkipForward size={16} />
                            Omitir hoy
                          </button>
                        )}

                        {habit.status === 'active' ? (
                          <button
                            onClick={() => handlePause(habit.id)}
                            className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <PauseCircle size={16} />
                            Pausar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResume(habit.id)}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Play size={16} />
                            Reanudar
                          </button>
                        )}

                        <button
                          onClick={() => router.push(`/editar-habito/${habit.id}`)}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} />
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(habit.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
