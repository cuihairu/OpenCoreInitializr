import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useHardwareStore } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { 
  ResponsiveForm, 
  ResponsiveFormGroup, 
  ResponsiveInput, 
  ResponsiveSelect, 
  ResponsiveButton 
} from '../components/ui/ResponsiveForm';
import { ResponsiveContainer } from '../components/layout/ResponsiveLayout';
import HardwareConfig from '../lib/config/hardware';

const HardwareConfigPage: React.FC = () => {
  const { t } = useTranslation();
  const { config, updateConfig, errors, validateConfig } = useHardwareStore();

  const handleInputChange = (field: string, value: any) => {
    console.log('handleInputChange调用:', { field, value });
    const keys = field.split('.');
    const newConfig: any = {};
    
    let current = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    console.log('准备更新的newConfig:', newConfig);
    updateConfig(newConfig);
    console.log('updateConfig调用完成');
  };

  // 使用JSON配置文件中的数据
  const cpuBrandOptions = HardwareConfig.getCpuBrands().map(brand => ({
    value: brand,
    label: t(`options.cpuBrand.${brand}`)
  }));

  // 根据CPU品牌获取对应的代数选项
  const getGenerationOptions = () => {
    const cpuBrand = config.cpu?.brand;
    if (!cpuBrand) return [];
    
    const generations = HardwareConfig.getCpuGenerations(cpuBrand);
    return generations.map(gen => ({
      value: gen,
      label: gen
    }));
  };

  // 架构选项已移除，因为项目只支持 x86_64 架构（Intel 和 AMD）

  const memoryTypeOptions = HardwareConfig.getMemoryTypes().map(type => ({
    value: type,
    label: t(`options.memoryTypes.${type}`, type)
  }));

  const storageTypeOptions = HardwareConfig.getStorageTypes().map(type => ({
    value: type,
    label: t(`options.storageTypes.${type}`, type)
  }));

  const gpuBrandOptions = HardwareConfig.getGpuBrands().map(brand => ({
    value: brand,
    label: t(`options.gpuBrands.${brand}`, brand)
  }));

  return (
    <ResponsiveContainer size="narrow" className="space-y-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
          {t('hardware.title', 'Hardware Configuration')}
        </h1>
        <p className="text-base md:text-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {t('hardware.description', 'Configure your hardware specifications to generate the optimal OpenCore configuration.')}
        </p>
      </div>

      {/* CPU Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.cpu.title', 'CPU Configuration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ResponsiveFormGroup
                label={t('hardware.cpu.brand', 'CPU Brand')}
                error={errors.cpu}
                required
              >
                <ResponsiveSelect
                  options={cpuBrandOptions}
                  value={config.cpu?.brand || ''}
                  onChange={(value) => {
                    console.log('CPU品牌选择变化:', value);
                    console.log('选择前的config:', config);
                    // 自动设置架构为 x86_64，因为项目只支持此架构
                    handleInputChange('cpu.brand', value);
                    handleInputChange('cpu.architecture', 'x86_64');
                    console.log('选择后的config:', config);
                  }}
                  error={!!errors.cpu}
                  placeholder="选择 CPU 品牌"
                />
              </ResponsiveFormGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ResponsiveFormGroup
                label={t('hardware.cpu.generation', 'Generation')}
                description={config.cpu?.brand ? `选择${config.cpu.brand}代数或手动输入` : "请先选择CPU代数"}
              >
                {config.cpu?.brand ? (
                  <div className="space-y-2">
                    <ResponsiveSelect
                      options={getGenerationOptions()}
                      value={config.cpu?.generation || ''}
                      onChange={(value) => handleInputChange('cpu.generation', value)}
                      placeholder={`选择${config.cpu.brand}代数`}
                    />
                    <ResponsiveInput
                      value={config.cpu?.generation || ''}
                      onChange={(e) => handleInputChange('cpu.generation', e.target.value)}
                      placeholder="或手动输入代数"
                    />
                  </div>
                ) : (
                  <ResponsiveInput
                    value={config.cpu?.generation || ''}
                    onChange={(e) => handleInputChange('cpu.generation', e.target.value)}
                    placeholder="请先选择CPU品牌"
                    disabled
                  />
                )}
              </ResponsiveFormGroup>
              
              <ResponsiveFormGroup
                label={t('hardware.cpu.model', 'Model')}
                description="例如：i7-12700K, Ryzen 7 5800X"
              >
                <ResponsiveInput
                  value={config.cpu?.model || ''}
                  onChange={(e) => handleInputChange('cpu.model', e.target.value)}
                  placeholder="e.g., i7-12700K, Ryzen 7 5800X"
                />
              </ResponsiveFormGroup>
            </div>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* GPU Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.gpu.title', 'GPU Configuration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm className="space-y-6">
            {/* Integrated GPU */}
            <div>
              <h4 className="text-responsive-lg font-medium mb-4">
                {t('hardware.gpu.integrated', 'Integrated Graphics')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ResponsiveFormGroup
                  label={t('hardware.gpu.brand', 'Brand')}
                >
                  <ResponsiveSelect
                    options={gpuBrandOptions.filter(opt => opt.value !== 'NVIDIA')}
                    value={config.gpu?.integrated?.brand || ''}
                    onChange={(value) => handleInputChange('gpu.integrated.brand', value)}
                    placeholder="选择集成显卡品牌"
                  />
                </ResponsiveFormGroup>
                
                <ResponsiveFormGroup
                  label={t('hardware.gpu.model', 'Model')}
                  description="例如：UHD Graphics 770, Vega 8"
                >
                  <ResponsiveInput
                    value={config.gpu?.integrated?.model || ''}
                    onChange={(e) => handleInputChange('gpu.integrated.model', e.target.value)}
                    placeholder="e.g., UHD Graphics 770, Vega 8"
                  />
                </ResponsiveFormGroup>
              </div>
            </div>

            {/* Discrete GPU */}
            <div>
              <h4 className="text-responsive-lg font-medium mb-4">
                {t('hardware.gpu.discrete', 'Discrete Graphics')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ResponsiveFormGroup
                  label={t('hardware.gpu.brand', 'Brand')}
                >
                  <ResponsiveSelect
                    options={gpuBrandOptions}
                    value={config.gpu?.discrete?.brand || ''}
                    onChange={(value) => handleInputChange('gpu.discrete.brand', value)}
                    placeholder="选择独立显卡品牌"
                  />
                </ResponsiveFormGroup>
                
                <ResponsiveFormGroup
                  label={t('hardware.gpu.model', 'Model')}
                  description="例如：RTX 4070, RX 6800 XT"
                >
                  <ResponsiveInput
                    value={config.gpu?.discrete?.model || ''}
                    onChange={(e) => handleInputChange('gpu.discrete.model', e.target.value)}
                    placeholder="e.g., RTX 4070, RX 6800 XT"
                  />
                </ResponsiveFormGroup>
              </div>
            </div>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* Motherboard Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.motherboard.title', 'Motherboard')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResponsiveFormGroup
              label={t('hardware.motherboard.brand', 'Brand')}
              error={errors.motherboard}
              required
              description="例如：ASUS, MSI, Gigabyte"
            >
              <ResponsiveInput
                value={config.motherboard?.brand || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('motherboard.brand', e.target.value)}
                placeholder="e.g., ASUS, MSI, Gigabyte"
                error={!!errors.motherboard}
              />
            </ResponsiveFormGroup>
            
            <ResponsiveFormGroup
              label={t('hardware.motherboard.model', 'Model')}
              description="例如：Z690-A, B550 AORUS"
            >
              <ResponsiveInput
                value={config.motherboard?.model || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('motherboard.model', e.target.value)}
                placeholder="e.g., Z690-A, B550 AORUS"
              />
            </ResponsiveFormGroup>
            
            <ResponsiveFormGroup
              label={t('hardware.motherboard.chipset', 'Chipset')}
              description="例如：Z690, B550"
            >
              <ResponsiveInput
                value={config.motherboard?.chipset || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('motherboard.chipset', e.target.value)}
                placeholder="e.g., Z690, B550"
              />
            </ResponsiveFormGroup>
          </div>
        </CardContent>
      </Card>

      {/* Memory Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.memory.title', 'Memory (RAM)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <ResponsiveFormGroup
                label={t('hardware.memory.size', 'Size (GB)')}
                error={errors.memory}
                required
                description="例如：16, 32"
              >
                <ResponsiveInput
                   type="number"
                   value={String(config.memory?.size || '')}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('memory.size', parseInt(e.target.value) || 0)}
                   placeholder="16"
                   error={!!errors.memory}
                 />
              </ResponsiveFormGroup>
              
              <ResponsiveFormGroup
                label={t('hardware.memory.type', 'Type')}
              >
                <ResponsiveSelect
                  options={memoryTypeOptions}
                  value={config.memory?.type || ''}
                  onChange={(value) => handleInputChange('memory.type', value)}
                  placeholder="选择内存类型"
                />
              </ResponsiveFormGroup>
              
              <ResponsiveFormGroup
                label={t('hardware.memory.speed', 'Speed (MHz)')}
                description="例如：3200, 3600"
              >
                <ResponsiveInput
                   type="number"
                   value={String(config.memory?.speed || '')}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('memory.speed', parseInt(e.target.value) || 0)}
                   placeholder="3200"
                 />
              </ResponsiveFormGroup>
            </div>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* Storage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.storage.title', 'Storage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm>
            <ResponsiveFormGroup
              label={t('hardware.storage.type', 'Primary Storage Type')}
            >
              <ResponsiveSelect
                options={storageTypeOptions}
                value={config.storage?.type || ''}
                onChange={(value) => handleInputChange('storage.type', value)}
                placeholder="选择存储类型"
              />
            </ResponsiveFormGroup>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* Audio Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.audio.title', 'Audio')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ResponsiveFormGroup
                label={t('hardware.audio.codec', 'Audio Codec')}
                description="例如：ALC897, ALC1220"
              >
                <ResponsiveInput
                  value={config.audio?.codec || ''}
                  onChange={(e) => handleInputChange('audio.codec', e.target.value)}
                  placeholder="e.g., ALC897, ALC1220"
                />
              </ResponsiveFormGroup>
              
              <ResponsiveFormGroup
                label={t('hardware.audio.layout', 'Layout ID')}
                description="音频布局 ID"
              >
                <ResponsiveInput
                   type="number"
                   value={String(config.audio?.layout || '')}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('audio.layout', parseInt(e.target.value) || 0)}
                   placeholder="1"
                 />
              </ResponsiveFormGroup>
            </div>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('hardware.network.title', 'Network')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveForm className="space-y-6">
            {/* Ethernet */}
            <div>
              <h4 className="text-responsive-lg font-medium mb-4">
                {t('hardware.network.ethernet', 'Ethernet')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ResponsiveFormGroup
                  label={t('hardware.network.brand', 'Brand')}
                  description="例如：Intel, Realtek"
                >
                  <ResponsiveInput
                    value={config.network?.ethernet?.brand || ''}
                    onChange={(e) => handleInputChange('network.ethernet.brand', e.target.value)}
                    placeholder="e.g., Intel, Realtek"
                  />
                </ResponsiveFormGroup>
                
                <ResponsiveFormGroup
                  label={t('hardware.network.model', 'Model')}
                  description="例如：I225-V, RTL8125B"
                >
                  <ResponsiveInput
                    value={config.network?.ethernet?.model || ''}
                    onChange={(e) => handleInputChange('network.ethernet.model', e.target.value)}
                    placeholder="e.g., I225-V, RTL8125B"
                  />
                </ResponsiveFormGroup>
              </div>
            </div>

            {/* WiFi */}
            <div>
              <h4 className="text-responsive-lg font-medium mb-4">
                {t('hardware.network.wifi', 'WiFi')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ResponsiveFormGroup
                  label={t('hardware.network.brand', 'Brand')}
                  description="例如：Intel, Broadcom"
                >
                  <ResponsiveInput
                    value={config.network?.wifi?.brand || ''}
                    onChange={(e) => handleInputChange('network.wifi.brand', e.target.value)}
                    placeholder="e.g., Intel, Broadcom"
                  />
                </ResponsiveFormGroup>
                
                <ResponsiveFormGroup
                  label={t('hardware.network.model', 'Model')}
                  description="例如：AX200, BCM94360CS2"
                >
                  <ResponsiveInput
                    value={config.network?.wifi?.model || ''}
                    onChange={(e) => handleInputChange('network.wifi.model', e.target.value)}
                    placeholder="e.g., AX200, BCM94360CS2"
                  />
                </ResponsiveFormGroup>
              </div>
            </div>

            {/* Bluetooth */}
            <div>
              <h4 className="text-responsive-lg font-medium mb-4">
                {t('hardware.network.bluetooth', 'Bluetooth')}
              </h4>
              <ResponsiveFormGroup
                label={t('hardware.network.version', 'Version')}
                description="例如：5.0, 5.2"
                className="max-w-xs"
              >
                <ResponsiveInput
                  value={config.network?.bluetooth?.version || ''}
                  onChange={(e) => handleInputChange('network.bluetooth.version', e.target.value)}
                  placeholder="e.g., 5.0, 5.2"
                />
              </ResponsiveFormGroup>
            </div>
          </ResponsiveForm>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <ResponsiveButton variant="outline" className="order-2 sm:order-1">
          {t('common.reset', 'Reset')}
        </ResponsiveButton>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
          <ResponsiveButton variant="secondary">
            {t('common.save_draft', 'Save Draft')}
          </ResponsiveButton>
          
          <ResponsiveButton 
            onClick={() => {
              if (validateConfig()) {
                // Navigate to next step
              }
            }}
          >
            {t('common.continue', 'Continue')}
          </ResponsiveButton>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default HardwareConfigPage;