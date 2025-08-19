import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadStatus, DownloadItem } from '../types';
import { downloadManager, downloadUtils } from '../lib/download/manager';

interface DownloadProgressProps {
  downloadItems: DownloadItem[];
  onComplete: (downloadedFiles: { [key: string]: Blob }) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  downloadItems,
  onComplete,
  onError,
  onCancel
}) => {
  const { t } = useTranslation();
  const [downloadStatuses, setDownloadStatuses] = useState<{ [key: string]: DownloadStatus }>({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState<{ [key: string]: Blob }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    startDownloads();
    const interval = setInterval(updateProgress, 500);
    
    return () => {
      clearInterval(interval);
      if (!isCompleted && !isCancelled) {
        cancelAllDownloads();
      }
    };
  }, []);

  const startDownloads = async () => {
    try {
      // 开始所有下载
      const downloadPromises = downloadItems.map(async (item) => {
        try {
          const data = await downloadManager.downloadFile(item, (status) => {
            setDownloadStatuses(prev => ({
              ...prev,
              [item.id]: status
            }));
          });
          
          // 将 Uint8Array 转换为 Blob
          const blob = new Blob([data]);
          setDownloadedFiles(prev => ({
            ...prev,
            [item.id]: blob
          }));
          
          return { id: item.id, blob };
        } catch (error) {
          setDownloadStatuses(prev => ({
            ...prev,
            [item.id]: {
              itemId: item.id,
              status: 'error',
              progress: 0,
              downloadedBytes: 0,
              totalBytes: item.size,
              error: error instanceof Error ? error.message : '下载失败'
            }
          }));
          throw error;
        }
      });

      // 等待所有下载完成
      const results = await Promise.all(downloadPromises);
      const filesMap = results.reduce((acc, { id, blob }) => {
        acc[id] = blob;
        return acc;
      }, {} as { [key: string]: Blob });
      
      setIsCompleted(true);
      onComplete(filesMap);
    } catch (error) {
      onError(error instanceof Error ? error.message : '下载过程中发生错误');
    }
  };

  const updateProgress = () => {
    const statusArray = downloadManager.getAllDownloadStatus();
    const statuses = statusArray.reduce((acc, status) => {
      acc[status.itemId] = status;
      return acc;
    }, {} as { [key: string]: DownloadStatus });
    
    setDownloadStatuses(statuses);
    
    // 计算总体进度
    const totalItems = downloadItems.length;
    const completedItems = Object.values(statuses).filter(status => status.status === 'completed').length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    setOverallProgress(progress);
  };

  const cancelAllDownloads = () => {
    downloadItems.forEach(item => {
      downloadManager.cancelDownload(item.id);
    });
    setIsCancelled(true);
  };

  const handleCancel = () => {
    cancelAllDownloads();
    onCancel();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.293 11.793a1 1 0 101.414 1.414L12 10.914l2.293 2.293a1 1 0 001.414-1.414L13.414 9.5l2.293-2.293a1 1 0 00-1.414-1.414L12 8.086 9.707 5.793z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <div className="w-5 h-5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        );
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 总体进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('download.progress_title')}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(overallProgress)}% 完成
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {Object.values(downloadStatuses).filter(s => s.status === 'completed').length} / {downloadItems.length} 文件已完成
          </span>
          <span>
            总大小: {downloadUtils.formatFileSize(downloadItems.reduce((sum, item) => sum + item.size, 0))}
          </span>
        </div>
      </div>

      {/* 详细进度列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            下载详情
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {downloadItems.map((item) => {
            const status = downloadStatuses[item.id] || { 
              itemId: item.id,
              status: 'pending', 
              progress: 0,
              downloadedBytes: 0,
              totalBytes: item.size
            };
            
            return (
              <div key={item.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(status.status)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {downloadUtils.formatFileSize(item.size)}
                    </div>
                    {status.speed && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {downloadUtils.formatSpeed(status.speed)}
                      </div>
                    )}
                  </div>
                </div>
                
                {status.status === 'downloading' && (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.status)}`}
                        style={{ width: `${status.progress || 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>
                        {downloadUtils.formatFileSize(status.downloadedBytes || 0)} / {downloadUtils.formatFileSize(status.totalBytes || item.size)}
                      </span>
                      {status.speed && status.totalBytes > status.downloadedBytes && (
                      <span>
                        剩余时间: {downloadUtils.formatETA(downloadUtils.calculateETA(status.downloadedBytes, status.totalBytes, status.speed))}
                      </span>
                    )}
                    </div>
                  </>
                )}
                
                {status.status === 'error' && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    错误: {status.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      {!isCompleted && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消下载
          </button>
        </div>
      )}
    </div>
  );
};