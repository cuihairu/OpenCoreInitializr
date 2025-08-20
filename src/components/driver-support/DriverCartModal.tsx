/**
 * 驱动下载清单弹窗组件
 */
import React from 'react';
import { X, Download, Trash2, Play, Pause, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/Progress';
import { useDriverCart, type CartDriverItem, type DownloadStatus } from '@/lib/store/driver-cart';
import { driverDownloadService } from '@/lib/services/driver-download';

interface DriverCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DriverCartModal: React.FC<DriverCartModalProps> = ({ isOpen, onClose }) => {
  const {
    items,
    removeDriver,
    clearCart,
    startDownload,
    pauseDownload,
    resumeDownload,
    startBatchDownload,
    isDownloading,
    getCartCount,
    getDownloadingCount,
    getCompletedCount,
    updateProgress
  } = useDriverCart();

  // 处理单个驱动下载
  const handleDownloadDriver = async (driverId: string) => {
    const item = items.find(item => item.driver.id === driverId);
    if (!item) return;

    startDownload(driverId);
    
    try {
      await driverDownloadService.downloadDriver(item.driver, (progress) => {
        updateProgress(driverId, progress.progress);
        
        if (progress.status === 'completed') {
          // 下载完成后可以选择从购物车中移除
          // removeDriver(driverId);
        } else if (progress.status === 'failed') {
          // 处理下载失败
          console.error('下载失败:', progress.error);
        }
      });
    } catch (error) {
      console.error('下载驱动失败:', error);
    }
  };

  // 处理批量下载
  const handleBatchDownload = async () => {
    const drivers = items.filter(item => item.downloadStatus === 'pending').map(item => item.driver);
    
    // 开始所有待下载驱动的下载状态
    drivers.forEach(driver => startDownload(driver.id));
    
    try {
      await driverDownloadService.downloadDrivers(drivers, (progress) => {
        // 根据状态更新对应驱动
        if (progress.status === 'downloading') {
          updateProgress(progress.driverId, progress.progress);
        } else if (progress.status === 'completed') {
          updateProgress(progress.driverId, 100);
        } else if (progress.status === 'failed') {
          console.error(`驱动 ${progress.driverId} 下载失败:`, progress.error);
          // 这里可以调用setDownloadFailed方法，但需要先添加到useDriverCart的解构中
        }
      });
    } catch (error) {
      console.error('批量下载失败:', error);
    }
  };
  
  if (!isOpen) return null;
  
  const cartCount = getCartCount();
  const downloadingCount = getDownloadingCount();
  const completedCount = getCompletedCount();
  const pendingCount = items.filter(item => item.downloadStatus === 'pending').length;
  
  // 获取状态图标
  const getStatusIcon = (status: DownloadStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'downloading':
        return <Download className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // 获取状态文本
  const getStatusText = (item: CartDriverItem) => {
    switch (item.downloadStatus) {
      case 'pending':
        return '等待下载';
      case 'downloading':
        return `下载中 ${item.downloadProgress}%`;
      case 'completed':
        return '下载完成';
      case 'failed':
        return `下载失败: ${item.error || '未知错误'}`;
      case 'paused':
        return `已暂停 ${item.downloadProgress}%`;
      default:
        return '未知状态';
    }
  };
  
  // 获取状态颜色
  const getStatusColor = (status: DownloadStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'downloading':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">驱动下载清单</h2>
              <p className="text-sm text-gray-500">
                共 {cartCount} 个驱动 • 
                {downloadingCount > 0 && `${downloadingCount} 个下载中 • `}
                {completedCount > 0 && `${completedCount} 个已完成 • `}
                {pendingCount > 0 && `${pendingCount} 个等待中`}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 操作栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBatchDownload}
              disabled={isDownloading || pendingCount === 0}
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? '下载中...' : `开始下载 (${pendingCount})`}
            </Button>
            
            {completedCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {completedCount} 个已完成
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            disabled={isDownloading}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            清空列表
          </Button>
        </div>
        
        {/* 驱动列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>下载清单为空</p>
              <p className="text-sm">在驱动支持页面点击下载按钮添加驱动</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.driver.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{item.driver.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.driver.category}
                          </Badge>
                          <Badge className={getStatusColor(item.downloadStatus)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.downloadStatus)}
                              <span className="text-xs">{getStatusText(item)}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{item.driver.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>版本: {item.driver.version.version}</span>
                          <span>大小: {item.driver.version.fileSize}</span>
                          <span>添加时间: {new Date(item.addedAt).toLocaleString()}</span>
                        </div>
                        
                        {/* 下载进度条 */}
                        {(item.downloadStatus === 'downloading' || item.downloadStatus === 'paused') && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>下载进度</span>
                              <div className="flex items-center gap-2">
                                {item.downloadSpeed && <span>{item.downloadSpeed}</span>}
                                {item.estimatedTime && <span>剩余 {item.estimatedTime}</span>}
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${item.downloadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2 ml-4">
                        {item.downloadStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDriver(item.driver.id)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            开始
                          </Button>
                        )}
                        
                        {item.downloadStatus === 'downloading' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              pauseDownload(item.driver.id);
                              driverDownloadService.pauseDownload(item.driver.id);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Pause className="h-3 w-3" />
                            暂停
                          </Button>
                        )}
                        
                        {item.downloadStatus === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDriver(item.driver.id)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            继续
                          </Button>
                        )}
                        
                        {item.downloadStatus === 'failed' && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDriver(item.driver.id)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            重试
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDriver(item.driver.id)}
                          disabled={item.downloadStatus === 'downloading'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* 底部 */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 animate-pulse" />
                正在下载 {downloadingCount} 个驱动...
              </span>
            ) : completedCount === cartCount && cartCount > 0 ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                所有驱动下载完成
              </span>
            ) : (
              `准备下载 ${pendingCount} 个驱动`
            )}
          </div>
          
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverCartModal;