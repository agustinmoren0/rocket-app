'use client'

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlayCircle, Trash2, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PausedHabit {
  id: string;
  name: string;
  frequency: string;
  racha: number;
  pausedDate: string;
  reason: string;
  pauseEndDate?: string;
}

export default function PausadosPage() {
  const [pausedHabits, setPausedHabits] = useState<PausedHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Load paused habits from localStorage
    const stored = localStorage.getItem('habika_paused_habits');
    if (stored) {
      setPausedHabits(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleResume = (habitId: string) => {
    const habit = pausedHabits.find(h => h.id === habitId);
    if (!habit) return;

    // Get all habits
    const allHabits = JSON.parse(localStorage.getItem('habika_habits') || '[]');

    // Find and restore the habit
    const habitIndex = allHabits.findIndex((h: any) => h.id === habitId);
    if (habitIndex >= 0) {
      // Restore racha from pause
      allHabits[habitIndex].racha = habit.racha;
      allHabits[habitIndex].isPaused = false;
      localStorage.setItem('habika_habits', JSON.stringify(allHabits));
    }

    // Remove from paused habits
    const updated = pausedHabits.filter(h => h.id !== habitId);
    setPausedHabits(updated);
    localStorage.setItem('habika_paused_habits', JSON.stringify(updated));
  };

  const handleDelete = (habitId: string) => {
    const updated = pausedHabits.filter(h => h.id !== habitId);
    setPausedHabits(updated);
    localStorage.setItem('habika_paused_habits', JSON.stringify(updated));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} p-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="h-40 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} p-4 pb-24`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
            Hábitos Pausados
          </h1>
          <p className={`${currentTheme.textSecondary}`}>
            Tus hábitos pausados están aquí. Reanúdalos cuando te sientas listo.
          </p>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${currentTheme.bgCard} rounded-xl p-4 mb-6 border ${currentTheme.border}`}
        >
          <p className={`text-sm ${currentTheme.textSecondary}`}>
            💡 <strong>Tip:</strong> La pausa preserva tu racha actual. Cuando reanudes, tu racha seguirá intacta. No hay presión, solo progreso a tu ritmo.
          </p>
        </motion.div>

        {/* Paused Habits List */}
        <div className="space-y-4">
          <AnimatePresence>
            {pausedHabits.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${currentTheme.bgCard} rounded-xl p-8 border ${currentTheme.border} text-center`}
              >
                <Clock size={48} className={`${currentTheme.primary} mx-auto mb-4`} />
                <h2 className={`text-xl font-semibold ${currentTheme.text} mb-2`}>
                  Sin hábitos pausados
                </h2>
                <p className={currentTheme.textSecondary}>
                  Cuando pauses un hábito, aparecerá aquí.
                </p>
              </motion.div>
            ) : (
              pausedHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${currentTheme.bgCard} rounded-xl p-4 border ${currentTheme.border}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${currentTheme.text}`}>
                        {habit.name}
                      </h3>
                      <p className={`text-sm ${currentTheme.textSecondary} mt-1`}>
                        {habit.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${currentTheme.primary}`}>
                        {habit.racha}
                      </div>
                      <p className={`text-xs ${currentTheme.textMuted}`}>
                        días
                      </p>
                    </div>
                  </div>

                  {/* Pause Details */}
                  <div className={`mb-4 p-3 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover} space-y-2`}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className={currentTheme.textSecondary} />
                      <span className={`text-sm ${currentTheme.textSecondary}`}>
                        <strong>Pausado:</strong> {formatDate(habit.pausedDate)}
                      </span>
                    </div>
                    {habit.reason && (
                      <div>
                        <p className={`text-sm ${currentTheme.textSecondary}`}>
                          <strong>Razón:</strong> {habit.reason}
                        </p>
                      </div>
                    )}
                    {habit.pauseEndDate && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={currentTheme.textSecondary} />
                        <span className={`text-sm ${currentTheme.textSecondary}`}>
                          <strong>Retorno planeado:</strong> {formatDate(habit.pauseEndDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleResume(habit.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${currentTheme.gradient} text-white`}
                    >
                      <PlayCircle size={18} />
                      Reanudar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(habit.id)}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${currentTheme.buttonHover} text-red-600 hover:text-red-700`}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
