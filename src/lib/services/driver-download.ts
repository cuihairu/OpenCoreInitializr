import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { DriverSupportInfo } from '@/types/driver-support';

export interface DownloadProgress {
  driverId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
  error?: string;
}

export class DriverDownloadService {
  private downloadQueue: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  /**
   * 下载单个驱动
   */
  async downloadDriver(
    driver: DriverSupportInfo,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const driverId = driver.id;
    
    // 如果已经在下载中，则跳过
    if (this.downloadQueue.has(driverId)) {
      return;
    }

    const abortController = new AbortController();
    this.downloadQueue.set(driverId, abortController);
    
    if (onProgress) {
      this.progressCallbacks.set(driverId, onProgress);
    }

    try {
      // 更新进度：开始下载
      this.updateProgress(driverId, {
        driverId,
        progress: 0,
        status: 'downloading'
      });

      // 模拟下载过程（实际项目中这里应该是真实的文件下载）
      await this.simulateDownload(driver, abortController.signal);

      // 生成并下载单个驱动文件
      const zip = new JSZip();
      const driverContent = await this.getDriverContent(driver);
      const folderName = `${driver.name.replace(/[^a-zA-Z0-9]/g, '_')}_${driver.version.version}`;
      
      zip.folder(folderName)?.file('README.md', this.generateDriverReadme(driver));
      zip.folder(folderName)?.file(`${driver.name}.kext`, driverContent);
      
      // 生成并下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      saveAs(zipBlob, `${driver.name}_${driver.version.version}_${timestamp}.zip`);

      // 更新进度：下载完成
      this.updateProgress(driverId, {
        driverId,
        progress: 100,
        status: 'completed'
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // 下载被取消
        this.updateProgress(driverId, {
          driverId,
          progress: 0,
          status: 'paused'
        });
      } else {
        // 下载失败
        this.updateProgress(driverId, {
          driverId,
          progress: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : '下载失败'
        });
      }
    } finally {
      this.downloadQueue.delete(driverId);
      this.progressCallbacks.delete(driverId);
    }
  }

  /**
   * 批量下载驱动
   */
  async downloadDrivers(
    drivers: DriverSupportInfo[],
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const zip = new JSZip();
    const totalDrivers = drivers.length;
    let completedDrivers = 0;

    try {
      // 为每个驱动创建下载任务
      const downloadPromises = drivers.map(async (driver, index) => {
        try {
          // 开始下载该驱动
          if (onProgress) {
            onProgress({
              driverId: driver.id,
              progress: 0,
              status: 'downloading'
            });
          }

          // 模拟下载过程
          await this.simulateDownload(driver, new AbortController().signal);
          
          // 模拟下载驱动文件内容
          const driverContent = await this.getDriverContent(driver);
          
          // 添加到ZIP文件
          const folderName = `${driver.name.replace(/[^a-zA-Z0-9]/g, '_')}_${driver.version.version}`;
          zip.folder(folderName)?.file('README.md', this.generateDriverReadme(driver));
          zip.folder(folderName)?.file(`${driver.name}.kext`, driverContent);
          
          completedDrivers++;
          
          // 更新该驱动的完成状态
          if (onProgress) {
            onProgress({
              driverId: driver.id,
              progress: 100,
              status: 'completed'
            });
          }
          
        } catch (error) {
          console.error(`下载驱动 ${driver.name} 失败:`, error);
          if (onProgress) {
            onProgress({
              driverId: driver.id,
              progress: 0,
              status: 'failed',
              error: error instanceof Error ? error.message : '下载失败'
            });
          }
        }
      });

      await Promise.all(downloadPromises);

      // 生成并下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      saveAs(zipBlob, `OpenCore_Drivers_${timestamp}.zip`);

      // 批量下载完成，不需要额外的batch进度更新

    } catch (error) {
      if (onProgress) {
        onProgress({
          driverId: 'batch',
          progress: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : '批量下载失败'
        });
      }
    }
  }

  /**
   * 暂停下载
   */
  pauseDownload(driverId: string): void {
    const controller = this.downloadQueue.get(driverId);
    if (controller) {
      controller.abort();
    }
  }

  /**
   * 取消所有下载
   */
  cancelAllDownloads(): void {
    this.downloadQueue.forEach(controller => controller.abort());
    this.downloadQueue.clear();
    this.progressCallbacks.clear();
  }

  /**
   * 检查驱动是否正在下载
   */
  isDownloading(driverId: string): boolean {
    return this.downloadQueue.has(driverId);
  }

  /**
   * 模拟下载过程
   */
  private async simulateDownload(driver: DriverSupportInfo, signal: AbortSignal): Promise<void> {
    const totalSteps = 10;
    
    for (let i = 0; i <= totalSteps; i++) {
      if (signal.aborted) {
        throw new Error('Download aborted');
      }
      
      // 模拟下载延迟
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      
      // 更新进度
      this.updateProgress(driver.id, {
        driverId: driver.id,
        progress: Math.round((i / totalSteps) * 100),
        status: 'downloading'
      });
    }
  }

  /**
   * 获取驱动内容（模拟）
   */
  private async getDriverContent(driver: DriverSupportInfo): Promise<string> {
    // 在实际项目中，这里应该从真实的URL下载驱动文件
    // 现在我们返回一个模拟的内容
    return `# ${driver.name}\n\n这是 ${driver.name} 驱动的模拟内容。\n\n版本: ${driver.version.version}\n描述: ${driver.description}\n\n请从官方源下载真实的驱动文件。`;
  }

  /**
   * 生成驱动说明文件
   */
  private generateDriverReadme(driver: DriverSupportInfo): string {
    return `# ${driver.name}

## 描述
${driver.description}

## 版本信息
- 当前版本: ${driver.version.version}
- 最后更新: ${new Date(driver.version.lastUpdated).toLocaleDateString('zh-CN')}

## 开发状态
${driver.developmentStatus}

## 兼容性
${driver.compatibility}

## 优先级
${driver.priority}

## 标签
${driver.tags.join(', ')}

## 链接
${driver.links?.github ? `- GitHub: ${driver.links.github}` : ''}
${driver.links?.website ? `- 官网: ${driver.links.website}` : ''}
${driver.links?.download ? `- 下载: ${driver.links.download}` : ''}

## 注意事项
请确保您的系统满足此驱动的兼容性要求。
建议在安装前备份您的系统。

---
此文件由 OpenCore Initializr 自动生成。
`;
  }

  /**
   * 更新下载进度
   */
  private updateProgress(driverId: string, progress: DownloadProgress): void {
    const callback = this.progressCallbacks.get(driverId);
    if (callback) {
      callback(progress);
    }
  }
}

// 导出单例实例
export const driverDownloadService = new DriverDownloadService();