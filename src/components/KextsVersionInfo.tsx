import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useHardwareStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronDown, ChevronUp, Download, Info } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface KextInfo {
  name: string;
  version: string;
  description: string;
  compatibility: {
    minMacOS: string;
    maxMacOS: string;
    architectures: string[];
  };
  hardwareSupport: Record<string, any>;
  downloadUrl: string;
  required: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[];
  notes?: string;
}

interface KextCategory {
  category: string;
  name: string;
  description: string;
  kexts: KextInfo[];
}

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: number;
  file: string;
}

const KextsVersionInfo: React.FC = () => {
  const { t } = useTranslation();
  const { config } = useHardwareStore();
  const [kextCategories, setKextCategories] = useState<KextCategory[]>([]);
  const [categoryIndex, setCategoryIndex] = useState<CategoryInfo[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['system']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKextData();
  }, []);

  const loadKextData = async () => {
    try {
      // 加载分类索引
      const indexResponse = await fetch('/src/data/kexts/index.json');
      const indexData = await indexResponse.json();
      setCategoryIndex(indexData.categories);

      // 加载各分类的kext数据
      const categories: KextCategory[] = [];
      for (const category of indexData.categories) {
        try {
          const categoryResponse = await fetch(`/src/data/kexts/${category.file}`);
          const categoryData = await categoryResponse.json();
          categories.push(categoryData);
        } catch (error) {
          console.warn(`Failed to load kext category: ${category.file}`, error);
        }
      }
      
      setKextCategories(categories);
    } catch (error) {
      console.error('Failed to load kext data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getRelevantKexts = (category: KextCategory): KextInfo[] => {
    if (!config) return category.kexts.filter(kext => kext.required || kext.priority === 'critical');

    return category.kexts.filter(kext => {
      // 必需的驱动总是显示
      if (kext.required || kext.priority === 'critical') return true;

      // 根据硬件配置过滤相关驱动
      const { hardwareSupport } = kext;
      
      // 检查CPU品牌
      if (hardwareSupport.cpuBrands && config.cpu?.brand) {
        if (hardwareSupport.cpuBrands.includes(config.cpu.brand)) return true;
      }

      // 检查GPU品牌
      if (hardwareSupport.gpuBrands && (config.gpu?.integrated?.brand || config.gpu?.discrete?.brand)) {
        const gpuBrand = config.gpu.integrated?.brand || config.gpu.discrete?.brand;
        if (gpuBrand && hardwareSupport.gpuBrands.includes(gpuBrand)) return true;
      }

      // 检查音频编解码器
       if (hardwareSupport.audioCodecs && config.audio?.codec) {
         if (hardwareSupport.audioCodecs.some((codec: string) => 
           config.audio?.codec?.toLowerCase().includes(codec.toLowerCase()) ||
           codec.toLowerCase().includes(config.audio?.codec?.toLowerCase() || '')
         )) return true;
       }

      // 检查网络芯片
      if (hardwareSupport.networkChips && (config.network?.ethernet?.brand || config.network?.ethernet?.model)) {
        const ethernetInfo = `${config.network.ethernet?.brand || ''} ${config.network.ethernet?.model || ''}`.trim();
        if (hardwareSupport.networkChips.some((chip: string) => 
          ethernetInfo.toLowerCase().includes(chip.toLowerCase()) ||
          chip.toLowerCase().includes(ethernetInfo.toLowerCase())
        )) return true;
      }

      // 检查WiFi芯片
      if (hardwareSupport.wifiChips && (config.network?.wifi?.brand || config.network?.wifi?.model)) {
        const wifiInfo = `${config.network.wifi?.brand || ''} ${config.network.wifi?.model || ''}`.trim();
        if (hardwareSupport.wifiChips.some((chip: string) => 
          wifiInfo.toLowerCase().includes(chip.toLowerCase()) ||
          chip.toLowerCase().includes(wifiInfo.toLowerCase())
        )) return true;
      }

      // 通用支持的驱动
      if (hardwareSupport.universal) return true;

      return false;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return '必需';
      case 'high': return '重要';
      case 'medium': return '推荐';
      case 'low': return '可选';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧</span>
            Kexts 驱动版本
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔧</span>
          Kexts 驱动版本
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          根据您的硬件配置推荐的驱动程序
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {kextCategories.map((category) => {
          const relevantKexts = getRelevantKexts(category);
          const categoryInfo = categoryIndex.find(c => c.id === category.category);
          
          if (relevantKexts.length === 0) return null;

          return (
            <Collapsible
              key={category.category}
              open={expandedCategories.has(category.category)}
              onOpenChange={() => toggleCategory(category.category)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryInfo?.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {relevantKexts.length} 个驱动
                      </div>
                    </div>
                  </div>
                  {expandedCategories.has(category.category) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {relevantKexts.map((kext) => (
                  <div
                    key={kext.name}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{kext.name}</h4>
                          <Badge variant="outline">v{kext.version}</Badge>
                          <Badge className={getPriorityColor(kext.priority)}>
                            {getPriorityText(kext.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {kext.description}
                        </p>
                        {kext.dependencies && kext.dependencies.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">依赖:</span>
                            {kext.dependencies.map((dep) => (
                              <Badge key={dep} variant="secondary" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {kext.notes && (
                          <div className="flex items-center gap-1 mt-1">
                            <Info className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-amber-600">{kext.notes}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(kext.downloadUrl, '_blank')}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>下载 {kext.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      兼容: macOS {kext.compatibility.minMacOS} - {kext.compatibility.maxMacOS}
                      {' | '}
                      架构: {kext.compatibility.architectures.join(', ')}
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default KextsVersionInfo;