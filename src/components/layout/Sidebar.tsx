import {
  IconAIFilledLevel1,
  IconCloud,
  IconComment,
  IconHome,
  IconLikeHeart,
  IconLikeThumb,
  IconRefresh,
  IconUser,
} from '@douyinfe/semi-icons';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import React from 'react';
import { mockVideoData } from '../../mock/videoData';
import { videoListAtom } from '../../store/videoStore';
import { mockRequest } from '../../utils/mockRequest';

const Sidebar: React.FC = () => {
  const [, setVideoList] = useAtom(videoListAtom);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  // 用于推荐按钮的鼠标悬停状态
  const [isHoveringRecommend, setIsHoveringRecommend] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState('recommend');
  const [lastClicked, setLastClicked] = React.useState<string | null>(null);

  // 刷新函数
  const handleRefresh = async () => {
    console.log('刷新函数被调用');
    setLastClicked('refresh');

    setIsRefreshing(true);
    try {
      const newVideos = await mockRequest(mockVideoData.videos, 600);
      setVideoList(newVideos);
      alert('视频列表已刷新');
    } catch (error) {
      console.error('刷新视频流失败:', error);
      alert('刷新失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
    }

    // 重置上次点击状态，避免一直显示
    setTimeout(() => setLastClicked(null), 500);
  };

  // 菜单项选择函数，添加导航功能
  const handleItemSelect = (id: string) => {
    console.log(`选择菜单项: ${id}`);
    setSelectedItem(id);
    setLastClicked(id);

    // 根据不同的菜单项进行导航
    switch (id) {
      case 'home':
        window.location.href = '/';
        break;
      case 'featured':
        window.location.href = '/featured';
        break;
      case 'follow':
        // 跳转到关注页面，如果不存在则显示提示
        alert('关注功能待实现');
        break;
      case 'favorite':
        // 跳转到收藏页面，如果不存在则显示提示
        alert('收藏功能待实现');
        break;
      default:
        break;
    }

    // 重置上次点击状态，避免一直显示
    setTimeout(() => setLastClicked(null), 500);
  };

  // 推荐按钮处理函数
  const handleRecommendClick = () => {
    console.log('推荐按钮被点击');
    setLastClicked('recommend');
    setSelectedItem('recommend');

    // 刷新视频列表
    handleRefresh();

    // 重置上次点击状态，避免一直显示
    setTimeout(() => setLastClicked(null), 500);
  };

  return (
    <div className="w-64 h-screen border-r border-gray-800 bg-black flex flex-col py-6 fixed left-0 top-0 bottom-0 z-50">
      {/* 点击反馈指示器 */}
      {lastClicked && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-lg z-50"
        >
          点击: {lastClicked}
        </motion.div>
      )}

      {/* 抖音Logo */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl" />
      </motion.div>

      <div className="flex flex-col space-y-4 px-4">
        {/* 首页按钮 */}
        <motion.button
          type="button"
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-white ${selectedItem === 'home' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'}`}
          onClick={() => handleItemSelect('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {selectedItem === 'home' && (
            <motion.div
              className="w-1 h-8 bg-red-500 rounded-r-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '2rem', opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <IconHome size="large" />
          <span className="text-sm font-medium">首页</span>
        </motion.button>

        {/* 关注按钮 */}
        <motion.button
          type="button"
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-white ${selectedItem === 'follow' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'}`}
          onClick={() => handleItemSelect('follow')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {selectedItem === 'follow' && (
            <motion.div
              className="w-1 h-8 bg-red-500 rounded-r-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '2rem', opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <IconUser size="large" />
          <span className="text-sm font-medium">关注</span>
        </motion.button>

        {/* 推荐按钮 */}
        <motion.button
          type="button"
          className={`flex flex-col items-center justify-center w-16 h-20 rounded-lg transition-all duration-200 text-white ${selectedItem === 'recommend' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'}`}
          onClick={handleRecommendClick}
          onMouseEnter={() => setIsHoveringRecommend(true)}
          onMouseLeave={() => setIsHoveringRecommend(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {selectedItem === 'recommend' && (
            <motion.div
              className="w-1 h-8 bg-red-500 rounded-r-md absolute left-0"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '2rem', opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          {isHoveringRecommend ? (
            <IconRefresh size="large" className="mb-2" />
          ) : (
            <IconLikeThumb size="large" className="mb-2" />
          )}
          <span className="text-xs font-medium">推荐</span>
        </motion.button>

        {/* 精选按钮 */}
        <motion.button
          type="button"
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-white ${selectedItem === 'featured' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'}`}
          onClick={() => handleItemSelect('featured')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {selectedItem === 'featured' && (
            <motion.div
              className="w-1 h-8 bg-red-500 rounded-r-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '2rem', opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <IconAIFilledLevel1 size="large" />
          <span className="text-sm font-medium">精选</span>
        </motion.button>

        {/* 收藏按钮 */}
        <motion.button
          type="button"
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-white ${selectedItem === 'favorite' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'}`}
          onClick={() => handleItemSelect('favorite')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {selectedItem === 'favorite' && (
            <motion.div
              className="w-1 h-8 bg-red-500 rounded-r-md"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: '2rem', opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <IconLikeHeart size="large" />
          <span className="text-sm font-medium">收藏</span>
        </motion.button>
      </div>

      {/* 底部刷新按钮 */}
      <div className="mt-auto px-4 pb-4">
        <motion.button
          type="button"
          className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-white ${selectedItem === 'refresh' ? 'bg-red-500' : 'text-white/80 hover:bg-gray-800'} ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{
              duration: 0.8,
              repeat: isRefreshing ? Number.POSITIVE_INFINITY : 0,
              ease: 'linear',
            }}
          >
            <IconRefresh size="large" />
          </motion.div>
          <span className="text-sm font-medium">刷新视频</span>

          {/* 刷新进度指示器 */}
          {isRefreshing && (
            <motion.div
              className="ml-auto w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs"
              initial={{ scale: 0 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
