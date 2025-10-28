'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import { useUser } from './context/UserContext';
import { useCycle } from './context/CycleContext';
import { getWeekProgress, getCustomHabits } from './lib/store';
import BottomNav from './components/BottomNav';
import {
  Home, FileText, Plus, Activity, User,
  Flame, PieChart, TrendingUp, Settings, X, BookOpen, PauseCircle, Heart, ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { username } = useUser();
  const { cycleData, getPhaseInfo } = useCycle();
  const [percentage, setPercentage] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [totalDays] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pausedCount, setPausedCount] = useState(0);

  useEffect(() => {
    const progress = getWeekProgress();
    setPercentage(progress);
    setActiveDays(3); // TODO: calcular real
    setMinutes(120); // TODO: calcular real
    setStreak(5); // TODO: calcular real

    // Count paused habits
    const paused = localStorage.getItem('habika_paused_habits');
    if (paused) {
      setPausedCount(JSON.parse(paused).length);
    }
  }, []);

  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay();

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/60 border-b border-white/20 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tu día
            </h1>
            <p className="text-sm text-slate-600">
              Cada paso cuenta, sin presión
            </p>
          </div>
          <button
            onClick={() => router.push('/perfil')}
            className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white/80 transition-all"
          >
            <Settings size={20} className="text-slate-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 max-w-4xl mx-auto pb-32 space-y-5">

        {/* Tu semana - Con barras verticales */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Tu semana</h2>
            <Link href="/calendario">
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Ver todo →
              </button>
            </Link>
          </div>

          {/* Week bars */}
          <div className="flex items-end justify-between gap-2 h-32">
            {daysOfWeek.map((day, i) => {
              const isToday = i === (today === 0 ? 6 : today - 1);
              const height = Math.random() * 100; // TODO: usar datos reales

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex-1 w-full flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={`w-3 rounded-full ${
                        isToday
                          ? 'bg-indigo-600'
                          : percentage > 50
                            ? 'bg-indigo-400'
                            : 'bg-indigo-200'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    isToday ? 'text-indigo-600 font-bold' : 'text-slate-500'
                  }`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Racha + Balance */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tu Racha */}
          <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-xl transition-all">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Tu Racha</h3>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" size={32} />
              <div>
                <p className="text-3xl font-bold text-slate-900">{streak}</p>
                <p className="text-xs text-slate-600">días</p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <Link href="/balance">
            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-xl transition-all cursor-pointer">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Balance</h3>
              <div className="flex items-center gap-2">
                <PieChart className="text-indigo-600" size={32} />
                <div>
                  <p className="text-3xl font-bold text-slate-900">{Math.round(percentage)}%</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Mensaje de la semana */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-white/40">
          <h3 className="font-bold text-slate-900 mb-2">Mensaje de la semana</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            "La creatividad no se gasta. Cuanta más usas, más tienes." - Maya Angelou
          </p>
        </div>

        {/* Modo Ciclo - Active or Promotional */}
        {cycleData.isActive ? (
          <Link href="/modo-ciclo">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 backdrop-blur-xl bg-gradient-to-br from-pink-50/80 to-rose-50/80 border border-rose-200/40 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-3xl flex-shrink-0">
                  {getPhaseInfo(cycleData.currentPhase).emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Modo Ciclo Activo</h3>
                  <p className="text-sm text-slate-600">
                    Fase {getPhaseInfo(cycleData.currentPhase).name} · Día {cycleData.currentDay}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <div className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-medium">
                      Próximo periodo: {Math.ceil((new Date(cycleData.nextPeriodDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                    </div>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-400 flex-shrink-0" />
              </div>
            </motion.div>
          </Link>
        ) : (
          <Link href="/perfil">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 backdrop-blur-xl bg-gradient-to-br from-pink-50/80 to-rose-50/80 border border-rose-200/40 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                  <Heart size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Modo Ciclo 🌸</h3>
                  <p className="text-sm text-slate-600">
                    Adapta tus hábitos a tu ciclo menstrual
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Recibe recomendaciones personalizadas según tu fase del ciclo
                  </p>
                </div>
                <ArrowRight size={20} className="text-slate-400 flex-shrink-0" />
              </div>
            </motion.div>
          </Link>
        )}

        {/* Quick Access Shortcuts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Reflexiones */}
          <Link href="/reflexiones">
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Reflexiones</h3>
              <p className="text-xs text-slate-600">Tu diario semanal</p>
            </motion.div>
          </Link>

          {/* Pausados */}
          <Link href="/pausados">
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-5 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3">
                <PauseCircle size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">En pausa</h3>
              <p className="text-xs text-slate-600">
                {pausedCount > 0 ? `${pausedCount} hábitos` : 'Sin pausas'}
              </p>
            </motion.div>
          </Link>
        </div>

        {/* Historial */}
        <Link href="/historial">
          <div className="glass-card rounded-2xl p-5 backdrop-blur-xl bg-white/60 border border-white/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Historial</h3>
                <p className="text-sm text-slate-600">Revisa tu progreso semanal</p>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              →
            </div>
          </div>
        </Link>

        {/* Actividades Recientes */}
        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/60 border border-white/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recientes</h2>
            <Link href="/actividades">
              <button className="text-sm font-semibold text-indigo-600">Ver todas →</button>
            </Link>
          </div>
          {/* TODO: mostrar últimas 3 actividades */}
          <p className="text-sm text-slate-600">No hay actividades recientes</p>
        </div>
      </main>

      <BottomNav />

      <style jsx global>{`
        .glass-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
