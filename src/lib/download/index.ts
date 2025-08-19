import { DownloadItem, DownloadStatus, GeneratedFile, PackageOptions, HardwareConfig, OpenCoreConfig } from '../../types';
import { formatFileSize, formatDuration, calculateETA, generateId } from '../utils';

/**
 * Download Manager for handling file downloads
 */
export class DownloadManager {
  private downloads: Map<string, DownloadItem> = new Map();
  private statusCallbacks: Map<string, (status: DownloadStatus) => void> = new Map();

  /**
   * Create a new download item
   */
  createDownload(item: {
    id: string;
    name: string;
    version: string;
    url: string;
    size: number;
    type: 'opencore' | 'kext' | 'tool' | 'driver' | 'acpi';
    description: string;
    required: boolean;
    category: string;
  }): DownloadItem {
    const downloadItem: DownloadItem = {
      ...item,
      progress: 0,
      downloadedSize: 0,
      speed: 0,
      eta: 0,
      status: 'pending'
    };

    this.downloads.set(item.id, downloadItem);
    return downloadItem;
  }

  /**
   * Start downloading an item
   */
  async startDownload(itemId: string): Promise<void> {
    const item = this.downloads.get(itemId);
    if (!item) {
      throw new Error(`Download item ${itemId} not found`);
    }

    item.status = 'downloading';
    const startTime = Date.now();

    try {
      // Simulate download progress
      for (let progress = 0; progress <= 100; progress += 10) {
        item.progress = progress;
        item.downloadedSize = Math.floor((progress / 100) * item.size);
        
        const elapsed = Date.now() - startTime;
        if (elapsed > 0 && progress > 0) {
          item.speed = (item.downloadedSize || 0) / (elapsed / 1000);
          item.eta = calculateETA(item.downloadedSize || 0, item.size, item.speed);
        }

        // Notify status callback
        const callback = this.statusCallbacks.get(itemId);
        if (callback) {
          callback({
            itemId,
            status: 'downloading',
            progress,
            downloadedBytes: item.downloadedSize || 0,
            totalBytes: item.size,
            speed: item.speed,
            startTime
          });
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      item.status = 'completed';
      item.completedAt = Date.now();
    } catch (error) {
      item.status = 'error';
      item.error = error instanceof Error ? error.message : 'Download failed';
      item.failedAt = Date.now();
    }
  }

  /**
   * Get download status
   */
  getDownloadStatus(itemId: string): DownloadItem | undefined {
    return this.downloads.get(itemId);
  }

  /**
   * Register status callback
   */
  onStatusChange(itemId: string, callback: (status: DownloadStatus) => void): void {
    this.statusCallbacks.set(itemId, callback);
  }

  /**
   * Get all downloads
   */
  getAllDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values());
  }

  /**
   * Clear completed downloads
   */
  clearCompleted(): void {
    for (const [id, item] of this.downloads.entries()) {
      if (item.status === 'completed') {
        this.downloads.delete(id);
        this.statusCallbacks.delete(id);
      }
    }
  }
}

/**
 * Package Builder for creating ZIP packages
 */
export class PackageBuilder {
  private files: GeneratedFile[] = [];

  /**
   * Add file to package
   */
  addFile(file: GeneratedFile): void {
    this.files.push(file);
  }

  /**
   * Add multiple files to package
   */
  addFiles(files: GeneratedFile[]): void {
    this.files.push(...files);
  }

  /**
   * Build ZIP package
   */
  async buildZip(name: string): Promise<Blob> {
    // In a real implementation, this would use a ZIP library like JSZip
    // For now, we'll create a simple blob
    const content = this.files.map(file => `${file.path}: ${file.content}`).join('\n');
    return new Blob([content], { type: 'application/zip' });
  }

  /**
   * Get total package size
   */
  getTotalSize(): number {
    return this.files.reduce((total, file) => {
      if (typeof file.content === 'string') {
        return total + new Blob([file.content]).size;
      } else {
        return total + file.content.byteLength;
      }
    }, 0);
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files = [];
  }

  /**
   * Get file list
   */
  getFiles(): GeneratedFile[] {
    return [...this.files];
  }
}

/**
 * OpenCore Package Generator
 */
export class OpenCorePackageGenerator {
  private packageBuilder = new PackageBuilder();

  /**
   * Generate OpenCore EFI package
   */
  async generatePackage(
    hardwareConfig: HardwareConfig,
    openCoreConfig: OpenCoreConfig,
    selectedKexts: string[],
    selectedTools: string[],
    selectedDrivers: string[],
    options: PackageOptions
  ): Promise<Blob> {
    this.packageBuilder.clear();

    // Add OpenCore files
    this.addOpenCoreFiles(openCoreConfig);

    // Add Kexts
    this.addKextFiles(selectedKexts);

    // Add Tools
    if (options.includeTools) {
      this.addToolFiles(selectedTools);
    }

    // Add Drivers
    this.addDriverFiles(selectedDrivers);

    // Add ACPI files
    this.addACPIFiles(hardwareConfig);

    // Add documentation
    if (options.includeDocumentation) {
      this.addDocumentationFiles(hardwareConfig, openCoreConfig);
    }

    // Build package
    const packageName = options.customName || `OpenCore-${openCoreConfig.version}-${Date.now()}`;
    return await this.packageBuilder.buildZip(packageName);
  }

  private addOpenCoreFiles(config: OpenCoreConfig): void {
    // Add OpenCore bootloader
    this.packageBuilder.addFile({
      path: 'EFI/BOOT/BOOTx64.efi',
      content: 'OpenCore Bootloader Binary',
      type: 'text'
    });

    this.packageBuilder.addFile({
      path: 'EFI/OC/OpenCore.efi',
      content: 'OpenCore Main Binary',
      type: 'text'
    });

    // Add config.plist
    this.packageBuilder.addFile({
      path: 'EFI/OC/config.plist',
      content: JSON.stringify(config, null, 2),
      type: 'text'
    });
  }

  private addKextFiles(kexts: string[]): void {
    kexts.forEach(kext => {
      this.packageBuilder.addFile({
        path: `EFI/OC/Kexts/${kext}.kext/Contents/Info.plist`,
        content: `Kext Info for ${kext}`,
        type: 'text'
      });
    });
  }

  private addToolFiles(tools: string[]): void {
    tools.forEach(tool => {
      this.packageBuilder.addFile({
        path: `EFI/OC/Tools/${tool}.efi`,
        content: `Tool Binary for ${tool}`,
        type: 'text'
      });
    });
  }

  private addDriverFiles(drivers: string[]): void {
    drivers.forEach(driver => {
      this.packageBuilder.addFile({
        path: `EFI/OC/Drivers/${driver}.efi`,
        content: `Driver Binary for ${driver}`,
        type: 'text'
      });
    });
  }

  private addACPIFiles(hardwareConfig: HardwareConfig): void {
    // Add common ACPI files based on hardware
    const acpiFiles = this.getRequiredACPIFiles(hardwareConfig);
    
    acpiFiles.forEach(file => {
      this.packageBuilder.addFile({
        path: `EFI/OC/ACPI/${file}`,
        content: `ACPI Table: ${file}`,
        type: 'text'
      });
    });
  }

  private addDocumentationFiles(hardwareConfig: HardwareConfig, openCoreConfig: OpenCoreConfig): void {
    // Add README
    this.packageBuilder.addFile({
      path: 'README.md',
      content: this.generateReadme(hardwareConfig, openCoreConfig),
      type: 'text'
    });

    // Add configuration guide
    this.packageBuilder.addFile({
      path: 'CONFIGURATION.md',
      content: this.generateConfigurationGuide(hardwareConfig),
      type: 'text'
    });
  }

  private getRequiredACPIFiles(hardwareConfig: HardwareConfig): string[] {
    const files: string[] = [];

    // Common ACPI files
    files.push('SSDT-PLUG.aml');
    files.push('SSDT-EC-USBX.aml');

    // CPU specific
    if (hardwareConfig.cpu.brand === 'AMD') {
      files.push('SSDT-CPUR.aml');
    }

    // GPU specific
    if (hardwareConfig.gpu.discrete?.brand === 'NVIDIA') {
      files.push('SSDT-DGPU.aml');
    }

    return files;
  }

  private generateReadme(hardwareConfig: HardwareConfig, openCoreConfig: OpenCoreConfig): string {
    return `# OpenCore EFI Package

## Hardware Configuration
- CPU: ${hardwareConfig.cpu.brand} ${hardwareConfig.cpu.model || 'Unknown'}
- GPU: ${hardwareConfig.gpu.integrated?.model || 'Unknown'}
- Motherboard: ${hardwareConfig.motherboard.brand} ${hardwareConfig.motherboard.model}
- Memory: ${hardwareConfig.memory.size}GB ${hardwareConfig.memory.type}

## OpenCore Version
${openCoreConfig.version}

## Installation Instructions
1. Copy the EFI folder to your USB drive's EFI partition
2. Boot from the USB drive
3. Follow the macOS installation process

## Important Notes
- This configuration is generated automatically
- Please review and test thoroughly before use
- Backup your existing EFI before replacing
`;
  }

  private generateConfigurationGuide(hardwareConfig: HardwareConfig): string {
    return `# Configuration Guide

## Hardware Specific Settings

### CPU Configuration
- Brand: ${hardwareConfig.cpu.brand}
- Architecture: ${hardwareConfig.cpu.architecture}

### Memory Configuration
- Size: ${hardwareConfig.memory.size}GB
- Type: ${hardwareConfig.memory.type}

### Storage Configuration
- Type: ${hardwareConfig.storage.type}
- Drives: ${hardwareConfig.storage.drives.length}

## Troubleshooting

If you encounter issues, please check:
1. BIOS settings are correct
2. All required kexts are present
3. Config.plist syntax is valid
`;
  }
}

// Export utilities
export const downloadUtils = {
  /**
   * Download OpenCore package
   */
  async downloadOpenCorePackage(
    hardwareConfig: HardwareConfig,
    openCoreConfig: OpenCoreConfig,
    selectedKexts: string[],
    selectedTools: string[],
    selectedDrivers: string[],
    options: PackageOptions = {
      format: 'zip',
      includeDocumentation: true,
      includeTools: true
    }
  ): Promise<Blob> {
    const generator = new OpenCorePackageGenerator();
    return await generator.generatePackage(
      hardwareConfig,
      openCoreConfig,
      selectedKexts,
      selectedTools,
      selectedDrivers,
      options
    );
  },

  /**
   * Create download manager instance
   */
  createDownloadManager(): DownloadManager {
    return new DownloadManager();
  },

  /**
   * Create package builder instance
   */
  createPackageBuilder(): PackageBuilder {
    return new PackageBuilder();
  }
};

// Export default instances
export const downloadManager = new DownloadManager();
export const packageBuilder = new PackageBuilder();