import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/Progress';
import { cn } from '../lib/utils';

export interface FileDownloadProgress {
  name: string;
  loaded: number;
  total: number | null;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

interface DownloadProgressModalProps {
  isOpen: boolean;
  files: FileDownloadProgress[];
  onClose?: () => void;
  title?: string;
}

const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  isOpen,
  files,
  onClose,
  title = '下载进度'
}) => {
  if (!isOpen) return null;

  const completedFiles = files.filter(f => f.status === 'completed').length;
  const totalFiles = files.length;
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  const getStatusIcon = (status: FileDownloadProgress['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'downloading':
        return (
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        );
      case 'completed':
        return (
          <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileProgress = (file: FileDownloadProgress) => {
    if (file.status === 'completed') return 100;
    if (file.status === 'error' || file.status === 'pending') return 0;
    if (!file.total) return 0;
    return (file.loaded / file.total) * 100;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[80vh] mx-4 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                总体进度 ({completedFiles}/{totalFiles})
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress 
              value={overallProgress} 
              variant={overallProgress === 100 ? 'success' : 'default'}
              size="md"
            />
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-96">
          <div className="space-y-4">
            {files.map((file, index) => {
              const progress = getFileProgress(file);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <div className="font-medium text-sm truncate max-w-xs" title={file.name}>
                          {file.name}
                        </div>
                        {file.status === 'error' && file.error && (
                          <div className="text-xs text-red-600 mt-1">
                            {file.error}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-500">
                      {file.status === 'downloading' && file.total && (
                        <div>
                          {formatFileSize(file.loaded)} / {formatFileSize(file.total)}
                        </div>
                      )}
                      {file.status === 'completed' && file.total && (
                        <div className="text-green-600">
                          {formatFileSize(file.total)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {file.status === 'downloading' && (
                    <Progress 
                      value={progress}
                      variant="default"
                      size="sm"
                      className="mt-2"
                    />
                  )}
                  
                  {file.status === 'completed' && (
                    <Progress 
                      value={100}
                      variant="success"
                      size="sm"
                      className="mt-2"
                    />
                  )}
                  
                  {file.status === 'error' && (
                    <Progress 
                      value={0}
                      variant="error"
                      size="sm"
                      className="mt-2"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadProgressModal;
export type { DownloadProgressModalProps };