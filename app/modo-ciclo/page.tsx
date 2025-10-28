'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useCycle } from '../context/CycleContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Heart, Sparkles, Settings, TrendingUp,
  AlertCircle, Droplet, Moon, Sun, Thermometer, Activity, ArrowLeft,
  Bell, AlertTriangle, RotateCcw, Save, Check, X
} from 'lucide-react';

export default function ModoCicloPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { cycleData, getPhaseInfo, addSymptom, deactivateCycleMode, updateCycleSettings, registerNewPeriod, resetCycleData } = useCycle();
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
              {/* Quick action - Register period if not in period */}
              {cycleData.currentDay > cycleData.periodLengthDays && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl p-6 border-2 border-rose-200`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                      <Droplet size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">
                        ¿Tu periodo comenzó hoy?
                      </h3>
                      <p className="text-sm text-slate-600">
                        Actualiza tus datos para cálculos precisos
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('¿Registrar periodo hoy?')) {
                        registerNewPeriod(today);
                        alert('✅ Periodo registrado correctamente');
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Droplet size={18} />
                    Registrar periodo
                  </button>
                </motion.div>
              )}

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
              className="space-y-6"
            >
              {/* Registrar nuevo periodo */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-rose-200`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
                    <Droplet size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${currentTheme.text}`}>Registrar periodo</h2>
                    <p className={`text-sm ${currentTheme.textSecondary}`}>¿Tu periodo comenzó hoy?</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium ${currentTheme.text} mb-2`}>
                    Fecha de inicio del periodo
                  </label>
                  <input
                    type="date"
                    defaultValue={today}
                    max={today}
                    id="newPeriodDate"
                    className={`w-full px-4 py-3 rounded-xl border-2 border-rose-200 focus:border-rose-500 outline-none ${currentTheme.bgCardSecondary || currentTheme.bgHover} ${currentTheme.text}`}
                  />
                </div>

                <button
                  onClick={() => {
                    const dateInput = document.getElementById('newPeriodDate') as HTMLInputElement;
                    const date = dateInput.value;

                    if (confirm(`¿Registrar nuevo periodo el ${new Date(date).toLocaleDateString('es-ES')}?`)) {
                      registerNewPeriod(date);
                      alert('✅ Periodo registrado. Los cálculos se han actualizado.');
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Registrar nuevo periodo
                </button>

                <p className={`text-xs ${currentTheme.textSecondary} mt-3 text-center`}>
                  Esto actualizará todos los cálculos y predicciones
                </p>
              </div>

              {/* Ajustar configuración del ciclo */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-rose-200`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Settings size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${currentTheme.text}`}>Ajustar ciclo</h2>
                    <p className={`text-sm ${currentTheme.textSecondary}`}>Actualiza la duración según tu cuerpo</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text} mb-3`}>
                      🔄 Duración del ciclo completo
                    </label>
                    <input
                      type="range"
                      min="21"
                      max="35"
                      defaultValue={cycleData.cycleLengthDays}
                      id="cycleLengthSlider"
                      onChange={(e) => {
                        const value = e.target.value;
                        const display = document.getElementById('cycleLengthDisplay');
                        if (display) display.textContent = value;
                      }}
                      className="w-full h-3 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                      <span>21 días</span>
                      <div className="flex flex-col items-center">
                        <span id="cycleLengthDisplay" className="text-3xl font-bold text-slate-900">
                          {cycleData.cycleLengthDays}
                        </span>
                        <span className={currentTheme.textSecondary}>días</span>
                      </div>
                      <span>35 días</span>
                    </div>
                    <p className={`text-xs ${currentTheme.bgCardSecondary} p-3 rounded-lg mt-3 ${currentTheme.textSecondary}`}>
                      💡 Tiempo entre el primer día de un periodo y el siguiente
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${currentTheme.text} mb-3`}>
                      🩸 Duración del sangrado
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      defaultValue={cycleData.periodLengthDays}
                      id="periodLengthSlider"
                      onChange={(e) => {
                        const value = e.target.value;
                        const display = document.getElementById('periodLengthDisplay');
                        if (display) display.textContent = value;
                      }}
                      className="w-full h-3 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                      <span>2 días</span>
                      <div className="flex flex-col items-center">
                        <span id="periodLengthDisplay" className="text-3xl font-bold text-slate-900">
                          {cycleData.periodLengthDays}
                        </span>
                        <span className={currentTheme.textSecondary}>días</span>
                      </div>
                      <span>8 días</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const cycleSlider = document.getElementById('cycleLengthSlider') as HTMLInputElement;
                      const periodSlider = document.getElementById('periodLengthSlider') as HTMLInputElement;

                      const newCycleLength = parseInt(cycleSlider.value);
                      const newPeriodLength = parseInt(periodSlider.value);

                      if (confirm('¿Guardar nuevos ajustes?')) {
                        updateCycleSettings(newCycleLength, newPeriodLength);
                        alert('✅ Configuración actualizada');
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Guardar cambios
                  </button>
                </div>
              </div>

              {/* Notificaciones */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-rose-200`}>
                <h3 className={`font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                  <Bell size={20} />
                  Notificaciones
                </h3>

                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 bg-rose-50 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Droplet size={20} className="text-rose-500" />
                      <div>
                        <p className={`text-sm font-medium ${currentTheme.text}`}>
                          Recordar registrar periodo
                        </p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>Cuando llegue la fecha prevista</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-rose-500"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-4 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Sparkles size={20} className="text-amber-500" />
                      <div>
                        <p className={`text-sm font-medium ${currentTheme.text}`}>
                          Avisar ventana fértil
                        </p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>3 días antes del inicio</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-amber-500"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-4 bg-purple-50 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Heart size={20} className="text-purple-500" />
                      <div>
                        <p className={`text-sm font-medium ${currentTheme.text}`}>
                          Sugerencias de hábitos
                        </p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>Según tu fase actual</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-purple-500"
                    />
                  </label>

                  <label className={`flex items-center justify-between p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-blue-500" />
                      <div>
                        <p className={`text-sm font-medium ${currentTheme.text}`}>
                          Recordar registrar síntomas
                        </p>
                        <p className={`text-xs ${currentTheme.textSecondary}`}>Diariamente a las 20:00</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Historial de periodos */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-rose-200`}>
                <h3 className={`font-bold ${currentTheme.text} mb-4 flex items-center gap-2`}>
                  <Calendar size={20} />
                  Historial de periodos
                </h3>

                <div className="space-y-2">
                  {(() => {
                    const history = JSON.parse(localStorage.getItem('habika_period_history') || '[]');
                    const lastThree = history.slice(-3).reverse();

                    if (lastThree.length === 0) {
                      return (
                        <p className={`text-sm ${currentTheme.textSecondary} text-center py-4`}>
                          Aún no hay registros. Comienza registrando tu próximo periodo.
                        </p>
                      );
                    }

                    return lastThree.map((entry: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-3 bg-rose-50 rounded-xl`}>
                        <Droplet size={18} className="text-rose-500" />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${currentTheme.text}`}>
                            {new Date(entry.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className={`text-xs ${currentTheme.textSecondary}`}>
                            Registrado {new Date(entry.timestamp).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Zona de peligro */}
              <div className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl p-6 lg:p-8 border-2 border-red-200`}>
                <h3 className={`font-bold text-red-900 mb-4 flex items-center gap-2`}>
                  <AlertTriangle size={20} />
                  Zona de peligro
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={resetCycleData}
                    className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Reiniciar configuración
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(
                        '¿Desactivar Modo Ciclo?\n\n' +
                        'Tus datos se guardarán y podrás reactivarlo cuando quieras.'
                      )) {
                        deactivateCycleMode();
                        router.push('/perfil');
                      }
                    }}
                    className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Desactivar Modo Ciclo
                  </button>
                </div>

                <p className={`text-xs ${currentTheme.textSecondary} mt-4 text-center`}>
                  💾 Tu historial se mantendrá guardado
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
