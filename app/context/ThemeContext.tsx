'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
  name: string;
  emoji: string;
  // Core colors
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  gradient: string;
  gradientSubtle: string;
  // Backgrounds
  bg: string;
  bgCard: string;
  bgHover: string;
  bgGlass: string;
  // Text
  text: string;
  textMuted: string;
  // Borders
  border: string;
  // Status colors
  accent1: string;
  accent2: string;
  accent3: string;
  // Legacy properties for backward compatibility
  primaryLight: string;
  primaryDark: string;
  bgCardSecondary: string;
  secondaryText: string;
  accent: string;
  accentLight: string;
  textSecondary: string;
  borderLight: string;
  shadow: string;
  button: string;
  buttonHover: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  success: string;
  warning: string;
  error: string;
}

const themes: Record<string, Theme> = {
  stitch: {
    name: 'Stitch',
    emoji: '🧵',
    primary: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryText: 'text-orange-500',
    secondary: 'bg-pink-500',
    gradient: 'bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500',
    gradientSubtle: 'bg-gradient-to-br from-orange-100 to-rose-100',
    bg: 'bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-orange-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-orange-200/60',
    accent1: 'bg-orange-400',
    accent2: 'bg-rose-400',
    accent3: 'bg-pink-400',
    // Legacy properties
    primaryLight: 'bg-orange-400',
    primaryDark: 'bg-orange-600',
    bgCardSecondary: 'bg-orange-50/50',
    secondaryText: 'text-rose-600',
    accent: 'bg-rose-400',
    accentLight: 'bg-rose-200',
    textSecondary: 'text-slate-600',
    borderLight: 'border-orange-100',
    shadow: 'shadow-orange-100/50',
    button: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
    buttonHover: 'hover:bg-orange-50',
    buttonSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    buttonSecondaryHover: 'hover:bg-orange-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
  oceano: {
    name: 'Océano',
    emoji: '🌊',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-blue-600',
    secondary: 'bg-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-600 to-cyan-600',
    gradientSubtle: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-blue-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-blue-200/60',
    accent1: 'bg-sky-400',
    accent2: 'bg-cyan-400',
    accent3: 'bg-blue-400',
    // Legacy properties
    primaryLight: 'bg-blue-400',
    primaryDark: 'bg-blue-700',
    bgCardSecondary: 'bg-blue-50/50',
    secondaryText: 'text-cyan-600',
    accent: 'bg-sky-400',
    accentLight: 'bg-sky-200',
    textSecondary: 'text-slate-600',
    borderLight: 'border-blue-100',
    shadow: 'shadow-blue-100/50',
    button: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    buttonHover: 'hover:bg-blue-50',
    buttonSecondary: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    buttonSecondaryHover: 'hover:bg-blue-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
  bosque: {
    name: 'Bosque',
    emoji: '🌲',
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    primaryText: 'text-green-600',
    secondary: 'bg-emerald-500',
    gradient: 'bg-gradient-to-br from-green-600 to-emerald-600',
    gradientSubtle: 'bg-gradient-to-br from-green-100 to-emerald-100',
    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-green-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-green-200/60',
    accent1: 'bg-teal-400',
    accent2: 'bg-emerald-400',
    accent3: 'bg-green-400',
    // Legacy properties
    primaryLight: 'bg-green-400',
    primaryDark: 'bg-green-700',
    bgCardSecondary: 'bg-green-50/50',
    secondaryText: 'text-emerald-600',
    accent: 'bg-teal-400',
    accentLight: 'bg-teal-200',
    textSecondary: 'text-slate-600',
    borderLight: 'border-green-100',
    shadow: 'shadow-green-100/50',
    button: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    buttonHover: 'hover:bg-green-50',
    buttonSecondary: 'bg-green-100 hover:bg-green-200 text-green-700',
    buttonSecondaryHover: 'hover:bg-green-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
  atardecer: {
    name: 'Atardecer',
    emoji: '🌅',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryText: 'text-orange-600',
    secondary: 'bg-rose-500',
    gradient: 'bg-gradient-to-br from-orange-600 to-rose-600',
    gradientSubtle: 'bg-gradient-to-br from-orange-100 to-rose-100',
    bg: 'bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-orange-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-orange-200/60',
    accent1: 'bg-pink-400',
    accent2: 'bg-rose-400',
    accent3: 'bg-orange-400',
    // Legacy properties
    primaryLight: 'bg-orange-400',
    primaryDark: 'bg-orange-700',
    bgCardSecondary: 'bg-orange-50/50',
    secondaryText: 'text-rose-600',
    accent: 'bg-pink-400',
    accentLight: 'bg-pink-200',
    textSecondary: 'text-slate-600',
    borderLight: 'border-orange-100',
    shadow: 'shadow-orange-100/50',
    button: 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800',
    buttonHover: 'hover:bg-orange-50',
    buttonSecondary: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    buttonSecondaryHover: 'hover:bg-orange-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
  lavanda: {
    name: 'Lavanda',
    emoji: '💜',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryText: 'text-purple-600',
    secondary: 'bg-violet-500',
    gradient: 'bg-gradient-to-br from-purple-600 to-indigo-600',
    gradientSubtle: 'bg-gradient-to-br from-purple-100 to-indigo-100',
    bg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-purple-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-purple-200/60',
    accent1: 'bg-indigo-400',
    accent2: 'bg-violet-400',
    accent3: 'bg-purple-400',
    // Legacy properties
    primaryLight: 'bg-purple-400',
    primaryDark: 'bg-purple-700',
    bgCardSecondary: 'bg-purple-50/50',
    secondaryText: 'text-violet-600',
    accent: 'bg-indigo-400',
    accentLight: 'bg-indigo-200',
    textSecondary: 'text-slate-600',
    borderLight: 'border-purple-100',
    shadow: 'shadow-purple-100/50',
    button: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
    buttonHover: 'hover:bg-purple-50',
    buttonSecondary: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    buttonSecondaryHover: 'hover:bg-purple-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
  monocromo: {
    name: 'Monocromo',
    emoji: '⚫',
    primary: 'bg-slate-700',
    primaryHover: 'hover:bg-slate-800',
    primaryText: 'text-slate-700',
    secondary: 'bg-gray-600',
    gradient: 'bg-gradient-to-br from-slate-700 to-gray-700',
    gradientSubtle: 'bg-gradient-to-br from-slate-100 to-gray-100',
    bg: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50',
    bgCard: 'bg-white/60 backdrop-blur-xl',
    bgHover: 'hover:bg-slate-50/80',
    bgGlass: 'bg-white/40 backdrop-blur-xl border border-white/30',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-slate-200/60',
    accent1: 'bg-zinc-500',
    accent2: 'bg-gray-500',
    accent3: 'bg-slate-500',
    // Legacy properties
    primaryLight: 'bg-slate-500',
    primaryDark: 'bg-slate-800',
    bgCardSecondary: 'bg-slate-50/50',
    secondaryText: 'text-gray-600',
    accent: 'bg-zinc-500',
    accentLight: 'bg-zinc-300',
    textSecondary: 'text-slate-600',
    borderLight: 'border-slate-100',
    shadow: 'shadow-slate-100/50',
    button: 'bg-slate-700 hover:bg-slate-800 active:bg-slate-900',
    buttonHover: 'hover:bg-slate-50',
    buttonSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    buttonSecondaryHover: 'hover:bg-slate-100/50',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeId: string;
  changeTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.stitch,
  themeId: 'stitch',
  changeTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeId, setThemeId] = useState('stitch');

  useEffect(() => {
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
