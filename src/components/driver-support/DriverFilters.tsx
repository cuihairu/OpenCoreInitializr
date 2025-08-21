import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  DriverCategoryInfo,
  DriverSearchFilter,
  DriverCategory,
  DriverPriority
} from '@/types/driver-support';

interface DriverFiltersProps {
  categories: DriverCategoryInfo[];
  searchFilter: DriverSearchFilter;
  onSearchFilterChange: (filter: DriverSearchFilter) => void;
}

const DriverFilters: React.FC<DriverFiltersProps> = ({ categories, searchFilter, onSearchFilterChange }) => {
  const { t, getText } = useTranslation();

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchFilterChange({ ...searchFilter, keyword: e.target.value });
  };

  const handleCategoryChange = (categoryId: DriverCategory, checked: boolean) => {
    const newCategories = checked
      ? [...(searchFilter.categories || []), categoryId]
      : (searchFilter.categories || []).filter(id => id !== categoryId);
    onSearchFilterChange({ ...searchFilter, categories: newCategories });
  };

  const handlePriorityChange = (value: string) => {
    const priorities = value === 'all' ? [] : [value as DriverPriority];
    onSearchFilterChange({ ...searchFilter, priority: priorities });
  };

  return (
    <div className="bg-card p-4 rounded-lg border mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-2">
          <Label htmlFor="search-kexts" className="mb-2 block">{t('kexts.search')}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-kexts"
              placeholder={t('kexts.search_placeholder')}
              className="pl-10"
              value={searchFilter.keyword}
              onChange={handleKeywordChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="priority-select" className="mb-2 block">{t('kexts.priority')}</Label>
          <Select onValueChange={handlePriorityChange} defaultValue="all">
            <SelectTrigger id="priority-select">
              <SelectValue placeholder={t('kexts.select_priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kexts.all_priorities')}</SelectItem>
              <SelectItem value="essential">{t('kexts.essential')}</SelectItem>
              <SelectItem value="recommended">{t('kexts.recommended')}</SelectItem>
              <SelectItem value="optional">{t('kexts.optional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4">
          <Label className="mb-2 block">{t('kexts.category')}</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {categories.map((category: DriverCategoryInfo) => (
              <div key={category.id} className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={searchFilter.categories?.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                />
                <Label htmlFor={`category-${category.id}`} className="ml-2 font-normal">
                  {getText(category.name)}
                </Label>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default DriverFilters;