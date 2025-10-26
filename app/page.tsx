'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import CircularProgress from './components/CircularProgress';
import InsightCard from './components/InsightCard';
import StreakCard from './components/StreakCard';
import ShareButton from './components/ShareButton';
import { loadData, getWeekProgress, getImprovement, getCurrentStreak, getBestStreak, toggleZenMode } from './lib/store';
import { celebrateStreak } from './lib/confetti';
import { useTheme } from './hooks/useTheme';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
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
          className="text-slate-400 text-sm"
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

  // MODO ZEN
  if (data.zenMode) {
    return (
      <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-12"
          >
            <CircularProgress percentage={progress} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-center mb-12 max-w-sm text-base"
          >
            {activeDays > 0
              ? `Llevas ${activeDays} ${activeDays === 1 ? 'día' : 'días'} esta semana`
              : 'Empezá tu semana'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Link
              href="/reflexion"
              className={`inline-flex items-center gap-2 px-6 h-12 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} text-white font-medium shadow-md hover:shadow-lg transition-all duration-250`}
            >
              Registrar actividad
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              toggleZenMode();
              setTimeout(() => window.location.href = '/', 100);
            }}
            className="mt-8 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Salir del modo Zen
          </motion.button>
        </motion.div>
      </main>
    );
  }

  // MODO NORMAL
  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      {/* Header Premium */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-6 pt-8 pb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            Hola, {data.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/perfil"
            className={`w-10 h-10 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center ${currentTheme.bgHover} transition-all duration-200`}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <circle cx="10" cy="10" r="3"/>
              <path d="M19 10a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H1m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"/>
            </svg>
          </Link>
        </motion.div>
      </motion.header>

      {/* Quick Nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto px-6 mb-6 flex gap-2"
      >
        <motion.div className="flex-1" whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
          <Link
            href="/balance"
            className={`h-11 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 ${currentTheme.bgHover} transition-all duration-200`}
          >
            <span className="text-base">📊</span>
            Balance
          </Link>
        </motion.div>
        <motion.div className="flex-1" whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
          <Link
            href="/historial"
            className={`h-11 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center gap-2 text-sm font-medium text-slate-700 ${currentTheme.bgHover} transition-all duration-200`}
          >
            <span className="text-base">📅</span>
            Historial
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-6 space-y-4 pb-24"
      >
        {/* Card Principal */}
        {/* Tu semana - MEJORADO */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Tu semana</h2>
            <button
              onClick={() => router.push('/estadisticas')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Ver más →
            </button>
          </div>

          {/* Progress Circle */}
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${progress * 5.53} 553`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={currentTheme.primary} />
                    <stop offset="100%" stopColor={currentTheme.secondary} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-900">{Math.round(progress)}%</span>
                <span className="text-sm text-slate-500 mt-1">Completado</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-sm text-slate-600 mb-1">Días activos</p>
              <p className="text-2xl font-bold text-slate-900">{activeDays}/7</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-sm text-slate-600 mb-1">Minutos</p>
              <p className="text-2xl font-bold text-slate-900">{data.currentWeek.totalMinutes}</p>
            </div>
          </div>

          {/* Racha */}
          {activeDays > 0 && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div className="flex-1">
                <p className="text-sm text-orange-900 font-medium">¡Racha activa!</p>
                <p className="text-xs text-orange-700">{activeDays} días consecutivos</p>
              </div>
            </div>
          )}
        </motion.section>

        <motion.div variants={itemVariants}>
          <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <InsightCard {...insight} />
        </motion.div>

        {/* Actividades */}
        {data.currentWeek.activities.length > 0 && (
          <motion.section
            variants={itemVariants}
            className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-5`}
          >
            <button
              onClick={() => setShowActivities(!showActivities)}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-base font-semibold text-slate-900">
                Recientes
              </h2>
              <motion.span
                animate={{ rotate: showActivities ? 180 : 0 }}
                className="text-slate-400"
              >
                ↓
              </motion.span>
            </button>

            {showActivities && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="mt-4 space-y-2"
              >
                {data.currentWeek.activities.slice(-5).reverse().map((act, i) => {
                  const actualIndex = data.currentWeek.activities.length - 1 - i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className={`flex items-start gap-3 py-3 border-b ${currentTheme.border} last:border-0`}
                    >
                      {act.emotion && (
                        <span className="text-xl flex-shrink-0">{act.emotion}</span>
                      )}
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${currentTheme.gradientSubtle} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold" style={{ color: currentTheme.primary }}>
                          {act.minutes}m
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 line-clamp-2 leading-relaxed">{act.note}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(act.date)}
                        </p>
                      </div>
                      <Link
                        href={`/editar?date=${act.date}&index=${actualIndex}`}
                        className={`text-xs font-medium ${currentTheme.accent} hover:opacity-70 transition-opacity`}
                      >
                        Editar
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.section>
        )}

        {/* Botones de acción */}
        <motion.div variants={itemVariants} className="space-y-3 pt-2">
          <ShareButton
            name={data.name}
            progress={progress}
            activeDays={activeDays}
            minutes={data.currentWeek.totalMinutes}
            streak={currentStreak}
          />

          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
              <Link
                href="/reflexion"
                className={`block w-full h-12 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} text-white font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-250`}
              >
                <span className="mr-2 text-lg">+</span>
                Registrar actividad
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
              <Link
                href="/biblioteca"
                className="block w-full h-12 rounded-2xl bg-white text-slate-700 font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all border border-slate-200"
              >
                <span className="mr-2 text-lg">🌱</span>
                Explorar hábitos
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
              <Link
                href="/mis-habitos"
                className="block w-full h-12 rounded-2xl bg-white text-slate-700 font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all border border-slate-200"
              >
                <span className="mr-2 text-lg">📊</span>
                Mis hábitos
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
              <Link
                href="/estadisticas"
                className="block w-full h-12 rounded-2xl bg-white text-slate-700 font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all border border-slate-200"
              >
                <span className="mr-2 text-lg">📈</span>
                Estadísticas
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}
