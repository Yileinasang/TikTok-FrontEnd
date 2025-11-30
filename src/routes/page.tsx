import {
  IconComment,
  IconLikeHeart,
  IconShare,
  IconStar,
} from '@douyinfe/semi-icons';
import { IconClose, IconSearch } from '@douyinfe/semi-icons';
import { Button } from '@douyinfe/semi-ui';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import CommentDrawer from '../components/CommentDrawer';
import SwiperVideoPlayer from '../components/SwiperVideoPlayer/index';
import AppBar from '../components/layout/AppBar';
import Sidebar from '../components/layout/Sidebar';
import { mockCommentData, mockVideoData } from '../mock/videoData';
import {
  activeSlideIndexAtom,
  currentVideoAtom,
  isAutoPlayingAtom,
  videoListAtom,
} from '../store/videoStore';
import { mockRequest } from '../utils/mockRequest';

console.log('HomePage组件开始加载 - 模块导入完成');

export default function HomePage() {
  console.log('HomePage组件实例化 - 开始');

  const [videoList, setVideoList] = useAtom(videoListAtom);
  const [currentVideo, setCurrentVideo] = useAtom(currentVideoAtom);
  const [activeSlideIndex, setActiveSlideIndex] = useAtom(activeSlideIndexAtom);
  const [isAutoPlaying, setIsAutoPlaying] = useAtom(isAutoPlayingAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  console.log('HomePage组件 - 状态初始化完成', {
    initialVideoListLength: videoList.length,
    initialCurrentVideo: currentVideo ? currentVideo.title : 'null',
    initialIsLoading: isLoading,
  });

  // 初始化加载视频列表
  useEffect(() => {
    console.log('HomePage useEffect - 触发视频加载', {
      dependencies: ['setVideoList', 'setCurrentVideo'],
      timestamp: new Date().toISOString(),
    });

    const loadVideos = async () => {
      console.log('loadVideos函数 - 开始执行');

      try {
        setIsLoading(true);
        console.log('loadVideos - 设置isLoading为true');

        // 检查mock数据是否存在
        console.log('loadVideos - 检查mock数据:', {
          mockVideoDataExists: !!mockVideoData,
          videosPropertyExists: 'videos' in mockVideoData,
          videosIsArray: Array.isArray(mockVideoData.videos),
          videosLength: mockVideoData.videos?.length || 'undefined/null',
        });

        // 直接使用mock数据，避免异步延迟导致的问题
        if (mockVideoData?.videos && Array.isArray(mockVideoData.videos)) {
          console.log(
            'loadVideos - 使用mock数据,视频数量:',
            mockVideoData.videos.length,
          );
          if (mockVideoData.videos.length > 0) {
            console.log(
              'loadVideos - 第一个视频数据示例:',
              mockVideoData.videos[0],
            );
          }

          // 只设置视频列表，currentVideo由第二个useEffect统一处理
          console.log('loadVideos - 准备设置视频列表...');
          setVideoList(mockVideoData.videos);
          console.log('loadVideos - 视频列表设置完成');

          // 同步更新Jotai原子状态，确保mock数据优先
          console.log('loadVideos - 同步更新Jotai原子状态');
          // setVideoList已通过useAtom从videoListAtom解构，直接使用即可同步原子状态
          // setCurrentVideo已通过useAtom从currentVideoAtom解构
          // 此处已通过setVideoList更新，currentVideo由第二个useEffect统一处理
        } else {
          console.error('loadVideos - 错误: mock数据格式不正确');
        }

        // 仍然尝试模拟请求（保持兼容性），但不依赖其结果
        try {
          console.log('loadVideos - 开始mockRequest模拟请求...');
          const videos = await mockRequest(mockVideoData.videos, 600);
          console.log(
            'loadVideos - mockRequest完成,返回视频数量:',
            videos.length,
          );
        } catch (requestError) {
          console.warn(
            'loadVideos - 模拟请求失败（不影响功能）:',
            requestError,
          );
        }
      } catch (error) {
        console.error('loadVideos - 视频数据加载失败', error);
        // 即使失败也尝试直接使用mock数据作为后备方案
        console.log('loadVideos - 进入错误处理，尝试使用后备方案');
        if (mockVideoData?.videos) {
          // 只设置视频列表，currentVideo由第二个useEffect统一处理
          // 注意：setVideoList会自动更新Jotai的videoListAtom状态
          setVideoList(mockVideoData.videos || []);
        }
      } finally {
        setIsLoading(false);
        console.log('loadVideos - 执行完成, isLoading设置为false');
      }
    };

    // 立即执行加载函数
    console.log('HomePage useEffect - 调用loadVideos函数');
    loadVideos();
    console.log('HomePage useEffect - loadVideos函数调用完成(异步)');
  }, [setVideoList]); //, setCurrentVideo]);

  // 监听videoList变化，确保视频能正确更新
  useEffect(() => {
    console.log('HomePage - videoList状态更新:', { length: videoList.length });

    if (videoList.length > 0) {
      // 情况1: currentVideo为空，需要设置第一个视频
      // 情况2: currentVideo不在videoList中（无效视频），需要重置
      // 情况3: activeSlideIndex超出范围，需要重置
      const currentVideoExists =
        currentVideo && videoList.some(video => video.id === currentVideo.id);
      const isValidActiveIndex =
        activeSlideIndex >= 0 && activeSlideIndex < videoList.length;

      if (!currentVideoExists || !isValidActiveIndex) {
        // 确定要设置的视频索引
        const targetIndex = isValidActiveIndex ? activeSlideIndex : 0;
        const targetVideo = videoList[targetIndex];

        console.log(
          `HomePage - 设置视频: ${targetVideo.title}, 索引: ${targetIndex}`,
        );
        setCurrentVideo(targetVideo);
        setActiveSlideIndex(targetIndex);
        setLikeCount(targetVideo?.likes || 0);

        // 当视频列表加载完成且isAutoPlaying为true时，确保播放
        if (isAutoPlaying) {
          console.log(
            'HomePage - 视频已设置且isAutoPlaying为true,将在SwiperVideoPlayer初始化后自动播放',
          );
        }
      }
    }
  }, [
    videoList,
    currentVideo,
    activeSlideIndex,
    setCurrentVideo,
    setActiveSlideIndex,
    isAutoPlaying,
  ]);

  useEffect(() => {
    console.log(
      'HomePage - currentVideo状态更新:',
      currentVideo ? currentVideo.title : 'null',
    );
    // 当currentVideo改变且isAutoPlaying为true时，确保会播放新的视频
    if (currentVideo && isAutoPlaying) {
      console.log(
        'HomePage - currentVideo已设置且isAutoPlaying为true,将在SwiperVideoPlayer切换后自动播放',
      );
    }
  }, [currentVideo, isAutoPlaying]);

  useEffect(() => {
    console.log('HomePage - isLoading状态更新:', isLoading);
    // 当加载完成且isAutoPlaying为true时，确保会播放视频
    if (!isLoading && isAutoPlaying && videoList.length > 0) {
      console.log(
        'HomePage - 视频加载完成且isAutoPlaying为true,SwiperVideoPlayer应已初始化并准备播放',
      );
    }
  }, [isLoading, isAutoPlaying, videoList.length]);

  // 处理轮播滑动
  const handleSlideChange = (index: number) => {
    if (videoList.length > 0 && index >= 0 && index < videoList.length) {
      setActiveSlideIndex(index);
      setCurrentVideo(videoList?.[index]);
      setLikeCount(videoList[index]?.likes || 0);
      setIsLiked(false);
      setIsFavorited(false);
      // 切换视频时关闭评论区
      setShowComments(false);
    }
  };

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  // 处理收藏
  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  // 处理分享
  const handleShare = () => {
    console.log('Share video:', currentVideo?.id);
  };

  // 切换到下一个视频
  const handleNextVideo = () => {
    if (videoList.length === 0) return;
    const nextIndex = (activeSlideIndex + 1) % videoList.length;
    handleSlideChange(nextIndex);
  };

  // 切换到上一个视频
  const handlePrevVideo = () => {
    if (videoList.length === 0) return;
    const prevIndex =
      (activeSlideIndex - 1 + videoList.length) % videoList.length;
    handleSlideChange(prevIndex);
  };

  console.log('HomePage - 渲染前检查状态:', {
    videoListLength: videoList.length,
    currentVideo: currentVideo ? currentVideo.title : 'null',
    isLoading: isLoading,
  });

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* 主内容区 */}
      <div className="w-full h-full flex">
        {/* 主视频区 */}
        <div className="relative flex-1 flex flex-col">
          {/* 视频播放器 */}
          <div className="flex-1 flex items-center justify-center w-full h-full relative z-10 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white p-8">
                <div className="text-2xl font-bold mb-4">视频加载中</div>
                <div className="text-gray-300 mb-4">正在获取精彩内容...</div>
                <div className="animate-pulse text-sm">请稍候...</div>
              </div>
            ) : videoList?.length > 0 ? (
              <SwiperVideoPlayer
                videos={videoList}
                activeIndex={activeSlideIndex}
                onSlideChange={handleSlideChange}
                autoPlay={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white p-8">
                <div className="text-2xl font-bold mb-4">暂无视频数据</div>
                <div className="text-gray-300 mb-6">请稍后再试或刷新页面</div>
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition-colors"
                  onClick={() => {
                    setIsLoading(true);
                    mockRequest(mockVideoData.videos, 600)
                      .then(videos => {
                        setVideoList(videos);
                        if (videos.length > 0) {
                          setCurrentVideo(videos[0]);
                        }
                      })
                      .catch(error => console.error('重新加载失败', error))
                      .finally(() => setIsLoading(false));
                  }}
                >
                  重新加载视频
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 视频信息区域 - 固定在底部 */}
        {currentVideo && (
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={`https://picsum.photos/100/100?random=${currentVideo.id}`}
                    alt={currentVideo.author}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/100/100?default';
                      target.onerror = null;
                    }}
                  />
                  <div
                    className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-white"
                    aria-label="已认证"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="white"
                      aria-hidden="true"
                    >
                      <path d="M8 15a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-13a6 6 0 1 0 0 12A6 6 0 0 0 8 2z" />
                      <path d="M11.5 8a.5.5 0 0 1 0 1H8.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L8.707 8H11.5z" />
                    </svg>
                  </div>
                </div>
                <Button
                  type="primary"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                >
                  关注
                </Button>
              </div>
              <div className="flex flex-col items-center gap-6">
                <motion.button
                  className="flex flex-col items-center gap-1 transition-transform duration-300 hover:scale-110 bg-transparent border-none cursor-pointer"
                  type="button"
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <IconLikeHeart
                      size="large"
                      className={
                        isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                      }
                    />
                  </motion.div>
                  <span className="text-sm font-medium">{likeCount}</span>
                </motion.button>
                <motion.button
                  className="flex flex-col items-center gap-1 transition-transform duration-300 hover:scale-110 bg-transparent border-none cursor-pointer"
                  type="button"
                  onClick={() => setShowComments(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconComment size="large" className="text-white" />
                  <span className="text-sm font-medium">
                    {currentVideo.comments}
                  </span>
                </motion.button>
                <motion.button
                  className="flex flex-col items-center gap-1 transition-transform duration-300 hover:scale-110 bg-transparent border-none cursor-pointer"
                  type="button"
                  onClick={handleFavorite}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconStar
                    size="large"
                    className={
                      isFavorited
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white'
                    }
                  />
                  <span className="text-sm font-medium">
                    {currentVideo.likes || 0}
                  </span>
                </motion.button>
                <motion.button
                  className="flex flex-col items-center gap-1 transition-transform duration-300 hover:scale-110 bg-transparent border-none cursor-pointer"
                  type="button"
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IconShare size="large" className="text-white" />
                  <span className="text-sm font-medium">分享</span>
                </motion.button>
                <motion.div
                  className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                >
                  <img
                    src={`https://picsum.photos/100/100?random=${currentVideo.id}`}
                    alt="Music cover"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </motion.div>
                <button
                  className="flex flex-col items-center gap-1 transition-transform duration-300 hover:scale-110 bg-transparent border-none cursor-pointer"
                  type="button"
                >
                  <div className="text-3xl">•••</div>
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-2 line-clamp-1">
              {currentVideo.title}
            </h2>

            <p className="text-gray-300 mb-4 line-clamp-3">
              {currentVideo.description}
            </p>
          </div>
        )}
      </div>

      {/* 评论抽屉组件 */}
      <CommentDrawer
        visible={showComments || false}
        onClose={() => setShowComments(false)}
        comments={mockCommentData || []}
      />

      {/* 全局样式 */}
      <style>{`
        :root {
          --primary-color: #ff0050;
          --secondary-color: #2a2a2a;
          --text-primary: #ffffff;
          --text-secondary: #999999;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #000000;
          color: #ffffff;
          overflow: hidden;
        }

        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #777;
        }

        * {
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }

        button {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
