'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import EmotionSummaryCard from '@/components/Estadisticas/EmotionSummaryCard';
import ProgressGrid from '@/components/Estadisticas/ProgressGrid';
import EnergyBalanceChart from '@/components/Estadisticas/EnergyBalanceChart';
import TopHabitsList from '@/components/Estadisticas/TopHabitsList';
import TopActivitiesList from '@/components/Estadisticas/TopActivitiesList';
import PersonalInsights from '@/components/Estadisticas/PersonalInsights';

type TimeRange = 'dia' | 'semana' | 'mes';

interface Activity {
  id: string;
  name: string;
  icon: string;
  date: string;
  duration: number;
  category?: string;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDates?: string[];
}

interface Reflexion {
  id: string;
  date: string;
  emotions?: string[];
}

interface EstadisticasData {
  range: TimeRange;
  summary: {
    mood: 'calma' | 'energico' | 'reflexivo' | 'estresado';
    text: string;
  };
  progress: {
    habitsCompleted: number;
    totalHabits: number;
    totalActivityHours: number;
    meditationMinutes: number;
    gratitudeCount: number;
  };
  energyBalance: {
    totalHours: number;
    categories: Array<{ name: string; value: number; color: string }>;
    comment: string;
  };
  topHabits: Array<{
    id: string;
    name: string;
    icon: string;
    completed: number;
    total: number;
  }>;
  topActivities: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
  }>;
  insights: {
    main: string;
    extra?: string;
  };
}

const MOCK_HABITS: Habit[] = [
  { id: '1', name: 'Beber agua', icon: '💧', completedDates: ['2025-11-01', '2025-10-31', '2025-10-30'] },
  { id: '2', name: 'Meditación', icon: '🧘', completedDates: ['2025-11-01', '2025-10-30'] },
  { id: '3', name: 'Ejercicio', icon: '💪', completedDates: ['2025-11-01', '2025-10-31'] },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    name: 'Yoga',
    icon: '🧘',
    date: '2025-11-01',
    duration: 1.5,
    category: 'Bienestar',
  },
  {
    id: '2',
    name: 'Caminata',
    icon: '🚶',
    date: '2025-10-31',
    duration: 2,
    category: 'Movimiento',
  },
  {
    id: '3',
    name: 'Meditación',
    icon: '🧘',
    date: '2025-11-01',
    duration: 0.5,
    category: 'Mental',
  },
];

const MOCK_REFLEXIONS: Reflexion[] = [
  { id: '1', date: '2025-11-01', emotions: ['grateful', 'calm', 'energized'] },
  { id: '2', date: '2025-10-31', emotions: ['grateful', 'calm'] },
];

export default function EstadisticasPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>('semana');
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate statistics based on time range
  const calculateStats = useCallback((range: TimeRange): EstadisticasData => {
    const now = new Date();
    const getStartDate = () => {
      const start = new Date();
      if (range === 'dia') {
        start.setHours(0, 0, 0, 0);
      } else if (range === 'semana') {
        start.setDate(now.getDate() - 7);
      } else {
        start.setMonth(now.getMonth() - 1);
      }
      return start;
    };

    const startDate = getStartDate();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(startDate);

    // Filter data by range
    const activitiesInRange = MOCK_ACTIVITIES.filter((a) => a.date >= startDateStr);
    const habitsInRange = MOCK_HABITS.filter((h) =>
      h.completedDates?.some((d) => d >= startDateStr)
    );

    // Calculate metrics
    const totalActivityHours = activitiesInRange.reduce((sum, a) => sum + a.duration, 0);
    const meditationMinutes = activitiesInRange
      .filter((a) => a.name.toLowerCase().includes('meditación'))
      .reduce((sum, a) => sum + a.duration * 60, 0);

    const gratitudeCount = MOCK_REFLEXIONS.filter((r) => r.date >= startDateStr).length;

    const habitsCompleted = habitsInRange.reduce(
      (sum, h) => sum + (h.completedDates?.filter((d) => d >= startDateStr).length || 0),
      0
    );

    // Get top habits
    const topHabits = MOCK_HABITS
      .map((h) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        completed: h.completedDates?.filter((d) => d >= startDateStr).length || 0,
        total: range === 'dia' ? 1 : range === 'semana' ? 7 : 30,
      }))
      .filter((h) => h.completed > 0)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 3);

    // Get top activities
    const activityMap = new Map<string, { name: string; icon: string; count: number }>();
    activitiesInRange.forEach((a) => {
      if (activityMap.has(a.id)) {
        const current = activityMap.get(a.id)!;
        current.count++;
      } else {
        activityMap.set(a.id, { name: a.name, icon: a.icon, count: 1 });
      }
    });

    const topActivities = Array.from(activityMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Determine mood based on data
    const getMood = (): EstadisticasData['summary']['mood'] => {
      if (totalActivityHours > 4 && meditationMinutes > 60) return 'energico';
      if (meditationMinutes > 30) return 'calma';
      if (gratitudeCount > 3) return 'reflexivo';
      return 'calma';
    };

    const getMoodText = (mood: EstadisticasData['summary']['mood']): string => {
      const texts: Record<string, string> = {
        calma: 'Te has sentido en calma y con energía positiva esta semana.',
        energico:
          'Excelente semana! Tu energía ha sido muy alta gracias a tus actividades físicas.',
        reflexivo:
          'Has tenido momentos de reflexión profunda. Sigue cultivando la gratitud.',
        estresado:
          'Detectamos algunos momentos de estrés. Recuerda practicar meditación y descanso.',
      };
      return texts[mood];
    };

    const mood = getMood();

    // Energy balance categories
    const energyCategories = [
      {
        name: 'Movimiento',
        value:
          activitiesInRange
            .filter((a) => ['Caminata', 'Ejercicio', 'Yoga', 'Correr'].includes(a.name))
            .reduce((sum, a) => sum + a.duration, 0) * 60,
        color: '#10b981',
      },
      {
        name: 'Bienestar',
        value:
          activitiesInRange
            .filter((a) => ['Yoga', 'Masaje', 'Spa'].includes(a.name))
            .reduce((sum, a) => sum + a.duration, 0) * 60,
        color: '#FF99AC',
      },
      {
        name: 'Mental/Creatividad',
        value: meditationMinutes,
        color: '#a78bfa',
      },
      {
        name: 'Social',
        value:
          activitiesInRange
            .filter((a) => ['Llamada', 'Reunión', 'Paseo con amigos'].includes(a.name))
            .reduce((sum, a) => sum + a.duration, 0) * 60,
        color: '#fb923c',
      },
      {
        name: 'Descanso',
        value: Math.max(0, (24 - totalActivityHours) * 60 * 0.3),
        color: '#60a5fa',
      },
    ].filter((c) => c.value > 0);

    const getEnergyComment = (): string => {
      if (totalActivityHours > 4) {
        return 'Tu balance es muy activo. Recuerda incluir más tiempo de descanso y meditación.';
      } else if (totalActivityHours > 2) {
        return 'Tu balance es equilibrado, con un buen foco en movimiento y bienestar mental.';
      } else {
        return 'Tu actividad ha sido baja. Considera aumentar tiempo de movimiento o actividades.';
      }
    };

    // Insights
    const getInsights = () => {
      const baseInsight =
        totalActivityHours > 3 && meditationMinutes > 30
          ? 'Hemos notado que tu energía aumenta los días que practicas yoga y meditación.'
          : 'Sigue registrando tus actividades para obtener insights más personalizados.';

      const extra =
        range === 'semana'
          ? 'Mantén tu consistencia con los hábitos — la repetición es la clave del cambio.'
          : undefined;

      return { main: baseInsight, extra };
    };

    return {
      range,
      summary: {
        mood,
        text: getMoodText(mood),
      },
      progress: {
        habitsCompleted,
        totalHabits: MOCK_HABITS.length,
        totalActivityHours: Math.round(totalActivityHours * 10) / 10,
        meditationMinutes: Math.round(meditationMinutes),
        gratitudeCount,
      },
      energyBalance: {
        totalHours: Math.round(totalActivityHours * 10) / 10,
        categories: energyCategories,
        comment: getEnergyComment(),
      },
      topHabits,
      topActivities,
      insights: getInsights(),
    };
  }, []);

  // Load data when range changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setData(calculateStats(timeRange));
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [timeRange, calculateStats]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F0] via-white to-[#FFF5F0] px-5 pb-24 pt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-[#3D2C28]" />
        </motion.button>
        <h1 className="text-2xl font-bold text-[#3D2C28] flex-1 text-center">Tu Actividad</h1>
        <div className="w-10" />
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 bg-white rounded-2xl p-1 border border-[#FFB4A8]/30"
      >
        {(['dia', 'semana', 'mes'] as const).map((range) => (
          <motion.button
            key={range}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              timeRange === range
                ? 'bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white'
                : 'text-[#A67B6B] hover:bg-[#FFF5F0]'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center py-12"
        >
          <p className="text-[#A67B6B]">Cargando estadísticas...</p>
        </motion.div>
      ) : data ? (
        <motion.div
          key={timeRange}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Emotion Summary */}
          <EmotionSummaryCard mood={data.summary.mood} summaryText={data.summary.text} />

          {/* Progress Grid */}
          <ProgressGrid
            habitsCompleted={data.progress.habitsCompleted}
            totalHabits={data.progress.totalHabits}
            totalActivityHours={data.progress.totalActivityHours}
            meditationMinutes={data.progress.meditationMinutes}
            gratitudeCount={data.progress.gratitudeCount}
            comparison={{
              habitsLastWeek: Math.max(0, data.progress.habitsCompleted - 2),
              meditationDelta: 15,
            }}
          />

          {/* Energy Balance */}
          <EnergyBalanceChart
            totalHours={data.energyBalance.totalHours}
            categories={data.energyBalance.categories}
            comment={data.energyBalance.comment}
          />

          {/* Top Habits */}
          {data.topHabits.length > 0 && (
            <TopHabitsList
              topHabits={data.topHabits}
              summary="¡Beber agua fue tu hábito más constante esta semana!"
            />
          )}

          {/* Top Activities */}
          {data.topActivities.length > 0 && (
            <TopActivitiesList topActivities={data.topActivities} />
          )}

          {/* Personal Insights */}
          <PersonalInsights insights={data.insights} />
        </motion.div>
      ) : null}
    </div>
  );
}
