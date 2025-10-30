'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';
import { useCycle } from './context/CycleContext';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Flame, Edit3, Calendar, CheckSquare } from 'lucide-react';

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
  }, []);

  const calculateStats = () => {
    const habits = JSON.parse(localStorage.getItem('habika_custom_habits') || '[]');
    const completions = JSON.parse(localStorage.getItem('habika_completions') || '{}');
    const activities = JSON.parse(localStorage.getItem('habika_activities') || '[]');

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

    // Tiempo en actividades
    const activityTime = activities
      .filter((a: any) => last7Days.includes(a.date))
      .reduce((sum: number, a: any) => sum + (a.duration || 0), 0);

    // Racha global
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasCompletion = Object.values(completions).some((habitComps: any) =>
        habitComps.some((c: any) => c.date === dateStr && c.status === 'completed')
      );

      if (hasCompletion) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    setStats({
      consistency,
      activityTime: Math.round(activityTime / 60),
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
    <div className="relative min-h-screen w-full flex flex-col pb-32 bg-[#FFF5F0]">
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60 animate-float" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <header className="relative flex items-center justify-between px-6 pt-6 pb-4 z-10">
        <div className="flex flex-col">
          <p className="text-[#A67B6B] text-sm leading-none">Hola, {username}</p>
          <p className="text-[#3D2C28] text-xl font-bold tracking-tight">{getGreeting()}</p>
        </div>
        <button
          onClick={() => router.push('/estadisticas')}
          className="flex items-center justify-center h-10 w-10 rounded-full glass-stitch hover:scale-105 transition-transform"
        >
          <TrendingUp className="w-5 h-5 text-[#3D2C28]" />
        </button>
      </header>

      <main className="relative flex-grow p-6 pt-4 space-y-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass-stitch p-4"
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[#A67B6B] text-sm font-medium">Tu Semana</p>
            {cycleData.isActive && (
              <button
                onClick={() => router.push('/modo-ciclo')}
                className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-full"
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
          className="rounded-xl bg-white p-4 shadow-lg"
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
          <button
            onClick={() => router.push('/reflexiones')}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-white shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
            <Edit3 className="w-8 h-8 text-[#FF8C66]" />
            <span className="text-sm font-semibold text-[#3D2C28]">Reflexiones</span>
          </button>
          <button
            onClick={() => router.push('/calendario')}
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-white shadow-lg hover:scale-105 transition-transform active:scale-95"
          >
            <Calendar className="w-8 h-8 text-[#FF8C66]" />
            <span className="text-sm font-semibold text-[#3D2C28]">Calendario</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
