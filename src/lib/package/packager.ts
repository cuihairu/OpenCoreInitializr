import { GeneratedFile, PackageOptions, OpenCoreConfig } from '../../types';
import { downloadUtils } from '../download/manager';

/**
 * 文件打包器类
 * 负责将生成的配置文件和下载的资源打包成ZIP或ISO格式
 */
export class FilePackager {
  private files: Map<string, GeneratedFile> = new Map();

  /**
   * 添加文件到打包列表
   */
  addFile(file: GeneratedFile): void {
    this.files.set(file.path, file);
  }

  /**
   * 批量添加文件
   */
  addFiles(files: GeneratedFile[]): void {
    files.forEach(file => this.addFile(file));
  }

  /**
   * 移除文件
   */
  removeFile(path: string): void {
    this.files.delete(path);
  }

  /**
   * 清空所有文件
   */
  clear(): void {
    this.files.clear();
  }

  /**
   * 获取所有文件
   */
  getFiles(): GeneratedFile[] {
    return Array.from(this.files.values());
  }

  /**
   * 创建ZIP包
   */
  async createZip(options: PackageOptions): Promise<Uint8Array> {
    // 动态导入JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // 添加所有文件到ZIP
    for (const file of this.files.values()) {
      if (file.type === 'text') {
        zip.file(file.path, file.content as string);
      } else {
        zip.file(file.path, file.content as Uint8Array);
      }
    }

    // 如果包含文档，添加README
    if (options.includeDocumentation) {
      const readme = this.generateReadme();
      zip.file('README.md', readme);
      
      const installGuide = this.generateInstallGuide();
      zip.file('INSTALL.md', installGuide);
    }

    // 生成ZIP文件
    return await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
  }

  /**
   * 创建ISO镜像（简化版本，实际需要更复杂的ISO生成库）
   */
  async createISO(options: PackageOptions): Promise<Uint8Array> {
    // 注意：这是一个简化的实现
    // 实际的ISO创建需要专门的库，如iso9660-writer
    // 这里我们先创建一个包含所有文件的ZIP，然后转换为ISO格式的数据结构
    
    console.warn('ISO创建功能需要专门的库支持，当前返回ZIP格式');
    return await this.createZip(options);
  }

  /**
   * 根据选项创建包
   */
  async createPackage(options: PackageOptions): Promise<Uint8Array> {
    switch (options.format) {
      case 'zip':
        return await this.createZip(options);
      case 'iso':
        return await this.createISO(options);
      default:
        throw new Error(`不支持的打包格式: ${options.format}`);
    }
  }

  /**
   * 生成README文件
   */
  private generateReadme(): string {
    return `# OpenCore EFI Package

这是由 OpenCore Initializr 生成的 EFI 包。

## 包含内容

- **EFI/**: 完整的 EFI 文件夹结构
  - **BOOT/**: 启动文件
  - **OC/**: OpenCore 核心文件
    - **ACPI/**: ACPI 补丁文件
    - **Drivers/**: UEFI 驱动程序
    - **Kexts/**: 内核扩展
    - **Tools/**: 实用工具
    - **config.plist**: OpenCore 配置文件

## 安装说明

1. 将整个 EFI 文件夹复制到您的 EFI 分区根目录
2. 确保您的 BIOS/UEFI 设置正确
3. 重启计算机并从 OpenCore 启动

## 注意事项

⚠️ **重要提醒**：
- 请在安装前备份原有的 EFI 文件夹
- 确保您的硬件配置与生成的配置匹配
- 建议先在虚拟机中测试

## 支持

如果遇到问题，请参考：
- [OpenCore 官方文档](https://dortania.github.io/OpenCore-Install-Guide/)
- [OpenCore Initializr 项目页面](https://github.com/your-repo/opencore-initializr)

---

生成时间: ${new Date().toLocaleString()}
生成工具: OpenCore Initializr
`;
  }

  /**
   * 生成安装指南
   */
  private generateInstallGuide(): string {
    return `# OpenCore 安装指南

## 准备工作

### 1. 备份现有系统
- 备份重要数据
- 创建系统恢复盘
- 备份现有的 EFI 分区（如果有）

### 2. 检查硬件兼容性
- 确认 CPU 型号和代数
- 检查主板芯片组
- 确认显卡型号
- 检查网卡和声卡型号

## 安装步骤

### 1. 准备 EFI 分区
\`\`\`bash
# 在 macOS 中挂载 EFI 分区
sudo diskutil mount EFI

# 在 Windows 中（以管理员身份运行）
mountvol S: /s
\`\`\`

### 2. 安装 EFI 文件
1. 将生成的 EFI 文件夹复制到 EFI 分区根目录
2. 确保文件结构正确：
   \`\`\`
   EFI/
   ├── BOOT/
   │   └── BOOTx64.efi
   └── OC/
       ├── ACPI/
       ├── Drivers/
       ├── Kexts/
       ├── Tools/
       ├── OpenCore.efi
       └── config.plist
   \`\`\`

### 3. BIOS/UEFI 设置

#### 禁用以下选项：
- Fast Boot
- Secure Boot
- VT-d（如果不需要虚拟化）
- CSM
- Intel SGX
- Intel Platform Trust
- CFG Lock（如果可以禁用）

#### 启用以下选项：
- VT-x
- Above 4G Decoding
- Hyper-Threading
- Execute Disable Bit
- EHCI/XHCI Hand-off
- OS type: Windows 8.1/10 UEFI Mode

### 4. 首次启动
1. 重启计算机
2. 选择从 OpenCore 启动
3. 在 OpenCore 启动菜单中选择 macOS 安装器或已安装的 macOS

## 故障排除

### 常见问题

#### 1. 无法启动到 OpenCore
- 检查 EFI 文件是否正确复制
- 确认 BIOS 设置正确
- 尝试重置 NVRAM

#### 2. 卡在苹果 Logo
- 检查 config.plist 配置
- 确认 Kext 兼容性
- 查看详细启动日志

#### 3. 无法识别硬件
- 检查相关 Kext 是否加载
- 确认硬件 ID 配置
- 更新驱动程序

### 调试工具

在 OpenCore 启动菜单中，您可以使用以下工具：
- **Reset NVRAM**: 重置 NVRAM
- **Verify msrE2**: 检查 CFG Lock 状态
- **Clean Nvram**: 清理 NVRAM

## 更新和维护

### 定期检查
- OpenCore 版本更新
- Kext 驱动更新
- macOS 兼容性

### 备份配置
- 定期备份工作的 EFI 配置
- 记录配置更改
- 保存硬件信息

---

**免责声明**: 本指南仅供参考，安装 Hackintosh 存在风险，请谨慎操作。
`;
  }

  /**
   * 计算包的总大小
   */
  getTotalSize(): number {
    let totalSize = 0;
    for (const file of this.files.values()) {
      if (file.type === 'text') {
        totalSize += new TextEncoder().encode(file.content as string).length;
      } else {
        totalSize += (file.content as Uint8Array).length;
      }
    }
    return totalSize;
  }

  /**
   * 获取文件统计信息
   */
  getStats(): {
    totalFiles: number;
    totalSize: number;
    formattedSize: string;
    fileTypes: Record<string, number>;
  } {
    const totalFiles = this.files.size;
    const totalSize = this.getTotalSize();
    const fileTypes: Record<string, number> = {};

    for (const file of this.files.values()) {
      const ext = file.path.split('.').pop()?.toLowerCase() || 'unknown';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    return {
      totalFiles,
      totalSize,
      formattedSize: downloadUtils.formatFileSize(totalSize),
      fileTypes
    };
  }
}

/**
 * 创建标准的 OpenCore EFI 结构
 */
export function createEFIStructure(
  config: OpenCoreConfig,
  downloadedFiles: Map<string, Uint8Array>
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // 添加 config.plist
  files.push({
    path: 'EFI/OC/config.plist',
    content: JSON.stringify(config, null, 2),
    type: 'text',
    encoding: 'utf-8'
  });

  // 添加 OpenCore.efi（从下载的文件中获取）
  const openCoreEfi = downloadedFiles.get('OpenCore.efi');
  if (openCoreEfi) {
    files.push({
      path: 'EFI/OC/OpenCore.efi',
      content: openCoreEfi,
      type: 'binary'
    });
  }

  // 添加 BOOTx64.efi
  const bootEfi = downloadedFiles.get('BOOTx64.efi');
  if (bootEfi) {
    files.push({
      path: 'EFI/BOOT/BOOTx64.efi',
      content: bootEfi,
      type: 'binary'
    });
  }

  // 添加驱动程序
  config.UEFI.Drivers.forEach(driver => {
    if (driver.Enabled) {
      const driverFile = downloadedFiles.get(driver.Path);
      if (driverFile) {
        files.push({
          path: `EFI/OC/Drivers/${driver.Path}`,
          content: driverFile,
          type: 'binary'
        });
      }
    }
  });

  // 添加 Kext
  config.Kernel.Add.forEach(kext => {
    if (kext.Enabled) {
      const kextFile = downloadedFiles.get(kext.BundlePath);
      if (kextFile) {
        files.push({
          path: `EFI/OC/Kexts/${kext.BundlePath}`,
          content: kextFile,
          type: 'binary'
        });
      }
    }
  });

  // 添加工具
  config.Misc.Tools.forEach(tool => {
    if (tool.Enabled) {
      const toolFile = downloadedFiles.get(tool.Path);
      if (toolFile) {
        files.push({
          path: `EFI/OC/Tools/${tool.Path}`,
          content: toolFile,
          type: 'binary'
        });
      }
    }
  });

  // 添加 ACPI 文件
  config.ACPI.Add.forEach(acpi => {
    if (acpi.Enabled) {
      const acpiFile = downloadedFiles.get(acpi.Path);
      if (acpiFile) {
        files.push({
          path: `EFI/OC/ACPI/${acpi.Path}`,
          content: acpiFile,
          type: 'binary'
        });
      }
    }
  });

  return files;
}

// 创建全局打包器实例
export const filePackager = new FilePackager();