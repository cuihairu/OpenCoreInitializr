import { useTranslation } from '@/hooks/useTranslation';
import { LocalizedText as LocalizedTextType } from '@/types/driver-support';
import { i18nUtils } from '@/lib/i18n';

interface LocalizedTextProps {
  text: LocalizedTextType | string | undefined;
}

// Export a standalone getText function for backward compatibility
export const getText = (text: LocalizedTextType | string | undefined, lang?: keyof LocalizedTextType): string => {
  // If lang is provided (old API), use it for backward compatibility
  if (lang) {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.en;
  }
  
  // Use the optimized global version
  return i18nUtils.getText(text);
};

export const LocalizedText: React.FC<LocalizedTextProps> = ({ text }) => {
  const { getText } = useTranslation();

  if (!text) {
    return null;
  }

  if (typeof text === 'string') {
    return <>{text}</>;
  }

  return <>{getText(text)}</>;
};
