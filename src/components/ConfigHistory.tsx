import React, { useState, useEffect } from 'react';
import { historyManager, historyUtils, ConfigurationRecord, HistoryStats } from '../lib/history/manager';
import { HardwareConfig, PackageOptions } from '../types';

interface ConfigHistoryProps {
  onLoadConfiguration?: (record: ConfigurationRecord) => void;
  onDeleteConfiguration?: (id: string) => void;
  className?: string;
}

export const ConfigHistory: React.FC<ConfigHistoryProps> = ({
  onLoadConfiguration,
  onDeleteConfiguration,
  className = ''
}) => {
  const [records, setRecords] = useState<ConfigurationRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'favorite'>('date');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSortRecords();
  }, [searchQuery, selectedTag, showFavoritesOnly, sortBy]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const [allRecords, historyStats] = await Promise.all([
        historyManager.getAllConfigurations(),
        historyManager.getHistoryStats()
      ]);
      setRecords(allRecords);
      setStats(historyStats);
    } catch (error) {
      console.error('Failed to load configuration history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRecords = async () => {
    try {
      let filteredRecords = await historyManager.getAllConfigurations();

      // 搜索过滤
      if (searchQuery) {
        filteredRecords = await historyManager.searchConfigurations(searchQuery);
      }

      // 标签过滤
      if (selectedTag) {
        filteredRecords = await historyManager.getConfigurationsByTag(selectedTag);
      }

      // 收藏过滤
      if (showFavoritesOnly) {
        filteredRecords = filteredRecords.filter(record => record.isFavorite);
      }

      // 排序
      filteredRecords.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'favorite':
            return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
          case 'date':
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });

      setRecords(filteredRecords);
    } catch (error) {
      console.error('Failed to filter records:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await historyManager.toggleFavorite(id);
      await loadHistory();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await historyManager.deleteConfiguration(id);
      await loadHistory();
      onDeleteConfiguration?.(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete configuration:', error);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRecords.size === 0) return;
    
    try {
      await historyManager.deleteConfigurations(Array.from(selectedRecords));
      await loadHistory();
      setSelectedRecords(new Set());
    } catch (error) {
      console.error('Failed to delete configurations:', error);
    }
  };

  const handleSelectRecord = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRecords(new Set(records.map(r => r.id)));
    } else {
      setSelectedRecords(new Set());
    }
  };

  const handleExportHistory = async () => {
    try {
      const exportData = await historyManager.exportHistory();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opencore-config-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export history:', error);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const allTags = stats?.mostUsedTags.map(t => t.tag) || [];

  return (
    <div className={className}>
      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalConfigurations}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">总配置数</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.favoriteCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">收藏配置</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.recentCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">本周更新</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {allTags.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">标签数量</div>
          </div>
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索配置名称、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 标签过滤 */}
          <div className="md:w-48">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* 排序 */}
          <div className="md:w-32">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'favorite')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">按日期</option>
              <option value="name">按名称</option>
              <option value="favorite">按收藏</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">只显示收藏</span>
            </label>

            {selectedRecords.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                删除选中 ({selectedRecords.size})
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportHistory}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              导出历史
            </button>
          </div>
        </div>
      </div>

      {/* 配置列表 */}
      {records.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">没有找到配置记录</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || selectedTag || showFavoritesOnly 
              ? '尝试调整搜索条件或过滤器' 
              : '开始创建您的第一个 OpenCore 配置'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 全选 */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRecords.size === records.length && records.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">全选</span>
            </label>
          </div>

          {/* 配置卡片 */}
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(record.id)}
                    onChange={(e) => handleSelectRecord(record.id, e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {record.name}
                      </h3>
                      {record.isFavorite && (
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      )}
                    </div>
                    
                    {record.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {record.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {record.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <div>OpenCore: {record.openCoreVersion}</div>
                      <div>更新时间: {historyUtils.formatDate(record.updatedAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleFavorite(record.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      record.isFavorite
                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={record.isFavorite ? '取消收藏' : '添加收藏'}
                  >
                    <svg className="w-5 h-5" fill={record.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  
                  {onLoadConfiguration && (
                    <button
                      onClick={() => onLoadConfiguration(record)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      加载
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowDeleteConfirm(record.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="删除配置"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              确认删除配置
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              您确定要删除这个配置吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteRecord(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigHistory;