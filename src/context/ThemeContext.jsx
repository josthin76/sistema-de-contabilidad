import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
const THEME_STORAGE_PREFIX = 'contabeni_theme:';

function getThemeKey(user) {
  return `${THEME_STORAGE_PREFIX}${user?.id || user?.email || 'guest'}`;
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const themeKey = getThemeKey(user);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let savedTheme = 'light';
    try {
      const stored = localStorage.getItem(themeKey);
      if (stored === 'light' || stored === 'dark') savedTheme = stored;
    } catch (error) {
      console.warn('No se pudo leer la preferencia de tema:', error);
    }

    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.documentElement.style.colorScheme = savedTheme;

    return () => {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    };
  }, [themeKey]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(themeKey, nextTheme);
    } catch (error) {
      console.warn('No se pudo guardar la preferencia de tema:', error);
    }
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.style.colorScheme = nextTheme;
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, themeKey]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
