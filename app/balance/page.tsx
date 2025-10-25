'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { loadData, getCategoryBreakdown } from '../lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const categoryItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export default function BalancePage() {
  const router = useRouter();
  const data = loadData();
  const breakdown = getCategoryBreakdown();

  console.log('🔍 Balance Debug:', {
    hasCategories: breakdown.length > 0,
    breakdown,
    totalActivities: data.currentWeek.activities.length,
    activitiesWithCategory: data.currentWeek.activities.filter(a => a.category).length
  });

  const chartData = breakdown.map(item => ({
    name: item.category,
    value: item.minutes,
    percentage: item.percentage,
  }));

  const hasCategories = breakdown.length > 0;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50"
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Balance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dónde invertís tu energía
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50"
        >
          ✕
        </motion.button>
      </motion.header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {hasCategories ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Gráfico */}
            <motion.section
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8"
            >
              <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
                Distribución esta semana
              </h2>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value} min`}
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-sm text-slate-500 mt-4"
              >
                Total: {data.currentWeek.totalMinutes} minutos
              </motion.p>
            </motion.section>

            {/* Desglose */}
            <motion.section
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Desglose por categoría
              </h3>

              <div className="space-y-3">
                {breakdown.map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={categoryItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="font-bold text-slate-800"
                      >
                        {item.percentage}%
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="text-xs text-slate-500"
                      >
                        {item.minutes} min
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Insights */}
            <motion.section
              variants={itemVariants}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6"
            >
              <div className="flex items-start gap-3">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
                  className="text-3xl"
                >
                  💡
                </motion.span>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Insight de la semana
                  </h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-sm text-slate-700"
                  >
                    {getBalanceInsight(breakdown)}
                  </motion.p>
                </div>
              </div>
            </motion.section>
          </motion.div>
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              📊
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Empezá a categorizar
            </h3>
            <p className="text-slate-600 mb-6">
              Cuando registres actividades con categorías, verás tu balance aquí.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/reflexion"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              >
                <span>+</span>
                Registrar actividad
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}

function getBalanceInsight(breakdown: any[]): string {
  if (breakdown.length === 0) return '';

  const top = breakdown[0];

  if (top.percentage >= 50) {
    return `Esta semana te enfocaste principalmente en ${top.category} (${top.percentage}%). Es genial tener claridad, pero recordá equilibrar con otras áreas.`;
  }

  if (breakdown.length >= 4) {
    return `Tu semana fue muy equilibrada entre ${breakdown.length} áreas. Esto refleja versatilidad y balance en tu energía.`;
  }

  const hasBalance = breakdown.find((b: any) => b.category === '🧘 Equilibrio');
  if (!hasBalance || hasBalance.percentage < 10) {
    return `Considerá dedicar más tiempo a 🧘 Equilibrio. El descanso es parte del progreso.`;
  }

  return `Distribuiste tu energía de forma consciente entre ${breakdown.length} áreas. ¡Seguí así!`;
}
