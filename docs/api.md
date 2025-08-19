# OpenCore Initializer API 设计文档

## 概述

本文档描述了 OpenCore Initializer 应用的数据结构、接口设计和前端 API 规范。由于这是一个纯前端应用，所有的 API 都是客户端 JavaScript 函数和类型定义。

## 核心数据类型

### 1. 硬件配置类型

```typescript
// CPU 配置
interface CPUConfig {
  brand: 'Intel' | 'AMD';
  series: string;
  model: string;
  architecture: 'x86_64' | 'arm64';
  cores: number;
  threads: number;
  igpu?: string; // 集成显卡型号
}

// 主板配置
interface MotherboardConfig {
  brand: string;
  model: string;
  chipset: string;
  socket: string;
  formFactor: 'ATX' | 'mATX' | 'ITX';
  biosType: 'UEFI' | 'Legacy';
  ethernet?: EthernetConfig;
  wifi?: WifiConfig;
  audio?: AudioConfig;
}

// 显卡配置
interface GPUConfig {
  type: 'integrated' | 'discrete' | 'both';
  primary?: {
    brand: 'NVIDIA' | 'AMD' | 'Intel';
    model: string;
    vram: number;
  };
  secondary?: {
    brand: 'NVIDIA' | 'AMD' | 'Intel';
    model: string;
    vram: number;
  };
}

// 网络配置
interface EthernetConfig {
  chipset: string;
  speed: '100M' | '1G' | '2.5G' | '10G';
}

interface WifiConfig {
  chipset: string;
  standard: 'WiFi4' | 'WiFi5' | 'WiFi6' | 'WiFi6E' | 'WiFi7';
  bluetooth?: string;
}

// 音频配置
interface AudioConfig {
  codec: string;
  layout: number;
}
```

### 2. OpenCore 配置类型

```typescript
// OpenCore 主配置
interface OpenCoreConfig {
  version: string;
  acpi: ACPIConfig;
  booter: BooterConfig;
  deviceProperties: DevicePropertiesConfig;
  kernel: KernelConfig;
  misc: MiscConfig;
  nvram: NVRAMConfig;
  platformInfo: PlatformInfoConfig;
  uefi: UEFIConfig;
}

// ACPI 配置
interface ACPIConfig {
  add: ACPITable[];
  delete: ACPIDelete[];
  patch: ACPIPatch[];
  quirks: ACPIQuirks;
}

interface ACPITable {
  comment: string;
  enabled: boolean;
  path: string;
}

interface ACPIPatch {
  comment: string;
  count: number;
  enabled: boolean;
  find: string;
  limit: number;
  mask: string;
  oem: string;
  replace: string;
  replaceAll: boolean;
  skip: number;
  tableLength: number;
  tableSignature: string;
}

// Kernel 配置
interface KernelConfig {
  add: KextConfig[];
  block: KextBlock[];
  emulate: KernelEmulate;
  force: KextForce[];
  patch: KernelPatch[];
  quirks: KernelQuirks;
  scheme: KernelScheme;
}

interface KextConfig {
  arch: string;
  bundlePath: string;
  comment: string;
  enabled: boolean;
  executablePath: string;
  maxKernel: string;
  minKernel: string;
  plistPath: string;
}
```

### 3. 用户配置状态

```typescript
// 应用状态
interface AppState {
  currentStep: ConfigStep;
  hardware: HardwareConfig;
  opencore: Partial<OpenCoreConfig>;
  preferences: UserPreferences;
  generation: GenerationState;
}

// 配置步骤
type ConfigStep = 
  | 'hardware-selection'
  | 'opencore-version'
  | 'acpi-configuration'
  | 'kernel-configuration'
  | 'platform-info'
  | 'misc-settings'
  | 'review-generate';

// 硬件配置汇总
interface HardwareConfig {
  cpu: CPUConfig;
  motherboard: MotherboardConfig;
  gpu: GPUConfig;
  ram: RAMConfig;
  storage: StorageConfig[];
}

// 用户偏好设置
interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  expertMode: boolean;
  autoSave: boolean;
}

// 生成状态
interface GenerationState {
  status: 'idle' | 'configuring' | 'confirming' | 'downloading' | 'packaging' | 'success' | 'error';
  progress: number;
  message?: string;
  downloadUrl?: string;
  currentStep?: GenerationStep;
}

// 生成步骤
type GenerationStep = 
  | 'preparing'
  | 'downloading-opencore'
  | 'downloading-kexts'
  | 'downloading-acpi'
  | 'validating-files'
  | 'generating-config'
  | 'packaging-zip'
  | 'packaging-iso'
  | 'completed';

// 配置摘要
interface ConfigurationSummary {
  hardware: HardwareConfig;
  opencore: OpenCoreConfig;
  downloadList: DownloadItem[];
  estimatedSize: number;
  warnings: ValidationWarning[];
  recommendations: string[];
}

// 下载项目
interface DownloadItem {
  id: string;
  name: string;
  description: string;
  version: string;
  size: number;
  url: string;
  checksum: string;
  required: boolean;
  category: 'opencore' | 'kext' | 'acpi' | 'tool' | 'driver';
}

// 下载状态
interface DownloadStatus {
  itemId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  downloadedSize: number;
  totalSize: number;
  error?: string;
}
```

## 核心 API 函数

### 1. 硬件检测 API

```typescript
// 硬件检测服务
class HardwareDetectionService {
  /**
   * 检测 CPU 信息
   */
  static async detectCPU(): Promise<Partial<CPUConfig>> {
    // 通过 navigator.userAgent 和其他 Web API 检测
  }

  /**
   * 获取推荐的硬件配置
   */
  static getRecommendedConfig(cpu: CPUConfig): HardwareConfig {
    // 基于 CPU 推荐兼容的硬件配置
  }

  /**
   * 验证硬件兼容性
   */
  static validateCompatibility(config: HardwareConfig): ValidationResult {
    // 检查硬件配置的兼容性
  }
}

interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
}
```

### 2. OpenCore 配置生成 API

```typescript
// OpenCore 配置生成器
class OpenCoreGenerator {
  /**
   * 根据硬件配置生成 OpenCore 配置
   */
  static generateConfig(hardware: HardwareConfig): OpenCoreConfig {
    // 生成完整的 OpenCore 配置
  }

  /**
   * 生成 ACPI 配置
   */
  static generateACPIConfig(hardware: HardwareConfig): ACPIConfig {
    // 根据硬件生成 ACPI 配置
  }

  /**
   * 生成 Kernel 配置
   */
  static generateKernelConfig(hardware: HardwareConfig): KernelConfig {
    // 根据硬件生成 Kernel 配置和 Kext 列表
  }

  /**
   * 生成平台信息
   */
  static generatePlatformInfo(cpu: CPUConfig): PlatformInfoConfig {
    // 生成 SMBIOS 平台信息
  }
}
```

### 3. 配置确认和摘要 API

```typescript
// 配置摘要服务
class ConfigurationSummaryService {
  /**
   * 生成配置摘要
   */
  static generateSummary(
    hardware: HardwareConfig,
    opencore: OpenCoreConfig
  ): ConfigurationSummary {
    // 生成完整的配置摘要
  }

  /**
   * 生成下载清单
   */
  static generateDownloadList(
    config: OpenCoreConfig,
    hardware: HardwareConfig
  ): DownloadItem[] {
    // 根据配置生成需要下载的文件清单
  }

  /**
   * 计算总下载大小
   */
  static calculateTotalSize(downloadList: DownloadItem[]): number {
    // 计算所有文件的总大小
  }

  /**
   * 验证配置兼容性
   */
  static validateConfiguration(
    hardware: HardwareConfig,
    opencore: OpenCoreConfig
  ): ValidationResult {
    // 最终的兼容性检查
  }
}
```

### 4. 文件下载管理 API

```typescript
// 下载管理服务
class DownloadManagerService {
  /**
   * 开始批量下载
   */
  static async startBatchDownload(
    downloadList: DownloadItem[],
    onProgress: (status: DownloadStatus[]) => void
  ): Promise<Map<string, Uint8Array>> {
    // 批量下载所有文件
  }

  /**
   * 下载单个文件
   */
  static async downloadFile(
    item: DownloadItem,
    onProgress: (progress: number) => void
  ): Promise<Uint8Array> {
    // 下载单个文件并验证
  }

  /**
   * 验证文件完整性
   */
  static async verifyFile(
    data: Uint8Array,
    expectedChecksum: string
  ): Promise<boolean> {
    // 验证文件的校验和
  }

  /**
   * 重试失败的下载
   */
  static async retryFailedDownloads(
    failedItems: DownloadItem[]
  ): Promise<Map<string, Uint8Array>> {
    // 重试下载失败的文件
  }
}
```

### 5. 文件生成和打包 API

```typescript
// 文件生成服务
class FileGenerationService {
  /**
   * 生成 config.plist 文件
   */
  static generateConfigPlist(config: OpenCoreConfig): string {
    // 将配置对象转换为 plist XML 格式
  }

  /**
   * 生成完整的 EFI 文件结构
   */
  static async generateEFIStructure(
    config: OpenCoreConfig,
    downloadedFiles: Map<string, Uint8Array>
  ): Promise<EFIStructure> {
    // 使用下载的文件生成完整的 EFI 文件夹结构
  }

  /**
   * 打包为 ZIP 文件
   */
  static async packageAsZip(
    efiStructure: EFIStructure,
    options: PackagingOptions
  ): Promise<Blob> {
    // 使用 JSZip 打包文件
  }

  /**
   * 生成 ISO 镜像
   */
  static async generateISO(
    efiStructure: EFIStructure,
    options: ISOOptions
  ): Promise<Blob> {
    // 生成可引导的 ISO 镜像
  }
}

// EFI 文件结构
interface EFIStructure {
  'EFI/BOOT/BOOTx64.efi': Uint8Array;
  'EFI/OC/OpenCore.efi': Uint8Array;
  'EFI/OC/config.plist': string;
  'EFI/OC/Drivers/': { [filename: string]: Uint8Array };
  'EFI/OC/Kexts/': { [kextName: string]: KextBundle };
  'EFI/OC/ACPI/': { [filename: string]: Uint8Array };
  'EFI/OC/Tools/': { [filename: string]: Uint8Array };
}

interface PackagingOptions {
  includeTools: boolean;
  includeDocumentation: boolean;
  compressionLevel: number;
}

interface ISOOptions extends PackagingOptions {
  volumeLabel: string;
  bootable: boolean;
}
```

### 4. 模板和预设 API

```typescript
// 模板管理服务
class TemplateService {
  /**
   * 获取可用的配置模板
   */
  static getAvailableTemplates(): ConfigTemplate[] {
    // 返回预定义的配置模板
  }

  /**
   * 根据硬件推荐模板
   */
  static getRecommendedTemplate(hardware: HardwareConfig): ConfigTemplate {
    // 推荐最适合的配置模板
  }

  /**
   * 应用模板到当前配置
   */
  static applyTemplate(
    template: ConfigTemplate,
    currentConfig: Partial<OpenCoreConfig>
  ): OpenCoreConfig {
    // 将模板应用到当前配置
  }
}

interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  category: 'desktop' | 'laptop' | 'server';
  targetHardware: HardwareRequirement[];
  config: Partial<OpenCoreConfig>;
  kexts: string[];
  acpiTables: string[];
}
```

### 5. 国际化 API

```typescript
// 国际化服务
class I18nService {
  /**
   * 获取支持的语言列表
   */
  static getSupportedLanguages(): Language[] {
    // 返回支持的语言列表
  }

  /**
   * 切换语言
   */
  static async changeLanguage(languageCode: string): Promise<void> {
    // 切换应用语言
  }

  /**
   * 获取本地化文本
   */
  static t(key: string, params?: Record<string, any>): string {
    // 获取翻译文本
  }
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}
```

## 状态管理 API

### Zustand Store 定义

```typescript
// 主应用状态
interface AppStore {
  // 状态
  currentStep: ConfigStep;
  hardware: HardwareConfig;
  opencore: Partial<OpenCoreConfig>;
  preferences: UserPreferences;
  generation: GenerationState;
  configurationSummary?: ConfigurationSummary;
  downloadStatus: Map<string, DownloadStatus>;
  downloadedFiles: Map<string, Uint8Array>;
  
  // 操作
  setCurrentStep: (step: ConfigStep) => void;
  updateHardware: (hardware: Partial<HardwareConfig>) => void;
  updateOpenCoreConfig: (config: Partial<OpenCoreConfig>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // 配置确认相关
  generateConfigurationSummary: () => Promise<void>;
  confirmConfiguration: () => Promise<void>;
  
  // 下载相关
  startDownload: () => Promise<void>;
  updateDownloadStatus: (itemId: string, status: DownloadStatus) => void;
  retryFailedDownloads: () => Promise<void>;
  
  // 打包相关
  startPackaging: (format: 'zip' | 'iso') => Promise<void>;
  resetConfiguration: () => void;
  
  // 计算属性
  isConfigurationValid: () => boolean;
  getConfigurationSummary: () => ConfigurationSummary | null;
  getTotalDownloadProgress: () => number;
  getFailedDownloads: () => DownloadItem[];
}

// 创建状态存储
const useAppStore = create<AppStore>((set, get) => ({
  // 实现状态和操作
}));
```

## 错误处理

```typescript
// 错误类型定义
type AppError = 
  | HardwareError
  | ConfigurationError
  | GenerationError
  | NetworkError;

interface HardwareError {
  type: 'hardware';
  code: 'UNSUPPORTED_CPU' | 'INCOMPATIBLE_GPU' | 'MISSING_HARDWARE_INFO';
  message: string;
  details?: any;
}

interface ConfigurationError {
  type: 'configuration';
  code: 'INVALID_CONFIG' | 'MISSING_REQUIRED_FIELD' | 'VALIDATION_FAILED';
  message: string;
  field?: string;
}

// 错误处理服务
class ErrorHandler {
  static handle(error: AppError): void {
    // 统一错误处理逻辑
  }
  
  static getErrorMessage(error: AppError, language: string): string {
    // 获取本地化错误消息
  }
}
```

## 性能监控 API

```typescript
// 性能监控服务
class PerformanceMonitor {
  /**
   * 记录操作耗时
   */
  static measureTime<T>(operation: string, fn: () => T): T {
    // 测量函数执行时间
  }

  /**
   * 记录内存使用情况
   */
  static recordMemoryUsage(): MemoryInfo {
    // 记录当前内存使用情况
  }

  /**
   * 获取性能报告
   */
  static getPerformanceReport(): PerformanceReport {
    // 生成性能报告
  }
}
```

## 缓存 API

```typescript
// 缓存服务
class CacheService {
  /**
   * 缓存配置
   */
  static saveConfiguration(config: AppState): void {
    // 保存配置到本地存储
  }

  /**
   * 加载缓存的配置
   */
  static loadConfiguration(): AppState | null {
    // 从本地存储加载配置
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    // 清除所有缓存数据
  }
}
```

## 总结

本 API 设计文档定义了 OpenCore Initializer 应用的完整数据结构和接口规范。通过类型安全的 TypeScript 定义和清晰的 API 设计，确保了代码的可维护性和开发效率。所有的 API 都是客户端实现，支持离线使用和快速响应。