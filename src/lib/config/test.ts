import { OpenCoreConfigGenerator } from './generator';
import { HardwareConfig } from '../../types';

// 测试硬件配置
const testHardwareConfig: HardwareConfig = {
  cpu: {
    brand: 'Intel',
    model: 'Core i7-12700K',
    architecture: 'x86_64',
    generation: '12th Gen'
  },
  motherboard: {
    brand: 'ASUS',
    model: 'ROG STRIX Z690-E GAMING WIFI',
    chipset: 'Z690'
  },
  memory: {
    size: 32,
    type: 'DDR4',
    speed: 3200
  },
  storage: {
    type: 'NVMe',
    drives: [
      {
        type: 'NVMe',
        size: 1000,
        model: 'Samsung 980 PRO'
      }
    ]
  },
  gpu: {
    integrated: {
      brand: 'Intel',
      model: 'UHD Graphics 770'
    },
    discrete: {
      brand: 'NVIDIA',
      model: 'RTX 3080'
    }
  },
  audio: {
    codec: 'ALC4080',
    layout: 1
  },
  network: {
    ethernet: {
      brand: 'Intel',
      model: 'I225-V'
    },
    wifi: {
      brand: 'Intel',
      model: 'AX210'
    }
  }
};

// 测试配置生成
export function testConfigGeneration() {
  try {
    const generator = new OpenCoreConfigGenerator(testHardwareConfig, '1.0.2');
    const config = generator.generateConfig();
    
    console.log('OpenCore配置生成成功!');
    console.log('ACPI Add项目数量:', config.ACPI.Add.length);
    console.log('Kernel Kext数量:', config.Kernel.Add.length);
    console.log('UEFI Driver数量:', config.UEFI.Drivers.length);
    console.log('SMBIOS型号:', config.PlatformInfo.Generic.SystemProductName);
    
    return config;
  } catch (error) {
    console.error('配置生成失败:', error);
    throw error;
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testConfigGeneration();
}