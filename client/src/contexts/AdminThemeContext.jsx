import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const AdminThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem('admin_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = useCallback((currentTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (currentTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('admin_theme', theme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  const value = {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme,
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

export const useTheme = useAdminTheme;

export default AdminThemeContext;
