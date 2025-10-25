'use client'

import { useEffect, useState } from 'react';
import { loadData, THEMES, type Theme } from '../lib/store';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('lavender');

  useEffect(() => {
    const data = loadData();
    setThemeState(data.theme);
  }, []);

  const currentTheme = THEMES[theme];

  return {
    theme,
    currentTheme,
    isDark: false, // Para futura implementación
  };
}
