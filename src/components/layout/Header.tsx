import {
  IconClose,
  IconComment,
  IconDelete,
  IconHistory,
  IconSearch,
  IconTiktokLogo,
  IconUpload,
} from '@douyinfe/semi-icons';
import { Button, Input, List, Space } from '@douyinfe/semi-ui';
import { motion } from 'framer-motion';
// src/components/layout/Header.tsx
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

// 搜索历史记录存储键名
const SEARCH_HISTORY_KEY = 'douyin_search_history';
// 最大保存的搜索历史数量
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  id: string;
  keyword: string;
  timestamp: number;
}

const Header = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 从本地存储加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('加载搜索历史失败:', error);
      }
    }
  }, []);

  // 保存搜索历史到本地存储
  const saveSearchHistory = (history: SearchHistoryItem[]) => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    setSearchHistory(history);
  };

  // 添加搜索关键词到历史记录
  const addSearchKeyword = (keyword: string) => {
    if (!keyword.trim()) return;

    // 移除已存在的相同关键词
    const filteredHistory = searchHistory.filter(
      item => item.keyword !== keyword,
    );

    // 创建新的历史记录项
    const newHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(),
      keyword,
      timestamp: Date.now(),
    };

    // 添加到历史记录开头并限制数量
    const newHistory = [newHistoryItem, ...filteredHistory].slice(
      0,
      MAX_HISTORY_ITEMS,
    );
    saveSearchHistory(newHistory);
  };

  // 处理搜索
  const handleSearch = () => {
    if (searchValue.trim()) {
      addSearchKeyword(searchValue);
      setShowHistory(false);
      // 这里可以添加实际的搜索逻辑
      console.log('搜索:', searchValue);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 处理历史记录项点击
  const handleHistoryItemClick = (item: SearchHistoryItem) => {
    setSearchValue(item.keyword);
    addSearchKeyword(item.keyword); // 更新时间戳
    // 执行搜索
    console.log('搜索历史项:', item.keyword);
    setShowHistory(false);
  };

  // 清除单条历史记录
  const handleRemoveHistoryItem = (id: string) => {
    const newHistory = searchHistory.filter(item => item.id !== id);
    saveSearchHistory(newHistory);
  };

  // 清除所有历史记录
  const handleClearAllHistory = () => {
    saveSearchHistory([]);
  };

  return (
    <div
      className="flex items-center justify-between h-16 px-6 border-b border-gray-700"
      style={{ backgroundColor: 'var(--semi-color-bg-1)' }}
    >
      {/* 左侧抖音LOGO */}
      <a
        href="/"
        className="w-[120px] flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
        onClick={() => {
          console.log('抖音LOGO被点击');
        }}
      >
        <IconTiktokLogo className="text-white text-3xl" />
      </a>

      {/* 搜索框居中 */}
      <div className="flex items-center max-w-xl w-full justify-center relative">
        <div
          className={`flex items-center transition-all duration-300 ${isInputFocused ? 'ring-2 ring-primary ring-opacity-50' : ''} rounded-full overflow-hidden bg-white`}
        >
          <Input
            ref={searchInputRef}
            placeholder="搜索你感兴趣的内容"
            value={searchValue}
            onChange={(value: string) => setSearchValue(value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              setIsInputFocused(true);
              setShowHistory(searchHistory.length > 0);
            }}
            onBlur={() => {
              // 延迟隐藏，以便点击历史记录
              setTimeout(() => {
                setIsInputFocused(false);
                setShowHistory(false);
              }, 200);
            }}
            className="w-full pl-4 pr-0 py-2 border-none focus:outline-none focus:ring-0 bg-transparent text-white placeholder:text-gray-400"
          />
          <Button
            theme="light"
            size="small"
            className="h-full rounded-l-none rounded-r-full px-4 py-2 border-none cursor-pointer"
            onClick={handleSearch}
          >
            <IconSearch className="text-white mr-1" />
            <span className="text-white">搜索</span>
          </Button>
        </div>

        {/* 搜索历史下拉框 */}
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-10 p-4 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <IconHistory className="text-gray-400 mr-2" />
                <span className="text-white font-medium">搜索历史</span>
              </div>
              <Button
                theme="borderless"
                size="small"
                text
                onClick={handleClearAllHistory}
                className="text-gray-400 hover:text-white"
              >
                清空
              </Button>
            </div>
            <List
              dataSource={searchHistory}
              renderItem={item => (
                <List.Item
                  className="flex items-center justify-between hover:bg-gray-800 cursor-pointer px-2 py-1.5 rounded-md transition-colors"
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <span className="text-white">{item.keyword}</span>
                  <Button
                    theme="borderless"
                    size="small"
                    icon={<IconDelete className="text-gray-400" />}
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveHistoryItem(item.id);
                    }}
                    className="rounded-full h-6 w-6 p-0 hover:bg-gray-800"
                  />
                </List.Item>
              )}
            />
          </motion.div>
        )}
      </div>

      {/* 右侧操作按钮 */}
      <Space spacing={20}>
        <Button
          theme="borderless"
          className="text-white hover:text-primary cursor-pointer"
          onClick={() => {
            console.log('上传按钮被点击');
            // 这里可以添加实际的上传功能
            alert('上传功能待实现');
          }}
        >
          <IconUpload className="text-xl" />
          <span className="text-xs text-white ml-1">上传</span>
        </Button>
        <Button
          theme="borderless"
          className="text-white hover:text-primary relative cursor-pointer"
          onClick={() => {
            console.log('消息按钮被点击');
            // 这里可以添加实际的消息功能
            alert('消息功能待实现');
          }}
        >
          <IconComment className="text-xl" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center" />
          <span className="text-xs text-white ml-1">消息</span>
        </Button>
      </Space>
    </div>
  );
};

export default Header;
