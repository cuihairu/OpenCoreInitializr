import React from 'react';
import { useTranslation, useLanguage } from '../../hooks/useTranslation';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'zh-CN',
    name: 'Chinese Simplified',
    nativeName: '简体中文',
    flag: '🇨🇳'
  },
  {
    code: 'zh-TW',
    name: 'Chinese Traditional',
    nativeName: '繁體中文',
    flag: '🇨🇳'
  },
  {
    code: 'zh-HK',
    name: 'Chinese Traditional (Hong Kong)',
    nativeName: '繁體中文（香港）',
    flag: '🇭🇰'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  }
];

export function LanguageToggle() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="language-toggle">
      <label className="label">{t('common.language', '语言')}</label>
      <div className="language-options">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
            onClick={() => changeLanguage(lang.code as any)}
            title={lang.name}
          >
            <span className="language-flag">{lang.flag}</span>
            <span className="language-name">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 紧凑版语言切换器（用于导航栏）
export function LanguageToggleCompact() {
  const { t } = useTranslation();
  const { currentLanguage: currentLang, changeLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <span>{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code as any)}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span>{lang.flag}</span>
            <span>{lang.nativeName}</span>
            {currentLang === lang.code && (
              <span className="ml-auto text-xs opacity-60">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 下拉菜单版本的语言切换器
export function LanguageSelect() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <div className="language-select">
      <label className="label" htmlFor="language-select">
        {t('common.language', '语言')}
      </label>
      <select
        id="language-select"
        className="select"
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as any)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}