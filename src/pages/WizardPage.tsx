import React, { useState } from 'react';
import { Step1_PlatformChoice } from '@/components/wizard/Step1_PlatformChoice';
import { Step2_HardwareSelection } from '@/components/wizard/Step2_HardwareSelection';
import { Step3_KextSelection } from '@/components/wizard/Step3_KextSelection';
import { Step4_Finalize } from '@/components/wizard/Step4_Finalize';
import { WizardState } from '@/types';
// import { motion, AnimatePresence } from 'framer-motion';
import { createEfiPackage, FileProgressInfo } from '@/lib/package/packager';
import DownloadProgressModal from '@/components/DownloadProgressModal';

const WizardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileProgressInfo[]>([]);

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
    setFileProgress([]);
    setShowDownloadModal(true);

    try {
      await createEfiPackage(
        wizardState, 
        (message, percentage) => {
          setProgressMessage(message);
          setProgress(percentage);
        },
        (files, overallMessage, overallPercentage) => {
          setFileProgress([...files]);
          setProgressMessage(overallMessage);
          setProgress(overallPercentage);
        }
      );
      
      // Keep modal open for a moment to show completion
      setTimeout(() => {
        setShowDownloadModal(false);
        setIsDownloading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create EFI package:', error);
      setProgressMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setProgress(100);
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      setTimeout(() => {
        setShowDownloadModal(false);
        setIsDownloading(false);
      }, 3000);
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
      case 4:
        return (
          <Step4_Finalize 
            wizardState={wizardState}
            onDownload={handleDownload}
            onBack={handleBack}
            isDownloading={isDownloading}
            progress={progress}
            progressMessage={progressMessage}
          />
        );
      default:
        return <div>未知步骤</div>;
    }
  };

  return (
    <div className="container mx-auto py-8 sm:py-12 lg:py-16">
      {renderStep()}
      
      <DownloadProgressModal
        isOpen={showDownloadModal}
        files={fileProgress}
        title="EFI 包生成进度"
        onClose={() => {
          if (!isDownloading) {
            setShowDownloadModal(false);
          }
        }}
      />
    </div>
  );
};

export default WizardPage;
