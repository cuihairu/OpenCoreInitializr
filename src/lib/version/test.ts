import { versionManager, versionUtils } from './manager';
import { historyManager, historyUtils } from '../history/manager';
import { HardwareConfig, PackageOptions } from '../../types';

// 测试硬件配置
const testHardwareConfig: HardwareConfig = {
  cpu: {
    brand: 'Intel',
    generation: '12th Gen',
    model: 'i7-12700K',
    architecture: 'x86_64'
  },
  gpu: {
    integrated: {
      brand: 'Intel',
      model: 'UHD Graphics 770'
    },
    discrete: {
      brand: 'AMD',
      model: 'RX 6800 XT'
    }
  },
  motherboard: {
    brand: 'ASUS',
    model: 'ROG STRIX Z690-E',
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
  network: {
    ethernet: {
      brand: 'Intel',
      model: 'I225-V'
    },
    wifi: {
      brand: 'Intel',
      model: 'AX210'
    },
    bluetooth: {
      version: '5.2'
    }
  },
  audio: {
    codec: 'ALC4080',
    layout: 1
  }
};

const testPackageOptions: PackageOptions = {
  format: 'zip',
  includeDocumentation: true,
  includeTools: true,
  customName: 'MyOpenCore'
};

async function testVersionManager() {
  console.log('=== 测试版本管理器 ===');
  
  try {
    // 测试获取版本信息
    console.log('\n1. 获取版本信息...');
    const versionInfo = await versionManager.getVersionInfo();
    console.log(`- 最新版本: ${versionInfo.latest.version}`);
    console.log(`- 稳定版本: ${versionInfo.stable.version}`);
    console.log(`- 总版本数: ${versionInfo.versions.length}`);
    console.log(`- 最后更新: ${versionUtils.formatReleaseDate(versionInfo.lastUpdated)}`);
    
    // 测试推荐版本
    console.log('\n2. 获取推荐版本...');
    const recommended = await versionManager.getRecommendedVersion();
    console.log(`- 推荐版本: ${recommended.version}`);
    console.log(`- 版本标签: ${versionUtils.getVersionLabel(recommended)}`);
    console.log(`- 文件大小: ${versionUtils.formatFileSize(recommended.size)}`);
    
    // 测试版本兼容性
    console.log('\n3. 测试版本兼容性...');
    const isCompatible = versionManager.isVersionCompatible(recommended.version, testHardwareConfig);
    console.log(`- ${recommended.version} 与当前硬件兼容: ${isCompatible ? '是' : '否'}`);
    
    // 测试版本比较
    console.log('\n4. 测试版本比较...');
    const compareResult = versionManager.compareVersions('0.9.7', '0.9.6');
    console.log(`- 0.9.7 vs 0.9.6: ${compareResult > 0 ? '更新' : compareResult < 0 ? '更旧' : '相同'}`);
    
  } catch (error) {
    console.error('版本管理器测试失败:', error);
  }
}

async function testHistoryManager() {
  console.log('\n=== 测试配置历史管理器 ===');
  
  try {
    // 清空历史记录（测试用）
    await historyManager.clearHistory();
    
    // 测试保存配置
    console.log('\n1. 保存测试配置...');
    const configName = historyUtils.formatConfigName(testHardwareConfig);
    const description = historyUtils.generateDescription(testHardwareConfig, '0.9.7');
    const tags = historyUtils.generateTags(testHardwareConfig);
    
    const configId = await historyManager.saveConfiguration(
      configName,
      testHardwareConfig,
      testPackageOptions,
      '0.9.7',
      {
        description,
        tags,
        isFavorite: true
      }
    );
    
    console.log(`- 配置已保存，ID: ${configId}`);
    console.log(`- 配置名称: ${configName}`);
    console.log(`- 描述: ${description}`);
    console.log(`- 标签: ${tags.join(', ')}`);
    
    // 保存更多测试配置
    for (let i = 1; i <= 3; i++) {
      const testConfig = { ...testHardwareConfig };
      testConfig.cpu.model = `i5-1240${i}K`;
      
      await historyManager.saveConfiguration(
        `测试配置 ${i}`,
        testConfig,
        testPackageOptions,
        '0.9.6',
        {
          description: `第 ${i} 个测试配置`,
          tags: ['test', `config-${i}`],
          isFavorite: i === 2
        }
      );
    }
    
    // 测试获取所有配置
    console.log('\n2. 获取所有配置...');
    const allConfigs = await historyManager.getAllConfigurations();
    console.log(`- 总配置数: ${allConfigs.length}`);
    
    // 测试搜索配置
    console.log('\n3. 搜索配置...');
    const searchResults = await historyManager.searchConfigurations('i7');
    console.log(`- 搜索 "i7" 结果数: ${searchResults.length}`);
    
    // 测试获取收藏配置
    console.log('\n4. 获取收藏配置...');
    const favorites = await historyManager.getFavoriteConfigurations();
    console.log(`- 收藏配置数: ${favorites.length}`);
    
    // 测试获取最近配置
    console.log('\n5. 获取最近配置...');
    const recent = await historyManager.getRecentConfigurations(3);
    console.log(`- 最近 3 个配置:`);
    recent.forEach((config, index) => {
      console.log(`  ${index + 1}. ${config.name} (${historyUtils.formatDate(config.updatedAt)})`);
    });
    
    // 测试统计信息
    console.log('\n6. 获取统计信息...');
    const stats = await historyManager.getHistoryStats();
    console.log(`- 总配置数: ${stats.totalConfigurations}`);
    console.log(`- 收藏数: ${stats.favoriteCount}`);
    console.log(`- 本周更新数: ${stats.recentCount}`);
    console.log(`- 常用标签:`);
    stats.mostUsedTags.slice(0, 5).forEach(tag => {
      console.log(`  - ${tag.tag}: ${tag.count} 次`);
    });
    
    // 测试切换收藏状态
    console.log('\n7. 测试切换收藏状态...');
    const firstConfig = allConfigs[0];
    const originalFavorite = firstConfig.isFavorite;
    const newFavorite = await historyManager.toggleFavorite(firstConfig.id);
    console.log(`- ${firstConfig.name} 收藏状态: ${originalFavorite} -> ${newFavorite}`);
    
    // 测试导出历史
    console.log('\n8. 测试导出历史...');
    const exportData = await historyManager.exportHistory();
    const exportSize = new Blob([exportData]).size;
    console.log(`- 导出数据大小: ${exportSize} 字节`);
    
    console.log('\n配置历史管理器测试完成！');
    
  } catch (error) {
    console.error('配置历史管理器测试失败:', error);
  }
}

async function runTests() {
  console.log('开始测试版本管理和配置历史功能...');
  
  await testVersionManager();
  await testHistoryManager();
  
  console.log('\n所有测试完成！');
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };