/**
 * 配置历史管理器
 * 负责保存、加载和管理用户的配置历史记录
 */

import { HardwareConfig, PackageOptions } from '../../types';

export interface ConfigurationRecord {
  id: string;
  name: string;
  description?: string;
  hardwareConfig: HardwareConfig;
  packageOptions: PackageOptions;
  openCoreVersion: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isFavorite: boolean;
}

export interface HistoryStats {
  totalConfigurations: number;
  favoriteCount: number;
  recentCount: number;
  mostUsedTags: { tag: string; count: number }[];
  oldestRecord: string;
  newestRecord: string;
}

class HistoryManager {
  private readonly STORAGE_KEY = 'opencore_config_history';
  private readonly MAX_RECORDS = 100; // 最多保存100个配置记录
  private records: ConfigurationRecord[] = [];
  private initialized = false;

  /**
   * 初始化历史管理器
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored);
        // 验证和清理无效记录
        this.records = this.records.filter(this.isValidRecord);
      }
    } catch (error) {
      console.error('Failed to load configuration history:', error);
      this.records = [];
    }
    
    this.initialized = true;
  }

  /**
   * 保存配置记录
   */
  async saveConfiguration(
    name: string,
    hardwareConfig: HardwareConfig,
    packageOptions: PackageOptions,
    openCoreVersion: string,
    options: {
      description?: string;
      tags?: string[];
      isFavorite?: boolean;
      updateExisting?: boolean;
    } = {}
  ): Promise<string> {
    await this.initialize();

    const now = new Date().toISOString();
    const id = options.updateExisting 
      ? this.findRecordByName(name)?.id || this.generateId()
      : this.generateId();

    const record: ConfigurationRecord = {
      id,
      name,
      description: options.description || '',
      hardwareConfig: JSON.parse(JSON.stringify(hardwareConfig)), // 深拷贝
      packageOptions: JSON.parse(JSON.stringify(packageOptions)),
      openCoreVersion,
      createdAt: options.updateExisting 
        ? this.findRecordById(id)?.createdAt || now
        : now,
      updatedAt: now,
      tags: options.tags || [],
      isFavorite: options.isFavorite || false
    };

    // 更新或添加记录
    const existingIndex = this.records.findIndex(r => r.id === id);
    if (existingIndex >= 0) {
      this.records[existingIndex] = record;
    } else {
      this.records.unshift(record); // 添加到开头
    }

    // 限制记录数量
    if (this.records.length > this.MAX_RECORDS) {
      this.records = this.records.slice(0, this.MAX_RECORDS);
    }

    await this.saveToStorage();
    return id;
  }

  /**
   * 获取所有配置记录
   */
  async getAllConfigurations(): Promise<ConfigurationRecord[]> {
    await this.initialize();
    return [...this.records]; // 返回副本
  }

  /**
   * 根据ID获取配置记录
   */
  async getConfigurationById(id: string): Promise<ConfigurationRecord | null> {
    await this.initialize();
    return this.findRecordById(id);
  }

  /**
   * 根据名称获取配置记录
   */
  async getConfigurationByName(name: string): Promise<ConfigurationRecord | null> {
    await this.initialize();
    return this.findRecordByName(name);
  }

  /**
   * 搜索配置记录
   */
  async searchConfigurations(query: string): Promise<ConfigurationRecord[]> {
    await this.initialize();
    
    const lowerQuery = query.toLowerCase();
    return this.records.filter(record => 
      record.name.toLowerCase().includes(lowerQuery) ||
      record.description?.toLowerCase().includes(lowerQuery) ||
      record.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      record.hardwareConfig.cpu?.model?.toLowerCase().includes(lowerQuery) ||
      record.hardwareConfig.motherboard?.model?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 根据标签筛选配置记录
   */
  async getConfigurationsByTag(tag: string): Promise<ConfigurationRecord[]> {
    await this.initialize();
    return this.records.filter(record => 
      record.tags.includes(tag)
    );
  }

  /**
   * 获取收藏的配置记录
   */
  async getFavoriteConfigurations(): Promise<ConfigurationRecord[]> {
    await this.initialize();
    return this.records.filter(record => record.isFavorite);
  }

  /**
   * 获取最近的配置记录
   */
  async getRecentConfigurations(limit: number = 10): Promise<ConfigurationRecord[]> {
    await this.initialize();
    return this.records
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  /**
   * 删除配置记录
   */
  async deleteConfiguration(id: string): Promise<boolean> {
    await this.initialize();
    
    const index = this.records.findIndex(r => r.id === id);
    if (index >= 0) {
      this.records.splice(index, 1);
      await this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * 批量删除配置记录
   */
  async deleteConfigurations(ids: string[]): Promise<number> {
    await this.initialize();
    
    let deletedCount = 0;
    for (const id of ids) {
      const index = this.records.findIndex(r => r.id === id);
      if (index >= 0) {
        this.records.splice(index, 1);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      await this.saveToStorage();
    }
    
    return deletedCount;
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(id: string): Promise<boolean> {
    await this.initialize();
    
    const record = this.findRecordById(id);
    if (record) {
      record.isFavorite = !record.isFavorite;
      record.updatedAt = new Date().toISOString();
      await this.saveToStorage();
      return record.isFavorite;
    }
    
    return false;
  }

  /**
   * 更新配置记录的标签
   */
  async updateTags(id: string, tags: string[]): Promise<boolean> {
    await this.initialize();
    
    const record = this.findRecordById(id);
    if (record) {
      record.tags = [...new Set(tags)]; // 去重
      record.updatedAt = new Date().toISOString();
      await this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * 获取历史统计信息
   */
  async getHistoryStats(): Promise<HistoryStats> {
    await this.initialize();
    
    const tagCounts = new Map<string, number>();
    let oldestDate = new Date();
    let newestDate = new Date(0);
    
    for (const record of this.records) {
      // 统计标签
      for (const tag of record.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
      
      // 找出最早和最晚的记录
      const createdDate = new Date(record.createdAt);
      if (createdDate < oldestDate) oldestDate = createdDate;
      if (createdDate > newestDate) newestDate = createdDate;
    }
    
    const mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalConfigurations: this.records.length,
      favoriteCount: this.records.filter(r => r.isFavorite).length,
      recentCount: this.records.filter(r => {
        const updatedDate = new Date(r.updatedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return updatedDate > weekAgo;
      }).length,
      mostUsedTags,
      oldestRecord: this.records.length > 0 ? oldestDate.toISOString() : '',
      newestRecord: this.records.length > 0 ? newestDate.toISOString() : ''
    };
  }

  /**
   * 导出配置历史
   */
  async exportHistory(): Promise<string> {
    await this.initialize();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      records: this.records
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入配置历史
   */
  async importHistory(jsonData: string, options: { merge?: boolean } = {}): Promise<number> {
    await this.initialize();
    
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.records || !Array.isArray(importData.records)) {
        throw new Error('Invalid import data format');
      }
      
      const validRecords = importData.records.filter(this.isValidRecord);
      
      if (options.merge) {
        // 合并模式：添加新记录，跳过重复的
        const existingIds = new Set(this.records.map(r => r.id));
        const newRecords = validRecords.filter((r: ConfigurationRecord) => !existingIds.has(r.id));
        this.records.unshift(...newRecords);
      } else {
        // 替换模式：完全替换现有记录
        this.records = validRecords;
      }
      
      // 限制记录数量
      if (this.records.length > this.MAX_RECORDS) {
        this.records = this.records.slice(0, this.MAX_RECORDS);
      }
      
      await this.saveToStorage();
      return validRecords.length;
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 清空历史记录
   */
  async clearHistory(): Promise<void> {
    this.records = [];
    await this.saveToStorage();
  }

  // 私有方法
  private findRecordById(id: string): ConfigurationRecord | null {
    return this.records.find(r => r.id === id) || null;
  }

  private findRecordByName(name: string): ConfigurationRecord | null {
    return this.records.find(r => r.name === name) || null;
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidRecord(record: any): record is ConfigurationRecord {
    return (
      record &&
      typeof record.id === 'string' &&
      typeof record.name === 'string' &&
      record.hardwareConfig &&
      record.packageOptions &&
      typeof record.openCoreVersion === 'string' &&
      typeof record.createdAt === 'string' &&
      typeof record.updatedAt === 'string' &&
      Array.isArray(record.tags) &&
      typeof record.isFavorite === 'boolean'
    );
  }

  private async saveToStorage(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.records));
    } catch (error) {
      console.error('Failed to save configuration history:', error);
      throw new Error('Failed to save configuration history');
    }
  }
}

// 导出单例实例
export const historyManager = new HistoryManager();

// 导出工具函数
export const historyUtils = {
  /**
   * 格式化配置名称
   */
  formatConfigName: (hardwareConfig: HardwareConfig): string => {
    const cpu = hardwareConfig.cpu?.model?.split(' ').slice(0, 2).join(' ') || 'Unknown CPU';
    const gpu = hardwareConfig.gpu?.discrete?.model || hardwareConfig.gpu?.integrated?.model || 'Unknown GPU';
    return `${cpu} + ${gpu.split(' ').slice(0, 2).join(' ')}`;
  },

  /**
   * 生成配置描述
   */
  generateDescription: (hardwareConfig: HardwareConfig, openCoreVersion: string): string => {
    const parts = [
      `CPU: ${hardwareConfig.cpu.brand} ${hardwareConfig.cpu.model}`,
      `主板: ${hardwareConfig.motherboard.brand} ${hardwareConfig.motherboard.model}`,
      `内存: ${hardwareConfig.memory.size}GB ${hardwareConfig.memory.type}`,
      `OpenCore: ${openCoreVersion}`
    ];
    return parts.join(' | ');
  },

  /**
   * 根据硬件配置生成标签
   */
  generateTags: (hardwareConfig: HardwareConfig): string[] => {
    const tags = [
      hardwareConfig.cpu.brand.toLowerCase(),
      hardwareConfig.cpu.generation?.toLowerCase() || 'unknown-gen',
      hardwareConfig.motherboard?.chipset?.toLowerCase() || 'unknown-chipset',
      hardwareConfig.memory.type.toLowerCase()
    ];
    
    if (hardwareConfig.gpu.discrete) {
      tags.push(hardwareConfig.gpu.discrete.brand.toLowerCase());
    }
    
    if (hardwareConfig.gpu.integrated) {
      tags.push('integrated-gpu');
    }
    
    return tags.filter(Boolean);
  },

  /**
   * 比较两个配置是否相似
   */
  areConfigsSimilar: (config1: HardwareConfig, config2: HardwareConfig): boolean => {
    return (
      config1.cpu.model === config2.cpu.model &&
      config1.motherboard.model === config2.motherboard.model &&
      config1.gpu.discrete?.model === config2.gpu.discrete?.model
    );
  },

  /**
   * 格式化时间
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }
};