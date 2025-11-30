import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { FC, RefObject } from 'react';
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';

interface CustomVideoPlayerProps {
  src: string;
  poster: string;
  videoId?: string;
  width?: number | string;
  height?: number | string;
}

export interface VideoPlayerMethods {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
  paused: boolean;
  muted: boolean;
}

// 使用xgplayer替换原生video元素的视频播放器组件
const CustomVideoPlayer = forwardRef<
  VideoPlayerMethods,
  CustomVideoPlayerProps
>(({ src, poster, videoId = 'default', width, height }, ref) => {
  // 播放器容器引用
  const playerContainerRef = useRef<HTMLDivElement>(null);
  // 播放器实例引用
  const playerRef = useRef<Player | null>(null);
  // 视频元素引用（用于降级处理）
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  // 状态管理
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // 处理错误的函数 - 使用useCallback避免重新创建
  const handleError = useCallback(
    (
      error:
        | Error
        | string
        | { type?: string; code?: number; message?: string },
    ) => {
      setIsError(true);
      setIsLoading(false);
      let errorMsg = '未知错误';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      } else if (error.message) {
        errorMsg = error.message;
      } else {
        errorMsg = String(error);
      }
      setErrorMessage(errorMsg);
      console.error('视频播放错误:', errorMsg);
    },
    [], // 状态设置函数是稳定的，不需要作为依赖项
  );

  // 重试加载视频的函数 - 使用useCallback避免重新创建
  const handleRetry = useCallback(() => {
    if (retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      console.log(`尝试重新加载视频，第${retryCountRef.current}次重试...`);

      // 延迟重试，避免频繁请求
      setTimeout(() => {
        if (playerRef.current) {
          try {
            playerRef.current.src = src;
            playerRef.current.load();
          } catch (retryError) {
            console.error('重试失败:', retryError);
            handleError(String(retryError));
          }
        }
      }, 2000 * retryCountRef.current);
    } else {
      handleError(new Error('达到最大重试次数，无法加载视频'));
    }
  }, [src, handleError]);

  // 使用useImperativeHandle暴露方法给父组件
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (playerRef.current) {
        return playerRef.current.play();
      }
      if (videoElementRef.current) {
        return videoElementRef.current.play();
      }
    },
    pause: async () => {
      if (playerRef.current) {
        return playerRef.current.pause();
      }
      if (videoElementRef.current) {
        return videoElementRef.current.pause();
      }
    },
    togglePlay: () => {
      if (playerRef.current) {
        if (playerRef.current.paused) {
          playerRef.current.play();
        } else {
          playerRef.current.pause();
        }
      } else if (videoElementRef.current) {
        if (videoElementRef.current.paused) {
          videoElementRef.current.play();
        } else {
          videoElementRef.current.pause();
        }
      }
    },
    seek: (time: number) => playerRef.current?.seek(time),
    seekTo: (time: number) => {
      if (playerRef.current) {
        playerRef.current.seek(time);
      } else if (videoElementRef.current) {
        videoElementRef.current.currentTime = time;
      }
    },
    setVolume: (volume: number) => {
      if (playerRef.current) {
        playerRef.current.volume = volume;
      } else if (videoElementRef.current) {
        videoElementRef.current.volume = volume;
      }
    },
    toggleMute: () => {
      if (playerRef.current) {
        playerRef.current.muted = !playerRef.current.muted;
      } else if (videoElementRef.current) {
        videoElementRef.current.muted = !videoElementRef.current.muted;
      }
    },
    setMuted: (muted: boolean) => {
      if (playerRef.current) {
        playerRef.current.muted = muted;
      } else if (videoElementRef.current) {
        videoElementRef.current.muted = muted;
      }
    },
    setPlaybackRate: (rate: number) => {
      if (playerRef.current) {
        playerRef.current.playbackRate = rate;
      } else if (videoElementRef.current) {
        videoElementRef.current.playbackRate = rate;
      }
    },
    getCurrentTime: (): number => {
      if (playerRef.current) {
        return playerRef.current.currentTime;
      }
      if (videoElementRef.current) {
        return videoElementRef.current.currentTime;
      }
      return 0;
    },
    getDuration: (): number => {
      if (playerRef.current) {
        return playerRef.current.duration;
      }
      if (videoElementRef.current) {
        return videoElementRef.current.duration;
      }
      return 0;
    },
    destroy: () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    },
    get paused() {
      if (playerRef.current) {
        return playerRef.current.paused;
      }
      if (videoElementRef.current) {
        return videoElementRef.current.paused;
      }
      return false;
    },
    get muted() {
      if (playerRef.current) {
        return playerRef.current.muted;
      }
      if (videoElementRef.current) {
        return videoElementRef.current.muted;
      }
      return false;
    },
  }));

  // 处理窗口尺寸变化的函数 - 移除重复定义，在useEffect中使用单一版本

  useEffect(() => {
    console.log('VideoPlayer组件已挂载, src:', src, 'poster:', poster);

    // 验证src和poster的有效性
    if (!src) {
      console.error('VideoPlayer: 视频源URL为空');
    } else {
      console.log(
        'VideoPlayer: 视频源URL类型检查:',
        typeof src,
        '是否为字符串:',
        src.startsWith('http') || src.includes('.mp4') || src.includes('.m3u8'),
      );
    }

    // 销毁之前的播放器实例（如果存在）
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    // 声明并初始化需要在清理函数中访问的变量
    let handleResize: () => void = () => {}; // 初始化为空函数
    let sizeCheckInterval: ReturnType<typeof setInterval> | undefined =
      undefined; // 初始化为undefined

    // 使用requestAnimationFrame延迟初始化，确保DOM布局完成
    const animationId = requestAnimationFrame(() => {
      // 确保容器存在
      const container = playerContainerRef.current;
      if (!container) {
        console.error('播放器容器不存在');
        handleError('播放器容器不存在');
        return;
      }

      // 强制刷新容器的布局计算
      container.style.display = 'none';
      setTimeout(() => {
        container.style.display = 'block';
      }, 0);

      // 立即强制设置容器的最小尺寸，无论父容器如何
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minWidth = '300px';
      container.style.minHeight = '200px';
      container.style.display = 'block';
      container.style.position = 'relative';
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      container.style.zIndex = '10';

      // 确保外层包装div的尺寸也被正确设置
      const wrapperDiv = container.parentElement;
      if (wrapperDiv) {
        wrapperDiv.style.width = '100%';
        wrapperDiv.style.height = '100%';
        wrapperDiv.style.display = 'flex';
        wrapperDiv.style.alignItems = 'center';
        wrapperDiv.style.justifyContent = 'center';
      }

      // 尝试通过强制重排获取准确尺寸
      void container.offsetHeight; // 触发重排

      // 检查容器尺寸
      const rect = container.getBoundingClientRect();
      console.log('播放器容器尺寸 (RAF):', rect.width, 'x', rect.height);
      if (rect.width === 0 || rect.height === 0) {
        console.warn('播放器容器尺寸为0,正在强制设置尺寸');
        // 直接设置具体像素值
        container.style.width = '1080px';
        container.style.height = '1920px';
        // 再次触发重排
        void container.offsetHeight;
      }

      // 定义handleResize函数，使用之前在顶层声明的变量
      handleResize = () => {
        if (playerRef.current && container) {
          // 使用getBoundingClientRect以获取更准确的尺寸信息
          const rect = container.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;

          // 如果获取到的尺寸为0，尝试强制设置
          if (width === 0 || height === 0) {
            console.warn('handleResize: 容器尺寸为0,尝试强制设置');

            // 尝试从父元素或视口获取尺寸
            const parent = container.parentElement;
            width = parent?.getBoundingClientRect().width || window.innerWidth;
            height =
              parent?.getBoundingClientRect().height || window.innerHeight;

            // 强制设置容器尺寸
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.minWidth = '300px';
            container.style.minHeight = '200px';
          }

          // 只有当尺寸有意义时才更新播放器
          if (width > 0 && height > 0) {
            playerRef.current.config.width = width;
            playerRef.current.config.height = height;
            playerRef.current.resize();
            console.log(`播放器尺寸已更新: ${width}x${height}`);
          } else {
            console.error('handleResize: 无法获取有效尺寸');
          }
        }
      };

      try {
        // 强制设置容器尺寸，防止为0 - 增强版本
        const ensureContainerSize = () => {
          // 使用getBoundingClientRect获取最准确的尺寸
          const rect = container.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;

          // 如果尺寸无效，尝试多种方式获取
          if (width === 0 || height === 0) {
            console.warn('播放器容器尺寸为0,正在设置默认尺寸');

            // 尝试从父容器获取尺寸
            const parent = container.parentElement;
            if (parent) {
              const parentRect = parent.getBoundingClientRect();
              width = parentRect.width || 1080;
              height = parentRect.height || 1920;
            } else {
              // 如果没有父容器，使用视口尺寸
              width = window.innerWidth;
              height = window.innerHeight;
            }

            // 设置最小尺寸保证可用性
            if (width < 300) width = 300;
            if (height < 200) height = 200;

            // 强制设置样式 - 使用px和!important确保生效
            container.style.width = `${width}px !important`;
            container.style.height = `${height}px !important`;
            container.style.minWidth = '300px !important';
            container.style.minHeight = '200px !important';
            container.style.display = 'block !important';
            container.style.position = 'relative !important';
            container.style.visibility = 'visible !important';
            container.style.opacity = '1 !important';
            container.style.overflow = 'hidden !important';
            container.style.zIndex = '100 !important';

            // 同时设置父容器的尺寸
            if (parent) {
              parent.style.width = '100%';
              parent.style.height = '100%';
              parent.style.display = 'flex';
              parent.style.alignItems = 'center';
              parent.style.justifyContent = 'center';
            }

            console.log(`已设置默认播放器尺寸: ${width}x${height}`);
          }

          return { width, height };
        };

        // 确保容器尺寸有效
        const { width, height } = ensureContainerSize();

        // 再次检查尺寸，确保有有效的宽高值
        let finalWidth = width;
        let finalHeight = height;

        // 如果仍然没有有效尺寸，使用硬编码的默认值
        if (finalWidth <= 0 || finalHeight <= 0) {
          finalWidth = 1080;
          finalHeight = 1920;
          console.warn('使用硬编码默认尺寸:', finalWidth, 'x', finalHeight);
          // 立即应用到容器
          container.style.width = `${finalWidth}px !important`;
          container.style.height = `${finalHeight}px !important`;
        }

        // 创建xgplayer实例
        playerRef.current = new Player({
          id: `xgplayer-${videoId}`,
          el: container,
          url: src,
          poster: poster,
          width: finalWidth,
          height: finalHeight,
          autoplay: true,
          muted: true, // 静音自动播放以提高兼容性
          loop: true,
          playsinline: true,
          lang: 'zh-cn',
          defaultPlaybackRate: 1,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          volume: 0.8,
          preload: 'auto',
          controls: true,
          rotate: {
            // 启用旋转功能
            useCssFullscreen: true,
            lockRotation: false,
          },
          download: false,
          // 允许所有域名的视频资源加载
          whitelist: ['*'], // 明确允许所有域名
          // 自定义UI配置
          ignoreKeys: ['ArrowLeft', 'ArrowRight', ' '], // 避免与轮播冲突
          plugins: [],
          // 尺寸变化监听
          onResize() {
            if (playerRef.current && container) {
              const newWidth = container.clientWidth;
              const newHeight = container.clientHeight;
              // 只有当尺寸有意义时才更新
              if (newWidth > 0 && newHeight > 0) {
                playerRef.current.config.width = newWidth;
                playerRef.current.config.height = newHeight;
                playerRef.current.resize();
              }
            }
          },
          // 错误处理
          errorType: {
            404: {
              text: '视频资源不存在',
              buttonText: '重试',
              code: 404,
            },
          },
          // 事件处理
          events: {
            // 加载错误处理
            onError(e: ErrorEvent) {
              console.error('视频加载错误:', e);
              handleError(e);
              handleRetry();
            },
            ready() {
              console.log('播放器准备就绪');
              setIsLoading(false);
              retryCountRef.current = 0;
              // 确保播放器容器可见
              if (playerContainerRef.current) {
                console.log(
                  '播放器容器样式:',
                  window.getComputedStyle(playerContainerRef.current),
                );
              }
            },
            play() {
              console.log('视频开始播放');
              setIsLoading(false);
            },
            // 加载状态变化
            loadingchange(loading: boolean) {
              console.log('视频加载状态变化:', loading);
              setIsLoading(loading);
            },
            pause() {
              console.log('视频暂停');
            },
            ended() {
              console.log('视频播放结束');
            },
            loadstart() {
              console.log('开始加载视频资源:', src);
              setIsLoading(true);
            },
            loadedmetadata() {
              console.log('视频元数据已加载');
              setIsLoading(false);
            },
            waiting() {
              console.log('视频等待加载/缓冲中');
              setIsLoading(true);
            },
            stalled() {
              console.warn('视频加载停滞');
              handleRetry();
            },
            abort() {
              console.warn('视频加载中止');
            },
            emptied() {
              console.warn('视频资源已清空');
            },
            canplay() {
              console.log('视频可以开始播放');
              setIsLoading(false);
            },
            canplaythrough() {
              console.log('视频可以流畅播放');
              setIsLoading(false);
            },
            // 增加尺寸变化时的监听器
            resize() {
              if (container && playerRef.current) {
                const rect = container.getBoundingClientRect();
                console.log('播放器resize事件:', rect.width, 'x', rect.height);

                // 如果尺寸为0，强制修复
                if (rect.width === 0 || rect.height === 0) {
                  console.error('resize事件检测到尺寸为0,强制修复');
                  const width = window.innerWidth;
                  const height = window.innerHeight;
                  container.style.width = `${width}px !important`;
                  container.style.height = `${height}px !important`;

                  if (playerRef.current) {
                    playerRef.current.config.width = width;
                    playerRef.current.config.height = height;
                    playerRef.current.resize();
                  }
                }
              }
            },
          },
        });

        console.log('播放器实例创建成功');
        window.addEventListener('resize', handleResize);

        // 添加定期尺寸检查机制
        sizeCheckInterval = setInterval(() => {
          if (playerRef.current && container) {
            const newRect = container.getBoundingClientRect();
            console.log('定期尺寸检查:', newRect.width, 'x', newRect.height);

            // 如果发现尺寸为0，立即强制修复
            if (newRect.width === 0 || newRect.height === 0) {
              console.error('发现播放器尺寸为0,立即修复');
              const width = window.innerWidth;
              const height = window.innerHeight;

              // 强制设置容器尺寸
              container.style.width = `${width}px !important`;
              container.style.height = `${height}px !important`;

              // 强制设置父容器尺寸
              const parent = container.parentElement;
              if (parent) {
                parent.style.width = '100%';
                parent.style.height = '100%';
              }

              // 重新调整播放器尺寸
              if (playerRef.current) {
                playerRef.current.config.width = width;
                playerRef.current.config.height = height;
                playerRef.current.resize();
              }
            } else if (playerRef.current) {
              // 如果尺寸有效，确保播放器使用正确的尺寸
              playerRef.current.config.width = newRect.width;
              playerRef.current.config.height = newRect.height;
              playerRef.current.resize();
            }
          }
        }, 2000); // 每2秒检查一次
      } catch (error) {
        console.error('创建播放器实例失败:', error);
        handleError(String(error));
      }
    });

    // 清理函数
    return () => {
      // 取消动画帧
      cancelAnimationFrame(animationId);

      // 清理定时器 - 先检查变量是否存在
      if (sizeCheckInterval !== undefined) {
        clearInterval(sizeCheckInterval);
      }

      // 移除事件监听器 - 先检查变量是否存在
      if (handleResize !== undefined) {
        window.removeEventListener('resize', handleResize);
      }

      if (playerRef.current) {
        try {
          // 安全地销毁播放器实例，避免DOM操作错误
          playerRef.current.destroy();
        } catch (error) {
          console.warn('销毁播放器时出现错误:', error);
        } finally {
          playerRef.current = null;
        }
      }
    };
  }, [handleError, handleRetry, src, poster, videoId]);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: width || '100%',
        height: height || 630, // 使用默认高度值
        minHeight: '300px',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        boxSizing: 'border-box', // 确保padding和border不影响尺寸计算
      }}
    >
      {/* 播放器容器 - 增强的尺寸保证 */}
      <div
        ref={playerContainerRef}
        id={`xgplayer-${videoId}`}
        className="relative"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 10,
          minWidth: '300px', // 增加最小宽度保证
          minHeight: '200px', // 增加最小高度保证
          boxSizing: 'border-box',
          // 强制确保容器可见
          visibility: 'visible',
          opacity: 1,
          pointerEvents: 'auto',
        }}
      >
        {/* 原生视频元素作为后备方案 */}
        <video
          ref={videoElementRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 5,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          onError={e => {
            console.error('原生视频播放错误:', e);
            if (!isError) {
              handleError('原生视频播放失败，请检查网络或视频源');
            }
          }}
          onLoadedData={() => {
            console.log('原生视频数据已加载');
            setIsLoading(false);
            setIsError(false);
          }}
          onLoadStart={() => setIsLoading(true)}
        />

        {/* 加载和错误状态显示 */}
        {(isLoading || isError) && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 20,
            }}
          >
            {isLoading && <div>视频加载中...</div>}
            {isError && (
              <>
                <div style={{ color: 'red', marginBottom: '10px' }}>
                  视频播放出错
                </div>
                <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                  {errorMessage}
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  重试
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// 修复forwardRef类型导出
CustomVideoPlayer.displayName = 'CustomVideoPlayer';

export default CustomVideoPlayer;
