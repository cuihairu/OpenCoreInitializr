import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HardwareConfig, OpenCoreConfig, DownloadItem, PackageOptions } from '../types';
import { packageService } from '../lib/services/packageService';
import { downloadFiles } from '../lib/download/manager';
import { Button } from './ui/button';

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface ConfigPreviewProps {
  hardwareConfig: HardwareConfig;
  packageOptions: PackageOptions;
  onConfirm: () => void;
  onBack: () => void;
}

interface PreviewData {
  config: OpenCoreConfig;
  downloadItems: DownloadItem[];
  estimatedSize: number;
  fileCount: number;
}

export const ConfigPreview: React.FC<ConfigPreviewProps> = ({
  hardwareConfig,
  packageOptions,
  onConfirm,
  onBack
}) => {
  const { t } = useTranslation();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'files' | 'config'>('summary');

  useEffect(() => {
    loadPreviewData();
  }, [hardwareConfig, packageOptions]);

  const loadPreviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Temporarily use mock data since service is disabled
      const mockData: PreviewData = {
        config: {} as OpenCoreConfig,
        downloadItems: [],
        estimatedSize: 0,
        fileCount: 0
      };
      setPreviewData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载预览数据失败');
    } finally {
      setLoading(false);
    }
  };

  const renderHardwareSummary = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('preview.hardware_summary')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">CPU</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hardwareConfig.cpu.brand} {hardwareConfig.cpu.model}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {hardwareConfig.cpu.architecture} • {hardwareConfig.cpu.generation}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">主板</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hardwareConfig.motherboard.brand} {hardwareConfig.motherboard.model}
            </p>
            {hardwareConfig.motherboard.chipset && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                芯片组: {hardwareConfig.motherboard.chipset}
              </p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">内存</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hardwareConfig.memory.size}GB {hardwareConfig.memory.type}
            </p>
            {hardwareConfig.memory.speed && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {hardwareConfig.memory.speed}MHz
              </p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">存储</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hardwareConfig.storage.type} • {hardwareConfig.storage.drives.length} 个驱动器
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              总容量: {hardwareConfig.storage.drives.reduce((sum, drive) => sum + drive.size, 0)}GB
            </p>
          </div>
          
          {hardwareConfig.gpu.integrated && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">集成显卡</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hardwareConfig.gpu.integrated.brand} {hardwareConfig.gpu.integrated.model}
              </p>
            </div>
          )}
          
          {hardwareConfig.gpu.discrete && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">独立显卡</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hardwareConfig.gpu.discrete.brand} {hardwareConfig.gpu.discrete.model}
              </p>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">音频</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hardwareConfig.audio.codec}
            </p>
            {hardwareConfig.audio.layout && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Layout ID: {hardwareConfig.audio.layout}
              </p>
            )}
          </div>
          
          {hardwareConfig.network.ethernet && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">以太网</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hardwareConfig.network.ethernet.brand} {hardwareConfig.network.ethernet.model}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPackageSummary = () => {
    if (!previewData) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('preview.package_summary')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {previewData.fileCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">文件数量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatFileSize(previewData.estimatedSize)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">估计大小</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {packageOptions.format.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">打包格式</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {previewData.config.version || '1.0.2'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">OpenCore版本</div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {packageOptions.includeDocumentation && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              包含文档
            </span>
          )}
          {packageOptions.includeTools && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              包含工具
            </span>
          )}
          {packageOptions.customName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              自定义名称: {packageOptions.customName}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderFilesList = () => {
    if (!previewData) return null;
    
    const groupedFiles = previewData.downloadItems.reduce((groups, item) => {
      const category = item.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {} as Record<string, DownloadItem[]>);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('preview.files_list')}
        </h3>
        <div className="space-y-6">
          {Object.entries(groupedFiles).map(([category, files]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                {category} ({files.length})
              </h4>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {file.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatFileSize(file.size)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {file.version}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConfigDetails = () => {
    if (!previewData) return null;
    
    const config = previewData.config;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('preview.config_details')}
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">ACPI</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              添加: {config.ACPI.Add.filter(item => item.Enabled).length} 个文件
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              补丁: {config.ACPI.Patch.filter(item => item.Enabled).length} 个
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Kernel</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Kext: {config.Kernel.Add.filter(item => item.Enabled).length} 个
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              补丁: {config.Kernel.Patch.filter(item => item.Enabled).length} 个
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">UEFI</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              驱动: {config.UEFI.Drivers.filter(item => item.Enabled).length} 个
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">工具</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              工具: {config.Misc.Tools.filter(item => item.Enabled).length} 个
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">加载预览数据...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              预览加载失败
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
            <div className="mt-4">
              <Button
                onClick={loadPreviewData}
                variant="outline"
                size="sm"
              >
                重试
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 标签导航 */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'summary', label: '概览' },
            { id: 'files', label: '文件列表' },
            { id: 'config', label: '配置详情' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* 标签内容 */}
      <div className="space-y-6">
        {activeTab === 'summary' && (
          <>
            {renderHardwareSummary()}
            {renderPackageSummary()}
          </>
        )}
        {activeTab === 'files' && renderFilesList()}
        {activeTab === 'config' && renderConfigDetails()}
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
        >
          返回修改
        </Button>
        <Button
          onClick={onConfirm}
        >
          确认并生成
        </Button>
      </div>
    </div>
  );
};