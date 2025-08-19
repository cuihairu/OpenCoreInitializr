import { HardwareConfig, OpenCoreConfig, DownloadItem, PackageOptions, GeneratedFile } from '../../types';
import { configUtils } from '../config/generator';
import { DownloadManager } from '../download/manager';
import { FilePackager, createEFIStructure } from '../package/packager';

/**
 * 包服务类
 * 整合配置生成、文件下载和打包功能
 */
export class PackageService {
  private downloadManager: DownloadManager;
  private filePackager: FilePackager;

  constructor() {
    this.downloadManager = new DownloadManager();
    this.filePackager = new FilePackager();
  }

  /**
   * 生成完整的 EFI 包
   */
  async generatePackage(
    hardwareConfig: HardwareConfig,
    packageOptions: PackageOptions,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<Uint8Array> {
    try {
      // 阶段1: 生成配置
      onProgress?.('生成OpenCore配置', 10);
      const openCoreConfig = configUtils.generateOpenCoreConfig(hardwareConfig);
      
      // 阶段2: 准备下载列表
      onProgress?.('准备下载列表', 20);
      const downloadItems = await this.prepareDownloadList(openCoreConfig, packageOptions);
      
      // 阶段3: 下载文件
      onProgress?.('下载文件', 30);
      const downloadedFiles = await this.downloadManager.downloadMultiple(
        downloadItems,
        (overall) => {
          const progressValue = 30 + (overall.progress * 0.4); // 30-70%
          onProgress?.(`下载文件 (${overall.completed}/${overall.total})`, progressValue);
        }
      );
      
      // 阶段4: 创建文件结构
      onProgress?.('创建文件结构', 75);
      const efiFiles = createEFIStructure(openCoreConfig, downloadedFiles);
      
      // 阶段5: 打包文件
      onProgress?.('打包文件', 85);
      this.filePackager.clear();
      this.filePackager.addFiles(efiFiles);
      
      const packageData = await this.filePackager.createPackage(packageOptions);
      
      onProgress?.('完成', 100);
      return packageData;
      
    } catch (error) {
      throw new Error(`包生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 准备下载列表
   */
  private async prepareDownloadList(
    config: OpenCoreConfig,
    options: PackageOptions
  ): Promise<DownloadItem[]> {
    const items: DownloadItem[] = [];
    
    // OpenCore 核心文件
    items.push({
      id: 'opencore-efi',
      name: 'OpenCore.efi',
      version: config.version,
      type: 'opencore',
      url: this.getOpenCoreDownloadUrl(config.version),
      size: 1024 * 1024, // 估计大小 1MB
      description: 'OpenCore 引导程序',
      required: true,
      category: 'core'
    });

    // BOOTx64.efi
    items.push({
      id: 'boot-efi',
      name: 'BOOTx64.efi',
      version: config.version,
      type: 'opencore',
      url: this.getBootEfiDownloadUrl(config.version),
      size: 512 * 1024, // 估计大小 512KB
      description: 'UEFI 启动文件',
      required: true,
      category: 'core'
    });

    // 驱动程序
    for (const driver of config.UEFI.Drivers) {
      if (driver.Enabled) {
        items.push({
          id: `driver-${driver.Path}`,
          name: driver.Path,
          version: 'latest',
          type: 'driver',
          url: this.getDriverDownloadUrl(driver.Path),
          size: 256 * 1024, // 估计大小 256KB
          description: driver.Comment || `UEFI驱动: ${driver.Path}`,
          required: true,
          category: 'drivers'
        });
      }
    }

    // Kext 扩展
    for (const kext of config.Kernel.Add) {
      if (kext.Enabled) {
        items.push({
          id: `kext-${kext.BundlePath}`,
          name: kext.BundlePath,
          version: 'latest',
          type: 'kext',
          url: this.getKextDownloadUrl(kext.BundlePath),
          size: 1024 * 1024, // 估计大小 1MB
          description: kext.Comment || `内核扩展: ${kext.BundlePath}`,
          required: true,
          category: 'kexts'
        });
      }
    }

    // 工具（如果选择包含）
    if (options.includeTools) {
      for (const tool of config.Misc.Tools) {
        if (tool.Enabled) {
          items.push({
            id: `tool-${tool.Path}`,
            name: tool.Path,
            version: 'latest',
            type: 'tool',
            url: this.getToolDownloadUrl(tool.Path),
            size: 512 * 1024, // 估计大小 512KB
            description: tool.Comment || `工具: ${tool.Name}`,
            required: false,
            category: 'tools'
          });
        }
      }
    }

    // ACPI 文件
    for (const acpi of config.ACPI.Add) {
      if (acpi.Enabled) {
        items.push({
          id: `acpi-${acpi.Path}`,
          name: acpi.Path,
          version: 'latest',
          type: 'acpi',
          url: this.getACPIDownloadUrl(acpi.Path),
          size: 64 * 1024, // 估计大小 64KB
          description: acpi.Comment || `ACPI补丁: ${acpi.Path}`,
          required: true,
          category: 'acpi'
        });
      }
    }

    return items;
  }

  /**
   * 获取 OpenCore 下载链接
   */
  private getOpenCoreDownloadUrl(version: string): string {
    // 这里应该从实际的 GitHub API 或其他源获取下载链接
    return `https://github.com/acidanthera/OpenCorePkg/releases/download/${version}/OpenCore-${version}-RELEASE.zip`;
  }

  /**
   * 获取 BOOTx64.efi 下载链接
   */
  private getBootEfiDownloadUrl(version: string): string {
    return `https://github.com/acidanthera/OpenCorePkg/releases/download/${version}/OpenCore-${version}-RELEASE.zip`;
  }

  /**
   * 获取驱动下载链接
   */
  private getDriverDownloadUrl(driverName: string): string {
    // 根据驱动名称返回相应的下载链接
    const driverUrls: Record<string, string> = {
      'HfsPlus.efi': 'https://github.com/acidanthera/OcBinaryData/raw/master/Drivers/HfsPlus.efi',
      'OpenRuntime.efi': 'https://github.com/acidanthera/OpenCorePkg/releases/latest/download/OpenCore-RELEASE.zip',
      'AudioDxe.efi': 'https://github.com/acidanthera/OpenCorePkg/releases/latest/download/OpenCore-RELEASE.zip'
    };
    
    return driverUrls[driverName] || `https://github.com/acidanthera/OcBinaryData/raw/master/Drivers/${driverName}`;
  }

  /**
   * 获取 Kext 下载链接
   */
  private getKextDownloadUrl(kextName: string): string {
    // 根据 Kext 名称返回相应的下载链接
    const kextUrls: Record<string, string> = {
      'Lilu.kext': 'https://github.com/acidanthera/Lilu/releases/latest/download/Lilu-RELEASE.zip',
      'VirtualSMC.kext': 'https://github.com/acidanthera/VirtualSMC/releases/latest/download/VirtualSMC-RELEASE.zip',
      'WhateverGreen.kext': 'https://github.com/acidanthera/WhateverGreen/releases/latest/download/WhateverGreen-RELEASE.zip',
      'AppleALC.kext': 'https://github.com/acidanthera/AppleALC/releases/latest/download/AppleALC-RELEASE.zip',
      'IntelMausi.kext': 'https://github.com/acidanthera/IntelMausi/releases/latest/download/IntelMausi-RELEASE.zip'
    };
    
    return kextUrls[kextName] || `https://github.com/acidanthera/${kextName.replace('.kext', '')}/releases/latest/download/${kextName.replace('.kext', '')}-RELEASE.zip`;
  }

  /**
   * 获取工具下载链接
   */
  private getToolDownloadUrl(toolName: string): string {
    return `https://github.com/acidanthera/OpenCorePkg/releases/latest/download/OpenCore-RELEASE.zip`;
  }

  /**
   * 获取 ACPI 下载链接
   */
  private getACPIDownloadUrl(acpiName: string): string {
    return `https://github.com/dortania/Getting-Started-With-ACPI/raw/master/extra-files/compiled/${acpiName}`;
  }

  /**
   * 获取包预览信息
   */
  async getPackagePreview(
    hardwareConfig: HardwareConfig,
    packageOptions: PackageOptions
  ): Promise<{
    config: OpenCoreConfig;
    downloadItems: DownloadItem[];
    estimatedSize: number;
    fileCount: number;
  }> {
    const config = configUtils.generateOpenCoreConfig(hardwareConfig);
    const downloadItems = await this.prepareDownloadList(config, packageOptions);
    
    const estimatedSize = downloadItems.reduce((total, item) => total + item.size, 0);
    const fileCount = downloadItems.length + 1; // +1 for config.plist
    
    return {
      config,
      downloadItems,
      estimatedSize,
      fileCount
    };
  }

  /**
   * 验证硬件配置
   */
  validateHardwareConfig(config: HardwareConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查必需字段
    if (!config.cpu?.brand) {
      errors.push('CPU 品牌是必需的');
    }
    
    if (!config.motherboard?.chipset) {
      warnings.push('建议指定主板芯片组以获得更好的兼容性');
    }
    
    if (!config.gpu?.integrated && !config.gpu?.discrete) {
      warnings.push('未检测到显卡配置，可能影响显示功能');
    }
    
    if (!config.audio?.codec) {
      warnings.push('未指定音频编解码器，音频功能可能不可用');
    }
    
    if (!config.network?.ethernet) {
      warnings.push('未配置以太网，网络功能可能受限');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取支持的硬件列表
   */
  getSupportedHardware(): {
    cpus: string[];
    chipsets: string[];
    gpus: { integrated: string[]; discrete: string[] };
    audioCodecs: string[];
    ethernetControllers: string[];
  } {
    return {
      cpus: [
        'Intel Core 6th Gen (Skylake)',
        'Intel Core 7th Gen (Kaby Lake)',
        'Intel Core 8th Gen (Coffee Lake)',
        'Intel Core 9th Gen (Coffee Lake Refresh)',
        'Intel Core 10th Gen (Comet Lake)',
        'Intel Core 11th Gen (Rocket Lake)',
        'Intel Core 12th Gen (Alder Lake)',
        'AMD Ryzen 1000 Series',
        'AMD Ryzen 2000 Series',
        'AMD Ryzen 3000 Series',
        'AMD Ryzen 5000 Series'
      ],
      chipsets: [
        'Intel H110', 'Intel B150', 'Intel H170', 'Intel Z170',
        'Intel H270', 'Intel B250', 'Intel Z270',
        'Intel H310', 'Intel B360', 'Intel H370', 'Intel Z370',
        'Intel B365', 'Intel H390', 'Intel Z390',
        'Intel H410', 'Intel B460', 'Intel H470', 'Intel Z490',
        'Intel B560', 'Intel H570', 'Intel Z590',
        'Intel H610', 'Intel B660', 'Intel H670', 'Intel Z690',
        'AMD A320', 'AMD B350', 'AMD X370',
        'AMD A520', 'AMD B450', 'AMD X470',
        'AMD A520', 'AMD B550', 'AMD X570'
      ],
      gpus: {
        integrated: [
          'Intel HD Graphics 530',
          'Intel HD Graphics 630',
          'Intel UHD Graphics 630',
          'Intel UHD Graphics 770',
          'AMD Radeon Vega 8',
          'AMD Radeon Vega 11'
        ],
        discrete: [
          'AMD Radeon RX 580',
          'AMD Radeon RX 6600 XT',
          'AMD Radeon RX 6700 XT',
          'AMD Radeon RX 6800 XT',
          'NVIDIA GTX 1060',
          'NVIDIA GTX 1070',
          'NVIDIA GTX 1080'
        ]
      },
      audioCodecs: [
        'ALC887', 'ALC892', 'ALC897', 'ALC1200',
        'ALC269', 'ALC280', 'ALC298', 'ALC299',
        'ALC4080', 'ALC4082'
      ],
      ethernetControllers: [
        'Intel I219-V', 'Intel I225-V', 'Intel I226-V',
        'Realtek RTL8111', 'Realtek RTL8125',
        'Aquantia AQC107', 'Aquantia AQC113'
      ]
    };
  }
}

// 创建全局包服务实例
export const packageService = new PackageService();