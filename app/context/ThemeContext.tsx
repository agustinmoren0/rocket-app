'use client'

import { createContext, useContext, ReactNode } from 'react';

// Tema único Stitch (sin cambios, siempre el mismo)
const stitchTheme = {
  primary: '#FF8C66',
  primaryHover: '#FF7A52',
  secondary: '#FFC0A9',
  accent1: '#FF99AC',
  accent2: '#FDF0D5',
  bg: '#FFF5F0',
  bgDark: '#1C141F',
  text: '#3D2C28',
  textDark: '#FCEEE9',
  subtext: '#A67B6B',
  subtextDark: '#D1B6AA',
  card: '#FFFFFF',
  cardDark: '#281E29',
  // Propiedades adicionales para compatibilidad
  bgCard: 'bg-white/70 backdrop-blur-xl',
  bgCardSecondary: 'bg-orange-50/50',
  bgHover: 'hover:bg-orange-50/80',
  primaryLight: '#FFB399',
  primaryDark: '#E67A54',
  primaryText: 'text-orange-500',
  secondaryText: 'text-pink-600',
  accent: 'bg-pink-400',
  accentLight: 'bg-pink-200',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  border: 'border-orange-200/60',
  borderLight: 'border-orange-100',
  shadow: 'shadow-orange-100/50',
  button: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
  buttonHover: 'hover:bg-orange-50',
  buttonSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  buttonSecondaryHover: 'hover:bg-orange-100/50',
  gradient: 'bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500',
  gradientSubtle: 'bg-gradient-to-br from-orange-100 to-rose-100',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  // Para glass-stitch
  bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
};

interface ThemeContextType {
  theme: typeof stitchTheme;
  currentTheme: typeof stitchTheme;
  themeId: string;
  changeTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const handleChangeTheme = (id: string) => {
    // Currently only Stitch theme is available
    // This function is kept for backward compatibility with existing pages
    console.log('Theme change requested to:', id, '(Stitch is the current theme)');
  };

  return (
    <ThemeContext.Provider value={{
      theme: stitchTheme,
      currentTheme: stitchTheme,
      themeId: 'stitch',
      changeTheme: handleChangeTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
