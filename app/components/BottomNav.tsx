'use client'

import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Activity, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Hide on onboarding
  if (pathname === '/onboarding') return null;

  const mainNavItems = [
    { icon: Home, label: 'Hoy', path: '/' },
    { icon: Activity, label: 'Hábitos', path: '/mis-habitos' },
    { icon: Calendar, label: 'Calendario', path: '/calendario' },
    { icon: TrendingUp, label: 'Progreso', path: '/estadisticas' },
  ];

  const fabMenuItems = [
    { icon: Activity, label: 'Nueva actividad', path: '/registrar-actividad', color: 'from-blue-500 to-cyan-500' },
    { icon: Plus, label: 'Nuevo hábito', path: '/biblioteca', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <>
      {/* FAB Menu flotante */}
      <AnimatePresence>
        {showFabMenu && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFabMenu(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Menu items */}
            <div className="fixed bottom-28 right-6 z-50 space-y-3">
              {fabMenuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.path}
                    initial={{ scale: 0, opacity: 0, x: 20 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      setShowFabMenu(false);
                      router.push(item.path);
                    }}
                    className={`flex items-center gap-3 bg-gradient-to-r ${item.color} text-white px-5 py-3 rounded-full shadow-xl`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 ${currentTheme.bgGlass} border-t ${currentTheme.border} z-30`}>
        <div className="flex items-center justify-between px-2 h-20">
          {mainNavItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center flex-1 relative"
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 0.9 }}
                  className={`relative transition-colors ${
                    isActive ? currentTheme.primaryText : 'text-slate-400'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? currentTheme.primaryText : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Center FAB */}
          <div className="flex-1 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-full ${currentTheme.gradient} text-white shadow-2xl flex items-center justify-center relative -top-6 ${
                showFabMenu ? 'rotate-45' : ''
              } transition-transform`}
            >
              <Plus size={28} strokeWidth={2.5} />
            </motion.button>
          </div>

          {mainNavItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center flex-1 relative"
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 0.9 }}
                  className={`relative transition-colors ${
                    isActive ? currentTheme.primaryText : 'text-slate-400'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? currentTheme.primaryText : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
