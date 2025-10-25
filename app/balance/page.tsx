'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadData, getCategoryBreakdown } from '../lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="max-w-2xl mx-auto px-6 pt-12 pb-8 flex items-center justify-between animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tu Balance</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dónde invertís tu energía
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50"
        >
          ✕
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {hasCategories ? (
          <div className="space-y-6">
            {/* Gráfico */}
            <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-8 animate-slideUp">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">
                Distribución esta semana
              </h2>

              <div className="h-80">
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
              </div>

              <p className="text-center text-sm text-slate-500 mt-4">
                Total: {data.currentWeek.totalMinutes} minutos
              </p>
            </section>

            {/* Desglose */}
            <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-6 animate-slideUp" style={{animationDelay: '0.1s'}}>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Desglose por categoría
              </h3>

              <div className="space-y-3">
                {breakdown.map((item, i) => (
                  <div
                    key={i}
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
                  </div>
                ))}
              </div>
            </section>

            {/* Insights */}
            <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 animate-slideUp" style={{animationDelay: '0.15s'}}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Insight de la semana
                  </h3>
                  <p className="text-sm text-slate-700">
                    {getBalanceInsight(breakdown)}
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          // Empty state
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 p-10 text-center animate-slideUp">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Empezá a categorizar
            </h3>
            <p className="text-slate-600 mb-6">
              Cuando registres actividades con categorías, verás tu balance aquí.
            </p>
            <Link
              href="/reflexion"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              <span>+</span>
              Registrar actividad
            </Link>
          </div>
        )}
      </div>
    </main>
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

  const hasBalance = breakdown.find(b => b.category === '🧘 Equilibrio');
  if (!hasBalance || hasBalance.percentage < 10) {
    return `Considerá dedicar más tiempo a 🧘 Equilibrio. El descanso es parte del progreso.`;
  }

  return `Distribuiste tu energía de forma consciente entre ${breakdown.length} áreas. ¡Seguí así!`;
}
