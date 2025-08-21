import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui';
import { driverSupportService } from '@/lib/services/driver-support';
import { useDriverCart } from '@/lib/store/driver-cart';
import DriverCartIcon from './DriverCartIcon';
import DriverCartModal from './DriverCartModal';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  DriverSupportInfo,
  DriverCategoryInfo,
  DriverSearchFilter,
  DriverSearchResult,
  DriverCategory,
  DriverPriority
} from '@/types/driver-support';
import DriverList from './DriverList';
import DriverFilters from './DriverFilters';

const DriverSupportPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<DriverSearchResult | null>(null);
  const [categories, setCategories] = useState<DriverCategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'recent'>('all');
  
  const { isOpen: isCartOpen, closeCart } = useDriverCart();
  
  const [searchFilter, setSearchFilter] = useState<DriverSearchFilter>({
    keyword: '',
    categories: [],
    priority: []
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const categoriesData = await driverSupportService.getCategories();
        setCategories(categoriesData);
        
        const initialResult = await driverSupportService.searchDrivers({
          keyword: '',
          categories: [],
          priority: []
        }, 1); // 现在使用默认的页面大小
        setSearchResult(initialResult);
      } catch (error) {
        console.error('Failed to initialize driver support data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleSearch = useMemo(() => {
    return async () => {
      try {
        setLoading(true);
        const result = await driverSupportService.searchDrivers(searchFilter, currentPage);
        setSearchResult(result);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };
  }, [searchFilter, currentPage]);

  const uniqueDrivers = useMemo(() => {
    if (!searchResult?.drivers) return [];
    const map = new Map<string, DriverSupportInfo>();
    for (const d of searchResult.drivers) {
      if (!map.has(d.id)) map.set(d.id, d);
    }
    return Array.from(map.values());
  }, [searchResult?.drivers]);

  const getFilteredDrivers = useMemo(() => {
    if (!uniqueDrivers.length) return [];

    switch (activeTab) {
      case 'recommended':
        return uniqueDrivers.filter(driver => 
          driver.priority === 'essential' || driver.priority === 'recommended'
        );
      case 'recent':
        return uniqueDrivers;
      case 'all':
      default:
        return uniqueDrivers;
    }
  }, [uniqueDrivers, activeTab]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleCategoryChange = (categoryId: DriverCategory, checked: boolean) => {
    setSearchFilter(prev => ({
      ...prev,
      categories: checked
        ? [...(prev.categories || []), categoryId]
        : (prev.categories || []).filter(id => id !== categoryId)
    }));
  };

  const handlePriorityChange = (value: string) => {
    const priorities = value === 'all' ? [] : [value as DriverPriority];
    setSearchFilter(prev => ({ ...prev, priority: priorities }));
  };

  const essentialDrivers = useMemo(() => uniqueDrivers.filter(d => d.priority === 'essential'), [uniqueDrivers]);
  const recommendedDrivers = useMemo(() => uniqueDrivers.filter(d => d.priority === 'recommended'), [uniqueDrivers]);
  const optionalDrivers = useMemo(() => uniqueDrivers.filter(d => d.priority === 'optional'), [uniqueDrivers]);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('kexts.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('kexts.description')}</p>
        </div>
        <DriverCartIcon />
      </header>

      <DriverFilters 
        categories={categories}
        searchFilter={searchFilter}
        onSearchFilterChange={setSearchFilter}
      />

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">{t('kexts.all_drivers')}</TabsTrigger>
              <TabsTrigger value="recommended">{t('kexts.recommended_drivers')}</TabsTrigger>
              <TabsTrigger value="recent">{t('kexts.recent_updates')}</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="text-center py-12">
              <p>{t('kexts.loading')}</p>
            </div>
          ) : (
            <div className="space-y-12">
              <DriverList drivers={essentialDrivers} title={t('kexts.essential_drivers')} />
              <DriverList drivers={recommendedDrivers} title={t('kexts.recommended_drivers')} />
              <DriverList drivers={optionalDrivers} title={t('kexts.optional_drivers')} />
            </div>
          )}
        </main>
      
      <DriverCartModal isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default DriverSupportPage;