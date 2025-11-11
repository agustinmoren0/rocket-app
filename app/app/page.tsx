'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import { useCycle } from '@/app/context/CycleContext';
import { motion } from 'framer-motion';
import { Clock, Flame, Edit3, Calendar, CheckSquare, Wind } from 'lucide-react';
import InsightsIcon from '@mui/icons-material/Insights';

export default function DashboardPage() {
  const router = useRouter();
  const { username } = useUser();
  const { cycleData } = useCycle();

  const [stats, setStats] = useState({
    consistency: 0,
    activityTime: 0,
    streak: 0,
  });

  useEffect(() => {
    calculateStats();

    // Listener para cambios en localStorage (desde otras tabs o cambios internos)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'habika_activities_today' || e.key === 'habika_completions' || e.key === 'habika_activities' || e.key === 'habika_custom_habits') {
        calculateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event listener para cambios internos en esta tab
    const handleDataChange = () => {
      calculateStats();
    };

    window.addEventListener('habika-data-changed', handleDataChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('habika-data-changed', handleDataChange as EventListener);
    };
  }, []);

  const calculateStats = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const activitiesToday = JSON.parse(localStorage.getItem('habika_activities_today') || '{}');
    const historicalActivities = JSON.parse(localStorage.getItem('habika_activities') || '[]');

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    // Calcular constancia
    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach((habit: any) => {
      if (habit.status !== 'active') return;
      const habitCompletions = completions[habit.id] || [];

      last7Days.forEach(date => {
        const dayOfWeek = new Date(date).getDay();
        const shouldCount = habit.frequency === 'diario' ||
          (habit.frequency === 'semanal' && habit.daysOfWeek?.includes(dayOfWeek));

        if (shouldCount) {
          totalPossible++;
          const completed = habitCompletions.some((c: any) =>
            c.date === date && c.status === 'completed'
          );
          if (completed) totalCompleted++;
        }
      });
    });

    const consistency = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Tiempo en actividades - buscar en habika_activities_today y habika_activities
    let totalActivityMinutes = 0;

    // Búscar en habika_activities_today (actividades de hoy por día)
    last7Days.forEach((dateStr) => {
      const dayActivities = activitiesToday[dateStr] || [];
      dayActivities.forEach((activity: any) => {
        const minutes = activity.unit === 'hora(s)' || activity.unit === 'hs' ? (activity.duration || 0) * 60 : (activity.duration || 0);
        totalActivityMinutes += minutes;
      });
    });

    // También buscar en histórico si existen
    historicalActivities
      .filter((a: any) => last7Days.includes(a.date))
      .forEach((activity: any) => {
        const minutes = activity.unit === 'hora(s)' || activity.unit === 'hs' ? (activity.duration || 0) * 60 : (activity.duration || 0);
        totalActivityMinutes += minutes;
      });

    // Racha global - contar días con hábitos completados O actividades realizadas
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Verificar si hay hábito completado
      const hasHabitCompletion = Object.values(completions).some((habitComps: any) =>
        habitComps.some((c: any) => c.date === dateStr && c.status === 'completed')
      );

      // Verificar si hay actividades en ese día
      const hasActivityToday = (activitiesToday[dateStr] && activitiesToday[dateStr].length > 0) ||
        historicalActivities.some((a: any) => a.date === dateStr);

      if (hasHabitCompletion || hasActivityToday) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    setStats({
      consistency,
      activityTime: Math.round(totalActivityMinutes / 60),
      streak,
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Qué buen día!';
    if (hour < 19) return '¡Buena tarde!';
    return '¡Buena noche!';
  };

  const motivationalMessage = stats.consistency >= 80
    ? '"La constancia no es la ausencia de fallos, sino la persistencia a pesar de ellos. ¡Sigue brillando!"'
    : stats.consistency >= 60
    ? '"Pequeños pasos llevan a grandes cambios. ¡Empieza hoy!"'
    : '"Cada día es una nueva oportunidad para crecer."';

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-32 pt-0 bg-[#FFF5F0]">
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60 animate-float" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-20 bg-gradient-to-b from-[#FFF5F0] via-[#FFF5F0] to-[#FFF5F0]/80 pt-safe lg:hidden">
        <div className="flex flex-col">
          <p className="text-[#A67B6B] text-sm leading-none">Hola, {username}</p>
          <p className="text-[#3D2C28] text-xl font-bold tracking-tight">{getGreeting()}</p>
        </div>
        <button
          onClick={() => router.push('/app/estadisticas')}
          className="flex items-center justify-center h-10 w-10 rounded-full glass-stitch hover:scale-105 transition-transform"
        >
          <InsightsIcon sx={{ fontSize: 20, color: '#3D2C28' }} />
        </button>
      </header>

      <main className="relative flex-grow p-6 pt-28 lg:pt-4 space-y-6 z-10 lg:z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 backdrop-blur-xl border border-white/20 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[#A67B6B] text-sm font-medium">Tu Semana</p>
            {cycleData.isActive && (
              <button
                onClick={() => router.push('/app/modo-ciclo')}
                className="flex items-center justify-center w-10 h-10 bg-pink-200/40 backdrop-blur-md rounded-full border border-pink-300/30 hover:scale-105 transition-transform"
              >
                <span className="text-xl">🌸</span>
              </button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF8C66]/10 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-[#FF8C66]" />
              </div>
              <p className="text-[#3D2C28] font-medium">
                Constancia de Hábitos: <span className="font-bold">{stats.consistency}%</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF8C66]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#FF8C66]" />
              </div>
              <p className="text-[#3D2C28] font-medium">
                Tiempo en Actividades: <span className="font-bold">{stats.activityTime}h</span>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] p-6 shadow-lg overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-white text-base font-bold mb-1">Racha Actual</p>
            <p className="text-white text-6xl font-extrabold tracking-tighter">{stats.streak}</p>
            <p className="text-white/80 text-sm">días seguidos</p>
          </div>
          <div className="absolute right-4 bottom-0 opacity-20">
            <Flame className="w-32 h-32 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 backdrop-blur-xl border border-white/20 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          <p className="text-[#3D2C28] text-base font-bold leading-tight mb-2">Mensaje para ti</p>
          <p className="text-[#A67B6B] text-sm">{motivationalMessage}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            onClick={() => router.push('/app/reflexiones')}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl backdrop-blur-xl border border-white/20 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            }}
          >
            <Edit3 className="w-8 h-8 text-[#FF8C66]" />
            <span className="text-sm font-semibold text-[#3D2C28]">Reflexiones</span>
          </motion.button>
          <motion.button
            onClick={() => router.push('/app/calendario')}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl backdrop-blur-xl border border-white/20 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            }}
          >
            <Calendar className="w-8 h-8 text-[#FF8C66]" />
            <span className="text-sm font-semibold text-[#3D2C28]">Calendario</span>
          </motion.button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/app/respiracion')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl p-6 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.7) 0%, rgba(255, 200, 169, 0.5) 100%)',
            boxShadow: '0 8px 32px 0 rgba(255, 200, 169, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                <Wind className="w-7 h-7 text-[#FF9B7B]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg tracking-tight">Respiremos</p>
                <p className="text-xs text-white/80">Tómate un respiro hoy</p>
              </div>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
              <span className="text-lg">→</span>
            </div>
          </div>
        </motion.button>
      </main>
    </div>
  );
}
