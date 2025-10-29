'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import { useUser } from './context/UserContext';
import { useCycle } from './context/CycleContext';
import { Calendar, TrendingUp, Heart, Flame, Clock } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: '¡Qué buen día!', emoji: '🌅' };
  if (hour < 18) return { text: '¡Buena tarde!', emoji: '☀️' };
  return { text: '¡Buena noche!', emoji: '🌙' };
};

export default function HomePage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { username } = useUser();
  const { cycleData } = useCycle();
  const [habits, setHabits] = useState<any[]>([]);
  const [stats, setStats] = useState({
    habitConsistency: 0,
    activityTime: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    // Load habits and calculate stats
    const stored = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    setHabits(stored);

    // Calculate 7-day consistency
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const today = new Date();
    let completedDays = 0;
    let totalPossibleDays = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      totalPossibleDays++;

      // Check if any habit was completed on this day
      let dayCompleted = false;
      for (const habitId in completions) {
        const habitCompletions = completions[habitId] as any[];
        if (habitCompletions.find((c: any) => c.date === dateStr && c.status === 'completed')) {
          dayCompleted = true;
          break;
        }
      }
      if (dayCompleted) completedDays++;
    }

    const consistency = totalPossibleDays > 0 ? Math.round((completedDays / totalPossibleDays) * 100) : 0;

    // Calculate current streak
    let streak = 0;
    const sortedDates = Object.keys(completions)
      .flatMap((habitId) =>
        (completions[habitId] as any[])
          .filter((c: any) => c.status === 'completed')
          .map((c: any) => c.date)
      )
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const uniqueDates = [...new Set(sortedDates)];
    const todayStr = new Date().toISOString().split('T')[0];
    const startDate = new Date(uniqueDates[0] || todayStr);
    startDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = new Date(uniqueDates[i]);
      date.setHours(0, 0, 0, 0);
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() - i);

      const daysDiff = Math.floor((startDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= i + 1) {
        streak = i + 1;
      } else {
        break;
      }
    }

    setStats({
      habitConsistency: consistency,
      activityTime: stored.length * 15, // Estimate: 15 min per habit
      currentStreak: streak,
    });
  }, []);

  const greeting = getGreeting();
  const motivationalMessages = [
    { min: 0, max: 33, msg: 'Pequeños pasos llevan a grandes cambios. ¡Empieza hoy!' },
    { min: 34, max: 66, msg: '¡Vas muy bien! Mantén la consistencia.' },
    { min: 67, max: 100, msg: '¡Excelente consistencia! Eres increíble 🌟' },
  ];

  const message = motivationalMessages.find(
    (m) => stats.habitConsistency >= m.min && stats.habitConsistency <= m.max
  )?.msg || 'Cada día es una nueva oportunidad';

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-32 pt-20 lg:pt-8 relative overflow-hidden`}>
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30 animate-blob"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`,
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-30 animate-blob"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.secondary} 0%, ${currentTheme.accent2} 100%)`,
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full opacity-20 animate-blob"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.accent1} 0%, ${currentTheme.primary} 100%)`,
            animationDelay: '4s',
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 relative z-10 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{greeting.emoji}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{greeting.text}</h1>
              <p className={`text-sm ${currentTheme.textMuted}`}>{username || 'Usuario'}</p>
            </div>
          </div>
        </motion.div>

        {/* Tu Semana Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${currentTheme.bgGlass} rounded-3xl p-6 border ${currentTheme.border}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg ${currentTheme.primary} flex items-center justify-center`}>
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Tu Semana</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${currentTheme.textMuted} mb-1`}>Consistencia</p>
              <p className="text-2xl font-bold text-slate-900">{stats.habitConsistency}%</p>
            </div>
            <div>
              <p className={`text-xs ${currentTheme.textMuted} mb-1`}>Tiempo invertido</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-slate-900">{stats.activityTime}</p>
                <p className="text-xs text-slate-500">min</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Racha Actual Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${currentTheme.gradient} rounded-3xl p-6 text-white`}
        >
          <div className="flex items-center gap-4">
            <Flame size={32} className="flex-shrink-0" />
            <div>
              <p className="text-sm opacity-90 mb-1">Racha Actual</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm opacity-75">días</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${currentTheme.bgCard} rounded-3xl p-6 border ${currentTheme.border}`}
        >
          <p className="text-sm leading-relaxed text-slate-700">
            💭 {message}
          </p>
        </motion.div>

        {/* Modo Ciclo Card */}
        {cycleData.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push('/modo-ciclo')}
            className={`${currentTheme.bgCard} rounded-3xl p-6 border ${currentTheme.border} cursor-pointer hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🌺</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Modo Ciclo Activo</h3>
                <p className="text-sm text-slate-600">Día {cycleData.currentDay} del ciclo</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push('/reflexiones')}
            className={`${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border} text-left hover:shadow-lg transition-shadow`}
          >
            <p className="text-sm font-semibold text-slate-900">📝 Reflexiones</p>
            <p className="text-xs text-slate-500 mt-1">Tu diario</p>
          </button>
          <button
            onClick={() => router.push('/calendario')}
            className={`${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border} text-left hover:shadow-lg transition-shadow`}
          >
            <p className="text-sm font-semibold text-slate-900">📅 Calendario</p>
            <p className="text-xs text-slate-500 mt-1">Visualiza todo</p>
          </button>
        </motion.div>
      </div>
    </main>
  );
}
