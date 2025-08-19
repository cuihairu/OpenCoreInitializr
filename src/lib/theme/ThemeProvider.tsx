import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, applyTheme, getSystemTheme, watchSystemTheme } from './themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // 从 localStorage 读取保存的主题设置
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  useEffect(() => {
    // 保存主题设置到 localStorage
    localStorage.setItem('theme', theme);
    
    // 应用主题
    applyTheme(theme);
    
    // 更新实际主题
    const newActualTheme = theme === 'system' ? getSystemTheme() : theme;
    setActualTheme(newActualTheme);
    
    // 监听系统主题变化（仅当选择跟随系统时）
    if (theme === 'system') {
      const cleanup = watchSystemTheme((systemTheme) => {
        setActualTheme(systemTheme);
        applyTheme('system');
      });
      return cleanup;
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}