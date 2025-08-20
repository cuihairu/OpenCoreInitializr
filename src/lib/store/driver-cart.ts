/**
 * 驱动下载购物车状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DriverSupportInfo } from '@/types/driver-support';

// 下载状态
export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';

// 购物车中的驱动项
export interface CartDriverItem {
  driver: DriverSupportInfo;
  addedAt: string;
  downloadStatus: DownloadStatus;
  downloadProgress: number;
  downloadSpeed?: string;
  estimatedTime?: string;
  error?: string;
  progress: number;
}

// 购物车状态
interface DriverCartState {
  // 购物车中的驱动列表
  items: CartDriverItem[];
  
  // 购物车是否打开
  isOpen: boolean;
  
  // 全局下载状态
  isDownloading: boolean;
  
  // 操作方法
  addDriver: (driver: DriverSupportInfo) => void;
  removeDriver: (driverId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // 下载相关方法
  startDownload: (driverId: string) => void;
  pauseDownload: (driverId: string) => void;
  resumeDownload: (driverId: string) => void;
  updateDownloadProgress: (driverId: string, progress: number, speed?: string, estimatedTime?: string) => void;
  updateProgress: (driverId: string, progress: number) => void;
  setDownloadCompleted: (driverId: string) => void;
  setDownloadFailed: (driverId: string, error: string) => void;
  startBatchDownload: () => void;
  
  // 获取方法
  getCartCount: () => number;
  getDownloadingCount: () => number;
  getCompletedCount: () => number;
  isDriverInCart: (driverId: string) => boolean;
}

export const useDriverCart = create<DriverCartState>()(persist(
  (set, get) => ({
    items: [],
    isOpen: false,
    isDownloading: false,
    
    addDriver: (driver) => {
      const { items } = get();
      const existingItem = items.find(item => item.driver.id === driver.id);
      
      if (!existingItem) {
        const newItem: CartDriverItem = {
          driver,
          addedAt: new Date().toISOString(),
          downloadStatus: 'pending',
          downloadProgress: 0,
          progress: 0
        };
        
        set({ items: [...items, newItem] });
      }
    },
    
    removeDriver: (driverId) => {
      const { items } = get();
      set({ items: items.filter(item => item.driver.id !== driverId) });
    },
    
    clearCart: () => {
      set({ items: [], isDownloading: false });
    },
    
    toggleCart: () => {
      const { isOpen } = get();
      set({ isOpen: !isOpen });
    },
    
    openCart: () => {
      set({ isOpen: true });
    },
    
    closeCart: () => {
      set({ isOpen: false });
    },
    
    startDownload: (driverId) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { ...item, downloadStatus: 'downloading' as DownloadStatus, downloadProgress: 0 }
          : item
      );
      
      set({ items: updatedItems, isDownloading: true });
    },
    
    pauseDownload: (driverId) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { ...item, downloadStatus: 'paused' as DownloadStatus }
          : item
      );
      
      set({ items: updatedItems });
    },
    
    resumeDownload: (driverId) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { ...item, downloadStatus: 'downloading' as DownloadStatus }
          : item
      );
      
      set({ items: updatedItems });
    },
    
    updateDownloadProgress: (driverId, progress, speed, estimatedTime) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { 
              ...item, 
              downloadProgress: progress,
              downloadSpeed: speed,
              estimatedTime: estimatedTime
            }
          : item
      );
      
      set({ items: updatedItems });
    },
    
    updateProgress: (driverId, progress) => {
      const { items } = get();
      const updatedItems = items.map(item => {
        if (item.driver.id === driverId) {
          let newStatus = item.downloadStatus;
          
          // 根据进度更新状态
          if (progress === 100) {
            newStatus = 'completed';
          } else if (progress > 0 && item.downloadStatus === 'pending') {
            newStatus = 'downloading';
          }
          
          return { 
            ...item, 
            progress, 
            downloadProgress: progress,
            downloadStatus: newStatus
          };
        }
        return item;
      });
      
      // 检查是否所有下载都完成了
      const hasDownloading = updatedItems.some(item => 
        item.downloadStatus === 'downloading' || item.downloadStatus === 'pending'
      );
      
      set({ items: updatedItems, isDownloading: hasDownloading });
    },
    
    setDownloadCompleted: (driverId) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { ...item, downloadStatus: 'completed' as DownloadStatus, downloadProgress: 100 }
          : item
      );
      
      // 检查是否所有下载都完成了
      const hasDownloading = updatedItems.some(item => 
        item.downloadStatus === 'downloading' || item.downloadStatus === 'pending'
      );
      
      set({ items: updatedItems, isDownloading: hasDownloading });
    },
    
    setDownloadFailed: (driverId, error) => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.driver.id === driverId 
          ? { ...item, downloadStatus: 'failed' as DownloadStatus, error }
          : item
      );
      
      set({ items: updatedItems });
    },
    
    startBatchDownload: () => {
      const { items } = get();
      const updatedItems = items.map(item => 
        item.downloadStatus === 'pending' || item.downloadStatus === 'failed'
          ? { ...item, downloadStatus: 'downloading' as DownloadStatus, downloadProgress: 0 }
          : item
      );
      
      set({ items: updatedItems, isDownloading: true });
    },
    
    getCartCount: () => {
      const { items } = get();
      return items.length;
    },
    
    getDownloadingCount: () => {
      const { items } = get();
      return items.filter(item => item.downloadStatus === 'downloading').length;
    },
    
    getCompletedCount: () => {
      const { items } = get();
      return items.filter(item => item.downloadStatus === 'completed').length;
    },
    
    isDriverInCart: (driverId) => {
      const { items } = get();
      return items.some(item => item.driver.id === driverId);
    }
  }),
  {
    name: 'driver-cart-storage',
    partialize: (state) => ({ 
      items: state.items.map(item => ({
        ...item,
        // 重置下载状态，避免刷新后显示错误状态
        downloadStatus: item.downloadStatus === 'downloading' ? 'pending' : item.downloadStatus,
        downloadProgress: item.downloadStatus === 'downloading' ? 0 : item.downloadProgress
      }))
    })
  }
));