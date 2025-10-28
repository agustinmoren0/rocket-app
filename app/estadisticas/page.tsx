'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { getCustomHabits } from '../lib/store';
import { TrendingUp, Award, Flame, Calendar, Clock } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function EstadisticasPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [habits, setHabits] = useState<any[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const loadedHabits = getCustomHabits();
    setHabits(loadedHabits);

    // Calcular estadísticas
    const minutes = loadedHabits.reduce((sum, h) => sum + (h.minutes || 0), 0);
    const days = loadedHabits.length;

    setTotalMinutes(minutes);
    setTotalDays(days);
    setBestStreak(days); // TODO: calcular racha real
  }, []);

  return (
    <main className={`min-h-screen ${currentTheme.bg} pb-40 p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tu evolución</h1>
            <p className="text-sm text-slate-600">Mide lo que importa: constancia, no perfección</p>
          </div>
          <div className="w-20" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white rounded-2xl shadow-sm text-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Flame className="text-indigo-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{bestStreak}</p>
            <p className="text-sm text-slate-600">Mejor racha</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-white rounded-2xl shadow-sm text-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{totalDays}</p>
            <p className="text-sm text-slate-600">Días activos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-white rounded-2xl shadow-sm text-center"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <Clock className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{Math.round(totalMinutes / 60)}</p>
            <p className="text-sm text-slate-600">Horas totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-white rounded-2xl shadow-sm text-center"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <Award className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{habits.length}</p>
            <p className="text-sm text-slate-600">Hábitos activos</p>
          </motion.div>
        </div>

        {/* Mensaje motivacional */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                ¡Excelente progreso!
              </h3>
              <p className="text-sm text-slate-600">
                Has completado {totalDays} días de actividad. ¡Sigue así!
              </p>
            </div>
          </div>
        </div>

        {/* Hábitos más practicados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Hábitos más practicados
          </h2>
          {habits.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              Aún no tenés hábitos registrados
            </p>
          ) : (
            <div className="space-y-3">
              {habits.slice(0, 5).map((habit, i) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{habit.name}</p>
                    <p className="text-sm text-slate-600">
                      {habit.minutes} min {habit.frequency === 'daily' ? '(Diario)' : '(Personalizado)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">0</p>
                    <p className="text-xs text-slate-500">completados</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
