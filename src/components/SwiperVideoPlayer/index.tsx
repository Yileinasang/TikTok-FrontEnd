import {
  IconExpand,
  IconPause,
  IconPlay,
  IconSetting,
  IconShrink,
  IconVolume1,
  IconVolume2,
} from '@douyinfe/semi-icons';
import { Button, Dropdown, Slider } from '@douyinfe/semi-ui';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import {
  Autoplay,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
  Virtual,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CustomVideoPlayer from '../VideoPlayer/index';
import type { VideoPlayerMethods } from '../VideoPlayer/index';
import 'swiper/css';
import 'swiper/css/virtual';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface VideoItem {
  id: string | number;
  src: string;
  poster: string;
  title?: string;
  description?: string;
}

interface SwiperVideoPlayerProps {
  videos: VideoItem[];
  autoPlay?: boolean;
  loop?: boolean;
  initialSlide?: number;
  activeIndex?: number;
  onSlideChange?: (index: number) => void;
}

const SwiperVideoPlayer: FC<SwiperVideoPlayerProps> = ({
  videos,
  autoPlay = false,
  loop = true,
  initialSlide = 0,
  activeIndex: propActiveIndex,
  onSlideChange,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(
    propActiveIndex ?? initialSlide,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const videoPlayersRef = useRef<Record<string, VideoPlayerMethods>>({});
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(() => {
    // 从本地存储加载音量设置
    const savedVolume = localStorage.getItem('videoVolume');
    return savedVolume ? Number.parseFloat(savedVolume) : 1.0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 控制方法对象
  const controlMethods = useRef({
    // 播放当前视频
    playCurrentVideo: (index: number) => {
      const currentPlayer = videoPlayersRef.current[`player-${index}`];
      if (currentPlayer) {
        try {
          currentPlayer.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('播放视频失败:', error);
        }
      }
    },
    // 暂停当前视频
    pauseCurrentVideo: (index: number) => {
      const currentPlayer = videoPlayersRef.current[`player-${index}`];
      if (currentPlayer) {
        try {
          currentPlayer.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error('暂停视频失败:', error);
        }
      }
    },
    // 暂停所有视频
    pauseAllVideos: () => {
      for (const player of Object.values(videoPlayersRef.current)) {
        if (player) {
          try {
            player.pause();
          } catch (error) {
            console.error('暂停视频失败:', error);
          }
        }
      }
      setIsPlaying(false);
    },
    // 切换播放/暂停
    togglePlayPause: (index: number) => {
      const currentPlayer = videoPlayersRef.current[`player-${index}`];
      if (currentPlayer) {
        try {
          if (isPlaying) {
            currentPlayer.pause();
            setIsPlaying(false);
          } else {
            currentPlayer.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('切换播放状态失败:', error);
        }
      }
    },
    // 设置音量
    setVolume: (newVolume: number) => {
      setVolume(newVolume);
      localStorage.setItem('videoVolume', newVolume.toString());
      for (const player of Object.values(videoPlayersRef.current)) {
        if (player) {
          try {
            player.setVolume(newVolume);
          } catch (error) {
            console.error('设置音量失败:', error);
          }
        }
      }
      setIsMuted(false);
    },
    // 切换静音
    toggleMute: () => {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      for (const player of Object.values(videoPlayersRef.current)) {
        if (player) {
          try {
            player.setMuted(newMutedState);
          } catch (error) {
            console.error('切换静音状态失败:', error);
          }
        }
      }
    },
    // 设置播放速度
    setPlaybackRate: (rate: number) => {
      setPlaybackRate(rate);
      for (const player of Object.values(videoPlayersRef.current)) {
        if (player) {
          try {
            player.setPlaybackRate(rate);
          } catch (error) {
            console.error('设置播放速度失败:', error);
          }
        }
      }
    },
    // 切换全屏
    toggleFullscreen: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        const container = wrapperRef.current;
        if (container) {
          container.requestFullscreen();
        }
      }
    },
    // 键盘事件处理
    handleKeyDown: (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          controlMethods.current.togglePlayPause(activeIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          // 上一个视频
          if (swiperRef.current) {
            swiperRef.current.slidePrev();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          // 下一个视频
          if (swiperRef.current) {
            swiperRef.current.slideNext();
          }
          break;
        case 'ArrowLeft': {
          e.preventDefault();
          // 快退5秒
          const currentPlayer =
            videoPlayersRef.current[`player-${activeIndex}`];
          if (currentPlayer) {
            try {
              currentPlayer.seekTo(currentPlayer.getCurrentTime() - 5);
            } catch (error) {
              console.error('快退失败:', error);
            }
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          // 快进5秒
          const player = videoPlayersRef.current[`player-${activeIndex}`];
          if (player) {
            try {
              player.seekTo(player.getCurrentTime() + 5);
            } catch (error) {
              console.error('快进失败:', error);
            }
          }
          break;
        }
      }
    },
    // 鼠标滚轮调节音量
    handleWheel: (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      controlMethods.current.setVolume(newVolume);
    },
  });

  // 处理轮播滑动变化
  const handleSlideChange = (swiper: { activeIndex: number }) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);
    onSlideChange?.(newIndex);

    // 暂停所有其他视频
    for (const key of Object.keys(videoPlayersRef.current)) {
      const player = videoPlayersRef.current[key];
      if (player && key !== `player-${newIndex}`) {
        try {
          player.pause();
        } catch (error) {
          console.error('暂停视频失败:', error);
        }
      }
    }

    // 播放当前视频
    setTimeout(() => {
      if (isPlaying) {
        controlMethods.current.playCurrentVideo(newIndex);
      }
    }, 100);
  };

  // 处理轮播初始化
  const handleInit = () => {
    setIsInitialized(true);
    console.log('Swiper初始化完成');
  };

  // 处理视频播放器实例
  const handleVideoPlayerRef = (
    instance: VideoPlayerMethods | null,
    index: number,
  ) => {
    const key = `player-${index}`;
    if (instance) {
      videoPlayersRef.current[key] = instance;
      console.log(`播放器实例已保存: ${key}`);

      // 初始化播放器设置
      try {
        instance.setVolume(volume);
        instance.setMuted(isMuted);
        instance.setPlaybackRate(playbackRate);
      } catch (error) {
        console.error('初始化播放器设置失败:', error);
      }

      // 如果是当前激活的索引且需要播放
      if (index === activeIndex && isPlaying) {
        console.log(`当前索引 ${index} 是激活的，尝试播放`);
        setTimeout(() => {
          try {
            instance.play();
          } catch (error) {
            console.error('播放视频失败:', error);
          }
        }, 200);
      }
    } else if (videoPlayersRef.current[key]) {
      // 清理播放器实例
      try {
        videoPlayersRef.current[key].destroy();
      } catch (error) {
        console.warn('销毁播放器失败:', error);
      }
      delete videoPlayersRef.current[key];
    }
  };

  // 监听activeIndex变化，确保切换视频时播放当前视频
  useEffect(() => {
    if (isInitialized) {
      console.log(`当前激活索引: ${activeIndex}`);
      // 播放当前索引的视频
      setTimeout(() => {
        if (isPlaying) {
          controlMethods.current.playCurrentVideo(activeIndex);
        }
      }, 100);
    }
  }, [activeIndex, isInitialized, isPlaying]);

  // 监听音量和静音状态变化
  useEffect(() => {
    for (const player of Object.values(videoPlayersRef.current)) {
      if (player) {
        try {
          player.setVolume(volume);
          player.setMuted(isMuted);
        } catch (error) {
          console.error('更新播放器音量设置失败:', error);
        }
      }
    }
  }, [volume, isMuted]);

  // 监听播放速度变化
  useEffect(() => {
    for (const player of Object.values(videoPlayersRef.current)) {
      if (player) {
        try {
          player.setPlaybackRate(playbackRate);
        } catch (error) {
          console.error('更新播放速度失败:', error);
        }
      }
    }
  }, [playbackRate]);

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 添加键盘事件监听
  useEffect(() => {
    document.addEventListener('keydown', controlMethods.current.handleKeyDown);
    return () => {
      document.removeEventListener(
        'keydown',
        controlMethods.current.handleKeyDown,
      );
    };
  }, []);

  // 播放速度选项
  const playbackRates = [
    { label: '0.5×', value: 0.5 },
    { label: '0.75×', value: 0.75 },
    { label: '正常', value: 1.0 },
    { label: '1.25×', value: 1.25 },
    { label: '1.5×', value: 1.5 },
    { label: '2.0×', value: 2.0 },
  ];

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 清理所有播放器实例
      for (const player of Object.values(videoPlayersRef.current)) {
        if (player) {
          try {
            player.destroy();
          } catch (error) {
            console.warn('销毁播放器失败:', error);
          }
        }
      }
    };
  }, []);

  return (
    <div
      className="swiper-video-player-container"
      ref={wrapperRef}
      onWheel={controlMethods.current.handleWheel}
    >
      <Swiper
        ref={el => {
          if (el) {
            swiperRef.current = el.swiper as SwiperType;
          }
        }}
        modules={[
          Virtual,
          Pagination,
          Navigation,
          Autoplay,
          Keyboard,
          Mousewheel,
        ]}
        spaceBetween={0}
        slidesPerView={1}
        direction="vertical"
        virtual={{
          slides: videos.map((video, index) => ({
            key: video.id,
            virtualIndex: index,
          })),
        }}
        pagination={{ enabled: false }}
        navigation={{ enabled: false }}
        autoplay={false}
        loop={loop}
        keyboard={{ enabled: true }}
        mousewheel={{ enabled: true }}
        initialSlide={initialSlide}
        onSlideChange={handleSlideChange}
        onInit={handleInit}
        className="w-full h-full"
      >
        {videos.map((video, index) => (
          <SwiperSlide key={video.id} virtualIndex={index}>
            <div
              className="relative w-full h-full cursor-pointer"
              onKeyUp={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  controlMethods.current.togglePlayPause(index);
                }
              }}
              onClick={() => controlMethods.current.togglePlayPause(index)}
            >
              <CustomVideoPlayer
                ref={instance => handleVideoPlayerRef(instance, index)}
                src={video.src}
                poster={video.poster}
                videoId={`video-${index}-${video.id}`}
                width="100%"
                height="100%"
              />

              {/* 视频控制层 */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                {/* 顶部控制栏 */}
                <div className="w-full flex justify-between items-center pointer-events-auto">
                  {/* 音量控制 */}
                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button
                      type="button"
                      className="text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200"
                      onClick={e => {
                        e.stopPropagation();
                        controlMethods.current.toggleMute();
                      }}
                    >
                      {isMuted || volume === 0 ? (
                        <IconVolume1 />
                      ) : (
                        <IconVolume2 />
                      )}
                    </button>

                    {/* 音量滑块 */}
                    {showVolumeSlider && (
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ml-8 bg-black/50 backdrop-blur-md p-2 rounded-lg">
                        <Slider
                          vertical
                          defaultValue={volume}
                          min={0}
                          max={1}
                          step={0.01}
                          style={{ height: 80 }}
                          onChange={(value: number | number[] | undefined) => {
                            const volumeValue =
                              typeof value === 'number'
                                ? value
                                : (Array.isArray(value) ? value[0] : 0) || 0;
                            controlMethods.current.setVolume(volumeValue);
                          }}
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部控制栏 */}
                <div className="w-full flex justify-between items-center pointer-events-auto">
                  {/* 播放/暂停按钮 */}
                  <button
                    type="button"
                    className="text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200"
                    onClick={e => {
                      e.stopPropagation();
                      controlMethods.current.togglePlayPause(index);
                    }}
                  >
                    {isPlaying ? <IconPause /> : <IconPlay />}
                  </button>

                  {/* 设置菜单和全屏按钮 */}
                  <div className="flex items-center gap-2">
                    {/* 播放速度设置 */}
                    <Dropdown
                      items={playbackRates.map(rate => ({
                        label: rate.label,
                        onClick: () =>
                          controlMethods.current.setPlaybackRate(rate.value),
                        className:
                          playbackRate === rate.value ? 'bg-white/10' : '',
                      }))}
                    >
                      <Button
                        icon={<IconSetting />}
                        theme="borderless"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={e => e.stopPropagation()}
                      >
                        {playbackRate}×
                      </Button>
                    </Dropdown>

                    {/* 全屏按钮 */}
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        controlMethods.current.toggleFullscreen();
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          controlMethods.current.toggleFullscreen();
                        }
                      }}
                      className="text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {isFullscreen ? <IconShrink /> : <IconExpand />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-video-player-container {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background-color: #000;
        }
        .swiper {
          width: 100%;
          height: 100%;
        }
        .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .semi-slider {
          background: rgba(255, 255, 255, 0.3);
        }
        .semi-slider-track {
          background: rgba(255, 255, 255, 0.3);
        }
        .semi-slider-handle {
          background: white;
          border: none;
        }
        .semi-dropdown-menu {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .semi-dropdown-item {
          color: white;
        }
        .semi-dropdown-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .semi-button {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default SwiperVideoPlayer;
