import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

// Import data (in a real app, you might lazy load this)
import intelCpuData from '@/data/hardware/cpu/intel.json';
import amdCpuData from '@/data/hardware/cpu/amd.json';
import chipsetData from '@/data/hardware/motherboard/chipsets.json';
import gpuData from '@/data/hardware/gpu/graphics.json';

export interface HardwareSelection {
  cpuGeneration: string;
  cpuModel: string;
  chipset: string;
  gpuBrand: string;
  gpuSeries: string;
  gpuModel: string;
}

interface HardwareSelectionProps {
  platform: 'intel' | 'amd';
  onComplete: (selection: HardwareSelection) => void;
  onBack: () => void;
}

export const Step2_HardwareSelection: React.FC<HardwareSelectionProps> = ({ platform, onComplete, onBack }) => {
  const [selection, setSelection] = useState<Partial<HardwareSelection>>({});
  const [cpuModels, setCpuModels] = useState<string[]>([]);
  const [gpuSeries, setGpuSeries] = useState<any[]>([]);
  const [gpuModels, setGpuModels] = useState<string[]>([]);

  const cpuData = platform === 'intel' ? intelCpuData : amdCpuData;
  const relevantChipsets = platform === 'intel' ? chipsetData.intel.chipsets : chipsetData.amd.chipsets;

  useEffect(() => {
    // Reset selections when platform changes (though it shouldn't in this wizard flow)
    setSelection({});
    setCpuModels([]);
    setGpuSeries([]);
    setGpuModels([]);
  }, [platform]);

  const handleCpuGenChange = (genName: string) => {
    const generation = cpuData.generations.find(g => g.name === genName);
    setSelection({ ...selection, cpuGeneration: genName, cpuModel: undefined });
    setCpuModels(generation ? generation.models : []);
  };

  const handleGpuBrandChange = (brand: string) => {
    const brandData = gpuData[brand as keyof typeof gpuData];
    setSelection({ ...selection, gpuBrand: brand, gpuSeries: undefined, gpuModel: undefined });
    setGpuSeries(brandData ? brandData.series : []);
    setGpuModels([]);
  };

  const handleGpuSeriesChange = (seriesName: string) => {
    const series = gpuSeries.find(s => s.name === seriesName);
    setSelection({ ...selection, gpuSeries: seriesName, gpuModel: undefined });
    setGpuModels(series ? series.models : []);
  };

  const isFormComplete = 
    selection.cpuGeneration &&
    selection.cpuModel &&
    selection.chipset &&
    selection.gpuBrand &&
    selection.gpuSeries &&
    selection.gpuModel;

  const handleSubmit = () => {
    if (isFormComplete) {
      onComplete(selection as HardwareSelection);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">核心硬件选择</CardTitle>
          <CardDescription>请提供您的主要硬件信息，以便我们为您定制配置。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPU Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu-gen">CPU 代数</Label>
              <Select onValueChange={handleCpuGenChange}>
                <SelectTrigger id="cpu-gen"><SelectValue placeholder="选择 CPU 代数..." /></SelectTrigger>
                <SelectContent>
                  {cpuData.generations.map(gen => (
                    <SelectItem key={gen.name} value={gen.name}>{gen.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpu-model">CPU 型号</Label>
              <Select 
                disabled={!selection.cpuGeneration}
                onValueChange={value => setSelection({...selection, cpuModel: value})}
              >
                <SelectTrigger id="cpu-model"><SelectValue placeholder="选择 CPU 型号..." /></SelectTrigger>
                <SelectContent>
                  {cpuModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chipset Selection */}
          <div className="space-y-2">
            <Label htmlFor="chipset">主板芯片组</Label>
            <Select onValueChange={value => setSelection({...selection, chipset: value})}>
              <SelectTrigger id="chipset"><SelectValue placeholder="选择主板芯片组..." /></SelectTrigger>
              <SelectContent>
                {relevantChipsets.flatMap(series => series.models.map((model, index) => (
                  <SelectItem key={`${series.series}-${model}-${index}`} value={model}>{model}</SelectItem>
                )))}
              </SelectContent>
            </Select>
          </div>

          {/* GPU Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpu-brand">显卡品牌</Label>
              <Select onValueChange={handleGpuBrandChange}>
                <SelectTrigger id="gpu-brand"><SelectValue placeholder="品牌..." /></SelectTrigger>
                <SelectContent>
                  {Object.keys(gpuData).map(brand => (
                    <SelectItem key={brand} value={brand}>{gpuData[brand as keyof typeof gpuData].brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpu-series">显卡系列</Label>
              <Select disabled={!selection.gpuBrand} onValueChange={handleGpuSeriesChange}>
                <SelectTrigger id="gpu-series"><SelectValue placeholder="系列..." /></SelectTrigger>
                <SelectContent>
                  {gpuSeries.map(series => (
                    <SelectItem key={series.name} value={series.name}>{series.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpu-model">显卡型号</Label>
              <Select 
                disabled={!selection.gpuSeries}
                onValueChange={value => setSelection({...selection, gpuModel: value})}
              >
                <SelectTrigger id="gpu-model"><SelectValue placeholder="型号..." /></SelectTrigger>
                <SelectContent>
                  {gpuModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>返回</Button>
          <Button onClick={handleSubmit} disabled={!isFormComplete}>下一步</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
