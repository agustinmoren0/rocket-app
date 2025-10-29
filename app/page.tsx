'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './context/UserContext';
import { useCycle } from './context/CycleContext';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { username } = useUser();
  const { cycleData } = useCycle();

  const [stats, setStats] = useState({
    consistency: 0,
    activityTime: 0,
    streak: 0,
  });

  const [motivationalMessage, setMotivationalMessage] = useState('');

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

    // Mensaje motivacional
    if (consistency >= 80) {
      setMotivationalMessage('"La constancia no es la ausencia de fallos, sino la persistencia a pesar de ellos. ¡Sigue brillando!"');
    } else if (consistency >= 60) {
      setMotivationalMessage('"Pequeños pasos llevan a grandes cambios. ¡Empieza hoy!"');
    } else {
      setMotivationalMessage('"Cada día es una nueva oportunidad para crecer."');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Qué buen día!';
    if (hour < 19) return '¡Buena tarde!';
    return '¡Buena noche!';
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-32 bg-[#FFF5F0]">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF99AC]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -top-10 right-0 w-80 h-80 bg-[#FFC0A9]/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute top-20 -right-20 w-80 h-80 bg-[#FDF0D5]/30 rounded-full filter blur-3xl opacity-60" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2 h-20">
        <div className="flex flex-col">
          <p className="text-[#A67B6B] text-base">Hola, {username || 'Usuario'}</p>
          <p className="text-[#3D2C28] text-2xl font-bold tracking-tight">{getGreeting()}</p>
        </div>
        <button
          onClick={() => router.push('/estadisticas')}
          className="flex items-center justify-center h-12 w-12 rounded-full glass-stitch"
        >
          <span className="material-symbols-outlined text-[#3D2C28]">insights</span>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 space-y-6">
        {/* Tu Semana */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass-stitch p-4"
        >
          <div className="flex justify-between items-start">
            <p className="text-[#A67B6B] text-sm font-medium">Tu Semana</p>
            {cycleData.isActive && (
              <button
                onClick={() => router.push('/modo-ciclo')}
                className="flex items-center gap-2 bg-white/50 px-2.5 py-1 rounded-full text-lg"
              >
                🌸
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FF8C66] text-xl">checklist</span>
              <p className="text-[#3D2C28] font-medium">
                Constancia de Hábitos: <span className="font-bold">{stats.consistency}%</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FF8C66] text-xl">hourglass_top</span>
              <p className="text-[#3D2C28] font-medium">
                Tiempo en Actividades: <span className="font-bold">{stats.activityTime}h</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Racha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] p-5 flex items-center justify-between shadow-lg"
        >
          <div className="flex flex-col">
            <p className="text-white text-base font-bold">Racha Actual</p>
            <p className="text-white text-5xl font-extrabold tracking-tighter">{stats.streak}</p>
            <p className="text-white/80 text-sm">días seguidos</p>
          </div>
          <div className="absolute right-4 bottom-0 opacity-20">
            <span className="material-symbols-outlined text-9xl text-white -rotate-12">local_fire_department</span>
          </div>
        </motion.div>

        {/* Mensaje */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-white p-4 shadow-lg"
        >
          <p className="text-[#3D2C28] text-base font-bold leading-tight">Mensaje para ti</p>
          <p className="text-[#A67B6B] text-sm mt-1">{motivationalMessage}</p>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push('/reflexiones')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white shadow-lg"
          >
            <span className="material-symbols-outlined text-3xl text-[#FF8C66]">edit_note</span>
            <span className="text-sm font-semibold text-[#3D2C28]">Reflexiones</span>
          </button>
          <button
            onClick={() => router.push('/calendario')}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white shadow-lg"
          >
            <span className="material-symbols-outlined text-3xl text-[#FF8C66]">calendar_month</span>
            <span className="text-sm font-semibold text-[#3D2C28]">Calendario</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
