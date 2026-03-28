import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('pscrm_theme') || 'light');
  const transitionTimerRef = useRef(null);

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
    localStorage.setItem('pscrm_theme', theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    document.body.classList.add('theme-transitioning');

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }

    const runToggle = () => {
      setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(runToggle);
    } else {
      runToggle();
    }

    transitionTimerRef.current = setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 650);
  };

  const value = useMemo(() => ({ theme, isDark: theme === 'dark', toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
