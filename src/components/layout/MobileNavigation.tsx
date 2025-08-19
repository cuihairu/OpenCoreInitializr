import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, Settings, History, Download, Info, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const navigationItems = [
    {
      path: '/',
      icon: Home,
      label: t('nav.home', 'Home'),
      description: t('nav.home_desc', 'Start configuration')
    },
    {
      path: '/hardware',
      icon: Settings,
      label: t('nav.hardware', 'Hardware'),
      description: t('nav.hardware_desc', 'Configure hardware')
    },
    {
      path: '/kexts',
      icon: Package,
      label: t('nav.kexts'),
      description: t('nav.kexts_desc')
    },
    {
      path: '/history',
      icon: History,
      label: t('nav.history', 'History'),
      description: t('nav.history_desc', 'View saved configs')
    },
    {
      path: '/download',
      icon: Download,
      label: t('nav.download', 'Download'),
      description: t('nav.download_desc', 'Download OpenCore')
    },
    {
      path: '/about',
      icon: Info,
      label: t('nav.about', 'About'),
      description: t('nav.about_desc', 'About this tool')
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: 'hsl(var(--card))', 
          borderColor: 'hsl(var(--border))', 
          border: '1px solid',
          minWidth: '48px',
          minHeight: '48px'
        }}
        aria-label={isOpen ? t('nav.close_menu', 'Close menu') : t('nav.open_menu', 'Open menu')}
      >
        {isOpen ? (
          <X className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        ) : (
          <Menu className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <nav
          className={`
            md:hidden fixed top-0 left-0 h-full w-72 max-w-[75vw] z-40
            transform transition-transform duration-300 ease-in-out shadow-xl
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{
            backgroundColor: 'hsl(var(--card))', 
            borderRight: '1px solid hsl(var(--border))',
            backdropFilter: 'blur(8px)'
          }}
        aria-label={t('nav.main_navigation', 'Main navigation')}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b" style={{borderColor: 'hsl(var(--border))'}}>
            <h2 className="text-xl font-bold text-foreground">
              OpenCore Initializr
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('app.description', 'Generate OpenCore configurations')}
            </p>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg transition-colors touch-target
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {item.label}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="p-4 border-t" style={{borderColor: 'hsl(var(--border))'}}>
            <div className="text-xs text-muted-foreground text-center">
              {t('app.version', 'Version')} 1.0.0
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;

// Hook for managing mobile navigation state
export const useMobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  // Close menu when route changes
  React.useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return {
    isOpen,
    toggle,
    open,
    close
  };
};