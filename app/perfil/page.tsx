/* INSTRUCCIONES PARA CLAUDE VS CODE:
Reemplazá app/perfil/page.tsx con este código
Solo cambió: agregamos estado loading para evitar hydration mismatch
*/

'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { loadData, setTheme, toggleZenMode, THEMES, type Theme } from '../lib/store';
import { useTheme } from '../hooks/useTheme';
import { forceUpdatePWA } from '../lib/pwa';
import InstallButton from '../components/InstallButton';
import ChangeNameModal from '../components/ChangeNameModal';
import { showToast } from '../components/Toast';
import {
  requestNotificationPermission,
  scheduleReminder,
  saveReminderPreference,
  loadReminderPreference
} from '../lib/notifications';

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

export default function PerfilPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();

  const [data, setData] = useState<any>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);

  useEffect(() => {
    // Cargar datos del usuario
    setData(loadData());

    // Verificar soporte de notificaciones
    if (!('Notification' in window)) {
      setNotificationSupported(false);
    }

    // Cargar preferencia guardada
    const pref = loadReminderPreference();
    setReminderEnabled(pref.enabled);
  }, []);

  async function handleToggleReminder() {
    if (!reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setReminderEnabled(true);
        saveReminderPreference(true, 18);
        scheduleReminder(18, 0);
        showToast('Recordatorios activados', 'success');
      } else {
        showToast('Necesitás activar los permisos de notificaciones en tu navegador', 'error');
      }
    } else {
      setReminderEnabled(false);
      saveReminderPreference(false, 18);
      showToast('Recordatorios desactivados', 'info');
    }
  }

  function handleClearData() {
    if (!confirm('¿Estás seguro? Se borrarán todos tus datos.')) return;
    localStorage.clear();
    window.location.href = '/onboarding';
  }

  // Mostrar loading hasta que carguen los datos
  if (!data) {
    return (
      <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center`}>
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      <header className="px-6 pt-10 pb-6 flex items-center justify-between animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800">
          Perfil y Configuración
        </h1>
        <button
          onClick={() => router.back()}
          className={`w-10 h-10 rounded-full ${currentTheme.bgCard} shadow-sm flex items-center justify-center ${currentTheme.bgHover}`}
        >
          ✕
        </button>
      </header>

      <div className="px-6 space-y-6 pb-12">
        {/* Usuario */}
        <section className={`${currentTheme.bgCard} rounded-3xl shadow-sm p-6 animate-slideUp border ${currentTheme.border}`}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4`} style={{backgroundImage: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`}}>
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {data.name}
            </h2>
            <p className="text-sm text-slate-500 mb-3">Usuario Creativo</p>

            <button
              onClick={() => setShowNameModal(true)}
              className="text-sm font-medium"
              style={{ color: currentTheme.primary }}
            >
              Cambiar nombre
            </button>
          </div>
        </section>

        {/* Notificaciones */}
        {notificationSupported && (
          <section className={`${currentTheme.bgCard} rounded-3xl shadow-sm p-6 animate-slideUp border ${currentTheme.border}`} style={{animationDelay: '0.12s'}}>
            <h3 className="font-semibold text-slate-800 mb-4">Notificaciones</h3>

            <button
              onClick={handleToggleReminder}
              className={`w-full flex items-center justify-between p-4 rounded-2xl ${currentTheme.bgHover}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: currentTheme.primary + '20'}}>
                  🔔
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800">Recordatorio diario</p>
                  <p className="text-sm text-slate-500">
                    {reminderEnabled ? 'Todos los días a las 6pm' : 'Desactivado'}
                  </p>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-colors relative`}
                style={{backgroundColor: reminderEnabled ? currentTheme.primary : '#cbd5e1'}}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
            </button>
          </section>
        )}

        {/* Selector de Tema */}
        <motion.section
          variants={itemVariants}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl shadow-lg border ${currentTheme.border} p-6`}
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>🎨</span>
            Tema de colores
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEMES) as Theme[]).map((themeKey) => {
              const theme = THEMES[themeKey];
              const isSelected = data.theme === themeKey;

              return (
                <motion.button
                  key={themeKey}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTheme(themeKey);
                    const newData = loadData();
                    setData(newData);
                    showToast(`Tema ${theme.name} activado`, 'success');
                    window.location.reload();
                  }}
                  className={`
                    h-20 rounded-2xl flex flex-col items-center justify-center gap-2
                    transition-all
                    ${isSelected
                      ? `ring-2 ring-offset-2 ${currentTheme.bgCard} shadow-lg`
                      : `${currentTheme.bgHover}`
                    }
                  `}
                  style={isSelected ? { borderColor: currentTheme.primary, boxShadow: `0 0 0 2px ${currentTheme.primary}` } : {}}
                >
                  <span className="text-3xl">{theme.emoji}</span>
                  <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Modo Zen */}
        <motion.section
          variants={itemVariants}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl shadow-lg border ${currentTheme.border} p-6`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <span>🧘</span>
                Modo Zen
              </h2>
              <p className="text-sm text-slate-600">
                Interfaz ultra minimalista. Solo progreso y acción.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                toggleZenMode();
                const newData = loadData();
                setData(newData);
                showToast(
                  newData.zenMode ? 'Modo Zen activado 🧘' : 'Modo normal activado',
                  'success'
                );
                setTimeout(() => window.location.href = '/', 500);
              }}
              className={`
                w-14 h-8 rounded-full flex items-center transition-all
              `}
              style={{backgroundColor: data.zenMode ? currentTheme.primary : '#cbd5e1'}}
            >
              <motion.div
                animate={{ x: data.zenMode ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>
        </motion.section>

        {/* Actualizar PWA */}
        <motion.section
          variants={itemVariants}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-3xl shadow-lg border ${currentTheme.border} p-6`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <span>🔄</span>
                Actualizar app
              </h2>
              <p className="text-sm text-slate-600">
                Si instalaste Rocket como PWA, usá esto para obtener la última versión.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              if (confirm('¿Actualizar Rocket a la última versión?\n\nTu progreso se mantendrá intacto.')) {
                showToast('Actualizando...', 'info');
                await forceUpdatePWA();
              }
            }}
            className={`w-full h-12 rounded-2xl ${currentTheme.bgHover} text-slate-800 font-medium transition-all flex items-center justify-center gap-2`}
          >
            <span>↻</span>
            Buscar actualizaciones
          </motion.button>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Versión actual: 0.1.0 · Última actualización: {new Date().toLocaleDateString()}
          </p>
        </motion.section>

        {/* Aplicación */}
        <section className={`${currentTheme.bgCard} rounded-3xl shadow-sm p-6 animate-slideUp border ${currentTheme.border}`} style={{animationDelay: '0.15s'}}>
          <h3 className="font-semibold text-slate-800 mb-4">Aplicación</h3>

          <InstallButton />

          <button className={`w-full flex items-center gap-3 p-4 rounded-2xl ${currentTheme.bgHover} mt-3`}>
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">Acerca de Rocket</p>
              <p className="text-sm text-slate-500">Versión 1.0.0 MVP</p>
            </div>
          </button>
        </section>

        {/* Cuenta */}
        <section className={`${currentTheme.bgCard} rounded-3xl shadow-sm p-6 animate-slideUp border ${currentTheme.border}`} style={{animationDelay: '0.2s'}}>
          <h3 className="font-semibold text-slate-800 mb-4">Cuenta</h3>

          <button
            onClick={handleClearData}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 hover:bg-red-100`}
          >
            <span className="text-2xl">🗑️</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-red-600">Borrar todos mis datos</p>
              <p className="text-sm text-red-500">Esta acción no se puede deshacer</p>
            </div>
          </button>
        </section>

        {/* Volver */}
        <button
          onClick={() => router.back()}
          className={`w-full h-14 rounded-full bg-gradient-to-r ${currentTheme.gradient} text-white font-medium shadow-lg hover:shadow-xl transition-shadow`}
        >
          Volver al inicio
        </button>
      </div>

      {/* Modal cambiar nombre */}
      <ChangeNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        currentName={data.name}
      />
    </main>
  );
}
