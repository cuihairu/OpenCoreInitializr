import { PackageService } from './packageService';
import { HardwareConfig, PackageOptions } from '../../types';

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

// 测试包选项
const testPackageOptions: PackageOptions = {
  format: 'zip',
  includeDocumentation: true,
  includeTools: true,
  customName: 'MyOpenCoreEFI'
};

/**
 * 测试包服务功能
 */
async function testPackageService() {
  console.log('开始测试包服务...');
  
  const packageService = new PackageService();
  
  try {
    // 测试硬件配置验证
    console.log('\n1. 测试硬件配置验证:');
    const validation = packageService.validateHardwareConfig(testHardwareConfig);
    console.log('验证结果:', validation);
    
    // 测试包预览
    console.log('\n2. 测试包预览:');
    const preview = await packageService.getPackagePreview(testHardwareConfig, testPackageOptions);
    console.log('预览信息:');
    console.log('- 配置版本:', preview.config.version);
    console.log('- 下载项目数量:', preview.downloadItems.length);
    console.log('- 估计大小:', Math.round(preview.estimatedSize / 1024 / 1024), 'MB');
    console.log('- 文件数量:', preview.fileCount);
    
    // 显示下载项目详情
    console.log('\n下载项目详情:');
    preview.downloadItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}) - ${Math.round(item.size / 1024)}KB`);
    });
    
    // 测试支持的硬件列表
    console.log('\n3. 测试支持的硬件列表:');
    const supportedHardware = packageService.getSupportedHardware();
    console.log('支持的CPU数量:', supportedHardware.cpus.length);
    console.log('支持的芯片组数量:', supportedHardware.chipsets.length);
    console.log('支持的集成显卡数量:', supportedHardware.gpus.integrated.length);
    console.log('支持的独立显卡数量:', supportedHardware.gpus.discrete.length);
    console.log('支持的音频编解码器数量:', supportedHardware.audioCodecs.length);
    console.log('支持的以太网控制器数量:', supportedHardware.ethernetControllers.length);
    
    console.log('\n包服务测试完成!');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testPackageService();
}

export { testPackageService };