/**
 * 驱动支持相关的类型定义
 */

export type LocalizedText = {
  en: string;
  zh: string;
};

// 驱动开发状态
export type DriverDevelopmentStatus = 
  | 'stable'        // 稳定版本
  | 'beta'          // 测试版本
  | 'alpha'         // 开发版本
  | 'deprecated'    // 已弃用
  | 'experimental'  // 实验性
  | 'archived';     // 已归档

export type DevelopmentStatus = 
  | 'active'        // 活跃开发
  | 'stable'        // 稳定版本
  | 'beta'          // 测试版本
  | 'deprecated'    // 已弃用
  | 'archived';     // 已归档

// 驱动优先级
export type DriverPriority = 
  | 'essential'     // 必需
  | 'recommended'   // 推荐
  | 'optional';     // 可选

// 驱动分类
export type DriverCategory = 
  | 'essential'     // 核心驱动
  | 'graphics'      // 显卡驱动
  | 'audio'         // 音频驱动
  | 'network'       // 网络驱动
  | 'bluetooth'     // 蓝牙驱动
  | 'input-devices' // 输入设备
  | 'system'        // 系统
  | 'sensors'       // 传感器
  | 'usb'           // USB
  | 'features';     // MacOS特性

// 硬件支持信息
export interface HardwareSupport {
  /** 硬件品牌 */
  brand: string;
  /** 硬件型号列表 */
  models: string[];
  /** 支持的macOS版本 */
  macosVersions: string[];
  /** 特殊说明 */
  notes?: string;
}

// 驱动兼容性
export type DriverCompatibility = 
  | 'excellent'     // 兼容性优秀
  | 'good'          // 兼容性良好
  | 'fair'          // 兼容性一般
  | 'poor'          // 兼容性差
  | 'unknown';      // 兼容性未知

// 驱动版本信息
export interface DriverVersion {
  /** 版本号 */
  version: string;
  /** 发布日期 */
  releaseDate: string;
  /** 更新日期 */
  lastUpdated: string;
  /** 下载链接 */
  downloadUrl: string;
  /** 文件大小 */
  fileSize: string;
  /** 版本说明 */
  changelog?: string;
  /** 是否为最新版本 */
  isLatest: boolean;
}

export interface GithubInfo {
  /** Github仓库地址 */
  repositoryUrl: string;
  /** Star数量 */
  starCount: number;
  /** Fork数量 */
  forkCount: number;
  /** Open Issue数量 */
  openIssueCount: number;
  /** 最近提交时间 */
  lastCommitDate: string;
}

export interface Tag {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}

// 驱动支持信息
export interface DriverSupportInfo {
  /** 驱动ID */
  id: string;
  /** 驱动名称 */
  name: string | LocalizedText;
  /** 驱动分类 */
  category: DriverCategory;
  /** 驱动描述 */
  description: string | LocalizedText;
  /** 驱动来源 */
  source: string;
  /** 驱动版本 */
  version: DriverVersion;
  /** 开发状态 */
  developmentStatus: DriverDevelopmentStatus;
  /** 兼容性 */
  compatibility: DriverCompatibility;
  /** 是否必需 */
  required?: boolean;
  /** 优先级 */
  priority: DriverPriority;
  /** 依赖项 */
  dependencies?: string[];
  /** Github信息 */
  github?: GithubInfo;
  /** 硬件支持信息 */
  hardwareSupport?: HardwareSupport[];
  /** 备注 */
  notes?: string | LocalizedText;
  /** 标签 */
  tags: (string | LocalizedText)[];
}

// 驱动分类信息
export interface DriverCategoryInfo {
  /** 分类ID */
  id: DriverCategory;
  /** 分类名称 */
  name: LocalizedText;
  /** 分类描述 */
  description: LocalizedText;
  /** 图标 */
  icon: string;
  /** 该分类下的驱动数量 */
  driverCount: number;
}

// 驱动支持数据库
export interface DriverSupportDatabase {
  /** 数据库版本 */
  version: string;
  /** 最后更新时间 */
  lastUpdated: string;
  /** 分类信息 */
  categories: DriverCategoryInfo[];
  /** 驱动支持信息列表 */
  drivers: DriverSupportInfo[];
  /** 标签信息 */
  tags: Tag[];
  /** 元数据 */
  metadata: {
    /** 总驱动数量 */
    totalDrivers: number;
    /** 支持的macOS版本 */
    supportedMacOSVersions: string[];
    /** 数据来源 */
    dataSources: string[];
  };
}

// 搜索过滤器
export interface DriverSearchFilter {
  /** 搜索关键词 */
  keyword?: string;
  /** 分类过滤 */
  categories?: DriverCategory[];
  /** 开发状态过滤 */
  developmentStatus?: DriverDevelopmentStatus[];
  /** 优先级过滤 */
  priority?: DriverPriority[];
  /** 硬件品牌过滤 */
  hardwareBrands?: string[];
  /** macOS版本过滤 */
  macosVersions?: string[];
}

// 搜索结果
export interface DriverSearchResult {
  /** 搜索结果列表 */
  drivers: DriverSupportInfo[];
  /** 总数量 */
  total: number;
  /** 分页信息 */
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  /** 搜索统计 */
  stats: {
    byCategory: Record<DriverCategory, number>;
  };
}