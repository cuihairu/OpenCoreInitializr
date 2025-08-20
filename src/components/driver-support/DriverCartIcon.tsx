/**
 * 驱动下载购物车图标组件
 */
import React from 'react';
import { ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDriverCart } from '@/lib/store/driver-cart';

interface DriverCartIconProps {
  className?: string;
}

const DriverCartIcon: React.FC<DriverCartIconProps> = ({ className = '' }) => {
  const { 
    getCartCount, 
    getDownloadingCount, 
    getCompletedCount, 
    isDownloading,
    toggleCart 
  } = useDriverCart();
  
  const cartCount = getCartCount();
  const downloadingCount = getDownloadingCount();
  const completedCount = getCompletedCount();
  
  // 如果购物车为空，不显示图标
  if (cartCount === 0) {
    return null;
  }
  
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleCart}
        className="relative p-2 hover:bg-gray-50 transition-colors"
        title={`驱动下载清单 (${cartCount}个驱动)`}
      >
        {isDownloading ? (
          <Download className="h-5 w-5 text-blue-600 animate-pulse" />
        ) : (
          <ShoppingCart className="h-5 w-5 text-gray-600" />
        )}
        
        {/* 购物车数量徽章 */}
        {cartCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold min-w-[20px]"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
        
        {/* 下载状态指示器 */}
        {isDownloading && downloadingCount > 0 && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        {/* 完成状态指示器 */}
        {!isDownloading && completedCount > 0 && completedCount === cartCount && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
        )}
      </Button>
      
      {/* 悬浮提示信息 */}
      <div className="absolute top-full right-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {isDownloading ? (
            `正在下载 ${downloadingCount} 个驱动`
          ) : completedCount === cartCount && completedCount > 0 ? (
            '所有驱动下载完成'
          ) : (
            `${cartCount} 个驱动待下载`
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverCartIcon;