'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import CircularProgress from './components/CircularProgress';
import InsightCard from './components/InsightCard';
import StreakCard from './components/StreakCard';
import ShareButton from './components/ShareButton';
import { loadData, getWeekProgress, getImprovement, getCurrentStreak, getBestStreak } from './lib/store';
import { celebrateStreak } from './lib/confetti';
import { useTheme } from './hooks/useTheme';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function Home() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(() => loadData());
  const [showActivities, setShowActivities] = useState(false);

  useEffect(() => {
    const userData = loadData();

    if (!userData.onboardingDone) {
      router.replace('/onboarding');
      return;
    }

    setData(userData);
    setLoaded(true);

    const currentStreak = getCurrentStreak();
    const savedStreak = parseInt(localStorage.getItem('rocket.lastStreak') || '0');

    if (currentStreak > savedStreak && currentStreak >= 3) {
      setTimeout(() => celebrateStreak(), 500);
    }

    localStorage.setItem('rocket.lastStreak', currentStreak.toString());
  }, [router]);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400"
        >
          Cargando...
        </motion.div>
      </main>
    );
  }

  const progress = getWeekProgress();
  const improvement = getImprovement();
  const activeDays = data.currentWeek.activeDays.filter(Boolean).length;
  const currentStreak = getCurrentStreak();
  const bestStreak = getBestStreak();

  const getInsight = () => {
    if (activeDays >= 5) return {
      icon: '🚀',
      title: '¡Despegue total!',
      description: 'Estás en racha. Tu constancia es increíble.'
    };
    if (activeDays >= 3) return {
      icon: '☀️',
      title: 'Ritmo saludable',
      description: 'Mantenés un flujo constante y sostenible.'
    };
    return {
      icon: '🌱',
      title: 'Empezando tu semana',
      description: 'Cada día cuenta. Seguí avanzando a tu ritmo.'
    };
  };

  const insight = getInsight();

  // MODO ZEN: UI ultra minimalista
  if (data.zenMode) {
    return (
      <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <CircularProgress percentage={progress} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 text-center mb-12 max-w-sm"
          >
            {activeDays > 0
              ? `Llevas ${activeDays} ${activeDays === 1 ? 'día' : 'días'} esta semana`
              : 'Empezá tu semana'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/reflexion"
              className={`block px-8 py-4 rounded-full bg-gradient-to-r ${currentTheme.gradient} text-white font-medium shadow-lg`}
            >
              Registrar actividad
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/perfil')}
            className="mt-8 text-sm text-slate-400 hover:text-slate-600"
          >
            Salir del modo Zen
          </motion.button>
        </motion.div>
      </main>
    );
  }

  // MODO NORMAL: UI completa
  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hola, {data.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/perfil"
            className="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-all"
          >
            <span className="text-lg">⚙️</span>
          </Link>
        </motion.div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto px-6 mb-6 flex gap-3"
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/balance"
            className="h-12 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-white transition-all"
          >
            <span>📊</span>
            Tu Balance
          </Link>
        </motion.div>
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/historial"
            className="h-12 rounded-2xl bg-white/70 backdrop-blur-sm shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-white transition-all"
          >
            <span>📅</span>
            Historial
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-6 space-y-5 pb-24"
      >
        <motion.section
          variants={itemVariants}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Tu semana</h2>
            <Link href="/historial" className="text-xs font-medium text-slate-600 hover:text-slate-800">
              Historial →
            </Link>
          </div>

          <div className="flex justify-center mb-6">
            <CircularProgress percentage={progress} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <p className="text-3xl font-bold" style={{ color: currentTheme.primary }}>{activeDays}/7</p>
              <p className="text-sm text-slate-500 mt-1">Días activos</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <p className="text-3xl font-bold" style={{ color: currentTheme.primary }}>{data.currentWeek.totalMinutes}</p>
              <p className="text-sm text-slate-500 mt-1">Minutos</p>
            </motion.div>
          </div>

          {improvement !== 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-slate-100 text-center"
            >
              <p className={`text-lg font-bold ${improvement > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {improvement > 0 ? '+' : ''}{improvement}% vs semana pasada
              </p>
            </motion.div>
          )}
        </motion.section>

        <motion.div variants={itemVariants}>
          <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InsightCard {...insight} />
        </motion.div>

        {data.currentWeek.activities.length > 0 ? (
          <motion.section
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6"
          >
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-slate-800">
                Actividades recientes
              </h2>
              <motion.span
                animate={{ rotate: showActivities ? 180 : 0 }}
                className="text-slate-400 text-xl"
              >
                −
              </motion.span>
            </button>

            {showActivities && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                {data.currentWeek.activities.slice(-5).reverse().map((act, i) => {
                  const actualIndex = data.currentWeek.activities.length - 1 - i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0"
                    >
                      {act.emotion && (
                        <span className="text-2xl flex-shrink-0">{act.emotion}</span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: currentTheme.primary }}>
                          {act.minutes}m
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 line-clamp-2">{act.note}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(act.date)}
                        </p>
                      </div>
                      <Link
                        href={`/editar?date=${act.date}&index=${actualIndex}`}
                        className="text-xs hover:opacity-80 font-medium"
                        style={{ color: currentTheme.primary }}
                      >
                        Editar
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.section>
        ) : (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-50/80 to-indigo-50/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🌱
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Empezá tu semana
            </h3>
            <p className="text-slate-600 mb-6">
              Cada día es una oportunidad para avanzar.
            </p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="space-y-3">
          <ShareButton
            name={data.name}
            progress={progress}
            activeDays={activeDays}
            minutes={data.currentWeek.totalMinutes}
            streak={currentStreak}
          />

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/reflexion"
              className={`block w-full h-14 rounded-full bg-gradient-to-r ${currentTheme.gradient} text-white font-medium flex items-center justify-center shadow-lg hover:shadow-xl transition-all`}
            >
              <span className="mr-2 text-xl">+</span>
              Registrar actividad
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return days[date.getDay()];
}
