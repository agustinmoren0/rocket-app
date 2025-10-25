'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadData, setUserName, setTheme, toggleZenMode, clearAllData, type Theme, THEMES } from '../lib/store';
import { showToast } from '../components/Toast';
import { useTheme } from '../hooks/useTheme';

export default function PerfilPage() {
  const router = useRouter();
  const { currentTheme, theme: activeTheme } = useTheme();
  const [data, setData] = useState(() => loadData());
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(data.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSaveName() {
    if (!newName.trim()) return;
    setUserName(newName.trim());
    setData(loadData());
    setEditingName(false);
    showToast('Nombre actualizado', 'success');
  }

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme);
    setData(loadData());
    showToast(`Tema ${THEMES[newTheme].name} activado`, 'success');
  }

  function handleToggleZen() {
    const wasZen = data.zenMode;
    toggleZenMode();
    const newData = loadData();
    setData(newData);
    showToast(wasZen ? 'Modo Zen desactivado' : 'Modo Zen activado', 'success');
  }

  function handleDeleteData() {
    clearAllData();
    showToast('Datos eliminados', 'success');
    setTimeout(() => router.replace('/onboarding'), 1000);
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-6 pt-8 pb-6 flex items-center justify-between"
      >
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
          Configuración
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className={`w-10 h-10 rounded-xl ${currentTheme.bgCard} shadow-sm flex items-center justify-center ${currentTheme.bgHover} transition-all`}
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
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-2xl">
              {data.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1 h-9 px-3 rounded-xl bg-white border-2 border-slate-200 focus:outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className={`px-4 h-9 rounded-xl ${currentTheme.button} text-white text-sm font-medium`}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">{data.name}</h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className={`text-xs ${currentTheme.accent} hover:opacity-70 transition-opacity mt-0.5`}
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
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎨</span>
            <h3 className="text-base font-semibold text-slate-900">Tema de colores</h3>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(THEMES) as Theme[]).map((themeKey) => {
              const theme = THEMES[themeKey];
              const isActive = themeKey === activeTheme;

              return (
                <motion.button
                  key={themeKey}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleThemeChange(themeKey)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: isActive ? `0 0 0 2px white, 0 0 0 4px ${theme.primary}` : 'none'
                    }}
                  >
                    {theme.emoji}
                  </div>
                  <p className={`text-xs font-medium ${isActive ? currentTheme.accent : 'text-slate-600'}`}>
                    {theme.name}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Modo Zen */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🧘</span>
                <h3 className="text-base font-semibold text-slate-900">Modo Zen</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interfaz ultra minimalista. Solo progreso y acción.
              </p>
            </div>
            <button
              onClick={handleToggleZen}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                data.zenMode ? currentTheme.button : 'bg-slate-300'
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

        {/* Actualizar */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔄</span>
            <h3 className="text-base font-semibold text-slate-900">Actualizar app</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Si instalaste HABIKA como PWA, usá esto para obtener la última versión.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`w-full h-10 rounded-xl ${currentTheme.bgCardSecondary} hover:opacity-80 transition-opacity text-sm font-medium text-slate-700`}
          >
            Buscar actualizaciones
          </button>
          <p className="text-xs text-slate-500 text-center mt-3">
            Versión 1.0.0 · Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </motion.section>

        {/* Aplicación */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <h3 className="text-base font-semibold text-slate-900 mb-3">Aplicación</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (window.matchMedia('(display-mode: standalone)').matches) {
                  showToast('HABIKA ya está instalada', 'success');
                } else {
                  showToast('Usá el menú de tu navegador para instalar', 'info');
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${currentTheme.bgHover} transition-colors text-left`}
            >
              <span className="text-xl">
                {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches ? '✅' : '📱'}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
                    ? 'HABIKA está instalada'
                    : 'Agregar a pantalla de inicio'}
                </p>
                <p className="text-xs text-slate-600">
                  {typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
                    ? 'Ya estás usando HABIKA como app'
                    : 'Usá HABIKA como app nativa'}
                </p>
              </div>
            </button>
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${currentTheme.bgHover} transition-colors text-left`}>
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-slate-900">Acerca de HABIKA</p>
                <p className="text-xs text-slate-600">Versión 1.0.0 MVP</p>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Cuenta */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className={`${currentTheme.bgCard} backdrop-blur-xl rounded-2xl shadow-sm border ${currentTheme.border} p-6`}
        >
          <h3 className="text-base font-semibold text-slate-900 mb-3">Cuenta</h3>

          {showDeleteConfirm ? (
            <div className={`${currentTheme.bgCardSecondary} rounded-xl p-4`}>
              <p className="text-sm font-medium text-slate-900 mb-3">
                ¿Estás seguro? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 text-sm font-medium transition-colors"
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
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
            >
              <span className="text-xl">🗑️</span>
              <div>
                <p className="text-sm font-medium text-red-600">Borrar todos mis datos</p>
                <p className="text-xs text-red-500">Esta acción no se puede deshacer</p>
              </div>
            </button>
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
            className={`block w-full h-12 rounded-2xl ${currentTheme.button} text-white font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all`}
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
