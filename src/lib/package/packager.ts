import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { WizardState } from '../../types';
import { downloadAndCustomizeConfigPlist } from '@/lib/config';
import { downloadFiles, DownloadableFile } from '@/lib/download/manager';
import { DriverSupportService } from '@/lib/services/driver-support';

export type ProgressCallback = (message: string, percentage: number) => void;

export interface FileProgressInfo {
  name: string;
  loaded: number;
  total: number | null;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  error?: string;
}

export type DetailedProgressCallback = (files: FileProgressInfo[], overallMessage: string, overallPercentage: number) => void;

/**
 * Creates the complete EFI package as a ZIP file.
 * 
 * @param state The final state from the wizard.
 * @param onProgress Optional callback to report overall progress.
 * @param onDetailedProgress Optional callback to report detailed file progress.
 */
export const createEfiPackage = async (
  state: WizardState, 
  onProgress?: ProgressCallback,
  onDetailedProgress?: DetailedProgressCallback
) => {
  if (!state.kexts) {
    throw new Error('Kext selection is missing.');
  }

  const zip = new JSZip();
  const efiFolder = zip.folder('EFI');
  const ocFolder = efiFolder!.folder('OC');

  // --- Step 1: Generate and download config.plist ---
  onProgress?.('正在从 OpenCore 官方仓库下载配置模板...', 10);
  
  // Download and customize the official Sample.plist based on wizard state
  const configPlistContent = await downloadAndCustomizeConfigPlist(state);
  ocFolder!.file('config.plist', configPlistContent);

  // --- Step 2: Determine files to download ---
  onProgress?.('正在准备下载文件...', 25);
  const filesToDownload: DownloadableFile[] = [];
  const driverSupportService = DriverSupportService.getInstance();
  const allKexts = driverSupportService.searchDrivers({}).drivers;

  state.kexts.forEach(kextId => {
    const kextData = allKexts.find(k => k.id === kextId);
    // FIXME: The `downloadUrl` is not available on `kextData`. This needs to be resolved.
    const downloadUrl = (kextData as any).downloadUrl || (kextData as any).assetUrl; // Temporary fix
    if (kextData && downloadUrl) {
      filesToDownload.push({ name: `${kextData.id}.zip`, url: downloadUrl });
    } else {
        console.warn(`No assetUrl found for ${kextId}. Skipping.`);
    }
  });
  
  // TODO: Add ACPI files from motherboard_data.json to the download list.

  // --- Step 3: Download files ---
  onProgress?.('正在下载驱动文件...', 40);
  
  if (filesToDownload.length === 0) {
    console.warn('No files to download. Proceeding with config-only package.');
  } else {
    console.log(`Attempting to download ${filesToDownload.length} files:`, filesToDownload.map(f => f.name));
  }
  
  let downloadedFiles: any[] = [];
  
  // Initialize file progress tracking
  const fileProgressMap = new Map<string, FileProgressInfo>();
  filesToDownload.forEach(file => {
    fileProgressMap.set(file.name, {
      name: file.name,
      loaded: 0,
      total: null,
      status: 'pending'
    });
  });
  
  const updateDetailedProgress = (message: string, percentage: number) => {
    if (onDetailedProgress) {
      const fileProgressArray = Array.from(fileProgressMap.values());
      onDetailedProgress(fileProgressArray, message, percentage);
    }
  };
  
  // Initial progress update
  updateDetailedProgress('正在准备下载...', 40);
  
  try {
    downloadedFiles = await downloadFiles(filesToDownload, (progress) => {
      // Update individual file progress
      const fileProgress = fileProgressMap.get(progress.file);
      if (fileProgress) {
        fileProgress.loaded = progress.loaded;
        fileProgress.total = progress.total;
        fileProgress.status = 'downloading';
        fileProgressMap.set(progress.file, fileProgress);
        
        // Calculate overall download progress
        const completedFiles = Array.from(fileProgressMap.values()).filter(f => f.status === 'completed').length;
        const downloadingFiles = Array.from(fileProgressMap.values()).filter(f => f.status === 'downloading').length;
        const totalFiles = filesToDownload.length;
        
        let overallProgress = 40; // Base progress
        if (totalFiles > 0) {
          const fileProgress = (completedFiles + downloadingFiles * 0.5) / totalFiles;
          overallProgress = 40 + (fileProgress * 35); // 40-75% range for downloads
        }
        
        onProgress?.(`正在下载 ${progress.file}...`, overallProgress);
        updateDetailedProgress(`正在下载 ${progress.file}...`, overallProgress);
      }
    });
    
    // Mark all files as completed
    filesToDownload.forEach(file => {
      const fileProgress = fileProgressMap.get(file.name);
      if (fileProgress) {
        fileProgress.status = 'completed';
        fileProgressMap.set(file.name, fileProgress);
      }
    });
    
    updateDetailedProgress('下载完成', 75);
    
  } catch (error) {
    console.error('Download failed:', error);
    
    // Mark failed files
    filesToDownload.forEach(file => {
      const fileProgress = fileProgressMap.get(file.name);
      if (fileProgress && fileProgress.status !== 'completed') {
        fileProgress.status = 'error';
        fileProgress.error = error instanceof Error ? error.message : 'Download failed';
        fileProgressMap.set(file.name, fileProgress);
      }
    });
    
    updateDetailedProgress('部分下载失败，继续创建配置包...', 75);
    
    // For now, continue with config-only package if downloads fail
    console.warn('Continuing with config-only package due to download failures.');
    downloadedFiles = [];
  }

  // --- Step 4: Add downloaded files to ZIP ---
  onProgress?.('正在打包文件...', 75);
  const kextsFolder = ocFolder!.folder('Kexts');
  
  if (downloadedFiles.length > 0) {
    // SIMPLIFICATION: We are currently adding the downloaded ZIPs directly.
    // A full implementation would unzip these in memory and place the .kext directory.
    downloadedFiles.forEach(file => {
      kextsFolder!.file(file.name, file.content);
    });
    console.log(`Added ${downloadedFiles.length} kext files to package.`);
  } else {
    // Add a README file explaining that kexts need to be downloaded manually
    kextsFolder!.file('README.txt', 
      'Kext files could not be downloaded automatically.\n' +
      'Please download the required kexts manually and place them in this folder.\n\n' +
      'Required kexts for your configuration:\n' +
      filesToDownload.map(f => `- ${f.name}: ${f.url}`).join('\n')
    );
    console.log('Added README with manual download instructions.');
  }

  // TODO: Add ACPI files to an ACPI folder.

  // --- Step 5: Generate final ZIP and trigger download ---
  onProgress?.('正在完成...', 95);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  const packageType = downloadedFiles.length > 0 ? '完整' : '配置';
  onProgress?.(`${packageType}包创建完成！`, 100);
  
  const filename = downloadedFiles.length > 0 ? 'OpenCore-EFI-Complete.zip' : 'OpenCore-EFI-Config.zip';
  saveAs(zipBlob, filename);
  
  if (downloadedFiles.length === 0) {
    console.log('Package created with config only. Kexts need to be downloaded manually.');
  }
};
