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
  hasData: boolean;
  summary: {
    mood: 'calma' | 'energico' | 'reflexivo' | 'estresado';
    text: string;
  };
  progress: {
    habitsCompleted: number;
    totalHabits: number;
    totalActivityHours: number;
    consistencyPercent: number;
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

// No mock data - use real user data only
const INITIAL_HABITS: Habit[] = [];
const INITIAL_ACTIVITIES: Activity[] = [];
const INITIAL_REFLEXIONS: Reflexion[] = [];

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

    // Cargar datos reales de localStorage
    let realHabits: Habit[] = [];
    let realActivities: Activity[] = [];

    if (typeof window !== 'undefined') {
      try {
        // Cargar hábitos personalizados
        const customHabits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
        realHabits = customHabits.map((h: any) => ({
          id: h.id,
          name: h.name,
          icon: h.icon || '✓',
          completedDates: h.completedDates || []
        }));

        // Cargar actividades de hoy
        const activitiesToday = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
        const activitiesHistorical = JSON.parse(localStorage.getItem('habika_activities') || '[]');

        // Combinar actividades de hoy y históricas
        const allActivities: any[] = [];
        Object.entries(activitiesToday).forEach(([date, activities]: [string, any]) => {
          if (Array.isArray(activities)) {
            activities.forEach((a: any) => {
              allActivities.push({
                id: a.id,
                name: a.name,
                icon: a.icon || '📍',
                date: date,
                duration: a.unit === 'hora(s)' || a.unit === 'hs' ? a.duration * 60 / 60 : a.duration / 60,
                category: a.categoria || 'Actividad'
              });
            });
          }
        });

        // Agregar actividades históricas
        activitiesHistorical.forEach((a: any) => {
          allActivities.push({
            id: a.id,
            name: a.name,
            icon: a.icon || '📍',
            date: a.date,
            duration: a.unit === 'hora(s)' || a.unit === 'hs' ? a.duration * 60 / 60 : a.duration / 60,
            category: a.categoria || 'Actividad'
          });
        });

        realActivities = allActivities;
      } catch (error) {
        console.error('Error cargando datos de localStorage:', error);
      }
    }

    // Usar datos reales - Sin datos ficticios
    const habits = realHabits;
    const activities = realActivities;
    const hasData = habits.length > 0 || activities.length > 0;

    // Filter data by range
    const activitiesInRange = activities.filter((a) => a.date >= startDateStr);
    const habitsInRange = habits.filter((h) =>
      h.completedDates?.some((d) => d >= startDateStr)
    );

    // Calculate metrics - Real data only
    const totalActivityHours = activitiesInRange.reduce((sum, a) => sum + a.duration, 0);

    const habitsCompleted = habitsInRange.reduce(
      (sum, h) => sum + (h.completedDates?.filter((d) => d >= startDateStr).length || 0),
      0
    );

    // Calculate consistency: percentage of days with activity or completed habits
    const daysInRange = range === 'dia' ? 1 : range === 'semana' ? 7 : 30;
    const daysWithActivity = new Set([
      ...activitiesInRange.map(a => a.date),
      ...habitsInRange.flatMap(h => h.completedDates?.filter(d => d >= startDateStr) || [])
    ]).size;
    const consistencyPercent = Math.round((daysWithActivity / daysInRange) * 100);

    // Get top habits
    const topHabits = habits
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

    // Determine mood based on real activity data
    const getMood = (): EstadisticasData['summary']['mood'] => {
      if (totalActivityHours > 4 && consistencyPercent > 70) return 'energico';
      if (consistencyPercent > 50) return 'calma';
      if (habitsCompleted > (daysInRange / 2)) return 'reflexivo';
      return 'calma';
    };

    const getMoodText = (mood: EstadisticasData['summary']['mood'], range: TimeRange): string => {
      // Variaciones según range y mood
      const calmVariations = [
        'Te has sentido en calma y con energía positiva.',
        'Tu semana ha sido equilibrada y serena.',
        'Mantienes un estado emocional estable y positivo.',
        'Has logrado momentos de paz y bienestar interior.',
      ];

      const energicoVariations = [
        'Excelente! Tu energía ha sido muy alta esta semana.',
        'Increíble semana: muy activo y dinámico.',
        'Tu ritmo ha sido energético y productivo.',
        'Has brillado con energía y motivación constante.',
      ];

      const reflexivoVariations = [
        'Has tenido momentos de reflexión profunda.',
        'Buena conexión contigo mismo durante estos días.',
        'Cultivaste la gratitud y la introspección.',
        'Equilibrio entre acción y reflexión personal.',
      ];

      const estresadoVariations = [
        'Detectamos períodos de mayor estrés.',
        'Algunos momentos retadores esta semana.',
        'Considera más descanso y meditación.',
        'Te invitamos a priorizar tu bienestar.',
      ];

      const getRandomVariation = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

      switch (mood) {
        case 'calma':
          return getRandomVariation(calmVariations);
        case 'energico':
          return getRandomVariation(energicoVariations);
        case 'reflexivo':
          return getRandomVariation(reflexivoVariations);
        case 'estresado':
          return getRandomVariation(estresadoVariations);
        default:
          return 'Tu estado emocional ha sido variado esta semana.';
      }
    };

    const mood = getMood();

    // Energy balance - Group by category from real activities
    const categoryMap = new Map<string, number>();
    activitiesInRange.forEach((a) => {
      const cat = a.category || 'Otro';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + a.duration);
    });

    const colorMap: Record<string, string> = {
      'Bienestar': '#FF99AC',
      'Movimiento': '#10b981',
      'Aprendizaje': '#8b5cf6',
      'Social': '#fb923c',
      'Trabajo': '#3b82f6',
      'Descanso': '#60a5fa',
      'Salud': '#ec4899',
      'Otro': '#a67b6b',
    };

    const energyCategories = Array.from(categoryMap.entries())
      .map(([name, duration]) => ({
        name,
        value: Math.round(duration * 60), // Convertir a minutos
        color: colorMap[name] || '#a67b6b',
      }))
      .sort((a, b) => b.value - a.value);

    const getEnergyComment = (): string => {
      if (totalActivityHours === 0) {
        return 'Sin actividades registradas aún. ¡Comienza a registrar para ver tu balance!';
      } else if (totalActivityHours > 4) {
        return 'Muy activo esta semana. Mantén este ritmo y asegúrate de descansar adecuadamente.';
      } else if (totalActivityHours > 2) {
        return 'Balance equilibrado. Buen progreso en tu rutina de actividades.';
      } else {
        return 'Actividad baja. Considera registrar más actividades para mejorar tu consistencia.';
      }
    };

    // Insights - Based on real data
    const getInsights = () => {
      let baseInsight = 'Sigue registrando tus actividades y hábitos para obtener insights personalizados.';

      if (habitsCompleted > 0) {
        baseInsight = `Has completado ${habitsCompleted} hábitos esta ${range === 'semana' ? 'semana' : range === 'mes' ? 'mes' : 'día'}. ¡Excelente consistencia!`;
      } else if (totalActivityHours > 3) {
        baseInsight = `Has invertido ${Math.round(totalActivityHours)} horas en actividades. ¡Gran dedicación!`;
      }

      const extra =
        range === 'semana' && consistencyPercent > 50
          ? 'Mantén tu consistencia — la repetición es la clave del cambio.'
          : undefined;

      return { main: baseInsight, extra };
    };

    return {
      range,
      hasData,
      summary: {
        mood,
        text: getMoodText(mood, range),
      },
      progress: {
        habitsCompleted,
        totalHabits: habits.length,
        totalActivityHours: Math.round(totalActivityHours * 10) / 10,
        consistencyPercent,
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
          {data.hasData ? (
            <ProgressGrid
              habitsCompleted={data.progress.habitsCompleted}
              totalHabits={data.progress.totalHabits}
              totalActivityHours={data.progress.totalActivityHours}
              consistencyPercent={data.progress.consistencyPercent}
              comparison={{
                habitsLastWeek: Math.max(0, data.progress.habitsCompleted - 2),
                consistencyDelta: 5,
              }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 border border-[#FFB4A8]/30 text-center mb-6"
            >
              <p className="text-[#A67B6B] mb-2">Sin datos registrados</p>
              <p className="text-sm text-[#A67B6B]">Comienza a registrar hábitos y actividades para ver tus estadísticas</p>
            </motion.div>
          )}

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
