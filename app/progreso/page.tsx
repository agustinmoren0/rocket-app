'use client'

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  name: string;
  date: string;
  emoji: string;
  createdAt: string;
}

interface Stats {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  bestWeek: number;
  allTimeActivities: number;
}

export default function ProgresoPage() {
  const [stats, setStats] = useState<Stats>({
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    bestWeek: 0,
    allTimeActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Calculate progress stats from activities
    const activities: Activity[] = JSON.parse(
      localStorage.getItem('habika_activities') || '[]'
    );

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate week boundaries (Sunday to Saturday)
    const currentDate = new Date();
    const startOfCurrentWeek = new Date(currentDate);
    startOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
    endOfCurrentWeek.setHours(23, 59, 59, 999);

    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfCurrentWeek);
    endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    // Month boundaries
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    // Count activities by period
    const thisWeekCount = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= startOfCurrentWeek && actDate <= endOfCurrentWeek;
    }).length;

    const lastWeekCount = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= startOfLastWeek && actDate <= endOfLastWeek;
    }).length;

    const thisMonthCount = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= startOfCurrentMonth && actDate <= endOfCurrentMonth;
    }).length;

    const lastMonthCount = activities.filter((a) => {
      const actDate = new Date(a.date);
      return actDate >= startOfLastMonth && actDate <= endOfLastMonth;
    }).length;

    // Find best week (highest activity count in any week)
    const weekActivityMap: { [key: string]: number } = {};
    activities.forEach((a) => {
      const actDate = new Date(a.date);
      const weekStart = new Date(actDate);
      weekStart.setDate(actDate.getDate() - actDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      weekActivityMap[weekKey] = (weekActivityMap[weekKey] || 0) + 1;
    });

    const bestWeek = Math.max(0, ...Object.values(weekActivityMap));

    setStats({
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      bestWeek,
      allTimeActivities: activities.length,
    });

    setLoading(false);
  }, []);

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const weekGrowth = calculateGrowth(stats.thisWeek, stats.lastWeek);
  const monthGrowth = calculateGrowth(stats.thisMonth, stats.lastMonth);

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} p-4`}>
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} p-4 pb-24`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
            Tu Progreso
          </h1>
          <p className={`${currentTheme.textSecondary}`}>
            Comparación personal: tú vs tú mismo. Lo importante es mejorar cada día.
          </p>
        </motion.div>

        {/* Week vs Last Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border} mb-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className={currentTheme.primary} />
            <h2 className={`text-lg font-semibold ${currentTheme.text}`}>
              Esta semana vs Semana pasada
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-2`}>
                Esta semana
              </p>
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${currentTheme.primary}`}>
                  {stats.thisWeek}
                </div>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  actividades
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-2`}>
                Semana pasada
              </p>
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${currentTheme.text}`}>
                  {stats.lastWeek}
                </div>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  actividades
                </p>
              </div>
            </div>
          </div>

          {/* Growth indicator */}
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp
              size={18}
              className={weekGrowth >= 0 ? 'text-green-500' : 'text-red-500'}
            />
            <span
              className={`font-semibold ${
                weekGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {weekGrowth >= 0 ? '+' : ''}{weekGrowth}%
            </span>
            <span className={currentTheme.textSecondary}>
              vs semana pasada
            </span>
          </div>
        </motion.div>

        {/* Month vs Last Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border} mb-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className={currentTheme.primary} />
            <h2 className={`text-lg font-semibold ${currentTheme.text}`}>
              Este mes vs Mes pasado
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-2`}>
                Este mes
              </p>
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${currentTheme.primary}`}>
                  {stats.thisMonth}
                </div>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  actividades
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-2`}>
                Mes pasado
              </p>
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${currentTheme.text}`}>
                  {stats.lastMonth}
                </div>
                <p className={`text-sm ${currentTheme.textSecondary}`}>
                  actividades
                </p>
              </div>
            </div>
          </div>

          {/* Growth indicator */}
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp
              size={18}
              className={monthGrowth >= 0 ? 'text-green-500' : 'text-red-500'}
            />
            <span
              className={`font-semibold ${
                monthGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {monthGrowth >= 0 ? '+' : ''}{monthGrowth}%
            </span>
            <span className={currentTheme.textSecondary}>
              vs mes pasado
            </span>
          </div>
        </motion.div>

        {/* Best Week Record */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border} mb-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className={currentTheme.primary} />
            <h2 className={`text-lg font-semibold ${currentTheme.text}`}>
              Tu Mejor Semana
            </h2>
          </div>

          <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
            <p className={`text-sm ${currentTheme.textSecondary} mb-3`}>
              Actividades registradas
            </p>
            <div className="flex items-end gap-2">
              <div className={`text-4xl font-bold ${currentTheme.primary}`}>
                {stats.bestWeek}
              </div>
              <p className={`text-base ${currentTheme.textSecondary} mb-2`}>
                en una semana
              </p>
            </div>
          </div>

          <p className={`mt-4 text-sm ${currentTheme.textSecondary}`}>
            🎯 Ese fue un buen ritmo. Intenta mantenerlo o mejorarlo.
          </p>
        </motion.div>

        {/* All Time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${currentTheme.bgCard} rounded-xl p-6 border ${currentTheme.border}`}
        >
          <h2 className={`text-lg font-semibold ${currentTheme.text} mb-4`}>
            Estadísticas Generales
          </h2>

          <div className={`p-4 rounded-lg ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
            <p className={`text-sm ${currentTheme.textSecondary} mb-3`}>
              Total de actividades registradas
            </p>
            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-bold ${currentTheme.primary}`}>
                {stats.allTimeActivities}
              </div>
              <p className={`text-base ${currentTheme.textSecondary}`}>
                desde el inicio
              </p>
            </div>
          </div>

          <p className={`mt-4 text-sm ${currentTheme.textSecondary} italic`}>
            "El progreso no es lineal. Algunos días registras más, otros menos. Lo importante es la consistencia en el tiempo." - Tu yo del futuro
          </p>
        </motion.div>
      </div>
    </div>
  );
}
