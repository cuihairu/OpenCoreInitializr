import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HardwareSelection } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import kextCategories from '@/data/kexts/index.json';
import systemKexts from '@/data/kexts/system.json';
import audioKexts from '@/data/kexts/audio.json';
import networkKexts from '@/data/kexts/network.json';
import usbKexts from '@/data/kexts/usb.json';

const allKextData = {
  system: systemKexts,
  audio: audioKexts,
  network: networkKexts,
  usb: usbKexts,
};

export type KextSelection = string[];

interface KextSelectionProps {
  hardware: HardwareSelection;
  onComplete: (selection: KextSelection) => void;
  onBack: () => void;
}

const getRecommendedKexts = (hardware: HardwareSelection): KextSelection => {
  const recommendations = new Set<string>();
  systemKexts.kexts.forEach(kext => {
    if (kext.required) recommendations.add(kext.name);
  });
  if (hardware.gpuBrand === 'amd' || hardware.gpuBrand === 'intel') {
    recommendations.add('WhateverGreen');
  }
  recommendations.add('AppleALC');
  // Determine platform based on CPU generation/model
  const isIntelPlatform = hardware.cpuGeneration?.toLowerCase().includes('intel') || 
                         hardware.cpuModel?.toLowerCase().includes('intel') ||
                         !hardware.cpuGeneration?.toLowerCase().includes('amd');
  
  if (isIntelPlatform) {
    recommendations.add('IntelMausi');
  } else {
    recommendations.add('RealtekRTL8111');
  }
  return Array.from(recommendations);
};

const KextItem: React.FC<{ 
  kext: any; 
  isSelected: boolean; 
  onToggle: (name: string, checked: boolean) => void;
}> = ({ kext, isSelected, onToggle }) => (
  <div key={kext.name} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent">
    <Checkbox
      id={kext.name}
      checked={isSelected}
      onCheckedChange={(checked) => onToggle(kext.name, !!checked)}
    />
    <div className="grid gap-1.5 leading-none">
      <Label htmlFor={kext.name} className="text-sm font-medium cursor-pointer">
        {kext.name} <span className="text-xs text-muted-foreground">v{kext.version}</span>
      </Label>
      <p className="text-sm text-muted-foreground">{kext.description}</p>
    </div>
  </div>
);

export const Step3_KextSelection: React.FC<KextSelectionProps> = ({ hardware, onComplete, onBack }) => {
  const recommended = useMemo(() => getRecommendedKexts(hardware), [hardware]);
  const [selectedKexts, setSelectedKexts] = useState<KextSelection>(recommended);

  const handleKextToggle = (kextName: string, isChecked: boolean) => {
    setSelectedKexts(prev => 
      isChecked ? [...prev, kextName] : prev.filter(name => name !== kextName)
    );
  };

  const recommendedLists = {
      system: systemKexts.kexts.filter(k => recommended.includes(k.name)),
      audio: audioKexts.kexts.filter(k => recommended.includes(k.name)),
      network: networkKexts.kexts.filter(k => recommended.includes(k.name)),
      usb: usbKexts.kexts.filter(k => recommended.includes(k.name)),
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Kext 与驱动选择</CardTitle>
          <CardDescription>我们已根据您的硬件为您推荐了必要的驱动。您也可以按需增减。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">推荐驱动</h3>
            <div className="space-y-2">
              {Object.values(recommendedLists).flat().map(kext => (
                  <KextItem kext={kext} isSelected={selectedKexts.includes(kext.name)} onToggle={handleKextToggle} key={kext.name} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">其他可用驱动</h3>
            <div className="w-full space-y-2">
              {kextCategories.categories.map(category => {
                const categoryId = category.id as keyof typeof allKextData;
                const kexts = allKextData[categoryId]?.kexts.filter(k => !recommended.includes(k.name));
                if (!kexts || kexts.length === 0) return null;

                return (
                  <Collapsible key={category.id}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/50 rounded-lg hover:bg-muted">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{category.icon} {category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {kexts.length} 个驱动
                        </span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 p-4 pt-2">
                        {kexts.map(kext => (
                          <KextItem
                            key={kext.name}
                            kext={kext}
                            isSelected={selectedKexts.includes(kext.name)}
                            onToggle={handleKextToggle}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>返回</Button>
          <Button onClick={() => onComplete(selectedKexts)}>下一步</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
