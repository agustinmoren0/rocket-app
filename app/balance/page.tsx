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
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function BalancePage() {
  const router = useRouter();
  const data = loadData();
  const breakdown = getCategoryBreakdown();

  const chartData = breakdown.map(item => ({
    name: item.category,
    value: item.minutes,
    percentage: item.percentage,
  }));

  const hasCategories = breakdown.length > 0;
  const hasActivities = data.currentWeek.activities.length > 0;
  const activitiesWithoutCategory = data.currentWeek.activities.filter(a => !a.category).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Balance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dónde invertís tu energía
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
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
                      animationDuration={800}
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
                transition={{ delay: 0.5 }}
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">
                        {item.percentage}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.minutes} min
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Aviso si hay actividades sin categoría */}
            {activitiesWithoutCategory > 0 && (
              <motion.section
                variants={itemVariants}
                className="bg-amber-50 rounded-2xl p-4"
              >
                <p className="text-sm text-amber-800">
                  💡 Tenés {activitiesWithoutCategory} {activitiesWithoutCategory === 1 ? 'actividad' : 'actividades'} sin categoría.
                  Podés editarlas para verlas en tu balance.
                </p>
              </motion.section>
            )}
          </motion.div>
        ) : hasActivities ? (
          // Tiene actividades pero sin categoría
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Agregá categorías para ver tu balance
              </h3>
              <p className="text-slate-600 mb-2">
                Tenés {data.currentWeek.activities.length} {data.currentWeek.activities.length === 1 ? 'actividad registrada' : 'actividades registradas'} esta semana.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Cuando las categorices, verás aquí cómo distribuís tu energía.
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link
                  href="/reflexion"
                  className="px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                >
                  Registrar con categoría
                </Link>
                <Link
                  href="/"
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  O editá actividades existentes →
                </Link>
              </div>
            </div>

            {/* Resumen sin categorías */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Resumen de la semana
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {data.currentWeek.activities.length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Actividades</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {data.currentWeek.totalMinutes}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Minutos</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // No hay actividades
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center"
          >
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Empezá tu semana
            </h3>
            <p className="text-slate-600 mb-6">
              Registrá tu primera actividad con categoría para ver tu balance.
            </p>
            <Link
              href="/reflexion"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <span>+</span>
              Registrar actividad
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
