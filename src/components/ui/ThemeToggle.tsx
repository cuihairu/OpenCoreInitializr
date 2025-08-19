import React from 'react';
import { useTheme } from '../../lib/theme/ThemeProvider';
import { Theme } from '../../lib/theme/themes';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: string;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: t('theme.light', '浅色主题'),
      icon: '☀️'
    },
    {
      value: 'dark',
      label: t('theme.dark', '深色主题'),
      icon: '🌙'
    },
    {
      value: 'system',
      label: t('theme.system', '跟随系统'),
      icon: '💻'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none">{t('theme.title', '主题设置')}</label>
      <div className="flex flex-wrap gap-2">
        {themeOptions.map((option) => (
          <Button
            key={option.value}
            variant={theme === option.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme(option.value)}
            title={option.label}
            className="flex items-center space-x-2"
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// 紧凑版主题切换器（用于导航栏）
export function ThemeToggleCompact() {
  const { theme, setTheme, actualTheme } = useTheme();
  const { t } = useTranslation();

  const getNextTheme = (): Theme => {
    switch (theme) {
      case 'light':
        return 'dark';
      case 'dark':
        return 'system';
      case 'system':
        return 'light';
      default:
        return 'light';
    }
  };

  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return actualTheme === 'dark' ? '🌙💻' : '☀️💻';
      default:
        return '☀️';
    }
  };

  const getCurrentLabel = () => {
    switch (theme) {
      case 'light':
        return t('theme.light', '浅色');
      case 'dark':
        return t('theme.dark', '深色');
      case 'system':
        return t('theme.system', '系统');
      default:
        return t('theme.light', '浅色');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(getNextTheme())}
      title={`${t('theme.current', '当前主题')}: ${getCurrentLabel()}`}
      className="flex items-center space-x-2"
    >
      <span>{getCurrentIcon()}</span>
      <span className="hidden sm:inline">{getCurrentLabel()}</span>
    </Button>
  );
}