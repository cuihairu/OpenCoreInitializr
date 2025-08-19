import React from 'react';
import { PackageGenerator } from './PackageGenerator';
import { HardwareConfig, PackageOptions } from '../types';

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

// 测试包选项
const testPackageOptions: PackageOptions = {
  format: 'zip',
  includeDocumentation: true,
  includeTools: true,
  customName: 'MyOpenCore'
};

export const TestPreview: React.FC = () => {
  const handleComplete = (packageBlob: Blob, filename: string) => {
    console.log('Package generated:', filename, packageBlob);
    
    // 创建下载链接
    const url = URL.createObjectURL(packageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`包生成完成！文件名: ${filename}`);
  };

  const handleError = (error: string) => {
    console.error('Generation error:', error);
    alert(`生成失败: ${error}`);
  };

  const handleBack = () => {
    console.log('Back to configuration');
    alert('返回配置页面');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            OpenCore 配置预览测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            测试配置确认和预览模块的功能
          </p>
        </div>
        
        <PackageGenerator
          hardwareConfig={testHardwareConfig}
          packageOptions={testPackageOptions}
          onComplete={handleComplete}
          onError={handleError}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default TestPreview;