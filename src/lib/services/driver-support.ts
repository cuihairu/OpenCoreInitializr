import type {
  DriverSupportInfo,
  DriverCategoryInfo,
  DriverSearchFilter,
  DriverSearchResult,
  DriverCategory,
  DriverSupportDatabase,
  Tag,
  LocalizedText,
  DriverVersion,
  GithubInfo
} from '@/types/driver-support';

// 导入驱动数据
import categoriesData from '@/data/driver-support/categories.json';
import tagsData from '@/data/driver-support/tags.json';

const driverModules = import.meta.glob('@/data/driver-support/drivers/**/*.json', { eager: true });

const transformToLocalizedText = (value: any, defaultValue = ''): LocalizedText => {
  if (typeof value === 'string') {
    return { en: value, zh: value };
  }
  if (typeof value === 'object' && value !== null && value.en) {
    return { en: value.en, zh: value.zh || value.en };
  }
  return { en: defaultValue, zh: defaultValue };
};

const transformDriver = (driver: any): DriverSupportInfo => {
  const id = String(driver.id || driver.name || '').replace(/\.kext$/, '');
  const nameStr = String(
    typeof driver.name === 'string' ? driver.name : (driver.name?.en || driver.id || '')
  ).replace(/\.kext$/, '');
  
  const version: DriverVersion = {
    version: driver.version?.version || driver.version || 'N/A',
    releaseDate: driver.version?.releaseDate || '',
    lastUpdated: driver.version?.lastUpdated || '',
    downloadUrl: driver.version?.downloadUrl || '',
    fileSize: driver.version?.fileSize || '',
    changelog: driver.version?.changelog || '',
    isLatest: driver.version?.isLatest || false
  };

  const github: GithubInfo | undefined = driver.github ? {
    repositoryUrl: driver.github.repositoryUrl || '',
    starCount: driver.github.starCount || 0,
    forkCount: driver.github.forkCount || 0,
    openIssueCount: driver.github.openIssueCount || 0,
    lastCommitDate: driver.github.lastCommitDate || ''
  } : undefined;

  return {
    id: id,
    name: transformToLocalizedText(driver.name, nameStr),
    category: driver.category,
    description: transformToLocalizedText(driver.description),
    source: driver.source || driver.links?.github || driver.links?.website || driver.officialWebsite || '',
    version: version,
    developmentStatus: driver.developmentStatus || 'unknown',
    compatibility: driver.compatibility || 'unknown',
    required: driver.required,
    priority: driver.priority || 'optional',
    dependencies: driver.dependencies,
    github: github,
    notes: transformToLocalizedText(driver.notes),
    tags: driver.tags || [],
  };
};

const allDrivers: DriverSupportInfo[] = Object.values(driverModules).map((module: any) => {
  const driverData = module.default || module;
  return transformDriver(driverData);
});

// HMR-safe singleton
const globalForService = globalThis as unknown as {
  driverSupportServiceInstance: DriverSupportService | undefined;
};

/**
 * 驱动支持服务类
 */
export class DriverSupportService {
  private static instance: DriverSupportService;
  private database: DriverSupportDatabase;

  private constructor() {
    this.database = this.initializeDatabase();
    console.log('DriverSupportService initialized');
  }

  public static getInstance(): DriverSupportService {
    if (process.env.NODE_ENV !== 'production') {
      if (!globalForService.driverSupportServiceInstance) {
        globalForService.driverSupportServiceInstance = new DriverSupportService();
      }
      return globalForService.driverSupportServiceInstance;
    }

    if (!DriverSupportService.instance) {
      DriverSupportService.instance = new DriverSupportService();
    }
    return DriverSupportService.instance;
  }

  /**
   * 初始化驱动数据库
   */
  private initializeDatabase(): DriverSupportDatabase {
    // 检查重复的驱动ID
    const driverIds = allDrivers.map(d => d.id);
    const duplicateIds = driverIds.filter((id, index) => driverIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.warn('发现重复的驱动ID:', duplicateIds);
    }

    // 去重处理
    const uniqueDrivers = allDrivers.filter((driver, index, self) => 
      index === self.findIndex(d => d.id === driver.id)
    );

    // 更新分类中的驱动数量
    const categories = categoriesData.categories.map(category => ({
      ...category,
      id: category.id as DriverCategory,
      driverCount: uniqueDrivers.filter(driver => driver.category === category.id).length
    })) as DriverCategoryInfo[];

    const tags: Tag[] = Object.entries(tagsData.tags).map(([id, tagData]) => ({
      id,
      name: (tagData as any).name || tagData,
      description: (tagData as any).description || { en: '', zh: '' }
    }));

    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      categories,
      drivers: uniqueDrivers,
      tags,
      metadata: {
        totalDrivers: uniqueDrivers.length,
        supportedMacOSVersions: ['10.8+', '10.12+', '11.0+', '12.0+', '13.0+', '14.0+'],
        dataSources: ['Acidanthera', 'Community']
      }
    };
  }

  /**
   * 获取所有驱动分类
   */
  public getCategories(): DriverCategoryInfo[] {
    return this.database.categories;
  }

  /**
   * 获取指定分类的驱动
   */
  public getDriversByCategory(categoryId: DriverCategory): DriverSupportInfo[] {
    return this.database.drivers.filter(driver => driver.category === categoryId);
  }

  /**
   * 根据ID获取驱动信息
   */
  public getDriverById(driverId: string): DriverSupportInfo | undefined {
    return this.database.drivers.find(driver => driver.id === driverId);
  }

  /**
   * 搜索驱动
   */
  public searchDrivers(
    filter: DriverSearchFilter,
    page: number = 1,
    pageSize: number = 20
  ): DriverSearchResult {
    let filteredDrivers = [...this.database.drivers];
    const currentLanguage = this.getCurrentLanguage(); // zh or en

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filteredDrivers = filteredDrivers.filter(driver => {
        const name = (driver.name as LocalizedText)[currentLanguage] || driver.name.en;
        const description = (driver.description as LocalizedText)[currentLanguage] || driver.description.en;
        return name.toLowerCase().includes(keyword) ||
               description.toLowerCase().includes(keyword) ||
               driver.tags.some(tagId => {
                 const tagInfo = this.database.tags.find(t => t.id === tagId);
                 if (!tagInfo) return false;
                 const tagName = (tagInfo.name as LocalizedText)[currentLanguage] || tagInfo.name.en;
                 return tagName.toLowerCase().includes(keyword);
               });
      });
    }

    // 分类过滤
    if (filter.categories && filter.categories.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        filter.categories!.includes(driver.category)
      );
    }

    // 最终去重（保险，确保不会因任何环节导致重复）
    const uniqueFilteredDrivers = filteredDrivers.filter((driver, index, self) => 
      index === self.findIndex(d => d.id === driver.id)
    );

    // 分页
    const total = uniqueFilteredDrivers.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDrivers = uniqueFilteredDrivers.slice(startIndex, endIndex);

    // 统计信息
    const stats = this.generateStats(uniqueFilteredDrivers);

    return {
      drivers: paginatedDrivers,
      total,
      pagination: {
        page,
        pageSize,
        totalPages
      },
      stats
    };
  }

  /**
   * 生成搜索统计信息
   */
  private generateStats(drivers: DriverSupportInfo[]) {
    const byCategory = {} as Record<DriverCategory, number>;

    drivers.forEach(driver => {
      // 按分类统计
      byCategory[driver.category] = (byCategory[driver.category] || 0) + 1;
    });

    return {
      byCategory
    };
  }

  /**
   * 获取推荐驱动
   */
  public getRecommendedDrivers(): DriverSupportInfo[] {
    return this.database.drivers.filter(driver => 
      driver.tags.includes('essential') || driver.tags.includes('recommended')
    );
  }

  /**
   * 获取最新更新的驱动
   */
  public getRecentlyUpdatedDrivers(limit: number = 10): DriverSupportInfo[] {
    // This is a placeholder as we don't have date information in the new structure
    return [...this.database.drivers].slice(0, limit);
  }

  /**
   * 获取数据库元数据
   */
  public getMetadata() {
    return this.database.metadata;
  }

  /**
   * 根据硬件配置获取相关驱动
   */
  public getDriversForHardware(hardwareInfo: {
    cpu?: string;
    gpu?: string;
    audio?: string;
    network?: string;
  }): DriverSupportInfo[] {
    const relevantDrivers: DriverSupportInfo[] = [];
    
    this.database.drivers.forEach(driver => {
      const isRelevant = driver.tags.some(tag => {
        if (hardwareInfo.gpu && tag.toLowerCase().includes('intel') && hardwareInfo.gpu.toLowerCase().includes('intel')) {
          return true;
        }
        if (hardwareInfo.gpu && tag.toLowerCase().includes('amd') && hardwareInfo.gpu.toLowerCase().includes('amd')) {
          return true;
        }
        if (hardwareInfo.gpu && tag.toLowerCase().includes('nvidia') && hardwareInfo.gpu.toLowerCase().includes('nvidia')) {
          return true;
        }
        return false;
      });
      
      if (isRelevant || driver.tags.includes('essential')) {
        relevantDrivers.push(driver);
      }
    });
    
    return relevantDrivers;
  }

  private getCurrentLanguage(): 'zh' | 'en' {
    // This is a placeholder. In a real application, you would get the current language from your i18n solution.
    return 'zh';
  }
}

// 导出单例实例
export const driverSupportService = DriverSupportService.getInstance();