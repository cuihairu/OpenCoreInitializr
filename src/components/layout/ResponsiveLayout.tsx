import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showSidebar?: boolean;
  sidebarTitle?: string;
  onSidebarToggle?: (isOpen: boolean) => void;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  showSidebar = false,
  sidebarTitle = '菜单',
  onSidebarToggle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onSidebarToggle?.(newState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    onSidebarToggle?.(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端导航栏 */}
      {(header || showSidebar) && (
        <div className="mobile-nav md:hidden">
          <div className="mobile-nav-content">
            {showSidebar && (
              <button
                onClick={toggleMobileMenu}
                className="touch-target p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            
            {header && (
              <div className="flex-1 flex justify-center">
                {header}
              </div>
            )}
            
            {showSidebar && <div className="w-10" />} {/* 占位符保持居中 */}
          </div>
        </div>
      )}

      {/* 桌面端头部 */}
      {header && (
        <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container-responsive py-4">
            {header}
          </div>
        </div>
      )}

      <div className="flex">
        {/* 桌面端侧边栏 */}
        {showSidebar && sidebar && (
          <div className="hidden md:block w-64 lg:w-80 border-r bg-card">
            <div className="sticky top-0 h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">{sidebarTitle}</h2>
                {sidebar}
              </div>
            </div>
          </div>
        )}

        {/* 主内容区域 */}
        <div className="flex-1 min-w-0">
          <main className={`container-responsive py-6 ${header ? 'mt-14 md:mt-0' : ''}`}>
            {children}
          </main>
        </div>
      </div>

      {/* 移动端侧边栏覆盖层 */}
      {showSidebar && sidebar && isMobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          <div 
            className="absolute inset-0" 
            onClick={closeMobileMenu}
            aria-label="关闭菜单"
          />
          <div className="mobile-menu-content animate-slide-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{sidebarTitle}</h2>
              <button
                onClick={closeMobileMenu}
                className="touch-target p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="关闭菜单"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              {sidebar}
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      {footer && (
        <footer className="border-t bg-card mt-auto">
          <div className="container-responsive py-6">
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

// 响应式容器组件
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  size?: 'narrow' | 'normal' | 'wide';
  className?: string;
}> = ({ children, size = 'normal', className = '' }) => {
  const containerClass = {
    narrow: 'container-narrow',
    normal: 'container-responsive',
    wide: 'container-wide',
  }[size];

  return (
    <div className={`${containerClass} ${className}`}>
      {children}
    </div>
  );
};

// 响应式网格组件
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  size?: 'sm' | 'normal' | 'lg';
  className?: string;
}> = ({ children, size = 'normal', className = '' }) => {
  const gridClass = {
    sm: 'grid-responsive-sm',
    normal: 'grid-responsive',
    lg: 'grid-responsive-lg',
  }[size];

  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
};

// 响应式卡片组件
export const ResponsiveCard: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  className?: string;
}> = ({ children, compact = false, className = '' }) => {
  const cardClass = compact ? 'p-4' : 'p-6';
  
  return (
    <div className={`bg-card text-card-foreground rounded-xl border shadow-sm ${cardClass} ${className}`}>
      {children}
    </div>
  );
};

// 移动端返回按钮组件
export const MobileBackButton: React.FC<{
  onBack: () => void;
  label?: string;
  className?: string;
}> = ({ onBack, label = '返回', className = '' }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBack}
      className={`mobile-only flex items-center space-x-2 ${className}`}
      aria-label={label}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

// 响应式模态框组件
export const ResponsiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!isOpen) return null;

  return (
    <div className="modal-responsive bg-black/50">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-label="关闭模态框"
      />
      <div className={`modal-content-responsive ${sizeClasses[size]} relative`}>
        <div className="p-6">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="touch-target p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;