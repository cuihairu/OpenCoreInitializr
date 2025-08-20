import React, { useState } from 'react';
import { Step1_PlatformChoice } from '@/components/wizard/Step1_PlatformChoice';
import { Step2_HardwareSelection } from '@/components/wizard/Step2_HardwareSelection';
import Step3 from '@/components/wizard/Step3_KextSelection';
import { Step4_Finalize } from '@/components/wizard/Step4_Finalize';
import { WizardState } from '@/types';
// import { motion, AnimatePresence } from 'framer-motion';
import { createEfiPackage, FileProgressInfo } from '@/lib/package/packager';
import DownloadProgressModal from '@/components/DownloadProgressModal';
import TaskProgressModal, { TaskStep, createDefaultTasks } from '@/components/TaskProgressModal';

const WizardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileProgressInfo[]>([]);
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>(createDefaultTasks());
  const [currentTaskId, setCurrentTaskId] = useState<string>('');

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

  const updateTaskStatus = (taskId: string, status: TaskStep['status'], progress?: number, error?: string) => {
    setTaskSteps(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, progress, error }
        : task
    ));
    if (status === 'in_progress') {
      setCurrentTaskId(taskId);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgressMessage('正在开始...');
    setProgress(0);
    setFileProgress([]);
    setShowTaskModal(true);
    setTaskSteps(createDefaultTasks());
    setCurrentTaskId('');

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
          
          // Update task progress based on overall progress
          const taskProgress = Math.floor(overallPercentage / 16.67); // 6 tasks, so each is ~16.67%
          const currentTaskIndex = Math.min(Math.floor(overallPercentage / 16.67), 5);
          const taskIds = ['download-config', 'customize-config', 'download-kexts', 'apply-patches', 'package-efi', 'generate-zip'];
          
          // Mark completed tasks
          for (let i = 0; i < currentTaskIndex; i++) {
            updateTaskStatus(taskIds[i], 'completed');
          }
          
          // Update current task
          if (currentTaskIndex < taskIds.length) {
            const currentProgress = (overallPercentage % 16.67) * 6; // Convert to 0-100 for current task
            updateTaskStatus(taskIds[currentTaskIndex], 'in_progress', currentProgress);
          }
        }
      );
      
      // Mark all tasks as completed
      const taskIds = ['download-config', 'customize-config', 'download-kexts', 'apply-patches', 'package-efi', 'generate-zip'];
      taskIds.forEach(id => updateTaskStatus(id, 'completed'));
      
      // Keep modal open for a moment to show completion
      setTimeout(() => {
        setShowTaskModal(false);
        setShowDownloadModal(false);
        setIsDownloading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create EFI package:', error);
      setProgressMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setProgress(100);
      
      // Mark current task as error
      if (currentTaskId) {
        updateTaskStatus(currentTaskId, 'error', undefined, error instanceof Error ? error.message : '未知错误');
      }
      
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      setTimeout(() => {
        setShowTaskModal(false);
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
        return <Step3 hardware={wizardState.hardware} onComplete={handleKextComplete} onBack={handleBack} />;
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
      
      <TaskProgressModal
        isOpen={showTaskModal}
        tasks={taskSteps}
        overallProgress={progress}
        currentTask={currentTaskId}
        title="OpenCore EFI 生成进度"
        onClose={() => {
          if (!isDownloading) {
            setShowTaskModal(false);
          }
        }}
      />
      
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
