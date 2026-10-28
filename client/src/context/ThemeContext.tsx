import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLight: boolean;
  isDark: boolean;
  logoSrc: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'light' per user request: "me gustaría probar con el fondo blanco"
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('allstar_theme') as Theme | null;
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('allstar_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const isLight = theme === 'light';
  const isDark = theme === 'dark';
  // Use isolated light logo for white background, dark logo for dark background
  const logoSrc = isLight ? '/images/allstar-team-logo-light.png' : '/images/allstar-team-logo.png';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLight, isDark, logoSrc }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return context;
};
