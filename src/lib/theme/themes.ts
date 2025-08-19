export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Primary colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  
  // Accent colors
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  
  // Destructive colors
  destructive: string;
  destructiveForeground: string;
  
  // Border and input
  border: string;
  input: string;
  ring: string;
  
  // Gradients
  gradientPrimary: string;
  gradientSecondary: string;
  gradientBackground: string;
  
  // Shadows
  shadow: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

export const lightTheme: ThemeColors = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  
  primary: '221.2 83.2% 53.3%',
  primaryForeground: '210 40% 98%',
  secondary: '210 40% 96%',
  secondaryForeground: '222.2 84% 4.9%',
  
  muted: '210 40% 96%',
  mutedForeground: '215.4 16.3% 46.9%',
  accent: '210 40% 96%',
  accentForeground: '222.2 84% 4.9%',
  
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '221.2 83.2% 53.3%',
  
  gradientPrimary: 'linear-gradient(135deg, hsl(221.2 83.2% 53.3%) 0%, hsl(262.1 83.3% 57.8%) 100%)',
  gradientSecondary: 'linear-gradient(135deg, hsl(210 40% 96%) 0%, hsl(214.3 31.8% 91.4%) 100%)',
  gradientBackground: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(210 40% 98%) 50%, hsl(214.3 31.8% 96%) 100%)',
  
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

export const darkTheme: ThemeColors = {
  background: '222.2 84% 4.9%',
  foreground: '210 40% 98%',
  card: '222.2 84% 4.9%',
  cardForeground: '210 40% 98%',
  popover: '222.2 84% 4.9%',
  popoverForeground: '210 40% 98%',
  
  primary: '217.2 91.2% 59.8%',
  primaryForeground: '222.2 84% 4.9%',
  secondary: '217.2 32.6% 17.5%',
  secondaryForeground: '210 40% 98%',
  
  muted: '217.2 32.6% 17.5%',
  mutedForeground: '215 20.2% 65.1%',
  accent: '217.2 32.6% 17.5%',
  accentForeground: '210 40% 98%',
  
  destructive: '0 62.8% 30.6%',
  destructiveForeground: '210 40% 98%',
  
  border: '217.2 32.6% 17.5%',
  input: '217.2 32.6% 17.5%',
  ring: '224.3 76.3% 94.1%',
  
  gradientPrimary: 'linear-gradient(135deg, hsl(217.2 91.2% 59.8%) 0%, hsl(262.1 83.3% 57.8%) 100%)',
  gradientSecondary: 'linear-gradient(135deg, hsl(217.2 32.6% 17.5%) 0%, hsl(215 27.9% 16.9%) 100%)',
  gradientBackground: 'linear-gradient(135deg, hsl(222.2 84% 4.9%) 0%, hsl(217.2 32.6% 17.5%) 50%, hsl(215 27.9% 16.9%) 100%)',
  
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
  shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
};

export const themes = {
  light: lightTheme,
  dark: darkTheme
};

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;
  const themeColors = themes[actualTheme];
  
  // Apply CSS variables with correct naming
  const cssVarMap: Record<string, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    gradientPrimary: '--gradient-primary',
    gradientSecondary: '--gradient-secondary',
    gradientBackground: '--gradient-background',
    shadow: '--shadow',
    shadowSm: '--shadow-sm',
    shadowMd: '--shadow-md',
    shadowLg: '--shadow-lg',
    shadowXl: '--shadow-xl'
  };
  
  Object.entries(themeColors).forEach(([key, value]) => {
    const cssVar = cssVarMap[key];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    }
  });
  
  // Set data attribute for theme-specific styles
  root.setAttribute('data-theme', actualTheme);
}

export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  return () => {};
}