'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { useCycle } from '@/app/context/CycleContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Heart, Sparkles, Settings, TrendingUp,
  AlertCircle, Droplet, Moon, Sun, Thermometer, Activity, ArrowLeft,
  Bell, AlertTriangle, RotateCcw, Save, Check, X
} from 'lucide-react';
import { showToast } from '@/app/components/Toast';

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

  // Listen for realtime cycle data updates from other devices
  useEffect(() => {
    const handleCycleUpdate = (event: any) => {
      console.log('🔄 Ciclo actualizado desde otro dispositivo:', event.detail);
      // Component will automatically re-render due to cycleData context update
      // triggered by RealtimeManager dispatching the event
    };

    window.addEventListener('cycleUpdated', handleCycleUpdate as EventListener);
    return () => window.removeEventListener('cycleUpdated', handleCycleUpdate);
  }, []);

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

  if (!cycleData.isActive) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full border border-[#FFB4A8]/30 text-center shadow-lg"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart size={48} className="text-[#FF99AC] mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#3D2C28] mb-2">Modo Ciclo desactivado</h1>
          <p className="text-[#A67B6B] mb-6">Actívalo en configuración para comenzar a registrar tu ciclo</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/app/perfil')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white font-medium transition-all hover:shadow-md"
          >
            Ir a configuración
          </motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0] pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#FF99AC] hover:text-[#FFC0A9] mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </motion.button>

        {/* Header con fase actual */}
        <div className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 mb-6 border border-[#FFB4A8]/30 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#3D2C28] mb-2">Modo Ciclo</h1>
              <p className="text-[#A67B6B]">Tu ciclo, tus reglas</p>
            </div>
          </div>

          {/* Fase actual - Banner mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${phaseInfo.color} rounded-2xl p-6 lg:p-8 text-white mb-6 shadow-lg`}
          >
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl flex-shrink-0"
                  >
                    {phaseInfo.emoji}
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-sm opacity-95 font-medium">Día {cycleData.currentDay} del ciclo</p>
                    <h2 className="text-3xl font-bold leading-tight">Fase {phaseInfo.name}</h2>
                  </div>
                </div>
                <p className="text-sm opacity-95 leading-relaxed mb-4">{phaseInfo.description}</p>
                <div className="flex gap-3 text-sm flex-wrap">
                  <div className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full font-medium whitespace-nowrap">
                    ⚡ {phaseInfo.energy}
                  </div>
                  <div className="bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full font-medium whitespace-nowrap">
                    😊 {phaseInfo.mood}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-5 border border-white/20 cursor-pointer"
                >
                  <p className="text-sm opacity-90 font-medium mb-2">Próximo período</p>
                  <p className="text-3xl font-bold">
                    {daysUntilNextPeriod > 0 ? daysUntilNextPeriod : '0'}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(cycleData.nextPeriodDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </motion.div>

                {isInFertilityWindow() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-yellow-400/30 backdrop-blur-sm rounded-xl p-4 border border-yellow-300/50"
                  >
                    <p className="text-sm font-semibold mb-1">✨ Ventana de fertilidad</p>
                    <p className="text-xs">Alta probabilidad de embarazo</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs con mejor responsividad */}
          <div className="flex gap-2 overflow-x-auto pb-4 snap-x -mx-2 px-2">
            {[
              { id: 'overview', label: 'Resumen', icon: Heart },
              { id: 'symptoms', label: 'Síntomas', icon: Activity },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'settings', label: 'Ajustes', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap snap-start flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white shadow-md'
                      : 'bg-[#FFF5F0] text-[#3D2C28] hover:bg-[#FFE8E1] border border-[#FFB4A8]/20'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
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
                  className="bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl p-6 border-2 border-red-200"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                      <Droplet size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">
                        ¿Tu período comenzó hoy?
                      </h3>
                      <p className="text-sm text-slate-600">
                        Actualiza tus datos para cálculos precisos
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('¿Registrar período hoy?')) {
                        registerNewPeriod(today);
                        showToast('✅ Período registrado correctamente', 'success');
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Droplet size={18} />
                    Registrar período
                  </motion.button>
                </motion.div>
              )}

              {/* Sugerencias de hábitos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
              >
                <h2 className="text-xl font-bold text-[#3D2C28] mb-4">
                  Sugerencias para esta fase
                </h2>
                <div className="grid lg:grid-cols-2 gap-3">
                  {phaseInfo.suggestions.map((suggestion: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer bg-[#FFF5F0] border border-[#FFB4A8]/20 hover:border-[#FFB4A8]/40"
                    >
                      <Sparkles size={20} className="text-[#FF99AC] flex-shrink-0" />
                      <span className="text-[#3D2C28] text-sm">{suggestion}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Calendario mini visual */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
              >
                <h2 className="text-xl font-bold text-[#3D2C28] mb-4">
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
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? `bg-gradient-to-br ${phaseInfo.color} text-white ring-2 ring-offset-2 ring-[#FF99AC]`
                            : isPeriod
                            ? 'bg-[#FDEEEE] text-[#3D2C28] border-2 border-[#FCE8E6]'
                            : isFertile
                            ? 'bg-white text-[#3D2C28] border-2 border-[#F9D68F] shadow-[0_0_0_2px_rgba(249,214,143,0.3)]'
                            : 'bg-white text-[#3D2C28] border border-[#FFB4A8]/20 hover:border-[#FFB4A8]/40'
                        }`}
                      >
                        {day}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#FDEEEE] border border-[#FCE8E6]"></div>
                    <span className="text-[#A67B6B]">Período</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-[#F9D68F]"></div>
                    <span className="text-[#A67B6B]">Ventana fértil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded bg-gradient-to-br ${phaseInfo.color}`}></div>
                    <span className="text-[#A67B6B]">Hoy</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'symptoms' && (
            <motion.div
              key="symptoms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[#3D2C28] mb-2">
                ¿Cómo te sientes hoy?
              </h2>
              <p className="text-[#A67B6B] mb-6">
                Registra tus síntomas para identificar patrones en tu ciclo
              </p>

              {['pain', 'physical', 'energy', 'mood', 'other'].map((category) => (
                <div key={category} className="mb-8">
                  <h3 className="text-sm font-semibold text-[#3D2C28] mb-3">
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
                              ? 'bg-gradient-to-br from-[#FFF5F0] to-[#FFE8E1] border-[#FF99AC] shadow-md'
                              : 'border-[#FFB4A8]/30 hover:border-[#FFB4A8]/60 bg-white hover:bg-[#FFF5F0]'
                          }`}
                        >
                          <div className="text-2xl mb-2">{symptom.emoji}</div>
                          <div className="text-sm font-medium text-[#3D2C28]">
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
              className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[#3D2C28] mb-6">
                Tus patrones del mes
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#FFF5F0] border border-[#FFB4A8]/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-[#3D2C28]">Síntomas más comunes</span>
                    <span className="text-sm text-[#A67B6B]">Últimos 30 días</span>
                  </div>
                  <div className="space-y-3">
                    {['Cólicos', 'Fatiga', 'Irritabilidad'].map((symptom, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 bg-white/80 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${80 - i * 20}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] h-full rounded-full"
                          />
                        </div>
                        <span className="text-sm text-[#3D2C28] w-24">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-medium text-amber-900 mb-2">💡 Insight del mes</p>
                  <p className="text-sm text-amber-800">
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-red-200/50 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <Droplet size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#3D2C28]">Registrar período</h2>
                    <p className="text-sm text-[#A67B6B]">¿Tu período comenzó hoy?</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3D2C28] mb-2">
                    Fecha de inicio del período
                  </label>
                  <input
                    type="date"
                    defaultValue={today}
                    max={today}
                    id="newPeriodDate"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#FFB4A8]/30 focus:border-[#FF99AC] focus:outline-none bg-white text-[#3D2C28]"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const dateInput = document.getElementById('newPeriodDate') as HTMLInputElement;
                    const date = dateInput.value;

                    if (confirm(`¿Registrar nuevo período el ${new Date(date).toLocaleDateString('es-ES')}?`)) {
                      registerNewPeriod(date);
                      showToast('✅ Período registrado. Los cálculos se han actualizado.', 'success');
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Registrar nuevo período
                </motion.button>

                <p className="text-xs text-[#A67B6B] mt-3 text-center">
                  Esto actualizará todos los cálculos y predicciones
                </p>
              </motion.div>

              {/* Ajustar configuración del ciclo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Settings size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#3D2C28]">Ajustar ciclo</h2>
                    <p className="text-sm text-[#A67B6B]">Actualiza la duración según tu cuerpo</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#3D2C28] mb-3">
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
                      className="w-full h-3 bg-[#FFB4A8] rounded-lg appearance-none cursor-pointer accent-[#FF99AC]"
                    />
                    <div className="flex justify-between items-center text-xs text-[#A67B6B] mt-2">
                      <span>21 días</span>
                      <div className="flex flex-col items-center">
                        <span id="cycleLengthDisplay" className="text-3xl font-bold text-[#3D2C28]">
                          {cycleData.cycleLengthDays}
                        </span>
                        <span>días</span>
                      </div>
                      <span>35 días</span>
                    </div>
                    <p className="text-xs bg-[#FFF5F0] p-3 rounded-lg mt-3 text-[#A67B6B]">
                      💡 Tiempo entre el primer día de un período y el siguiente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3D2C28] mb-3">
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
                      className="w-full h-3 bg-[#FFB4A8] rounded-lg appearance-none cursor-pointer accent-[#FF99AC]"
                    />
                    <div className="flex justify-between items-center text-xs text-[#A67B6B] mt-2">
                      <span>2 días</span>
                      <div className="flex flex-col items-center">
                        <span id="periodLengthDisplay" className="text-3xl font-bold text-[#3D2C28]">
                          {cycleData.periodLengthDays}
                        </span>
                        <span>días</span>
                      </div>
                      <span>8 días</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const cycleSlider = document.getElementById('cycleLengthSlider') as HTMLInputElement;
                      const periodSlider = document.getElementById('periodLengthSlider') as HTMLInputElement;

                      const newCycleLength = parseInt(cycleSlider.value);
                      const newPeriodLength = parseInt(periodSlider.value);

                      if (confirm('¿Guardar nuevos ajustes?')) {
                        updateCycleSettings(newCycleLength, newPeriodLength);
                        showToast('✅ Configuración actualizada', 'success');
                      }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    Guardar cambios
                  </motion.button>
                </div>
              </motion.div>

              {/* Notificaciones */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
              >
                <h3 className="font-bold text-[#3D2C28] mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Notificaciones
                </h3>

                <div className="space-y-3">
                  {[
                    { icon: Droplet, label: 'Recordar registrar período', desc: 'Cuando llegue la fecha prevista', color: 'rose' },
                    { icon: Sparkles, label: 'Avisar ventana fértil', desc: '3 días antes del inicio', color: 'amber' },
                    { icon: Heart, label: 'Sugerencias de hábitos', desc: 'Según tu fase actual', color: 'purple' },
                    { icon: Activity, label: 'Recordar registrar síntomas', desc: 'Diariamente a las 20:00', color: 'blue' },
                  ].map((notif, idx) => {
                    const Icon = notif.icon;
                    const colorClasses = {
                      rose: 'bg-rose-50 hover:bg-rose-100',
                      amber: 'bg-amber-50 hover:bg-amber-100',
                      purple: 'bg-purple-50 hover:bg-purple-100',
                      blue: 'bg-blue-50 hover:bg-blue-100',
                    };

                    return (
                      <motion.label
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center justify-between p-4 ${colorClasses[notif.color as keyof typeof colorClasses]} rounded-xl cursor-pointer transition-colors`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon size={20} className="flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#3D2C28] truncate">
                              {notif.label}
                            </p>
                            <p className="text-xs text-[#A67B6B]">{notif.desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 accent-[#FF99AC] flex-shrink-0"
                        />
                      </motion.label>
                    );
                  })}
                </div>
              </motion.div>

              {/* Historial de períodos */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#FFB4A8]/30 shadow-sm"
              >
                <h3 className="font-bold text-[#3D2C28] mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Historial de períodos
                </h3>

                <div className="space-y-2">
                  {(() => {
                    const history = JSON.parse(localStorage.getItem('habika_period_history') || '[]');
                    const lastThree = history.slice(-3).reverse();

                    if (lastThree.length === 0) {
                      return (
                        <p className="text-sm text-[#A67B6B] text-center py-4">
                          Aún no hay registros. Comienza registrando tu próximo período.
                        </p>
                      );
                    }

                    return lastThree.map((entry: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-[#FFF5F0] rounded-xl border border-[#FFB4A8]/20"
                      >
                        <Droplet size={18} className="text-rose-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#3D2C28] truncate">
                            {new Date(entry.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-[#A67B6B]">
                            Registrado {new Date(entry.timestamp).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </motion.div>
                    ));
                  })()}
                </div>
              </motion.div>

              {/* Zona de peligro */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white backdrop-blur-xl rounded-3xl p-6 lg:p-8 border-2 border-red-200/50 shadow-sm"
              >
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Zona de peligro
                </h3>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetCycleData}
                    className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    Reiniciar configuración
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm(
                        '¿Desactivar Modo Ciclo?\n\n' +
                        'Tus datos se guardarán y podrás reactivarlo cuando quieras.'
                      )) {
                        deactivateCycleMode();
                        showToast('Modo Ciclo desactivado', 'success');
                        router.push('/app/perfil');
                      }
                    }}
                    className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Desactivar Modo Ciclo
                  </motion.button>
                </div>

                <p className="text-xs text-[#A67B6B] mt-4 text-center">
                  💾 Tu historial se mantendrá guardado
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
