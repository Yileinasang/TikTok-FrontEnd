import { IconLikeHeart, IconPlay, IconRefresh } from '@douyinfe/semi-icons';
import { Avatar, Button, Spin, Tooltip } from '@douyinfe/semi-ui';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVideoData } from '../mock/videoData';
import { mockRequest } from '../utils/mockRequest';

// 视频卡片类型定义
interface VideoCard {
  id: string;
  title: string;
  coverImage: string;
  videoUrl: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  duration: number;
  aspectRatio: number;
}

// 格式化数字（例如：1000 -> 1k）
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const FeaturedPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [columnsCount, setColumnsCount] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const navigate = useNavigate();

  // 加载精选视频数据
  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      // 模拟请求延迟
      const data = await mockRequest(mockVideoData.videos, 800);

      // 转换数据格式并随机设置长宽比以创建瀑布流效果
      const formattedData = data.map(item => ({
        id: item.id,
        title: item.title,
        coverImage: item.poster,
        videoUrl: item.src,
        author: {
          id: `${item.id}_author`, // 基于视频ID生成作者ID
          name: typeof item.author === 'string' ? item.author : '未知作者',
          avatar: `https://picsum.photos/100/100?random=${item.id}_avatar`, // 生成随机头像URL
        },
        likes: item.likes || Math.floor(Math.random() * 100000),
        duration: Math.floor(Math.random() * 60) + 15, // 随机生成时长
        aspectRatio: 0.6 + Math.random() * 0.8, // 随机长宽比，创建瀑布流效果
      }));

      setVideos(formattedData);
    } catch (error) {
      console.error('加载精选视频失败:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // 监听窗口大小变化，调整瀑布流列数
  useEffect(() => {
    const updateColumnsCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumnsCount(1);
      } else if (width < 1024) {
        setColumnsCount(2);
      } else if (width < 1280) {
        setColumnsCount(3);
      } else if (width < 1536) {
        setColumnsCount(4);
      } else {
        setColumnsCount(5);
      }
    };

    updateColumnsCount();
    window.addEventListener('resize', updateColumnsCount);
    return () => window.removeEventListener('resize', updateColumnsCount);
  }, []);

  // 刷新视频列表
  const handleRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  // 处理卡片悬停
  const handleCardHover = (id: string, isHovered: boolean) => {
    if (isHovered) {
      setHoveredCard(id);
      // 鼠标悬停时，尝试播放视频预览
      const video = videoRefs.current[id];
      if (video) {
        video.currentTime = 0;
        video.play().catch(e => console.log('自动播放被阻止:', e));
      }
    } else {
      setHoveredCard(null);
      // 鼠标离开时，停止视频播放
      const video = videoRefs.current[id];
      if (video) {
        video.pause();
      }
    }
  };

  // 处理卡片点击
  const handleCardClick = (id: string, e?: React.MouseEvent) => {
    // 防止点击到作者头像或视频播放按钮时的冲突
    if (
      (e && (e.target as HTMLElement).closest('.author-avatar')) ||
      (e && (e.target as HTMLElement).closest('.play-button'))
    ) {
      return;
    }
    navigate(`/detail/${id}`);
  };

  // 处理作者头像点击
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 作者页面功能待实现
    alert('作者页面功能待实现');
  };

  // 将视频数据分配到不同列，实现瀑布流效果
  const getColumns = () => {
    const columns: VideoCard[][] = Array.from(
      { length: columnsCount },
      () => [],
    );

    videos.forEach((video, index) => {
      const columnIndex = index % columnsCount;
      columns[columnIndex].push(video);
    });

    return columns;
  };

  const columns = getColumns();

  // 渲染错误状态
  if (hasError && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-4">
        <div className="text-red-500 text-4xl mb-4">😢</div>
        <h3 className="text-xl font-medium mb-2">加载失败</h3>
        <p className="text-gray-400 mb-6">请检查网络连接后重试</p>
        <Button onClick={loadVideos} type="primary" className="bg-primary">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-60px)] bg-black text-white">
      {/* 顶部工具栏 */}
      <div className="sticky top-16 z-10 bg-black/90 backdrop-blur-md border-b border-gray-800 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <Spin spinning={refreshing} size="small" tip="刷新中...">
              <IconRefresh className="text-gray-300" />
            </Spin>
          </motion.button>
          <span className="text-gray-400">下拉刷新</span>
        </div>
      </div>

      {/* 视频瀑布流 */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-[calc(20%-10px)] aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="w-full h-full animate-pulse bg-gray-600" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4">
            {columns.map((column, columnIndex) => (
              <div
                key={`column-${columnIndex}-${column[0]?.id || columnIndex}`}
                className="flex-1"
              >
                {column.map(video => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: columnIndex * 0.1 }}
                    className="mb-4 relative rounded-lg overflow-hidden"
                    style={{ aspectRatio: video.aspectRatio }}
                    onMouseEnter={() => handleCardHover(video.id, true)}
                    onMouseLeave={() => handleCardHover(video.id, false)}
                    onClick={e => handleCardClick(video.id, e)}
                  >
                    {/* 视频封面或视频预览 */}
                    <div className="relative w-full h-full overflow-hidden">
                      <img
                        src={video.coverImage}
                        alt={video.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${hoveredCard === video.id ? 'opacity-0' : 'opacity-100'}`}
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/400/600?random=${video.id}`;
                          target.onerror = null;
                        }}
                      />

                      {/* 视频预览 */}
                      <video
                        ref={el => {
                          videoRefs.current[video.id] = el;
                        }}
                        className={`absolute inset-0 w-full h-full object-cover ${hoveredCard === video.id ? 'opacity-100' : 'opacity-0'}`}
                        src={video.videoUrl}
                        muted
                        loop
                        playsInline
                      />

                      {/* 播放按钮 */}
                      <AnimatePresence>
                        {hoveredCard === video.id && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Button
                              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                              onClick={e => {
                                e.stopPropagation();
                                handleCardClick(video.id);
                              }}
                            >
                              <IconPlay className="text-white" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 时长标签 */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    {/* 视频信息 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
                        {video.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        {/* 作者信息 */}
                        <div className="flex items-center gap-2">
                          <Tooltip content={video.author.name}>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="author-avatar w-6 h-6 rounded-full overflow-hidden border border-gray-500"
                              onClick={handleAuthorClick}
                            >
                              <Avatar
                                size="small"
                                src={video.author.avatar}
                                alt={video.author.name}
                                className="w-full h-full"
                              />
                            </motion.div>
                          </Tooltip>
                        </div>

                        {/* 点赞数 */}
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <IconLikeHeart className="text-red-500 w-3.5 h-3.5" />
                          <span>{formatNumber(video.likes)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部加载更多提示 */}
      {!isLoading && videos.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          已加载全部内容
        </div>
      )}
    </div>
  );
};

export default FeaturedPage;
