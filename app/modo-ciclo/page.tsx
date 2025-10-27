'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useCycle } from '../context/CycleContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Heart, Sparkles, Settings, TrendingUp,
  AlertCircle, Droplet, Moon, Sun, Thermometer, Activity, ArrowLeft
} from 'lucide-react';

export default function ModoCicloPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { cycleData, getPhaseInfo, addSymptom, deactivateCycleMode } = useCycle();
  const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'insights' | 'settings'>('overview');
  const [todaySymptoms, setTodaySymptoms] = useState<string[]>([]);

  const phaseInfo = getPhaseInfo(cycleData.currentPhase);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setTodaySymptoms(cycleData.symptoms[today] || []);
  }, [cycleData.symptoms, today]);

  const allSymptoms = [
    { id: 'cramps', label: 'Cólicos', emoji: '😣', category: 'pain' },
    { id: 'headache', label: 'Dolor de cabeza', emoji: '🤕', category: 'pain' },
    { id: 'backache', label: 'Dolor de espalda', emoji: '💢', category: 'pain' },
    { id: 'bloating', label: 'Hinchazón', emoji: '🎈', category: 'physical' },
    { id: 'tender-breasts', label: 'Sensibilidad en pechos', emoji: '💗', category: 'physical' },
    { id: 'acne', label: 'Acné', emoji: '😔', category: 'physical' },
    { id: 'fatigue', label: 'Fatiga', emoji: '😴', category: 'energy' },
    { id: 'high-energy', label: 'Mucha energía', emoji: '⚡', category: 'energy' },
    { id: 'anxious', label: 'Ansiedad', emoji: '😰', category: 'mood' },
    { id: 'happy', label: 'Feliz', emoji: '😊', category: 'mood' },
    { id: 'sad', label: 'Triste', emoji: '😢', category: 'mood' },
    { id: 'irritable', label: 'Irritable', emoji: '😠', category: 'mood' },
    { id: 'cravings', label: 'Antojos', emoji: '🍫', category: 'other' },
    { id: 'insomnia', label: 'Insomnio', emoji: '🌙', category: 'other' },
  ];

  const toggleSymptom = (symptomId: string) => {
    if (todaySymptoms.includes(symptomId)) {
      const updated = todaySymptoms.filter(s => s !== symptomId);
      setTodaySymptoms(updated);
    } else {
      addSymptom(today, symptomId);
      setTodaySymptoms([...todaySymptoms, symptomId]);
    }
  };

  const daysUntilNextPeriod = Math.ceil(
    (new Date(cycleData.nextPeriodDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isInFertilityWindow = () => {
    const now = new Date();
    const start = new Date(cycleData.fertilityWindow.start);
    const end = new Date(cycleData.fertilityWindow.end);
    return now >= start && now <= end;
  };

  const handleDeactivate = () => {
    if (window.confirm('¿Estás segura? Tus datos de síntomas se guardarán.')) {
      deactivateCycleMode();
      router.push('/perfil');
    }
  };

  if (!cycleData.isActive) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex items-center justify-center p-6">
        <div className={`${currentTheme.bgCard} rounded-3xl p-8 max-w-md w-full border ${currentTheme.border} text-center`}>
          <Heart size={48} className="text-rose-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold ${currentTheme.text} mb-2`}>Modo Ciclo desactivado</h1>
          <p className={currentTheme.textSecondary}>Actívalo en configuración para comenzar a registrar tu ciclo</p>
          <button
            onClick={() => router.push('/perfil')}
            className={`w-full mt-6 py-3 rounded-xl ${currentTheme.gradient} text-white font-medium`}
          >
            Ir a configuración
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto p-4 lg:p-0">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => router.back()}
          className={`flex items-center gap-2 ${currentTheme.textSecondary} hover:${currentTheme.text} mb-6 transition-colors`}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver</span>
        </motion.button>

        {/* Header con fase actual */}
        <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-6 border ${currentTheme.border}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Modo Ciclo 🌸</h1>
              <p className={currentTheme.textSecondary}>Tu ciclo, tus reglas</p>
            </div>
          </div>

          {/* Fase actual - Banner */}
          <div className={`bg-gradient-to-br ${phaseInfo.color} rounded-2xl p-6 text-white mb-6`}>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-5xl">{phaseInfo.emoji}</div>
                  <div>
                    <p className="text-sm opacity-90">Día {cycleData.currentDay} del ciclo</p>
                    <h2 className="text-2xl font-bold">Fase {phaseInfo.name}</h2>
                  </div>
                </div>
                <p className="text-sm opacity-90 mb-4">{phaseInfo.description}</p>
                <div className="flex gap-3 text-sm flex-wrap">
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    Energía: {phaseInfo.energy}
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    Ánimo: {phaseInfo.mood}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-sm opacity-90 mb-1">Próximo periodo</p>
                  <p className="text-xl font-bold">
                    {daysUntilNextPeriod > 0
                      ? `En ${daysUntilNextPeriod} días`
                      : 'Hoy o ya pasó'}
                  </p>
                  <p className="text-xs opacity-75">
                    {new Date(cycleData.nextPeriodDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>

                {isInFertilityWindow() && (
                  <div className="bg-amber-400/30 backdrop-blur-sm rounded-xl p-4 border border-amber-300/50">
                    <p className="text-sm font-medium mb-1">⚠️ Ventana de fertilidad</p>
                    <p className="text-xs">Alta probabilidad de embarazo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Resumen', icon: Heart },
              { id: 'symptoms', label: 'Síntomas', icon: Activity },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'settings', label: 'Configuración', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${phaseInfo.color} text-white`
                      : `${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text} hover:opacity-80`
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content por tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Sugerencias de hábitos */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}>
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>
                  Sugerencias para esta fase
                </h2>
                <div className="grid lg:grid-cols-2 gap-3">
                  {phaseInfo.suggestions.map((suggestion: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}
                    >
                      <Sparkles size={20} className={currentTheme.primary} />
                      <span className={currentTheme.text}>{suggestion}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Calendario mini visual */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}>
                <h2 className={`text-xl font-bold ${currentTheme.text} mb-4`}>
                  Tu ciclo este mes
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: cycleData.cycleLengthDays }).map((_, i) => {
                    const day = i + 1;
                    const isCurrent = day === cycleData.currentDay;
                    const isPeriod = day <= cycleData.periodLengthDays;
                    const isFertile = day >= Math.floor(cycleData.cycleLengthDays / 2) - 5 &&
                                     day <= Math.floor(cycleData.cycleLengthDays / 2) + 2;

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          isCurrent
                            ? `bg-gradient-to-br ${phaseInfo.color} text-white ring-4 ring-pink-200`
                            : isPeriod
                            ? 'bg-red-100 text-red-700'
                            : isFertile
                            ? 'bg-amber-100 text-amber-700'
                            : `${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100"></div>
                    <span className={currentTheme.textSecondary}>Periodo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-100"></div>
                    <span className={currentTheme.textSecondary}>Ventana fértil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${phaseInfo.color}`}></div>
                    <span className={currentTheme.textSecondary}>Hoy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'symptoms' && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}
            >
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-2`}>
                ¿Cómo te sientes hoy?
              </h2>
              <p className={`${currentTheme.textSecondary} mb-6`}>
                Registra tus síntomas para identificar patrones en tu ciclo
              </p>

              {['pain', 'physical', 'energy', 'mood', 'other'].map((category) => (
                <div key={category} className="mb-8">
                  <h3 className={`text-sm font-semibold ${currentTheme.text} mb-3 capitalize`}>
                    {category === 'pain' && '💢 Dolor'}
                    {category === 'physical' && '🌡️ Físico'}
                    {category === 'energy' && '⚡ Energía'}
                    {category === 'mood' && '😊 Estado de ánimo'}
                    {category === 'other' && '🌙 Otros'}
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {allSymptoms
                      .filter(s => s.category === category)
                      .map((symptom) => (
                        <motion.button
                          key={symptom.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            todaySymptoms.includes(symptom.id)
                              ? `bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300`
                              : `border-slate-200 hover:border-rose-200 ${currentTheme.bgCardSecondary || currentTheme.bgHover}`
                          }`}
                        >
                          <div className="text-2xl mb-2">{symptom.emoji}</div>
                          <div className={`text-sm font-medium ${currentTheme.text}`}>
                            {symptom.label}
                          </div>
                        </motion.button>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}
            >
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
                Tus patrones del mes
              </h2>

              {/* Gráfico simple de síntomas por fase */}
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-medium ${currentTheme.text}`}>Síntomas más comunes</span>
                    <span className={`text-sm ${currentTheme.textSecondary}`}>Últimos 30 días</span>
                  </div>
                  <div className="space-y-3">
                    {['Cólicos', 'Fatiga', 'Irritabilidad'].map((symptom, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`flex-1 bg-white/60 rounded-full h-2 overflow-hidden`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${80 - i * 20}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full`}
                          />
                        </div>
                        <span className={`text-sm ${currentTheme.text} w-24`}>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className={`font-medium text-amber-900 mb-2`}>💡 Insight del mes</p>
                  <p className={`text-sm text-amber-800`}>
                    Tus niveles de energía suelen ser más altos durante la fase ovulatoria.
                    Considera agendar tareas importantes para esos días.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border ${currentTheme.border}`}
            >
              <h2 className={`text-xl font-bold ${currentTheme.text} mb-6`}>
                Configuración del ciclo
              </h2>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    Duración del ciclo
                  </label>
                  <input
                    type="number"
                    value={cycleData.cycleLengthDays}
                    readOnly
                    className={`w-full px-4 py-3 rounded-xl border ${currentTheme.border} ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                    min="21"
                    max="35"
                  />
                  <p className={`text-xs ${currentTheme.textSecondary} mt-1`}>Días entre periodos</p>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    Duración del periodo
                  </label>
                  <input
                    type="number"
                    value={cycleData.periodLengthDays}
                    readOnly
                    className={`w-full px-4 py-3 rounded-xl border ${currentTheme.border} ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                    min="2"
                    max="8"
                  />
                </div>

                <div className={`border-t ${currentTheme.border} pt-6`}>
                  <h3 className={`font-semibold ${currentTheme.text} mb-4`}>Notificaciones</h3>

                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
                      <span className={`text-sm font-medium ${currentTheme.text}`}>
                        Recordar registrar periodo
                      </span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
                      <span className={`text-sm font-medium ${currentTheme.text}`}>
                        Avisar ventana fértil
                      </span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>

                    <label className={`flex items-center justify-between p-4 rounded-xl cursor-pointer ${currentTheme.bgCardSecondary || currentTheme.bgHover}`}>
                      <span className={`text-sm font-medium ${currentTheme.text}`}>
                        Sugerencias de hábitos por fase
                      </span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                  </div>
                </div>

                <div className={`border-t ${currentTheme.border} pt-6`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeactivate}
                    className="w-full py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    Desactivar Modo Ciclo
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
