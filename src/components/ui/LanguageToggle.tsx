import React from 'react';
import { useTranslation, useLanguage } from '../../hooks/useTranslation';
import { Button } from './button';

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
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
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
  const otherLanguage = languages.find(lang => lang.code !== currentLang) || languages[1];

  const toggleLanguage = () => {
    changeLanguage(otherLanguage.code as any);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      title={`${t('common.language', '语言')}: ${currentLanguage.nativeName}`}
      className="flex items-center space-x-2"
    >
      <span>{currentLanguage.flag}</span>
      <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
    </Button>
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