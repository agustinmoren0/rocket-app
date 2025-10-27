'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { getWeekProgress, getCustomHabits } from './lib/store';
import {
  Home, FileText, Plus, Activity, User,
  Flame, PieChart, TrendingUp, Settings, X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [showFab, setShowFab] = useState(false);
  const [username, setUsername] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [totalDays] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('habika_username');
    setUsername(stored || 'Alex');

    const progress = getWeekProgress();
    setPercentage(progress);
    setActiveDays(3); // TODO: calcular real
    setMinutes(120); // TODO: calcular real
    setStreak(5); // TODO: calcular real
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
              Hola, {username} 👋
            </h1>
            <p className="text-sm text-slate-600">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
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
            <Link href="/historial">
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
      </main>

      {/* FAB + Modal */}
      <AnimatePresence>
        {showFab && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFab(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* FAB Options */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3"
            >
              <button
                onClick={() => {
                  setShowFab(false);
                  router.push('/registrar-actividad');
                }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-white/40 hover:scale-105 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
                <span className="font-semibold text-slate-900">Registrar actividad</span>
              </button>

              <button
                onClick={() => {
                  setShowFab(false);
                  router.push('/biblioteca');
                }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-white/40 hover:scale-105 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Plus className="text-indigo-600" size={24} />
                </div>
                <span className="font-semibold text-slate-900">Añadir hábito</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-lg mx-auto px-6 pb-6">
          {/* FAB Button */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFab(!showFab)}
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-all ${
                showFab ? 'rotate-45' : ''
              }`}
            >
              <Plus size={32} />
            </motion.button>
          </div>

          {/* Nav Bar */}
          <div className="rounded-full backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-1">
            <nav className="flex items-center justify-between px-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center p-3 rounded-full transition-all ${
                  activeTab === 'home' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                }`}
              >
                <Home size={22} />
                <span className="text-xs font-bold mt-1">Hoy</span>
              </button>

              <Link href="/actividades">
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex flex-col items-center p-3 rounded-full transition-all ${
                    activeTab === 'activities' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  <Activity size={22} />
                  <span className="text-xs font-bold mt-1">Actividades</span>
                </button>
              </Link>

              <div className="w-16" />

              <Link href="/mis-habitos">
                <button
                  onClick={() => setActiveTab('habits')}
                  className={`flex flex-col items-center p-3 rounded-full transition-all ${
                    activeTab === 'habits' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  <FileText size={22} />
                  <span className="text-xs font-bold mt-1">Hábitos</span>
                </button>
              </Link>

              <Link href="/estadisticas">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex flex-col items-center p-3 rounded-full transition-all ${
                    activeTab === 'stats' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                  }`}
                >
                  <TrendingUp size={22} />
                  <span className="text-xs font-bold mt-1">Resumen</span>
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </footer>

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
