import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Clock, Shield, Cpu, ShoppingCart, Plus, GitCommit, CheckCircle, AlertCircle, Beaker, Info, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDriverCart } from '@/lib/store/driver-cart';
import type { DriverSupportInfo, DriverPriority, DriverDevelopmentStatus, DriverCompatibility, LocalizedText as LocalizedTextType } from '@/types/driver-support';

interface DriverCardProps {
  driver: DriverSupportInfo;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver }) => {
  const { i18n, getText } = useTranslation();
  const { addDriver, isDriverInCart } = useDriverCart();

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

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
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
  );
};

function TagList({ tags }: { tags: (string | LocalizedTextType)[] }) {
  const { i18n, getText } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
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

export default DriverCard;