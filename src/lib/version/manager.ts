/**
 * OpenCore 版本管理器
 * 负责获取、缓存和管理 OpenCore 版本信息
 */

export interface OpenCoreVersion {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  changelog: string;
  isStable: boolean;
  isRecommended: boolean;
  size: number;
  sha256: string;
}

export interface VersionInfo {
  latest: OpenCoreVersion;
  stable: OpenCoreVersion;
  versions: OpenCoreVersion[];
  lastUpdated: string;
}

class VersionManager {
  private cache: VersionInfo | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
  private readonly GITHUB_API_BASE = 'https://api.github.com/repos/acidanthera/OpenCorePkg';

  /**
   * 获取版本信息
   */
  async getVersionInfo(): Promise<VersionInfo> {
    // 检查缓存
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const versions = await this.fetchVersionsFromGitHub();
      const versionInfo: VersionInfo = {
        latest: versions[0],
        stable: versions.find(v => v.isStable) || versions[0],
        versions,
        lastUpdated: new Date().toISOString()
      };

      // 更新缓存
      this.cache = versionInfo;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      return versionInfo;
    } catch (error) {
      console.error('Failed to fetch version info:', error);
      
      // 如果有缓存，返回过期的缓存
      if (this.cache) {
        return this.cache;
      }
      
      // 返回默认版本信息
      return this.getDefaultVersionInfo();
    }
  }

  /**
   * 从 GitHub API 获取版本信息
   */
  private async fetchVersionsFromGitHub(): Promise<OpenCoreVersion[]> {
    const response = await fetch(`${this.GITHUB_API_BASE}/releases`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releases = await response.json();
    const versions: OpenCoreVersion[] = [];

    for (const release of releases.slice(0, 20)) { // 只取最近20个版本
      const version = this.parseGitHubRelease(release);
      if (version) {
        versions.push(version);
      }
    }

    return versions;
  }

  /**
   * 解析 GitHub Release 数据
   */
  private parseGitHubRelease(release: any): OpenCoreVersion | null {
    try {
      const version = release.tag_name;
      const releaseAsset = release.assets.find((asset: any) => 
        asset.name.includes('RELEASE') && asset.name.endsWith('.zip')
      );

      if (!releaseAsset) {
        return null;
      }

      return {
        version,
        releaseDate: release.published_at,
        downloadUrl: releaseAsset.browser_download_url,
        changelog: release.body || '',
        isStable: !release.prerelease,
        isRecommended: !release.prerelease, // 稳定版本为推荐版本
        size: releaseAsset.size,
        sha256: '' // GitHub API 不提供 SHA256，需要从其他地方获取
      };
    } catch (error) {
      console.error('Failed to parse GitHub release:', error);
      return null;
    }
  }

  /**
   * 获取默认版本信息（离线模式）
   */
  private getDefaultVersionInfo(): VersionInfo {
    const defaultVersion: OpenCoreVersion = {
      version: '0.9.7',
      releaseDate: '2023-12-04T00:00:00Z',
      downloadUrl: 'https://github.com/acidanthera/OpenCorePkg/releases/download/0.9.7/OpenCore-0.9.7-RELEASE.zip',
      changelog: 'Default OpenCore version for offline use',
      isStable: true,
      isRecommended: true,
      size: 15728640, // 约15MB
      sha256: ''
    };

    return {
      latest: defaultVersion,
      stable: defaultVersion,
      versions: [defaultVersion],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取特定版本信息
   */
  async getVersion(version: string): Promise<OpenCoreVersion | null> {
    const versionInfo = await this.getVersionInfo();
    return versionInfo.versions.find(v => v.version === version) || null;
  }

  /**
   * 获取推荐版本
   */
  async getRecommendedVersion(): Promise<OpenCoreVersion> {
    const versionInfo = await this.getVersionInfo();
    return versionInfo.versions.find(v => v.isRecommended) || versionInfo.stable;
  }

  /**
   * 检查版本兼容性
   */
  isVersionCompatible(version: string, hardwareConfig: any): boolean {
    // 简单的版本兼容性检查
    const versionNumber = parseFloat(version.replace(/[^0-9.]/g, ''));
    
    // 对于较新的硬件，建议使用较新的 OpenCore 版本
    if (hardwareConfig.cpu?.generation?.includes('13th') || 
        hardwareConfig.cpu?.generation?.includes('14th')) {
      return versionNumber >= 0.9;
    }
    
    if (hardwareConfig.cpu?.generation?.includes('12th')) {
      return versionNumber >= 0.8;
    }
    
    return versionNumber >= 0.7;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }

  /**
   * 获取版本比较结果
   */
  compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const v2Parts = version2.replace(/[^0-9.]/g, '').split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }
}

// 导出单例实例
export const versionManager = new VersionManager();

// 导出工具函数
export const versionUtils = {
  /**
   * 格式化版本号
   */
  formatVersion: (version: string): string => {
    return version.replace(/^v/, '').replace(/-.*$/, '');
  },

  /**
   * 格式化发布日期
   */
  formatReleaseDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * 格式化文件大小
   */
  formatFileSize: (bytes: number): string => {
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
   * 检查是否为预发布版本
   */
  isPrerelease: (version: string): boolean => {
    return /-(alpha|beta|rc|pre)/i.test(version);
  },

  /**
   * 获取版本标签
   */
  getVersionLabel: (version: OpenCoreVersion): string => {
    if (version.isRecommended) return '推荐';
    if (version.isStable) return '稳定';
    if (versionUtils.isPrerelease(version.version)) return '预发布';
    return '开发版';
  }
};