'use client'

import { usePathname, useRouter } from 'next/navigation';
import { Home, Rocket, Plus, CheckSquare, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showFAB, setShowFAB] = useState(false);

  const navItems = [
    { icon: Home, label: 'Hoy', path: '/' },
    { icon: Rocket, label: 'Actividades', path: '/actividades' },
    { icon: CheckSquare, label: 'Hábitos', path: '/mis-habitos' },
    { icon: User, label: 'Perfil', path: '/perfil' },
  ];

  return (
    <>
      <AnimatePresence>
        {showFAB && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowFAB(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFAB && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50"
          >
            <button
              onClick={() => {
                router.push('/registrar-actividad');
                setShowFAB(false);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <Rocket className="w-5 h-5" />
              <span className="font-medium">Nueva actividad</span>
            </button>
            <button
              onClick={() => {
                router.push('/biblioteca');
                setShowFAB(false);
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC] text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nuevo hábito</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200/50 pb-safe z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around h-16 relative">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-[#FF8C66]' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isActive ? 'text-[#FF8C66] font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}

            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setShowFAB(!showFAB)}
                className="w-14 h-14 -mt-6 bg-gradient-to-br from-[#FFC0A9] to-[#FF99AC] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <Plus className={`w-7 h-7 text-white transition-transform ${showFAB ? 'rotate-45' : ''}`} />
              </button>
            </div>

            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-[#FF8C66]' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isActive ? 'text-[#FF8C66] font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
