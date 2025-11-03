'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { getStreakDisplay, getStreakIndicator } from '@/app/lib/streakLogic';
import { getCustomHabits } from '@/app/lib/store';
import { Calendar, Flame, Award, TrendingUp, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import HabitCheckbox from '@/app/components/HabitCheckbox';

interface HabitDay {
  date: string;
  day: number;
  completed: boolean;
  weekday: string;
}

export default function HabitoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentTheme } = useTheme();
  const [habit, setHabit] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [indicator, setIndicator] = useState<any>(null);
  const [calendar, setCalendar] = useState<HabitDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar hábito
    const habits = getCustomHabits();
    const found = habits.find((h: any) => h.id === params.id);
    if (found) {
      setHabit(found);
      setStreak(getStreakDisplay(found.id));
      setIndicator(getStreakIndicator(found.id));
      generateCalendar(found.id);
    }
    setLoading(false);
  }, [params.id]);

  const generateCalendar = (habitId: string) => {
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const habitCompletions = completions[habitId] || [];

    // Últimos 30 días
    const cal: HabitDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      cal.push({
        date: dateStr,
        day: date.getDate(),
        completed: habitCompletions.some((d: string) => d.split('T')[0] === dateStr),
        weekday: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date),
      });
    }
    setCalendar(cal);
  };

  const handleComplete = () => {
    if (habit) {
      setStreak(getStreakDisplay(habit.id));
      setIndicator(getStreakIndicator(habit.id));
      generateCalendar(habit.id);
    }
  };

  if (loading || !habit) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} p-4`}>
        <div className="max-w-2xl mx-auto">
          <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-24 lg:pb-8`}>
      <div className="max-w-2xl mx-auto p-4 lg:p-0">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => router.back()}
          className={`flex items-center gap-2 ${currentTheme.textSecondary} hover:${currentTheme.text} mb-6 transition-colors`}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${currentTheme.bgCard} rounded-3xl p-6 lg:p-8 mb-6 border ${currentTheme.border}`}
        >
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (habit.color || '#3b82f6') + '20' }}
            >
              <span className="text-3xl">🎯</span>
            </div>
            <div className="flex-1">
              <h1 className={`text-3xl font-bold ${currentTheme.text}`}>{habit.name}</h1>
              {habit.category && (
                <p className={`text-sm ${currentTheme.textSecondary} mt-1`}>{habit.category}</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-xl ${currentTheme.bgCardSecondary || currentTheme.bgHover} text-center`}
            >
              <div className="text-2xl mb-1">{indicator?.emoji}</div>
              <p className={`text-2xl font-bold ${currentTheme.text}`}>{streak?.current || 0}</p>
              <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Racha actual</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-xl ${currentTheme.bgCardSecondary || currentTheme.bgHover} text-center`}
            >
              <Award size={24} className={`${currentTheme.primary} mx-auto mb-1`} />
              <p className={`text-2xl font-bold ${currentTheme.text}`}>{streak?.longest || 0}</p>
              <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Mejor racha</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-xl ${currentTheme.bgCardSecondary || currentTheme.bgHover} text-center`}
            >
              <TrendingUp size={24} className={`text-green-500 mx-auto mb-1`} />
              <p className={`text-2xl font-bold ${currentTheme.text}`}>
                {Math.round((calendar.filter(d => d.completed).length / 30) * 100)}%
              </p>
              <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Últimos 30 días</p>
            </motion.div>
          </div>

          {/* Detalles */}
          <div className={`mt-6 pt-6 border-t ${currentTheme.border} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={currentTheme.textSecondary}>Objetivo</span>
              <span className={`font-medium ${currentTheme.text}`}>{habit.minutes} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={currentTheme.textSecondary}>Frecuencia</span>
              <span className={`font-medium ${currentTheme.text}`}>
                {habit.frequency === 'daily' ? 'Diario' : 'Personalizado'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={currentTheme.textSecondary}>Creado</span>
              <span className={`font-medium ${currentTheme.text}`}>
                {new Date(habit.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Calendario visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${currentTheme.bgCard} rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={24} className={currentTheme.primary} />
            <h2 className={`text-xl font-bold ${currentTheme.text}`}>Historial (30 días)</h2>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {calendar.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-col items-center gap-2"
              >
                <span className={`text-xs font-medium ${currentTheme.textSecondary}`}>
                  {day.weekday}
                </span>
                <span className={`text-xs ${currentTheme.textMuted}`}>{day.day}</span>
                <div className="relative">
                  <HabitCheckbox
                    habitId={habit.id}
                    habitName={habit.name}
                    date={day.date}
                    onComplete={handleComplete}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Leyenda */}
          <div className={`mt-6 pt-6 border-t ${currentTheme.border}`}>
            <p className={`text-xs ${currentTheme.textSecondary} text-center`}>
              💡 Haz clic en los cuadrados para marcar completado
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
