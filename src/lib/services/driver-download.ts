import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { i18nUtils } from '@/lib/i18n';
import type { DriverSupportInfo, LocalizedText } from '@/types/driver-support';
import { downloadFiles } from '@/lib/download/manager';

export interface DownloadProgress {
  driverId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
  error?: string;
}

export class DriverDownloadService {
  private downloadQueue = new Map<string, AbortController>();
  private progressCallbacks = new Map<string, (progress: DownloadProgress) => void>();

  /**
   * Get localized text
   */
  private getText(text: LocalizedText | string | undefined): string {
    return i18nUtils.getText(text);
  }

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

      const downloadUrl = driver.version.downloadUrl;
      if (!downloadUrl) {
        throw new Error(`Driver ${driver.name} has no download URL`);
      }

      // 真实下载
      const results = await downloadFiles(
        [{ name: `${driver.id}.zip`, url: downloadUrl }],
        (progress) => {
          // Calculate percentage based on loaded/total
          let percentage = 0;
          if (progress.total) {
            percentage = Math.round((progress.loaded / progress.total) * 100);
          } else {
            // Fake progress if total is unknown, up to 90%
            percentage = Math.min(90, Math.round(progress.loaded / 1024 / 10)); 
          }
          
          this.updateProgress(driverId, {
            driverId,
            progress: percentage,
            status: 'downloading'
          });
        }
      );

      if (results.length === 0) {
        throw new Error('Download returned no results');
      }

      const downloadedFile = results[0];

      // 生成并下载单个驱动文件
      const zip = new JSZip();
      const folderName = `${this.getText(driver.name).replace(/[^a-zA-Z0-9]/g, '_')}_${driver.version.version}`;
      
      // Add README
      zip.folder(folderName)?.file('README.md', this.generateDriverReadme(driver));
      
      // Extract the downloaded zip and add its contents to our new zip
      // Or just add the downloaded zip file itself if we want to keep it simple
      // For now, let's try to extract if it's a zip, otherwise just add the file
      try {
        const loadedZip = await JSZip.loadAsync(downloadedFile.content);
        const driverFolder = zip.folder(folderName);
        
        // Copy all files from downloaded zip to our new zip structure
        loadedZip.forEach((relativePath, zipEntry) => {
           driverFolder?.file(relativePath, zipEntry.async('arraybuffer'));
        });
      } catch (e) {
        // If not a zip or extraction fails, just add the file as is
        console.warn('Failed to extract downloaded file, adding as is:', e);
        zip.folder(folderName)?.file(`${driver.id}.zip`, downloadedFile.content);
      }
      
      // 生成并下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      saveAs(zipBlob, `${this.getText(driver.name)}_${driver.version.version}_${timestamp}.zip`);

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
        console.error('Download failed:', error);
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
    let completedDrivers = 0;

    try {
      // Prepare files for download manager
      const filesToDownload = drivers.map(d => {
        if (!d.version.downloadUrl) {
           console.warn(`Skipping ${d.id} due to missing download URL`);
           return null;
        }
        return { name: `${d.id}.zip`, url: d.version.downloadUrl };
      }).filter(f => f !== null) as { name: string, url: string }[];

      if (filesToDownload.length === 0) {
        throw new Error('No valid download URLs found');
      }

      // Notify start
      if (onProgress) {
        onProgress({
          driverId: 'batch',
          progress: 0,
          status: 'downloading'
        });
      }

      // Use download manager for parallel downloads
      // We need to track individual progress to update the UI
      // But downloadFiles aggregates progress mostly. 
      // We can wrap the onProgress of downloadFiles to update individual items if needed,
      // but here we are batch downloading to a single ZIP.
      // The UI expects updates for individual drivers though.
      
      // Let's download them one by one or in parallel but tracking each
      // Actually, downloadFiles supports parallel downloads but the callback is global.
      // Let's implement a custom parallel download here to track individual progress
      
      const downloadPromises = drivers.map(async (driver) => {
        if (!driver.version.downloadUrl) return;

        try {
          if (onProgress) {
            onProgress({
              driverId: driver.id,
              progress: 0,
              status: 'downloading'
            });
          }

          const results = await downloadFiles(
            [{ name: `${driver.id}.zip`, url: driver.version.downloadUrl }],
            (progress) => {
               let percentage = 0;
               if (progress.total) {
                 percentage = Math.round((progress.loaded / progress.total) * 100);
               }
               if (onProgress) {
                 onProgress({
                   driverId: driver.id,
                   progress: percentage,
                   status: 'downloading'
                 });
               }
            }
          );
          
          if (results.length > 0) {
             const content = results[0].content;
             const folderName = `${this.getText(driver.name).replace(/[^a-zA-Z0-9]/g, '_')}_${driver.version.version}`;
             
             // Add README
             zip.folder(folderName)?.file('README.md', this.generateDriverReadme(driver));
             
             // Extract and add content
             try {
                const loadedZip = await JSZip.loadAsync(content);
                const driverFolder = zip.folder(folderName);
                loadedZip.forEach((relativePath, zipEntry) => {
                   driverFolder?.file(relativePath, zipEntry.async('arraybuffer'));
                });
             } catch {
                zip.folder(folderName)?.file(`${driver.id}.zip`, content);
             }
             
             completedDrivers++;
             
             if (onProgress) {
                onProgress({
                  driverId: driver.id,
                  progress: 100,
                  status: 'completed'
                });
             }
          }

        } catch (error) {
          console.error(`Failed to download ${driver.name}:`, error);
          if (onProgress) {
            onProgress({
              driverId: driver.id,
              progress: 0,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Failed'
            });
          }
        }
      });

      await Promise.all(downloadPromises);

      if (completedDrivers === 0) {
        throw new Error('All downloads failed');
      }

      // 生成并下载ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      saveAs(zipBlob, `OpenCore_Drivers_${timestamp}.zip`);

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
   * 生成驱动说明文件
   */
  private generateDriverReadme(driver: DriverSupportInfo): string {
    return `# ${this.getText(driver.name)}
    
## 描述
${this.getText(driver.description)}

## 版本信息
- 当前版本: ${driver.version.version}
- 最后更新: ${new Date(driver.version.lastUpdated).toLocaleDateString()}

## 开发状态
${driver.developmentStatus}

## 兼容性
${driver.compatibility}

## 优先级
${driver.priority}

## 链接
- 官方网站: ${driver.source || 'N/A'}

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