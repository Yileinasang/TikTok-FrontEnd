import {
  IconClose,
  IconHistory,
  IconMenu,
  IconSearch,
} from '@douyinfe/semi-icons';
import { Button, Dropdown, Input, Tooltip } from '@douyinfe/semi-ui';
import { Toast } from '@douyinfe/semi-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
}

const AppBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  // 从本地存储加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('douyin-search-history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // 保存搜索历史到本地存储
  const saveSearchHistory = (keyword: string) => {
    if (!keyword.trim()) return;

    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      keyword,
      timestamp: Date.now(),
    };

    // 移除重复项并添加到开头
    const updatedHistory = [
      newItem,
      ...searchHistory.filter(item => item.keyword !== keyword),
    ].slice(0, 10); // 保留最近10条

    setSearchHistory(updatedHistory);
    localStorage.setItem(
      'douyin-search-history',
      JSON.stringify(updatedHistory),
    );
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // 保存到搜索历史
    saveSearchHistory(searchQuery);

    // 模拟搜索
    console.log('Searching for:', searchQuery);
    Toast.success(`正在搜索: ${searchQuery}`);

    // 关闭历史记录面板
    setIsHistoryOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('douyin-search-history');
    setIsHistoryOpen(false);
    Toast.success('搜索历史已清空');
  };

  const removeHistoryItem = (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    localStorage.setItem(
      'douyin-search-history',
      JSON.stringify(updatedHistory),
    );
  };

  const useHistoryItem = (keyword: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    setSearchQuery(keyword);
    setIsHistoryOpen(false);
    searchInputRef.current?.focus();
  };

  // 点击外部关闭历史记录面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        historyContainerRef.current &&
        !historyContainerRef.current.contains(event.target as Node)
      ) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    return `${diffDays}天前`;
  };

  return (
    <motion.div
      className="flex items-center justify-end px-8 py-3 bg-black border-b border-gray-800 fixed top-0 left-16 right-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-80" ref={historyContainerRef}>
        <motion.div
          className={`absolute inset-0 rounded-full ${isFocused ? 'bg-red-500/20' : 'bg-transparent'}`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        />

        <Input
          ref={searchInputRef}
          placeholder="搜索你感兴趣的内容"
          value={searchQuery}
          onChange={value => setSearchQuery(value)}
          onKeyDown={handleKeyPress}
          onFocus={() => {
            setIsFocused(true);
            setIsHistoryOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          prefix={
            <IconSearch
              className={isFocused ? 'text-red-500' : 'text-gray-500'}
            />
          }
          suffix={
            searchQuery.length > 0 && (
              <IconClose
                className="cursor-pointer text-gray-500 hover:text-gray-400"
                onClick={clearSearch}
              />
            )
          }
          className={`w-full h-10 rounded-full border-none bg-gray-900 text-white placeholder:text-gray-500 transition-all duration-300 pl-10 pr-4 ${isFocused ? 'ring-2 ring-red-500' : ''}`}
          style={{
            boxShadow: isFocused ? '0 0 0 2px rgba(239, 68, 68, 0.3)' : 'none',
          }}
        />

        <motion.button
          onClick={handleSearch}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 rounded-full text-white font-medium transition-all duration-300 ${isFocused ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          搜索
        </motion.button>

        {/* 搜索历史面板 */}
        <AnimatePresence>
          {isHistoryOpen && searchHistory.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                <div className="flex items-center text-gray-400">
                  <IconHistory size="large" className="mr-2" />
                  <span className="text-sm">搜索历史</span>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-300 text-sm"
                  onClick={clearHistory}
                >
                  清空
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchHistory.map(item => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 cursor-pointer transition-colors duration-150"
                    onClick={e => useHistoryItem(item.keyword, e)}
                    whileHover={{ backgroundColor: 'rgba(50, 50, 50, 0.8)' }}
                  >
                    <div className="flex items-center">
                      <div className="text-gray-500 mr-3">
                        <IconSearch size="large" />
                      </div>
                      <div className="flex items-center text-white">
                        {item.keyword}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs">
                        {formatTime(item.timestamp)}
                      </span>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-400 p-1"
                        onClick={e => removeHistoryItem(item.id, e)}
                      >
                        <IconClose size="large" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AppBar;
