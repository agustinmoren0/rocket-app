'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, Plus, Activity, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [showFab, setShowFab] = useState(false);

  return (
    <>
      {/* FAB Modal */}
      <AnimatePresence>
        {showFab && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFab(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3"
            >
              <button
                onClick={() => {
                  setShowFab(false);
                  router.push('/registrar-actividad');
                }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-white/40"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
                <span className="font-semibold text-slate-900">Registrar actividad</span>
              </button>

              <button
                onClick={() => {
                  setShowFab(false);
                  router.push('/biblioteca');
                }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg border border-white/40"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Plus className="text-indigo-600" size={24} />
                </div>
                <span className="font-semibold text-slate-900">Añadir hábito</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-lg mx-auto px-6 pb-6">
          <div className="rounded-full backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl p-1">
            <nav className="flex items-center justify-around px-2">
              <Link href="/">
                <button className={`flex flex-col items-center p-3 rounded-full transition-all ${
                  pathname === '/' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                }`}>
                  <Home size={22} />
                  <span className="text-xs font-bold mt-1">Hoy</span>
                </button>
              </Link>

              <Link href="/actividades">
                <button className={`flex flex-col items-center p-3 rounded-full transition-all ${
                  pathname === '/actividades' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                }`}>
                  <Activity size={22} />
                  <span className="text-xs font-bold mt-1">Actividades</span>
                </button>
              </Link>

              {/* FAB integrado */}
              <motion.button
                onClick={() => setShowFab(!showFab)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center p-2 -mt-8"
              >
                <div className={`w-16 h-16 rounded-full ${currentTheme.gradient} text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-all ${
                  showFab ? 'rotate-45' : ''
                }`}>
                  <Plus size={32} />
                </div>
              </motion.button>

              <Link href="/mis-habitos">
                <button className={`flex flex-col items-center p-3 rounded-full transition-all ${
                  pathname === '/mis-habitos' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                }`}>
                  <FileText size={22} />
                  <span className="text-xs font-bold mt-1">Hábitos</span>
                </button>
              </Link>

              <Link href="/estadisticas">
                <button className={`flex flex-col items-center p-3 rounded-full transition-all ${
                  pathname === '/estadisticas' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                }`}>
                  <TrendingUp size={22} />
                  <span className="text-xs font-bold mt-1">Resumen</span>
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
