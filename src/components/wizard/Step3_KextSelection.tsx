import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HardwareSelection, KextSelection } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LocalizedText } from "@/components/ui/localized-text";
import { DriverSupportService } from "@/lib/services/driver-support";
import { DriverCategoryInfo, DriverSupportInfo } from "@/types/driver-support";
import { useEffect, useMemo, useState } from "react";
import { getRecommendedKexts } from '@/lib/config/recommendations';

interface Step3Props {
  hardware: HardwareSelection;
  onBack: () => void;
  onComplete: (kexts: KextSelection) => void;
}

const KextItem: React.FC<{
  kext: DriverSupportInfo;
  isSelected: boolean;
  onToggle: (kextName: string, isSelected: boolean) => void;
}> = ({ kext, isSelected, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start gap-4">
        <Checkbox
          id={kext.id}
          checked={isSelected}
          onCheckedChange={(checked) => onToggle(kext.id, !!checked)}
        />
        <div className="space-y-1">
          <Label htmlFor={kext.id} className="font-semibold cursor-pointer">
            <LocalizedText text={kext.name} />
          </Label>
          <p className="text-sm text-muted-foreground">
            <LocalizedText text={kext.description} />
          </p>
        </div>
      </div>
    </div>
  );
};

const Step3: React.FC<Step3Props> = ({ hardware, onBack, onComplete }) => {
  const [allKexts, setAllKexts] = useState<DriverSupportInfo[]>([]);
  const recommended = useMemo(() => getRecommendedKexts(hardware, allKexts), [hardware, allKexts]);
  const [selectedKexts, setSelectedKexts] = useState<KextSelection>([]);
  const [kextCategories, setKextCategories] = useState<DriverCategoryInfo[]>([]);
  const [kextsByCategory, setKextsByCategory] = useState<Record<string, DriverSupportInfo[]>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const driverSupportService = DriverSupportService.getInstance();

  useEffect(() => {
    const allDrivers = driverSupportService.searchDrivers({}).drivers;
    setAllKexts(allDrivers);

    const categories = driverSupportService.getCategories();
    setKextCategories(categories);

    const initialOpenState: Record<string, boolean> = {};
    const drivers: Record<string, DriverSupportInfo[]> = {};
    categories.forEach(category => {
      drivers[category.id] = driverSupportService.getDriversByCategory(category.id);
      initialOpenState[category.id] = true; // Default to open
    });
    setKextsByCategory(drivers);
    setOpenCategories(initialOpenState);
  }, [driverSupportService]);

  useEffect(() => {
    setSelectedKexts(recommended);
  }, [recommended]);

  const handleKextToggle = (kextName: string, isChecked: boolean) => {
    setSelectedKexts(prev => {
      if (isChecked) {
        return [...prev, kextName];
      } else {
        return prev.filter(k => k !== kextName);
      }
    });
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const recommendedKextsData = recommended
    .map(kextId => allKexts.find(k => k.id === kextId))
    .filter((k): k is DriverSupportInfo => !!k);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>选择驱动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">推荐驱动</h3>
              <div className="space-y-2">
                {recommendedKextsData.map(kext => (
                  <KextItem
                    key={kext.id}
                    kext={kext}
                    isSelected={selectedKexts.includes(kext.id)}
                    onToggle={handleKextToggle}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">其他可用驱动</h3>
              <div className="w-full space-y-2">
                {kextCategories.map((category) => {
                  const kexts = kextsByCategory[category.id]?.filter(k => !recommended.includes(k.id));
                  if (!kexts || kexts.length === 0) return null;

                  return (
                    <Collapsible key={category.id} open={openCategories[category.id]} onOpenChange={() => toggleCategory(category.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full p-4 text-left bg-muted/50 rounded-lg hover:bg-muted cursor-pointer">
                            <span className="font-medium">
                              <LocalizedText text={category.name} />
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {kexts.length} 个驱动
                            </span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 p-4 pt-2">
                          {kexts.map(kext => (
                            <KextItem
                              key={kext.id}
                              kext={kext}
                              isSelected={selectedKexts.includes(kext.id)}
                              onToggle={handleKextToggle}
                            />
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
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

export default Step3;
