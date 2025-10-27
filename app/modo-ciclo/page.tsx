'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useCycle } from '../context/CycleContext';
import { motion } from 'framer-motion';
import { Calendar, Heart, Sparkles, ArrowLeft } from 'lucide-react';

export default function ModoCicloPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { cycleData, activateCycleMode, deactivateCycleMode, getPhaseInfo } = useCycle();

  const [step, setStep] = useState(cycleData.isActive ? 2 : 1);
  const [formData, setFormData] = useState({
    lastPeriod: cycleData.isActive
      ? cycleData.lastPeriodStart.split('T')[0]
      : new Date().toISOString().split('T')[0],
    cycleLength: cycleData.cycleLengthDays,
    periodLength: cycleData.periodLengthDays,
  });

  const handleActivate = () => {
    activateCycleMode(formData.lastPeriod, formData.cycleLength, formData.periodLength);
    setStep(2);
  };

  const handleDeactivate = () => {
    deactivateCycleMode();
    setStep(1);
  };

  if (step === 2 && cycleData.isActive) {
    const phaseInfo = getPhaseInfo(cycleData.currentPhase);
    const containerClass = `bg-gradient-to-br ${phaseInfo.color} text-white rounded-3xl p-8`;

    return (
      <main className={`min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pb-24 lg:pb-8`}>
        <div className="max-w-2xl mx-auto p-4 lg:p-0">
          {/* Back Button */}
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.back()}
            className={`flex items-center gap-2 ${currentTheme.textSecondary} hover:${currentTheme.text} mb-6 transition-colors`}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </motion.button>

          {/* Header con toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${currentTheme.bgCard} rounded-3xl p-6 lg:p-8 mb-6 border ${currentTheme.border}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-3xl font-bold ${currentTheme.text}`}>Modo Ciclo 🌸</h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeactivate}
                className={`px-4 py-2 text-sm font-medium ${currentTheme.text} hover:${currentTheme.bgHover} rounded-lg transition-colors`}
              >
                Desactivar
              </motion.button>
            </div>

            {/* Fase actual - Gran card */}
            <div className={containerClass}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90">Día {cycleData.currentDay} del ciclo</p>
                  <h2 className="text-3xl font-bold mt-1">Fase {phaseInfo.name}</h2>
                  <p className="text-sm opacity-90 mt-2">{phaseInfo.description}</p>
                </div>
                <div className="text-6xl">{phaseInfo.emoji}</div>
              </div>
            </div>
          </motion.div>

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <div className={`${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Próximo periodo</p>
              <p className={`font-bold ${currentTheme.text}`}>
                {new Date(cycleData.nextPeriodDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            <div className={`${currentTheme.bgCard} rounded-2xl p-4 border ${currentTheme.border}`}>
              <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Energía estimada</p>
              <p className={`font-bold ${currentTheme.text}`}>{phaseInfo.energy}</p>
            </div>
          </motion.div>

          {/* Ventana de fertilidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${currentTheme.bgCard} rounded-2xl p-4 border-2 border-amber-200 bg-amber-50 mb-6`}
          >
            <p className="text-sm font-bold text-amber-900 mb-2">💡 Ventana de fertilidad</p>
            <p className="text-xs text-amber-800">
              Del {new Date(cycleData.fertilityWindow.start).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              al{' '}
              {new Date(cycleData.fertilityWindow.end).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </motion.div>

          {/* Sugerencias de hábitos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${currentTheme.bgCard} rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}
          >
            <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>
              Sugerencias para esta fase
            </h2>
            <div className="space-y-3">
              {phaseInfo.suggestions.map((suggestion: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className={`flex items-center gap-3 p-4 rounded-xl ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}
                >
                  <Sparkles size={20} className={currentTheme.primary} />
                  <span className={currentTheme.text}>{suggestion}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${currentTheme.bgCard} rounded-3xl p-8 max-w-md w-full border ${currentTheme.border}`}
      >
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mx-auto mb-4"
              >
                <Heart size={40} className="text-white" />
              </motion.div>
              <h1 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>
                Modo Ciclo 🌸
              </h1>
              <p className={currentTheme.textSecondary}>
                Adapta tus hábitos según tu energía y fase del ciclo
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-start gap-3 p-4 ${currentTheme.bgCardSecondary || currentTheme.bgHover} rounded-xl`}
              >
                <div className="text-2xl flex-shrink-0">🌙</div>
                <div>
                  <p className={`font-medium ${currentTheme.text}`}>Sugerencias adaptadas</p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>Según tu fase del ciclo</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-start gap-3 p-4 ${currentTheme.bgCardSecondary || currentTheme.bgHover} rounded-xl`}
              >
                <div className="text-2xl flex-shrink-0">📊</div>
                <div>
                  <p className={`font-medium ${currentTheme.text}`}>Predicciones precisas</p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>Próximo periodo y fertilidad</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-start gap-3 p-4 ${currentTheme.bgCardSecondary || currentTheme.bgHover} rounded-xl`}
              >
                <div className="text-2xl flex-shrink-0">💗</div>
                <div>
                  <p className={`font-medium ${currentTheme.text}`}>Entiende tu cuerpo</p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>Conoce tus energías naturales</p>
                </div>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Activar Modo Ciclo
            </motion.button>
          </>
        )}

        {step === 2 && !cycleData.isActive && (
          <>
            <h2 className={`text-2xl font-bold ${currentTheme.text} mb-6`}>
              Configuración inicial
            </h2>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  📅 Fecha del último periodo
                </label>
                <input
                  type="date"
                  value={formData.lastPeriod}
                  onChange={(e) => setFormData({ ...formData, lastPeriod: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 outline-none ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  🔄 Duración del ciclo (días)
                </label>
                <input
                  type="number"
                  value={formData.cycleLength}
                  onChange={(e) =>
                    setFormData({ ...formData, cycleLength: parseInt(e.target.value) })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 outline-none ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                  min="21"
                  max="35"
                />
                <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Promedio: 28 días</p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                  🩸 Duración del periodo (días)
                </label>
                <input
                  type="number"
                  value={formData.periodLength}
                  onChange={(e) =>
                    setFormData({ ...formData, periodLength: parseInt(e.target.value) })
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 outline-none ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                  min="2"
                  max="8"
                />
                <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Promedio: 5 días</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className={`flex-1 py-3 border-2 ${currentTheme.border} rounded-xl font-medium hover:${currentTheme.bgHover} transition-colors`}
              >
                Volver
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleActivate}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold"
              >
                Activar
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
