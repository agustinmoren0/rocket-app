'use client'

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  Home, Activity, FileText, TrendingUp, Settings,
  Calendar, BookOpen, Flame, PauseCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const { username } = useUser();

  const menuItems = [
    { icon: Home, label: 'Inicio', path: '/', hotkey: '1' },
    { icon: Activity, label: 'Actividades', path: '/actividades', hotkey: '2' },
    { icon: FileText, label: 'Mis Hábitos', path: '/mis-habitos', hotkey: '3' },
    { icon: Calendar, label: 'Calendario', path: '/calendario', hotkey: '4' },
    { icon: TrendingUp, label: 'Progreso', path: '/progreso', hotkey: '5' },
    { icon: BookOpen, label: 'Reflexiones', path: '/reflexiones', hotkey: '6' },
    { icon: PauseCircle, label: 'Pausados', path: '/pausados', hotkey: '7' },
  ];

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 7) {
          e.preventDefault();
          router.push(menuItems[num - 1].path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return (
    <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 ${currentTheme.bgCard} border-r ${currentTheme.border} z-40`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-full ${currentTheme.gradient} flex items-center justify-center text-white text-xl font-bold`}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">{username}</h2>
            <p className="text-sm text-slate-500">HABIKA</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `${currentTheme.gradient} text-white shadow-lg`
                  : `${currentTheme.buttonHover} text-slate-700`
              }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
              }`}>
                ⌘{item.hotkey}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => router.push('/perfil')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${currentTheme.buttonHover} text-slate-700 transition-all`}
        >
          <Settings size={20} />
          <span className="font-medium">Configuración</span>
        </button>
      </div>
    </aside>
  );
}
