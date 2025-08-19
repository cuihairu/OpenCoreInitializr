import React, { useState, useEffect } from 'react';
import { versionManager, versionUtils, OpenCoreVersion, VersionInfo } from '../lib/version/manager';
import { HardwareConfig } from '../types';

interface VersionSelectorProps {
  selectedVersion?: string;
  onVersionChange: (version: string) => void;
  hardwareConfig?: HardwareConfig;
  className?: string;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
  selectedVersion,
  onVersionChange,
  hardwareConfig,
  className = ''
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllVersions, setShowAllVersions] = useState(false);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await versionManager.getVersionInfo();
      setVersionInfo(info);
      
      // 如果没有选中版本，自动选择推荐版本
      if (!selectedVersion && info.versions.length > 0) {
        const recommended = info.versions.find(v => v.isRecommended) || info.stable;
        onVersionChange(recommended.version);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载版本信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version: string) => {
    onVersionChange(version);
  };

  const getVersionBadge = (version: OpenCoreVersion) => {
    const label = versionUtils.getVersionLabel(version);
    const badgeClass = {
      '推荐': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      '稳定': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      '预发布': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      '开发版': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }[label] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
    );
  };

  const getCompatibilityIndicator = (version: OpenCoreVersion) => {
    if (!hardwareConfig) return null;
    
    const isCompatible = versionManager.isVersionCompatible(version.version, hardwareConfig);
    
    return (
      <div className={`flex items-center text-sm ${
        isCompatible 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-yellow-600 dark:text-yellow-400'
      }`}>
        <svg 
          className={`w-4 h-4 mr-1 ${
            isCompatible ? 'text-green-500' : 'text-yellow-500'
          }`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          {isCompatible ? (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          )}
        </svg>
        {isCompatible ? '兼容' : '可能不兼容'}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">加载版本信息失败</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={loadVersionInfo}
          className="mt-3 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!versionInfo) {
    return null;
  }

  const displayVersions = showAllVersions 
    ? versionInfo.versions 
    : versionInfo.versions.slice(0, 5);

  return (
    <div className={className}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          OpenCore 版本
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          选择适合您硬件配置的 OpenCore 版本
        </p>
      </div>

      <div className="space-y-3">
        {displayVersions.map((version) => {
          const isSelected = selectedVersion === version.version;
          
          return (
            <div
              key={version.version}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
              onClick={() => handleVersionSelect(version.version)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="opencore-version"
                        checked={isSelected}
                        onChange={() => handleVersionSelect(version.version)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {versionUtils.formatVersion(version.version)}
                      </span>
                    </div>
                    {getVersionBadge(version)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span>
                      发布日期: {versionUtils.formatReleaseDate(version.releaseDate)}
                    </span>
                    <span>
                      大小: {versionUtils.formatFileSize(version.size)}
                    </span>
                  </div>
                  
                  {getCompatibilityIndicator(version)}
                  
                  {version.changelog && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {version.changelog.split('\n')[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {versionInfo.versions.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAllVersions(!showAllVersions)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showAllVersions ? '显示较少版本' : `显示全部 ${versionInfo.versions.length} 个版本`}
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            最后更新: {versionUtils.formatReleaseDate(versionInfo.lastUpdated)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VersionSelector;