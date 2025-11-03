'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useCycle } from '../context/CycleContext';
import { useUser } from '../context/UserContext';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const { cycleData, getPhaseInfo } = useCycle();
  const { username } = useUser();

  // Hide on onboarding
  if (pathname === '/app/onboarding') return null;

  return (
    <div className="hidden lg:block fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-30">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${currentTheme.gradient} flex items-center justify-center text-white font-bold`}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">HABIKA</h1>
            <p className="text-xs text-slate-500">Tu progreso real</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Modo Ciclo (if active) */}
          {cycleData.isActive && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/app/modo-ciclo')}
              className="relative p-2 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-rose-200"
            >
              <span className="text-xl">🌸</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
            </motion.button>
          )}

          {/* Settings */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/app/perfil')}
            className={`p-2 ${currentTheme.bgHover} rounded-xl transition-colors`}
          >
            <Settings size={20} className="text-slate-700" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
