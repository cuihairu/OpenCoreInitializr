import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardState } from '@/types';
import motherboardData from '@/data/hardware/motherboard/motherboard_data.json';
import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';

interface FinalizeStepProps {
  wizardState: WizardState;
  onDownload: () => void;
  onBack: () => void;
  isDownloading: boolean;
  progress: number;
  progressMessage: string;
}

export const Step4_Finalize: React.FC<FinalizeStepProps> = ({ 
  wizardState, 
  onDownload, 
  onBack, 
  isDownloading, 
  progress, 
  progressMessage 
}) => {
  const { hardware, kexts } = wizardState;

  const biosInfo = useMemo(() => {
    if (!hardware?.chipset) return null;
    return motherboardData.find(m => m.chipset === hardware.chipset) || null;
  }, [hardware?.chipset]);

  if (!hardware || !kexts) {
    return (
      <div className="text-center">
        <p>配置信息不完整，请返回上一步。</p>
        <Button variant="outline" onClick={onBack} className="mt-4">返回</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">配置完成！</CardTitle>
          <CardDescription>请在下载前，仔细核对您的配置信息并按要求设置 BIOS。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Configuration Summary */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">配置总览</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">硬件</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><span className="font-medium text-foreground">CPU:</span> {hardware.cpuModel}</li>
                    <li><span className="font-medium text-foreground">主板:</span> {hardware.chipset}</li>
                    <li><span className="font-medium text-foreground">显卡:</span> {hardware.gpuModel}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">驱动 (Kexts)</h4>
                  <div className="flex flex-wrap gap-2">
                    {kexts.map(kext => <Badge key={kext} variant="secondary">{kext}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BIOS Settings */}
          {biosInfo && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">BIOS 设置清单</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-6 space-y-4">
                  {biosInfo.bios_settings.map((setting, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 mt-1 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {setting.setting}: <span className="text-primary">{setting.value}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">路径参考: {setting.path}</p>
                        <p className="text-xs text-muted-foreground mt-1">原因: {setting.reason}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between mt-6">
          <Button variant="ghost" onClick={onBack} disabled={isDownloading}>返回</Button>
          
          {isDownloading ? (
            <div className="w-full max-w-xs text-center">
              <Progress value={progress} showLabel={true} label={progressMessage} />
            </div>
          ) : (
            <Button onClick={onDownload} size="lg">
              生成并下载 EFI
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};