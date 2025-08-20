import React, { useState } from 'react';
import { Step1_PlatformChoice } from '@/components/wizard/Step1_PlatformChoice';
import { Step2_HardwareSelection } from '@/components/wizard/Step2_HardwareSelection';
import { Step3_KextSelection } from '@/components/wizard/Step3_KextSelection';
import { Step4_Finalize } from '@/components/wizard/Step4_Finalize';
import { WizardState } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { createEfiPackage } from '@/lib/package/packager';

const WizardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handlePlatformSelect = (platform: 'intel' | 'amd') => {
    setWizardState({ platform });
    setStep(2);
  };

  const handleHardwareComplete = (hardware: WizardState['hardware']) => {
    setWizardState(prev => ({ ...prev, hardware }));
    setStep(3);
  };

  const handleKextComplete = (kexts: WizardState['kexts']) => {
    setWizardState(prev => ({ ...prev, kexts }));
    setStep(4);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgressMessage('正在开始...');
    setProgress(0);

    try {
      await createEfiPackage(wizardState, (message, percentage) => {
        setProgressMessage(message);
        setProgress(percentage);
      });
    } catch (error) {
      console.error('Failed to create EFI package:', error);
      setProgressMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setProgress(100);
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    setStep(prevStep => Math.max(1, prevStep - 1));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_PlatformChoice onSelect={handlePlatformSelect} />;
      case 2:
        if (!wizardState.platform) return <div>请先返回第一步选择平台</div>;
        return <Step2_HardwareSelection platform={wizardState.platform} onComplete={handleHardwareComplete} onBack={handleBack} />;
      case 3:
        if (!wizardState.hardware) return <div>请先返回第二步选择硬件</div>;
        return <Step3_KextSelection hardware={wizardState.hardware} onComplete={handleKextComplete} onBack={handleBack} />;
      // Return null for other steps to isolate the issue
      case 4:
      default:
        return <div>Step 3 is OK. The problem is in the final step.</div>;
    }
  };

  return (
    <div className="container mx-auto py-8 sm:py-12 lg:py-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WizardPage;
