/* INSTRUCCIONES PARA CLAUDE VS CODE:
1. Creá la carpeta app/perfil
2. Creá el archivo app/perfil/page.tsx
3. Pegá este código
*/

'use client'

import { useRouter } from 'next/navigation';
import { loadData } from '../lib/store';
import { useTheme } from '../hooks/useTheme';

export default function PerfilPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const data = loadData();

  function handleClearData() {
    if (!confirm('¿Estás seguro? Se borrarán todos tus datos.')) return;
    localStorage.clear();
    window.location.href = '/onboarding';
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800">
          Perfil y Configuración
        </h1>
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-slate-50"
        >
          ✕
        </button>
      </header>

      <div className="px-6 space-y-6 pb-12">
        {/* Usuario */}
        <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {data.name}
            </h2>
            <p className="text-sm text-slate-500">Usuario Creativo</p>
          </div>
        </section>

        {/* Apariencia */}
        <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp" style={{animationDelay: '0.1s'}}>
          <h3 className="font-semibold text-slate-800 mb-4">Apariencia</h3>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Tema</p>
                <p className="text-sm text-slate-500">
                  {theme === 'dark' ? 'Oscuro' : 'Claro'}
                </p>
              </div>
            </div>
            <div
              className={`w-12 h-7 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
              } relative`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </section>

        {/* Aplicación */}
        <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp" style={{animationDelay: '0.15s'}}>
          <h3 className="font-semibold text-slate-800 mb-4">Aplicación</h3>

          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 mb-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">Agregar a pantalla de inicio</p>
              <p className="text-sm text-slate-500">Usá Rocket como app nativa</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100">
            <span className="text-2xl">ℹ️</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800">Acerca de Rocket</p>
              <p className="text-sm text-slate-500">Versión 1.0.0 MVP</p>
            </div>
          </button>
        </section>

        {/* Cuenta */}
        <section className="bg-white rounded-3xl shadow-sm p-6 animate-slideUp" style={{animationDelay: '0.2s'}}>
          <h3 className="font-semibold text-slate-800 mb-4">Cuenta</h3>

          <button
            onClick={handleClearData}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 hover:bg-red-100"
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
          className="w-full h-14 rounded-full bg-indigo-600 text-white font-medium shadow-lg hover:bg-indigo-700"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  );
}
