'use client'

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showFabMenu, setShowFabMenu] = useState(false);

  if (pathname === '/onboarding') return null;

  const navItems = [
    { icon: 'home', label: 'Hoy', path: '/' },
    { icon: 'rocket_launch', label: 'Actividades', path: '/actividades' },
    { icon: null, label: '', path: '' },
    { icon: 'checklist', label: 'Hábitos', path: '/mis-habitos' },
    { icon: 'person', label: 'Perfil', path: '/perfil' },
  ];

  const fabMenuItems = [
    { label: 'Nueva actividad', path: '/registrar-actividad' },
    { label: 'Nuevo hábito', path: '/biblioteca' },
  ];

  return (
    <>
      {/* FAB Menu */}
      <AnimatePresence>
        {showFabMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFabMenu(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />

            <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 space-y-3 lg:hidden">
              {fabMenuItems.map((item, i) => (
                <motion.button
                  key={item.path}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setShowFabMenu(false);
                    router.push(item.path);
                  }}
                  className="flex items-center gap-3 bg-gradient-to-r from-[#FF8C66] to-[#FF99AC] text-white px-5 py-3 rounded-full shadow-2xl font-medium whitespace-nowrap"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-[#FFF5F0]/80 backdrop-blur-lg border-t border-gray-200/50 z-30">
        <div className="flex justify-around items-center h-full max-w-lg mx-auto">
          {navItems.map((item, index) => {
            if (!item.icon) return <div key="fab-space" className="w-16" />;

            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center text-center"
              >
                <span className={`material-symbols-outlined ${
                  isActive ? 'text-[#FF8C66]' : 'text-[#A67B6B]'
                }`}>
                  {item.icon}
                </span>
                <span className={`text-xs mt-1 ${
                  isActive ? 'text-[#FF8C66] font-bold' : 'text-[#A67B6B] font-medium'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* FAB Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowFabMenu(!showFabMenu)}
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF8C66] to-[#FF99AC] rounded-full shadow-lg text-white transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl">add</span>
        </button>
      </div>
    </>
  );
}
