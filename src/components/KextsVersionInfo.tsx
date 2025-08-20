import { useEffect, useState } from 'react';
import { driverSupportService } from '@/lib/services/driver-support';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DriverCategoryInfo, DriverSupportInfo, LocalizedText } from '@/types/driver-support';
import { useTranslation } from '@/hooks/useTranslation';

export function KextsVersionInfo() {
  const [categories, setCategories] = useState<DriverCategoryInfo[]>([]);
  const [kexts, setKexts] = useState<DriverSupportInfo[]>([]);
  const { t, i18n } = useTranslation();

  const getText = (text: LocalizedText | string | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    const lang = i18n.language as keyof LocalizedText;
    return text[lang] || text.en;
  };

  useEffect(() => {
    const fetchDriverData = async () => {
      const [fetchedCategories, fetchedKextsResult] = await Promise.all([
        driverSupportService.getCategories(),
        driverSupportService.searchDrivers({}, 1, 1000), // Fetch all drivers
      ]);
      setCategories(fetchedCategories);
      setKexts(fetchedKextsResult.drivers);
    };

    fetchDriverData();
  }, []);

  const getKextsForCategory = (categoryId: string) => {
    return kexts.filter((kext) => kext.category === categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Kexts.title')}</CardTitle>
        <CardDescription>{t('Kexts.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={categories.map(c => c.id)}>
          {categories.map((category) => {
            const categoryKexts = getKextsForCategory(category.id);
            if (categoryKexts.length === 0) {
              return null;
            }
            return (
              <AccordionItem value={category.id} key={category.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    {category.icon && <img src={category.icon} alt="" className="w-6 h-6" />}
                    <span className="font-bold">{getText(category.name)}</span>
                    <span className="text-sm text-gray-500">({categoryKexts.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">{getText(category.description)}</p>
                  <ul className="space-y-2">
                    {categoryKexts.map((kext) => (
                      <li key={kext.id} className="p-2 border rounded-md">
                        <p className="font-semibold">{getText(kext.name)}</p>
                        <p className="text-sm">{getText(kext.description)}</p>
                        {kext.notes && <p className="text-xs text-gray-600 mt-1">{getText(kext.notes)}</p>}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}