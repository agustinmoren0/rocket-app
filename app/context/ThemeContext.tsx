'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  name: string;
  emoji: string;
  bg: string;
  bgCard: string;
  bgCardSecondary: string;
  bgHover: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  button: string;
  buttonHover: string;
  gradient: string;
}

const themes: Record<string, Theme> = {
  oceano: {
    name: 'Océano',
    emoji: '🌊',
    bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgCardSecondary: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    primary: 'bg-blue-600',
    primaryText: 'text-blue-600',
    secondary: 'bg-cyan-500',
    accent: 'bg-blue-400',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-blue-200',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonHover: 'hover:bg-blue-50',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600',
  },
  bosque: {
    name: 'Bosque',
    emoji: '🌲',
    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgCardSecondary: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    primary: 'bg-green-600',
    primaryText: 'text-green-600',
    secondary: 'bg-emerald-500',
    accent: 'bg-green-400',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-green-200',
    button: 'bg-green-600 hover:bg-green-700',
    buttonHover: 'hover:bg-green-50',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600',
  },
  atardecer: {
    name: 'Atardecer',
    emoji: '🌅',
    bg: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-100',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgCardSecondary: 'bg-orange-50',
    bgHover: 'hover:bg-orange-100',
    primary: 'bg-orange-600',
    primaryText: 'text-orange-600',
    secondary: 'bg-red-500',
    accent: 'bg-orange-400',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-orange-200',
    button: 'bg-orange-600 hover:bg-orange-700',
    buttonHover: 'hover:bg-orange-50',
    gradient: 'bg-gradient-to-br from-orange-600 to-red-600',
  },
  lavanda: {
    name: 'Lavanda',
    emoji: '💜',
    bg: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgCardSecondary: 'bg-purple-50',
    bgHover: 'hover:bg-purple-100',
    primary: 'bg-purple-600',
    primaryText: 'text-purple-600',
    secondary: 'bg-indigo-500',
    accent: 'bg-purple-400',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-purple-200',
    button: 'bg-purple-600 hover:bg-purple-700',
    buttonHover: 'hover:bg-purple-50',
    gradient: 'bg-gradient-to-br from-purple-600 to-indigo-600',
  },
  monocromo: {
    name: 'Monocromo',
    emoji: '⚫',
    bg: 'bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgCardSecondary: 'bg-slate-100',
    bgHover: 'hover:bg-slate-100',
    primary: 'bg-slate-700',
    primaryText: 'text-slate-700',
    secondary: 'bg-slate-600',
    accent: 'bg-slate-500',
    text: 'text-slate-900',
    textSecondary: 'text-slate-600',
    border: 'border-slate-300',
    button: 'bg-slate-700 hover:bg-slate-800',
    buttonHover: 'hover:bg-slate-50',
    gradient: 'bg-gradient-to-br from-slate-700 to-slate-900',
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeId: string;
  changeTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.oceano,
  themeId: 'oceano',
  changeTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState('oceano');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('habika_theme');
    if (stored && themes[stored]) {
      setThemeId(stored);
    }
  }, []);

  const changeTheme = (id: string) => {
    if (themes[id]) {
      setThemeId(id);
      localStorage.setItem('habika_theme', id);
    }
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: themes[themeId],
        themeId,
        changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
