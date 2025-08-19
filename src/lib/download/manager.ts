import { DownloadItem, DownloadStatus } from '../../types';

/**
 * 下载管理器类
 * 负责管理文件下载、进度跟踪和错误处理
 */
export class DownloadManager {
  private downloads: Map<string, DownloadStatus> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (status: DownloadStatus) => void> = new Map();

  /**
   * 开始下载文件
   */
  async downloadFile(
    item: DownloadItem,
    onProgress?: (status: DownloadStatus) => void
  ): Promise<Uint8Array> {
    const { id, url, size } = item;
    
    // 创建下载状态
    const status: DownloadStatus = {
      itemId: id,
      status: 'downloading',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: size,
      startTime: Date.now()
    };

    this.downloads.set(id, status);
    if (onProgress) {
      this.progressCallbacks.set(id, onProgress);
    }

    // 创建取消控制器
    const abortController = new AbortController();
    this.abortControllers.set(id, abortController);

    try {
      const response = await fetch(url, {
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const chunks: Uint8Array[] = [];
      let downloadedBytes = 0;
      const totalBytes = parseInt(response.headers.get('content-length') || '0') || size;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        downloadedBytes += value.length;
        
        // 更新进度
        const progress = Math.round((downloadedBytes / totalBytes) * 100);
        const currentTime = Date.now();
        const elapsedTime = (currentTime - status.startTime!) / 1000;
        const speed = downloadedBytes / elapsedTime;
        
        const updatedStatus: DownloadStatus = {
          ...status,
          progress,
          downloadedBytes,
          totalBytes,
          speed
        };
        
        this.downloads.set(id, updatedStatus);
        
        // 调用进度回调
        const callback = this.progressCallbacks.get(id);
        if (callback) {
          callback(updatedStatus);
        }
      }

      // 合并所有块
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      // 标记完成
      const completedStatus: DownloadStatus = {
        ...status,
        status: 'completed',
        progress: 100,
        downloadedBytes: totalLength,
        totalBytes: totalLength,
        endTime: Date.now()
      };
      
      this.downloads.set(id, completedStatus);
      
      const callback = this.progressCallbacks.get(id);
      if (callback) {
        callback(completedStatus);
      }

      return result;
      
    } catch (error) {
      const errorStatus: DownloadStatus = {
        ...status,
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误',
        endTime: Date.now()
      };
      
      this.downloads.set(id, errorStatus);
      
      const callback = this.progressCallbacks.get(id);
      if (callback) {
        callback(errorStatus);
      }
      
      throw error;
    } finally {
      // 清理资源
      this.abortControllers.delete(id);
      this.progressCallbacks.delete(id);
    }
  }

  /**
   * 取消下载
   */
  cancelDownload(itemId: string): void {
    const controller = this.abortControllers.get(itemId);
    if (controller) {
      controller.abort();
      
      const status = this.downloads.get(itemId);
      if (status) {
        this.downloads.set(itemId, {
          ...status,
          status: 'error',
          error: '用户取消下载',
          endTime: Date.now()
        });
      }
    }
  }

  /**
   * 获取下载状态
   */
  getDownloadStatus(itemId: string): DownloadStatus | undefined {
    return this.downloads.get(itemId);
  }

  /**
   * 获取所有下载状态
   */
  getAllDownloadStatus(): DownloadStatus[] {
    return Array.from(this.downloads.values());
  }

  /**
   * 清理已完成的下载
   */
  clearCompleted(): void {
    for (const [id, status] of this.downloads.entries()) {
      if (status.status === 'completed') {
        this.downloads.delete(id);
      }
    }
  }

  /**
   * 批量下载文件
   */
  async downloadMultiple(
    items: DownloadItem[],
    onProgress?: (overall: { completed: number; total: number; progress: number }) => void,
    concurrency: number = 3
  ): Promise<Map<string, Uint8Array>> {
    const results = new Map<string, Uint8Array>();
    const errors: string[] = [];
    let completed = 0;

    const updateOverallProgress = () => {
      if (onProgress) {
        onProgress({
          completed,
          total: items.length,
          progress: Math.round((completed / items.length) * 100)
        });
      }
    };

    // 分批处理下载
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      
      const promises = batch.map(async (item) => {
        try {
          const data = await this.downloadFile(item);
          results.set(item.id, data);
          completed++;
          updateOverallProgress();
        } catch (error) {
          errors.push(`${item.name}: ${error instanceof Error ? error.message : '未知错误'}`);
          completed++;
          updateOverallProgress();
        }
      });

      await Promise.all(promises);
    }

    if (errors.length > 0) {
      throw new Error(`部分文件下载失败:\n${errors.join('\n')}`);
    }

    return results;
  }
}

// 创建全局下载管理器实例
export const downloadManager = new DownloadManager();

/**
 * 下载工具函数
 */
export const downloadUtils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  },

  /**
   * 格式化下载速度
   */
  formatSpeed(bytesPerSecond: number): string {
    return `${this.formatFileSize(bytesPerSecond)}/s`;
  },

  /**
   * 格式化剩余时间
   */
  formatETA(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}分钟`;
    } else {
      return `${Math.round(seconds / 3600)}小时`;
    }
  },

  /**
   * 计算剩余时间
   */
  calculateETA(downloadedBytes: number, totalBytes: number, speed: number): number {
    const remainingBytes = totalBytes - downloadedBytes;
    return speed > 0 ? remainingBytes / speed : 0;
  },

  /**
   * 验证文件校验和
   */
  async validateChecksum(data: Uint8Array, expectedChecksum: string, algorithm: string = 'sha256'): Promise<boolean> {
    try {
      const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.toLowerCase() === expectedChecksum.toLowerCase();
    } catch (error) {
      console.error('校验和验证失败:', error);
      return false;
    }
  }
};