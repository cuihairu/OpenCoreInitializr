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
  GithubInfo,
  DriverPriority,
  DriverDevelopmentStatus,
  DriverCompatibility,
  HardwareSupport
} from '@/types/driver-support';
import { i18nUtils } from '@/lib/i18n';

// 导入驱动数据
import categoriesData from '@/data/driver-support/categories.json';
import tagsData from '@/data/driver-support/tags.json';

const driverModules = import.meta.glob('@/data/driver-support/drivers/**/*.json', { eager: true });

const transformToLocalizedText = (value: any, defaultValue = ''): LocalizedText => {
  if (typeof value === 'string') {
    return { 
      en: value, 
      'zh-CN': value, 
      'zh-TW': value, 
      'zh-HK': value,
      ja: value, 
      ko: value,
      es: value,
      fr: value,
      de: value, 
      ru: value 
    };
  }
  if (typeof value === 'object' && value !== null && value.en) {
    return { 
      en: value.en, 
      'zh-CN': value['zh-CN'] || value.en,
      'zh-TW': value['zh-TW'] || value.en,
      'zh-HK': value['zh-HK'] || value.en,
      ja: value.ja || value.en,
      ko: value.ko || value.en,
      es: value.es || value.en,
      fr: value.fr || value.en,
      de: value.de || value.en,
      ru: value.ru || value.en
    };
  }
  return { 
    en: defaultValue, 
    'zh-CN': defaultValue, 
    'zh-TW': defaultValue, 
    'zh-HK': defaultValue,
    ja: defaultValue, 
    ko: defaultValue,
    es: defaultValue,
    fr: defaultValue,
    de: defaultValue, 
    ru: defaultValue 
  };
};

const transformDriver = (driver: any, filename?: string): DriverSupportInfo => {
  const id = String(driver.id || driver.name || filename || '').replace(/\.kext$/, '');
  const getNameString = (name: any): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
      return name.en || name['zh-CN'] || '';
    }
    return '';
  };
  const nameStr = String(
    getNameString(driver.name) || driver.id || filename || ''
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
    hardwareSupport: driver.hardwareSupport || [],
  };
};

const allDrivers: DriverSupportInfo[] = Object.entries(driverModules).map(([path, module]: [string, any]) => {
  const driverData = module.default || module;
  const filename = path.split('/').pop()?.replace('.json', '');
  return transformDriver(driverData, filename);
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

  private getCurrentLanguage(): keyof LocalizedText {
    if (typeof window !== 'undefined' && (window as any).i18n) {
      const lang = (window as any).i18n?.language;
      if (lang === 'zh-CN') return 'zh-CN';
      if (lang === 'zh-TW') return 'zh-TW';
      if (lang === 'ja') return 'ja';
      if (lang === 'de') return 'de';
      if (lang === 'ru') return 'ru';
      if (lang?.startsWith('zh')) return 'zh-CN';
    }
    return 'en';
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
      description: (tagData as any).description || { en: '', 'zh-CN': '' }
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
    pageSize: number = 50  // 增加默认页面大小以显示更多驱动
  ): DriverSearchResult {
    let filteredDrivers = [...this.database.drivers];
    const currentLanguage = this.getCurrentLanguage(); // zh-CN or en

    // Use the global getText function
    const getText = (text: LocalizedText | string): string => {
      return i18nUtils.getText(text);
    };

    // 关键词搜索
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filteredDrivers = filteredDrivers.filter(driver => {
        const name = getText(driver.name);
        const description = getText(driver.description);
        return name.toLowerCase().includes(keyword) ||
               description.toLowerCase().includes(keyword) ||
               driver.tags.some(tagId => {
                 const tagInfo = this.database.tags.find(t => t.id === tagId);
                 if (!tagInfo) return false;
                 const tagName = getText(tagInfo.name);
                 return tagName.toLowerCase().includes(keyword);
               });
      });
    }

    // 分类过滤
    if (filter.categories && filter.categories.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        driver.category && filter.categories?.includes(driver.category)
      );
    }

    // 优先级过滤
    if (filter.priority && filter.priority.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        filter.priority?.includes(driver.priority)
      );
    }

    // 开发状态过滤
    if (filter.developmentStatus && filter.developmentStatus.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        filter.developmentStatus?.includes(driver.developmentStatus)
      );
    }

    // 硬件品牌过滤
    if (filter.hardwareBrands && filter.hardwareBrands.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        driver.hardwareSupport?.some(support => filter.hardwareBrands?.includes(support.brand))
      );
    }

    // macOS 版本过滤
    if (filter.macosVersions && filter.macosVersions.length > 0) {
      filteredDrivers = filteredDrivers.filter(driver => 
        driver.hardwareSupport?.some(support => 
          support.macosVersions?.some(version => filter.macosVersions?.includes(version))
        )
      );
    }

    // 排序
    filteredDrivers.sort((a, b) => {
      const priorityOrder: { [key in DriverPriority]: number } = {
        essential: 1,
        recommended: 2,
        optional: 3,
        unknown: 4
      };
      const priorityA = priorityOrder[a.priority] || 4;
      const priorityB = priorityOrder[b.priority] || 4;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      const nameA = getText(a.name);
      const nameB = getText(b.name);
      return nameA.localeCompare(nameB);
    });

    // 分页
    const totalItems = filteredDrivers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);

    return {
      drivers: paginatedDrivers,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      },
      metadata: {
        totalDrivers: this.database.metadata.totalDrivers,
        supportedMacOSVersions: this.database.metadata.supportedMacOSVersions,
        dataSources: this.database.metadata.dataSources
      }
    };
  }
}

export const driverSupportService = DriverSupportService.getInstance();