import intelCpuData from '../../data/hardware/cpu/intel.json';
import amdCpuData from '../../data/hardware/cpu/amd.json';
import chipsetsData from '../../data/hardware/motherboard/chipsets.json';
import graphicsData from '../../data/hardware/gpu/graphics.json';
import memoryData from '../../data/hardware/memory/ram.json';
import storageData from '../../data/hardware/storage/drives.json';

// CPU相关类型定义
export interface CpuModel {
  name: string;
  codename: string;
  architecture: string;
  models: string[];
}

export interface CpuBrand {
  brand: string;
  generations: CpuModel[];
}

// 主板相关类型定义
export interface ChipsetSeries {
  series: string;
  models: string[];
  supportedCpus: string[];
  socket: string;
}

export interface ChipsetBrand {
  brand: string;
  chipsets: ChipsetSeries[];
}

// 显卡相关类型定义
export interface GpuSeries {
  name: string;
  generation: string;
  architecture: string;
  models: string[];
  openCoreSupport: string;
  notes: string;
}

export interface GpuBrand {
  brand: string;
  series: GpuSeries[];
}

// 内存相关类型定义
export interface MemorySpeed {
  speed: string;
  frequency: string;
  jedec: boolean;
  voltage: string;
}

export interface MemoryType {
  type: string;
  speeds: MemorySpeed[];
  capacities: string[];
  supportedPlatforms: string[];
  openCoreSupport: string;
  notes: string;
}

// 存储相关类型定义
export interface StorageModel {
  model: string;
  capacities: string[];
  interface: string;
  openCoreSupport: string;
  notes: string;
  rpm?: string;
}

export interface StorageBrand {
  name: string;
  models: StorageModel[];
}

export interface StorageType {
  type: string;
  interface: string;
  brands: StorageBrand[];
  generalSupport: string;
  notes: string;
}

// 硬件配置数据类
export class HardwareConfig {
  // CPU数据
  static getCpuBrands(): string[] {
    return ['Intel', 'AMD'];
  }

  static getCpuData(brand: string): CpuBrand | null {
    switch (brand.toLowerCase()) {
      case 'intel':
        return intelCpuData as CpuBrand;
      case 'amd':
        return amdCpuData as CpuBrand;
      default:
        return null;
    }
  }

  static getCpuGenerations(brand: string): string[] {
    const cpuData = this.getCpuData(brand);
    return cpuData ? cpuData.generations.map(gen => gen.name) : [];
  }

  static getCpuModels(brand: string, generation?: string): string[] {
    const cpuData = this.getCpuData(brand);
    if (!cpuData) return [];

    if (generation) {
      const gen = cpuData.generations.find(g => g.name === generation);
      return gen ? gen.models : [];
    }

    // 返回所有型号
    return cpuData.generations.flatMap(gen => gen.models);
  }

  // 主板数据
  static getChipsetBrands(): string[] {
    return ['Intel', 'AMD'];
  }

  static getChipsetData(brand: string): ChipsetBrand | null {
    const data = chipsetsData as { intel: ChipsetBrand; amd: ChipsetBrand };
    switch (brand.toLowerCase()) {
      case 'intel':
        return data.intel;
      case 'amd':
        return data.amd;
      default:
        return null;
    }
  }

  static getChipsetModels(brand: string): string[] {
    const chipsetData = this.getChipsetData(brand);
    if (!chipsetData) return [];
    
    return chipsetData.chipsets.flatMap(series => series.models);
  }

  // 显卡数据
  static getGpuBrands(): string[] {
    return ['NVIDIA', 'AMD', 'Intel'];
  }

  static getGpuData(brand: string): GpuBrand | null {
    const data = graphicsData as { nvidia: GpuBrand; amd: GpuBrand; intel: GpuBrand };
    switch (brand.toLowerCase()) {
      case 'nvidia':
        return data.nvidia;
      case 'amd':
        return data.amd;
      case 'intel':
        return data.intel;
      default:
        return null;
    }
  }

  static getGpuModels(brand: string): string[] {
    const gpuData = this.getGpuData(brand);
    if (!gpuData) return [];
    
    return gpuData.series.flatMap(series => series.models);
  }

  // 内存数据
  static getMemoryTypes(): string[] {
    return ['DDR5', 'DDR4', 'DDR3'];
  }

  static getMemoryData(type: string): MemoryType | null {
    const data = memoryData as { ddr5: MemoryType; ddr4: MemoryType; ddr3: MemoryType };
    switch (type.toLowerCase()) {
      case 'ddr5':
        return data.ddr5;
      case 'ddr4':
        return data.ddr4;
      case 'ddr3':
        return data.ddr3;
      default:
        return null;
    }
  }

  static getMemorySpeeds(type: string): string[] {
    const memData = this.getMemoryData(type);
    return memData ? memData.speeds.map(speed => speed.speed) : [];
  }

  static getMemoryCapacities(type: string): string[] {
    const memData = this.getMemoryData(type);
    return memData ? memData.capacities : [];
  }

  // 存储数据
  static getStorageTypes(): string[] {
    return ['NVMe SSD', 'SATA SSD', 'HDD'];
  }

  static getStorageData(type: string): StorageType | null {
    const data = storageData as { nvme: StorageType; sata_ssd: StorageType; hdd: StorageType };
    switch (type.toLowerCase().replace(/\s+/g, '_')) {
      case 'nvme_ssd':
        return data.nvme;
      case 'sata_ssd':
        return data.sata_ssd;
      case 'hdd':
        return data.hdd;
      default:
        return null;
    }
  }

  static getStorageBrands(type: string): string[] {
    const storageData = this.getStorageData(type);
    return storageData ? storageData.brands.map(brand => brand.name) : [];
  }

  static getStorageModels(type: string, brand?: string): string[] {
    const storageData = this.getStorageData(type);
    if (!storageData) return [];

    if (brand) {
      const brandData = storageData.brands.find(b => b.name === brand);
      return brandData ? brandData.models.map(model => model.model) : [];
    }

    return storageData.brands.flatMap(brand => brand.models.map(model => model.model));
  }
}

// 导出默认实例
export default HardwareConfig;