import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info } from 'lucide-react';
import { KextsVersionInfo } from '../components/KextsVersionInfo';
import { Alert, AlertDescription } from '@/components/ui/alert';

const KextsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('kexts.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {t('kexts.description')}
        </p>
      </div>

      {/* 使用提示 */}
      <div className="mb-8 space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('kexts.usage_tips')}：</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• <strong>{t('kexts.tip_required')}：</strong>{t('kexts.tip_required_desc')}</li>
              <li>• <strong>{t('kexts.tip_recommended')}：</strong>{t('kexts.tip_recommended_desc')}</li>
              <li>• <strong>{t('kexts.tip_optional')}：</strong>{t('kexts.tip_optional_desc')}</li>
              <li>• <strong>{t('kexts.tip_dependencies')}：</strong>{t('kexts.tip_dependencies_desc')}</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('kexts.warning_title')}：</strong>
            {t('kexts.warning_desc')}
          </AlertDescription>
        </Alert>
      </div>

      {/* Kexts 版本信息组件 */}
      <KextsVersionInfo />
    </div>
  );
};

export default KextsPage;