import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import en from '../../data/locales/en.json';
import zhCN from '../../data/locales/zh-CN.json';
import zhTW from '../../data/locales/zh-TW.json';
import ja from '../../data/locales/ja.json';
import ko from '../../data/locales/ko.json';
import es from '../../data/locales/es.json';
import fr from '../../data/locales/fr.json';
import de from '../../data/locales/de.json';
import ru from '../../data/locales/ru.json';

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN }, // 简体中文
  'zh-TW': { translation: zhTW }, // 繁体中文
  'zh-HK': { translation: zhTW }, // 香港繁体
  ja: { translation: ja },
  ko: { translation: ko },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  ru: { translation: ru },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      // 语言映射：将 'zh' 映射到 'zh-CN'
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      // 添加语言代码转换
      convertDetectedLanguage: (lng: string) => {
        if (lng === 'zh' || lng === 'zh-Hans') {
          return 'zh-CN';
        }
        if (lng === 'zh-Hant') {
          return 'zh-TW';
        }
        return lng;
      },
    },
    
    // Language mapping for Chinese variants// 其他配置
    cleanCode: false,
    
    // 支持的语言列表
    supportedLngs: ['en', 'zh-CN', 'zh-TW', 'zh-HK', 'ja', 'ko', 'es', 'fr', 'de', 'ru'],
    nonExplicitSupportedLngs: false,
    
    // 语言映射配置
    load: 'languageOnly',
    preload: ['en', 'zh-CN'],
    
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    // 初始化时设置正确的 HTML lang 属性
    if (typeof document !== 'undefined') {
      const currentLang = i18n.language;
      document.documentElement.lang = currentLang;
    }
  });

// 监听语言变化事件，自动更新 HTML lang 属性
i18n.on('languageChanged', (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;

// Define supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese Simplified', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese Traditional', nativeName: '繁體中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' }
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

// Backward compatibility
export const languages = SUPPORTED_LANGUAGES;

import { LocalizedText } from '@/types/driver-support';

// ... existing code ...

// Utility functions
export const i18nUtils = {
  /**
   * Get localized text
   * Handles both website i18n and driver data i18n
   */
  getText(text: LocalizedText | string | undefined): string {
    if (!text) return '';
    if (typeof text === 'string') return text;

    const isLanguageSupported = (code: string): boolean => {
      return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
    };

    const getLang = (): keyof LocalizedText => {
      const currentLang = i18n.language;
      
      // Check if current language is directly supported
      if (isLanguageSupported(currentLang)) {
        return currentLang as keyof LocalizedText;
      }
      
      // Handle Chinese variants
      if (currentLang.startsWith('zh')) {
        const region = currentLang.split('-')[1]?.toUpperCase();
        if (region === 'TW' || region === 'HK' || region === 'MO') {
          return 'zh-TW';
        } else {
          return 'zh-CN';
        }
      }
      
      // For other languages, try base language
      const baseLang = currentLang.split('-')[0];
      if (isLanguageSupported(baseLang)) {
        return baseLang as keyof LocalizedText;
      }
      
      return 'en';
    };

    const lang = getLang();
    
    // Try current language first, then fallback hierarchy
    const fallbackOrder: (keyof LocalizedText)[] = [
      lang,
      'en', // Always try English as primary fallback
      'zh-CN', // Then Chinese Simplified as secondary fallback
      'zh-TW', // Then Chinese Traditional
    ];
    
    for (const fallbackLang of fallbackOrder) {
      if (text[fallbackLang]) {
        return text[fallbackLang];
      }
    }
    
    // Final fallback: return first available value
    const availableValues = Object.values(text).filter(Boolean);
    return availableValues[0] || '';
  },

  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    const currentLang = i18n.language;
    
    // 如果当前语言是 'zh'，需要映射到具体的中文变体
    if (currentLang === 'zh') {
      // 检查 localStorage 中是否有具体的中文语言设置
      const storedLang = localStorage.getItem('i18nextLng');
      if (storedLang && (storedLang === 'zh-CN' || storedLang === 'zh-TW' || storedLang === 'zh-HK')) {
        return storedLang as SupportedLanguage;
      }
      // 默认返回简体中文
      return 'zh-CN';
    }
    
    return currentLang as SupportedLanguage;
  },

  /**
   * Change language
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);
    // 同时更新 HTML 文档的 lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  },

  /**
   * Get language info
   */
  getLanguageInfo(code: SupportedLanguage) {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  },

  /**
   * Check if language is supported
   */
  isLanguageSupported(code: string): code is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
  },

  /**
   * Get browser language
   */
  getBrowserLanguage(): SupportedLanguage {
    const fullBrowserLang = navigator.language;
    
    // 首先尝试完整的语言代码（如 zh-CN, zh-TW）
    if (this.isLanguageSupported(fullBrowserLang)) {
      return fullBrowserLang as SupportedLanguage;
    }
    
    // 如果是中文，根据地区代码映射到具体的中文变体
    if (fullBrowserLang.startsWith('zh')) {
      const region = fullBrowserLang.split('-')[1]?.toUpperCase();
      if (region === 'TW' || region === 'HK' || region === 'MO') {
        return 'zh-TW';
      } else {
        return 'zh-CN'; // 默认简体中文
      }
    }
    
    // 其他语言尝试基础语言代码
    const baseLang = fullBrowserLang.split('-')[0];
    return this.isLanguageSupported(baseLang) ? (baseLang as SupportedLanguage) : 'en';
  },

  /**
   * Format message with interpolation
   */
  formatMessage(key: string, values?: Record<string, any>): string {
    return i18n.t(key, values) as string;
  },

  /**
   * Check if translation exists
   */
  exists(key: string): boolean {
    return i18n.exists(key);
  },

  /**
   * Get all translations for current language
   */
  getAllTranslations(): Record<string, any> {
    return i18n.getResourceBundle(i18n.language, 'translation') || {};
  },

  /**
   * Format number based on locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  },

  /**
   * Format date based on locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(i18n.language, options).format(date);
  },

  /**
   * Get text direction for current language
   */
  getTextDirection(): 'ltr' | 'rtl' {
    // For now, all supported languages are LTR
    return 'ltr';
  }
};

// Helper functions for backward compatibility
export const getLanguageName = (code: string): string => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.nativeName || code;
};

export const changeLanguageCompat = (lng: string): Promise<any> => {
  return i18n.changeLanguage(lng);
};

// Type-safe translation function
export const t = (key: string, options?: any): string => {
  const result = i18n.t(key, options);
  return typeof result === 'string' ? result : String(result);
};

// Helper function to change language
export const changeLanguage = (lng: string): Promise<any> => {
  return i18n.changeLanguage(lng);
};