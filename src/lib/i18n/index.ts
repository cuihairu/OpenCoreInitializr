import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language resources
import en from '../../data/locales/en.json';
import zh from '../../data/locales/zh.json';
import ja from '../../data/locales/ja.json';
import ko from '../../data/locales/ko.json';
import es from '../../data/locales/es.json';
import fr from '../../data/locales/fr.json';
import de from '../../data/locales/de.json';
import ru from '../../data/locales/ru.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
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
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Define supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
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

// Utility functions
export const i18nUtils = {
  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return i18n.language as SupportedLanguage;
  },

  /**
   * Change language
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);
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
    const browserLang = navigator.language.split('-')[0];
    return this.isLanguageSupported(browserLang) ? browserLang : 'en';
  },

  /**
   * Format message with interpolation
   */
  formatMessage(key: string, values?: Record<string, any>): string {
    return i18n.t(key, values);
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