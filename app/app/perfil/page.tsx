'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { loadData, toggleZenMode, clearAllData } from '@/app/lib/store';
import { showToast } from '@/app/components/Toast';
import { useTheme } from '@/app/context/ThemeContext';
import { useUser } from '@/app/context/UserContext';
import { useCycle } from '@/app/context/CycleContext';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';

function ModoCicloSection({ cycleData, currentTheme }: any) {
  const { activateCycleMode, deactivateCycleMode } = useCycle();
  const [showCycleSetup, setShowCycleSetup] = useState(false);
  const [cycleStep, setCycleStep] = useState<1 | 2 | 3>(1);
  const [cycleFormData, setCycleFormData] = useState({
    lastPeriod: '',
    cycleLength: 28,
    periodLength: 5,
  });
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const handleActivateCycle = () => {
    if (!cycleFormData.lastPeriod) {
      showToast('Selecciona la fecha de tu último período', 'error');
      return;
    }
    activateCycleMode(cycleFormData.lastPeriod, cycleFormData.cycleLength, cycleFormData.periodLength);
    setShowCycleSetup(false);
    setCycleStep(1);
    setCycleFormData({ lastPeriod: '', cycleLength: 28, periodLength: 5 });
    showToast('Modo Ciclo activado', 'success');
  };

  const handleDeactivateCycle = () => {
    deactivateCycleMode();
    setShowDeactivateConfirm(false);
    showToast('Modo Ciclo desactivado', 'success');
  };

  const daysUntilPeriod = cycleData.isActive
    ? Math.ceil(
        (new Date(cycleData.nextPeriodDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const phaseEmojiMap = {
    menstrual: '🌙',
    follicular: '🌱',
    ovulatory: '✨',
    luteal: '🍂',
  };

  const phaseEmoji = phaseEmojiMap[cycleData.currentPhase as keyof typeof phaseEmojiMap] || '❓';

  if (cycleData.isActive && !showCycleSetup) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{phaseEmoji}</span>
          <h3 className="text-base font-semibold text-[#3D2C28]">Modo Ciclo Activo</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE8E1] rounded-xl p-3 border border-[#FFB4A8]/20">
            <p className="text-xs text-[#A67B6B] mb-1">Día del ciclo</p>
            <p className="text-2xl font-bold text-[#3D2C28]">{cycleData.currentDay}</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE8E1] rounded-xl p-3 border border-[#FFB4A8]/20">
            <p className="text-xs text-[#A67B6B] mb-1">Próximo período</p>
            <p className="text-2xl font-bold text-[#3D2C28]">{Math.max(0, daysUntilPeriod)}d</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCycleSetup(true)}
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white text-sm font-medium hover:shadow-md transition-shadow"
          >
            Editar datos
          </button>
          <button
            onClick={() => setShowDeactivateConfirm(true)}
            className="flex-1 h-10 rounded-xl bg-[#F0E8E6] text-[#3D2C28] text-sm font-medium hover:bg-[#E8DEDE] transition-colors"
          >
            Desactivar
          </button>
        </div>

        {showDeactivateConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-[#FFF5F0] border border-[#FFB4A8]/30 rounded-xl p-3"
          >
            <p className="text-sm font-medium text-[#3D2C28] mb-2">¿Desactivar Modo Ciclo?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                className="flex-1 h-8 rounded-lg bg-[#E8DEDE] hover:bg-[#DDD4D2] text-[#3D2C28] text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivateCycle}
                className="flex-1 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
              >
                Sí, desactivar
              </button>
            </div>
          </motion.div>
        )}
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
    >
      <AnimatePresence mode="wait">
        {!showCycleSetup ? (
          <motion.button
            key="inactive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCycleSetup(true)}
            className="w-full p-5 rounded-2xl border-2 border-[#FFB4A8]/40 bg-gradient-to-r from-[#FFF5F0] to-[#FFE8E1] hover:border-[#FF99AC]/60 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] flex items-center justify-center">
                  <Heart size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#3D2C28]">Modo Ciclo</p>
                  <p className="text-sm text-[#A67B6B]">Adapta hábitos a tu ciclo</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#F0E8E6] text-[#A67B6B]">
                OFF
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      step <= cycleStep ? 'bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC]' : 'bg-[#F0E8E6]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-[#A67B6B]">
                Paso {cycleStep}/3
              </span>
            </div>

            <AnimatePresence mode="wait">
              {cycleStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <label className="block text-sm font-medium text-[#3D2C28] mb-3">
                    Fecha de tu último período
                  </label>
                  <input
                    type="date"
                    value={cycleFormData.lastPeriod}
                    onChange={(e) => setCycleFormData({ ...cycleFormData, lastPeriod: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#FFB4A8]/30 focus:border-[#FF99AC] focus:outline-none text-[#3D2C28] font-medium text-base"
                  />
                  <p className="text-xs text-[#A67B6B] mt-2">
                    Selecciona la fecha en que comenzó tu último período menstrual
                  </p>
                </motion.div>
              )}

              {cycleStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <label className="block text-sm font-medium text-[#3D2C28] mb-3">
                    Duración del ciclo: {cycleFormData.cycleLength} días
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A67B6B] min-w-fit">21d</span>
                    <input
                      type="range"
                      min="21"
                      max="35"
                      value={cycleFormData.cycleLength}
                      onChange={(e) =>
                        setCycleFormData({ ...cycleFormData, cycleLength: parseInt(e.target.value) })
                      }
                      className="cycle-slider flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[#FF99AC]"
                    />
                    <span className="text-xs text-[#A67B6B] min-w-fit">35d</span>
                  </div>
                  <p className="text-xs text-[#A67B6B] mt-3">
                    La mayoría de ciclos duran entre 21 y 35 días. El promedio es 28 días.
                  </p>
                </motion.div>
              )}

              {cycleStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <label className="block text-sm font-medium text-[#3D2C28] mb-3">
                    Duración del período: {cycleFormData.periodLength} días
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A67B6B] min-w-fit">2d</span>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={cycleFormData.periodLength}
                      onChange={(e) =>
                        setCycleFormData({ ...cycleFormData, periodLength: parseInt(e.target.value) })
                      }
                      className="cycle-slider flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[#FF99AC]"
                    />
                    <span className="text-xs text-[#A67B6B] min-w-fit">8d</span>
                  </div>
                  <p className="text-xs text-[#A67B6B] mt-3">
                    El período menstrual típico dura entre 2 y 8 días. La mayoría dura 5 días.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cycleStep > 1) {
                    setCycleStep((cycleStep - 1) as 1 | 2 | 3);
                  } else {
                    setShowCycleSetup(false);
                  }
                }}
                className="flex-1 h-11 rounded-xl border-2 border-[#FFB4A8]/30 text-[#3D2C28] font-medium hover:border-[#FFB4A8]/50 transition-colors flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                {cycleStep === 1 ? 'Cancelar' : 'Atrás'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cycleStep < 3) {
                    setCycleStep((cycleStep + 1) as 1 | 2 | 3);
                  } else {
                    handleActivateCycle();
                  }
                }}
                disabled={!cycleFormData.lastPeriod && cycleStep === 1}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cycleStep === 3 ? 'Activar' : 'Siguiente'}
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const { currentTheme, themeId, changeTheme } = useTheme();
  const { username, setUsername } = useUser();
  const { cycleData } = useCycle();
  const [data, setData] = useState(() => loadData());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setTempName(username);
  }, [username]);

  function handleSaveName() {
    if (!tempName.trim()) return;
    setUsername(tempName.trim());
    setIsEditingName(false);
    showToast('Nombre actualizado', 'success');
  }

  function handleThemeChange(themeId: string) {
    changeTheme(themeId);
    showToast(`Tema cambiado`, 'success');
  }

  function handleToggleZen() {
    const wasZen = data.zenMode;
    toggleZenMode();
    showToast(wasZen ? 'Modo Zen desactivado' : 'Modo Zen activado', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  function handleDeleteData() {
    clearAllData();
    // Reset username context to default
    setUsername('Usuario');
    showToast('Todos tus datos han sido eliminados', 'success');
    // Redirect to onboarding with a slight delay to allow toast to show
    setTimeout(() => {
      router.replace('/onboarding');
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-white to-[#FFF5F0]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 pt-8 pb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold text-[#3D2C28] tracking-tight">
            Configuración
          </h1>
          <p className="text-xs text-[#A67B6B]">Personaliza tu experiencia</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-[#FFF5F0] transition-all text-[#3D2C28]"
        >
          ✕
        </motion.button>
      </motion.header>

      <div className="max-w-2xl mx-auto px-6 space-y-4 pb-24">
        {/* Perfil */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] flex items-center justify-center text-2xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1 h-9 px-3 rounded-xl bg-[#FFF5F0] border-2 border-[#FFB4A8]/30 focus:border-[#FF99AC] focus:outline-none text-sm text-[#3D2C28]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 h-9 rounded-xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white text-sm font-medium hover:shadow-md transition-shadow"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-[#3D2C28]">{username}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-[#FF99AC] hover:opacity-70 transition-opacity mt-0.5"
                  >
                    Cambiar nombre
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* Temas */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">🎨</span>
            <h3 className="text-base font-semibold text-[#3D2C28]">Tema de colores</h3>
          </div>

          <div className="space-y-3">
            {[
              { id: 'habika', name: 'HABIKA', color: 'from-[#FFC0A9] to-[#FF99AC]', ring: 'ring-[#FF99AC]' },
              { id: 'oceano', name: 'Océano', color: 'from-blue-400 to-blue-500', ring: 'ring-blue-500' },
              { id: 'bosque', name: 'Bosque', color: 'from-green-400 to-green-500', ring: 'ring-green-500' },
              { id: 'atardecer', name: 'Atardecer', color: 'from-orange-400 to-orange-500', ring: 'ring-orange-500' },
              { id: 'lavanda', name: 'Lavanda', color: 'from-purple-400 to-purple-500', ring: 'ring-purple-500' },
              { id: 'monocromo', name: 'Monocromo', color: 'from-slate-600 to-slate-700', ring: 'ring-slate-700' },
            ].map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  themeId === theme.id
                    ? 'bg-gradient-to-r ' + theme.color + ' ring-2 ' + theme.ring
                    : 'bg-[#FFF5F0] hover:bg-[#FFE8E1] border border-[#FFB4A8]/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme.color} flex-shrink-0`}></div>
                <span className={`text-sm font-medium ${themeId === theme.id ? 'text-white' : 'text-[#3D2C28]'}`}>
                  {theme.name}
                </span>
                {themeId === theme.id && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC]"></div>
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Modo Zen */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🧘</span>
                <h3 className="text-base font-semibold text-[#3D2C28]">Modo Zen</h3>
              </div>
              <p className="text-xs text-[#A67B6B] leading-relaxed">
                Interfaz ultra minimalista. Solo progreso y acción.
              </p>
            </div>
            <button
              onClick={handleToggleZen}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                data.zenMode ? 'bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC]' : 'bg-[#E8DEDE]'
              }`}
            >
              <motion.div
                animate={{ x: data.zenMode ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </button>
          </div>
        </motion.section>

        {/* Modo Ciclo */}
        <ModoCicloSection cycleData={cycleData} currentTheme={currentTheme} />


        {/* Actualizar */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔄</span>
            <h3 className="text-base font-semibold text-[#3D2C28]">Actualizar app</h3>
          </div>
          <p className="text-xs text-[#A67B6B] mb-4 leading-relaxed">
            Si instalaste HABIKA como PWA, usá esto para obtener la última versión y limpiar la caché.
          </p>
          <button
            onClick={() => {
              showToast('Limpiando caché y recargando...', 'info');
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                  registrations.forEach((registration) => registration.unregister());
                });
              }
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white text-sm font-medium hover:shadow-md transition-shadow"
          >
            Buscar actualizaciones
          </button>
          <p className="text-xs text-[#A67B6B] text-center mt-3">
            Versión 1.0.0 · Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </motion.section>

        {/* Aplicación */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <h3 className="text-base font-semibold text-[#3D2C28] mb-3">Aplicación</h3>
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const isInstalled = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
                if (isInstalled) {
                  showToast('HABIKA ya está instalada como app', 'success');
                } else {
                  showToast('Usá el menú de tu navegador para agregar a inicio', 'info');
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
                  ? 'bg-gradient-to-r from-[#FFF5F0] to-[#FFE8E1] border border-[#FFB4A8]/20'
                  : 'bg-[#FFF5F0] hover:bg-[#FFE8E1] border border-[#FFB4A8]/20'
              }`}
            >
              <span className="text-xl">
                {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? '✅' : '📱'}
              </span>
              <div>
                <p className="text-sm font-medium text-[#3D2C28]">
                  {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
                    ? 'HABIKA instalada'
                    : 'Agregar a pantalla de inicio'}
                </p>
                <p className="text-xs text-[#A67B6B]">
                  {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
                    ? 'Acceso rápido desde inicio'
                    : 'Abre HABIKA como app nativa'}
                </p>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#FFF5F0] hover:bg-[#FFE8E1] border border-[#FFB4A8]/20 transition-colors text-left"
            >
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-[#3D2C28]">Acerca de HABIKA</p>
                <p className="text-xs text-[#A67B6B]">Versión 1.0.0 MVP</p>
              </div>
            </motion.button>
          </div>
        </motion.section>

        {/* Cuenta */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white backdrop-blur-xl rounded-2xl shadow-sm border border-[#FFB4A8]/30 p-6"
        >
          <h3 className="text-base font-semibold text-[#3D2C28] mb-3">Cuenta</h3>

          {showDeleteConfirm ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <p className="text-sm font-medium text-red-900 mb-3">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-9 rounded-xl bg-[#F0E8E6] hover:bg-[#E8DEDE] text-[#3D2C28] text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  Sí, borrar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 transition-colors text-left"
            >
              <span className="text-xl">🗑️</span>
              <div>
                <p className="text-sm font-medium text-red-600">Borrar todos mis datos</p>
                <p className="text-xs text-red-500">Esta acción no se puede deshacer</p>
              </div>
            </motion.button>
          )}
        </motion.section>

        {/* Volver */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <Link
            href="/"
            className="block w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
