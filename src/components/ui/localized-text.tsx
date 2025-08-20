import { useTranslation } from '@/hooks/useTranslation';
import { LocalizedText as LocalizedTextType } from '@/types/driver-support';

interface LocalizedTextProps {
  text: LocalizedTextType | string | undefined;
}

export const getText = (text: LocalizedTextType | string | undefined, lang: 'zh' | 'en'): string => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.en;
};

export const LocalizedText: React.FC<LocalizedTextProps> = ({ text }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en';

  if (!text) {
    return null;
  }

  if (typeof text === 'string') {
    return <>{text}</>;
  }

  return <>{text[lang] || text.en}</>;
};
