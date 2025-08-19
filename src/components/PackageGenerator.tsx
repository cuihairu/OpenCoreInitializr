import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardwareConfig, PackageOptions, DownloadItem, GenerationStep } from '../types';
import { ConfigPreview } from './ConfigPreview';
import { DownloadProgress } from './DownloadProgress';
import { packageService } from '../lib/services/packageService';
import { FilePackager } from '../lib/package/packager';

interface PackageGeneratorProps {
  hardwareConfig: HardwareConfig;
  packageOptions: PackageOptions;
  onComplete: (packageBlob: Blob, filename: string) => void;
  onError: (error: string) => void;
  onBack: () => void;
}

type GenerationPhase = 'preview' | 'downloading' | 'packaging' | 'completed';

export const PackageGenerator: React.FC<PackageGeneratorProps> = ({
  hardwareConfig,
  packageOptions,
  onComplete,
  onError,
  onBack
}) => {
  const { t } = useTranslation();
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('preview');
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [downloadedFiles, setDownloadedFiles] = useState<{ [key: string]: Blob }>({});
  const [packageProgress, setPackageProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSteps();
  }, []);

  const initializeSteps = () => {
    const steps: GenerationStep[] = [
      {
        id: 'config',
        name: '生成配置',
        description: '根据硬件配置生成 OpenCore 配置文件',
        status: 'pending'
      },
      {
        id: 'download',
        name: '下载文件',
        description: '下载必需的 Kext、驱动和工具',
        status: 'pending'
      },
      {
        id: 'package',
        name: '打包文件',
        description: '将所有文件打包成指定格式',
        status: 'pending'
      },
      {
        id: 'complete',
        name: '完成',
        description: '生成完成，准备下载',
        status: 'pending'
      }
    ];
    setGenerationSteps(steps);
  };

  const updateStepStatus = (stepId: string, status: GenerationStep['status'], progress?: number, error?: string) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, error }
        : step
    ));
  };

  const handleConfirmGeneration = async () => {
    try {
      setCurrentPhase('downloading');
      setError(null);
      
      // 步骤1: 生成配置和下载列表
      updateStepStatus('config', 'in_progress');
      const previewData = await packageService.getPackagePreview(hardwareConfig, packageOptions);
      setDownloadItems(previewData.downloadItems);
      updateStepStatus('config', 'completed');
      
      // 步骤2: 开始下载
      updateStepStatus('download', 'in_progress');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成过程中发生错误';
      setError(errorMessage);
      onError(errorMessage);
      updateStepStatus('config', 'error', undefined, errorMessage);
    }
  };

  const handleDownloadComplete = async (files: { [key: string]: Blob }) => {
    try {
      setDownloadedFiles(files);
      updateStepStatus('download', 'completed');
      
      // 步骤3: 开始打包
      setCurrentPhase('packaging');
      updateStepStatus('package', 'in_progress');
      
      await generatePackage(files);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '下载完成后处理失败';
      setError(errorMessage);
      onError(errorMessage);
      updateStepStatus('download', 'error', undefined, errorMessage);
    }
  };

  const generatePackage = async (files: { [key: string]: Blob }) => {
    try {
      const packager = new FilePackager();
      
      // 生成配置文件
      const previewData = await packageService.getPackagePreview(hardwareConfig, packageOptions);
      const configContent = JSON.stringify(previewData.config, null, 2);
      
      // 添加配置文件
      packager.addFile({
        path: 'EFI/OC/config.plist',
        content: configContent,
        type: 'text'
      });
      
      // 添加下载的文件
      let processedFiles = 0;
      const totalFiles = Object.keys(files).length;
      
      for (const [itemId, blob] of Object.entries(files)) {
        const item = downloadItems.find(item => item.id === itemId);
        if (item) {
          const arrayBuffer = await blob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // 根据文件类型确定路径
          let filePath = '';
          switch (item.type) {
            case 'kext':
              filePath = `EFI/OC/Kexts/${item.name}`;
              break;
            case 'driver':
              filePath = `EFI/OC/Drivers/${item.name}`;
              break;
            case 'tool':
              filePath = `EFI/OC/Tools/${item.name}`;
              break;
            case 'acpi':
              filePath = `EFI/OC/ACPI/${item.name}`;
              break;
            case 'opencore':
              filePath = `EFI/OC/${item.name}`;
              break;
            default:
              filePath = `EFI/OC/Misc/${item.name}`;
          }
          
          packager.addFile({
            path: filePath,
            content: uint8Array,
            type: 'binary'
          });
        }
        
        processedFiles++;
        const progress = (processedFiles / totalFiles) * 80; // 80% for file processing
        setPackageProgress(progress);
        updateStepStatus('package', 'in_progress', progress);
      }
      
      // 添加文档和说明文件
      if (packageOptions.includeDocumentation) {
        // 注意：这些方法是私有的，暂时跳过文档生成
        // 可以在后续版本中添加公共方法来生成文档
      }
      
      setPackageProgress(90);
      updateStepStatus('package', 'in_progress', 90);
      
      // 创建最终包
      const packageData = await packager.createPackage(packageOptions);
      const packageBlob = new Blob([packageData]);
      const filename = packageOptions.customName 
        ? `${packageOptions.customName}.${packageOptions.format}`
        : `OpenCore-${hardwareConfig.cpu.brand}-${Date.now()}.${packageOptions.format}`;
      
      setPackageProgress(100);
      updateStepStatus('package', 'completed');
      updateStepStatus('complete', 'completed');
      
      setCurrentPhase('completed');
      onComplete(packageBlob, filename);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '打包过程中发生错误';
      setError(errorMessage);
      onError(errorMessage);
      updateStepStatus('package', 'error', undefined, errorMessage);
    }
  };

  const handleDownloadError = (errorMessage: string) => {
    setError(errorMessage);
    onError(errorMessage);
    updateStepStatus('download', 'error', undefined, errorMessage);
  };

  const handleDownloadCancel = () => {
    setCurrentPhase('preview');
    updateStepStatus('download', 'pending');
    updateStepStatus('package', 'pending');
    updateStepStatus('complete', 'pending');
  };

  const renderProgressSteps = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          生成进度
        </h3>
        <div className="space-y-4">
          {generationSteps.map((step, index) => {
            const isActive = step.status === 'in_progress';
            const isCompleted = step.status === 'completed';
            const hasError = step.status === 'error';
            
            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    : hasError
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                    : isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : hasError ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : isActive ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    isCompleted 
                      ? 'text-green-900 dark:text-green-100'
                      : hasError
                      ? 'text-red-900 dark:text-red-100'
                      : isActive
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </div>
                  {step.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {step.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPackagingProgress = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            正在打包文件...
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(packageProgress)}%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${packageProgress}%` }}
          ></div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          正在处理文件并创建 {packageOptions.format.toUpperCase()} 包...
        </div>
      </div>
    );
  };

  if (error && currentPhase !== 'preview') {
    return (
      <div className="max-w-4xl mx-auto">
        {renderProgressSteps()}
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                生成失败
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentPhase('preview');
                    initializeSteps();
                  }}
                  className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700"
                >
                  重试
                </button>
                <button
                  onClick={onBack}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  返回
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {currentPhase !== 'preview' && renderProgressSteps()}
      
      {currentPhase === 'preview' && (
        <ConfigPreview
          hardwareConfig={hardwareConfig}
          packageOptions={packageOptions}
          onConfirm={handleConfirmGeneration}
          onBack={onBack}
        />
      )}
      
      {currentPhase === 'downloading' && downloadItems.length > 0 && (
        <DownloadProgress
          downloadItems={downloadItems}
          onComplete={handleDownloadComplete}
          onError={handleDownloadError}
          onCancel={handleDownloadCancel}
        />
      )}
      
      {currentPhase === 'packaging' && renderPackagingProgress()}
      
      {currentPhase === 'completed' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                生成完成！
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                您的 OpenCore 配置包已成功生成。下载将自动开始。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};