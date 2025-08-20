import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, Download, ExternalLink, Star, Clock, Shield, Cpu, ShoppingCart, Plus, GitCommit, CheckCircle, AlertCircle, Beaker, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger, Separator, Checkbox } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  DriverPriority,
  DriverDevelopmentStatus,
  DriverCompatibility,
  LocalizedText as LocalizedTextType
} from '@/types/driver-support';

import tagsData from '@/data/driver-support/tags.json';

const DriverSupportPage: React.FC = () => {
  const { i18n } = useTranslation();
  const [searchResult, setSearchResult] = useState<DriverSearchResult | null>(null);
  const [categories, setCategories] = useState<DriverCategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'recent'>('all');
  
  const { addDriver, isDriverInCart, isOpen: isCartOpen, closeCart } = useDriverCart();
  
  const [searchFilter, setSearchFilter] = useState<DriverSearchFilter>({
    keyword: '',
    categories: [],
    priority: []
  });

  const getText = (text: LocalizedTextType | string | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    const lang = i18n.language as 'zh' | 'en';
    return text[lang] || text.en;
  };

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
        }, 1);
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

  const getPriorityIcon = (priority: DriverPriority) => {
    switch (priority) {
      case 'essential': return <Star className="w-4 h-4 text-red-500" />;
      case 'recommended': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'optional': return <Cpu className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: DriverDevelopmentStatus) => {
    switch (status) {
      case 'stable': return <Shield className="w-4 h-4 text-green-500 mr-2" />;
      case 'beta': return <Beaker className="w-4 h-4 text-yellow-500 mr-2" />;
      case 'alpha': return <Beaker className="w-4 h-4 text-orange-500 mr-2" />;
      case 'experimental': return <Beaker className="w-4 h-4 text-purple-500 mr-2" />;
      case 'deprecated': return <Info className="w-4 h-4 text-gray-500 mr-2" />;
      default: return <Info className="w-4 h-4 text-gray-500 mr-2" />;
    }
  };

  const getCompatibilityBadgeVariant = (compatibility: DriverCompatibility): BadgeProps['variant'] => {
    switch (compatibility) {
      case 'excellent': return 'success';
      case 'good': return 'default';
      case 'fair': return 'warning';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: DriverDevelopmentStatus): BadgeProps['variant'] => {
    switch (status) {
      case 'stable': return 'success';
      case 'beta': return 'warning';
      case 'alpha': return 'warning';
      case 'experimental': return 'default';
      case 'deprecated': return 'outline';
      default: return 'outline';
    }
  };

  const getCompatibilityIcon = (compatibility: DriverCompatibility) => {
    switch (compatibility) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500 mr-2" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />;
      case 'fair': return <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />;
      case 'poor': return <AlertCircle className="w-4 h-4 text-red-500 mr-2" />;
      default: return <Info className="w-4 h-4 text-gray-500 mr-2" />;
    }
  };

  function DriverList({ drivers }: { drivers: DriverSupportInfo[] }) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-2">
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{getText(driver.name)}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2 min-h-[2.5rem]">
                      {getText(driver.description)}
                    </CardDescription>
                 </div>
                 {getPriorityIcon(driver.priority)}
               </div>
             </CardHeader>
             <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
              <div>
                <TagList tags={driver.tags} />

                <div className="space-y-2 text-sm mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2" />{i18n.t('kexts.version')}</span>
                    <Badge variant="outline" className="text-xs font-normal">{driver.version.version}</Badge>
                  </div>
                  {driver.version.lastUpdated && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2" />{i18n.t('kexts.last_updated')}</span>
                      <Badge variant="outline" className="text-xs font-normal">{new Date(driver.version.lastUpdated).toLocaleDateString()}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600 flex items-center">{getStatusIcon(driver.developmentStatus)}{i18n.t('kexts.status')}</span>
                    <Badge variant={getStatusBadgeVariant(driver.developmentStatus)} className="capitalize">{i18n.t(`kexts.development_status.${driver.developmentStatus}`)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600 flex items-center">{getCompatibilityIcon(driver.compatibility)}{i18n.t('kexts.compatibility_info')}</span>
                    <Badge variant={getCompatibilityBadgeVariant(driver.compatibility)} className="capitalize">{i18n.t(`kexts.compatibility.${driver.compatibility}`)}</Badge>
                  </div>
                  {driver.hardwareSupport && driver.hardwareSupport.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 flex items-center"><Cpu className="w-4 h-4 mr-2" />{i18n.t('kexts.hardware_support')}</span>
                      <Badge variant="outline" className="text-xs font-normal">{driver.hardwareSupport[0].brand}</Badge>
                    </div>
                  )}
                  {driver.hardwareSupport && driver.hardwareSupport.length > 0 && driver.hardwareSupport[0].macosVersions && driver.hardwareSupport[0].macosVersions.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600 flex items-center"><Shield className="w-4 h-4 mr-2" />{i18n.t('kexts.min_os_version')}</span>
                      <Badge variant="outline" className="text-xs font-normal">{driver.hardwareSupport[0].macosVersions[0]}</Badge>
                    </div>
                  )}
                  {driver.github && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600 flex items-center"><Star className="w-4 h-4 mr-2" />{i18n.t('kexts.stars')}</span>
                        <span className="text-xs text-gray-500">{driver.github.starCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-600 flex items-center"><GitCommit className="w-4 h-4 mr-2" />{i18n.t('kexts.last_commit')}</span>
                        <span className="text-xs text-gray-500">{new Date(driver.github.lastCommitDate).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Separator className="my-3"/>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={isDriverInCart(driver.id) ? "secondary" : "default"}
                    onClick={() => addDriver(driver)}
                    disabled={isDriverInCart(driver.id)}
                    className="flex-1"
                  >
                    {isDriverInCart(driver.id) ? (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {i18n.t('kexts.added_to_cart')}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        {i18n.t('kexts.add_to_cart')}
                      </>
                    )}
                  </Button>
                  {(() => {
                    const targetUrl = driver.source || driver.github?.repositoryUrl;
                    const hasUrl = Boolean(targetUrl);
                    return (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { if (hasUrl && targetUrl) window.open(targetUrl, '_blank', 'noopener,noreferrer'); }}
                        disabled={!hasUrl}
                        aria-label={hasUrl ? i18n.t('kexts.open_project_page') : i18n.t('kexts.no_link_available')}
                        title={hasUrl ? i18n.t('kexts.open_project_page') : i18n.t('kexts.no_link_available')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{i18n.t('kexts.title')}</h1>
            <p className="text-gray-600">{i18n.t('kexts.subtitle')}</p>
          </div>
          
          <DriverCartIcon className="group" />
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={i18n.t('kexts.search_placeholder')}
                value={searchFilter.keyword || ''}
                onChange={(e) => setSearchFilter(prev => ({ ...prev, keyword: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={searchFilter.categories?.[0] || 'all'}
            onValueChange={(value) => 
              setSearchFilter(prev => ({ 
                ...prev, 
                categories: value === 'all' ? [] : [value as DriverCategory] 
              }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={i18n.t('kexts.select_category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.t('kexts.all_categories')}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {getText(category.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchFilter.priority?.[0] || 'all'}
            onValueChange={(value) => 
              setSearchFilter(prev => ({ 
                ...prev, 
                priority: value === 'all' ? [] : [value as DriverPriority] 
              }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder={i18n.t('kexts.priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.t('kexts.all_priorities')}</SelectItem>
              <SelectItem value="essential">{i18n.t('kexts.essential')}</SelectItem>
              <SelectItem value="recommended">{i18n.t('kexts.recommended')}</SelectItem>
              <SelectItem value="optional">{i18n.t('kexts.optional')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{i18n.t('kexts.all_drivers')}</TabsTrigger>
          <TabsTrigger value="recommended">{i18n.t('kexts.recommended_drivers')}</TabsTrigger>
          <TabsTrigger value="recent">{i18n.t('kexts.recent_updates')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{i18n.t('kexts.loading')}</p>
            </div>
          ) : (
              <DriverList drivers={getFilteredDrivers} />
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{i18n.t('kexts.loading')}</p>
            </div>
          ) : (
            <DriverList drivers={getFilteredDrivers} />
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{i18n.t('kexts.loading')}</p>
            </div>
          ) : (
            <DriverList drivers={getFilteredDrivers} />
          )}
        </TabsContent>
      </Tabs>

      {searchResult && searchResult.pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              {i18n.t('kexts.previous_page')}
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              {i18n.t('kexts.page_info', { currentPage, totalPages: searchResult.pagination.totalPages })}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === searchResult.pagination.totalPages}
              onClick={() => setCurrentPage(prev => Math.min(searchResult.pagination.totalPages, prev + 1))}
            >
              {i18n.t('kexts.next_page')}
            </Button>
          </div>
        </div>
      )}
      
      <DriverCartModal isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default DriverSupportPage;


function TagList({ tags }: { tags: (string | LocalizedTextType)[] }) {
  const { i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getText = (text: LocalizedTextType | string | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    const lang = i18n.language as 'zh' | 'en';
    return text[lang] || text.en;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!el) return;
      if (!expanded) {
        setShowToggle(el.scrollHeight > el.clientHeight + 1);
      } else {
        setShowToggle(true);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [expanded, tags]);

  const heightClasses = expanded ? 'max-h-none' : 'h-[2.75rem]';
 
   return (
     <div className="space-y-1">
       <div
         ref={containerRef}
        className={`relative flex flex-wrap content-center gap-1 overflow-hidden ${heightClasses}`}
       >
         {tags.map((tag, index) => (
             <Badge key={index} variant="secondary" className="text-xs">
             {getText(tag)}
           </Badge>
         ))}
       </div>
      {showToggle && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? i18n.t('kexts.collapse_tags') : i18n.t('kexts.expand_tags')}
          >
            {expanded ? i18n.t('kexts.collapse') : i18n.t('kexts.expand')}
          </Button>
        </div>
      )}
    </div>
  );
}