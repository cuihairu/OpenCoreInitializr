import { useTranslation as useI18nTranslation } from 'react-i18next';
import { i18nUtils, SupportedLanguage } from '../lib/i18n';

/**
 * Custom hook for translations with additional utilities
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    i18n,
    currentLanguage: i18nUtils.getCurrentLanguage(),
    changeLanguage: i18nUtils.changeLanguage,
    getLanguageInfo: i18nUtils.getLanguageInfo,
    formatNumber: i18nUtils.formatNumber,
    formatDate: i18nUtils.formatDate,
    getTextDirection: i18nUtils.getTextDirection,
    exists: i18nUtils.exists,
    getText: i18nUtils.getText,
  };
};

/**
 * Hook for language switching
 */
export const useLanguage = () => {
  const { i18n } = useI18nTranslation();

  const changeLanguage = async (language: SupportedLanguage) => {
    await i18nUtils.changeLanguage(language);
  };

  return {
    currentLanguage: i18nUtils.getCurrentLanguage(),
    changeLanguage,
    isLanguageSupported: i18nUtils.isLanguageSupported,
    getLanguageInfo: i18nUtils.getLanguageInfo,
    getBrowserLanguage: i18nUtils.getBrowserLanguage,
  };
};

/**
 * Hook for formatting utilities
 */
export const useFormatting = () => {
  return {
    formatNumber: i18nUtils.formatNumber,
    formatDate: i18nUtils.formatDate,
    getTextDirection: i18nUtils.getTextDirection,
  };
};

export default useTranslation;