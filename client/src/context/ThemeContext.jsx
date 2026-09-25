import React, { createContext, useContext, useState, useLayoutEffect, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'emergency_finder_theme';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Track whether the current theme change is from an explicit user action
  const isUserAction = useRef(false);
  // Track first render to skip transition animation on initial mount
  const isFirstRender = useRef(true);

  // Synchronize <html> class and CSS color-scheme SYNCHRONOUSLY before paint
  useLayoutEffect(() => {
    const isDark = theme === 'dark';
    const root = document.documentElement;

    // Only add the transition class when the user is actively toggling,
    // never on the initial page load (prevents flash/jitter on mount)
    if (!isFirstRender.current) {
      root.classList.add('theme-transitioning');
    }

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // Only persist to localStorage when the user explicitly toggled/set the theme.
    // This preserves system-preference following when no explicit choice has been made.
    if (isUserAction.current) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Ignore storage quota/permission errors
      }
      isUserAction.current = false;
    }

    // Clean up temporary transition class after animations complete
    let timer;
    if (!isFirstRender.current) {
      timer = setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 350);
    }

    isFirstRender.current = false;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [theme]);

  // Listen for system theme changes if user hasn't explicitly set preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // If localStorage is unavailable, follow system preference
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Clean, pure state toggle — marks as user action for persistence
  const toggleTheme = useCallback(() => {
    isUserAction.current = true;
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      isUserAction.current = true;
      setThemeState(newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
