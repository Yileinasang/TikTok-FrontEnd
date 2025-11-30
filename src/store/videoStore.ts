import { atom } from 'jotai';

// 定义视频数据类型，与SwiperVideoPlayer组件兼容
export interface VideoData {
  id: string | number;
  src: string;
  poster: string;
  title?: string;
  description?: string;
  author?: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

console.log('videoStore.ts - 开始初始化视频状态管理');

// 视频列表状态
const _videoListAtom = atom<VideoData[]>([]);
export const videoListAtom = atom(
  get => get(_videoListAtom),
  (get, set, update: VideoData[]) => {
    console.log('videoStore.ts - videoListAtom更新:', {
      previous: get(_videoListAtom),
      newLength: update.length,
    });
    set(_videoListAtom, update);
  },
);
console.log('videoStore.ts - videoListAtom初始化完成');

// 当前播放视频状态
const _currentVideoAtom = atom<VideoData | null>(null);
export const currentVideoAtom = atom(
  get => get(_currentVideoAtom),
  (get, set, update: VideoData | null) => {
    console.log('videoStore.ts - currentVideoAtom更新:', {
      id: update?.id || 'null',
      title: update?.title || 'null',
    });
    set(_currentVideoAtom, update);
  },
);
console.log('videoStore.ts - currentVideoAtom初始化完成');

// 当前活动的幻灯片索引
export const activeSlideIndexAtom = atom<number>(0);
console.log('videoStore.ts - activeSlideIndexAtom初始化完成');

// 视频播放状态
export const isPlayingAtom = atom<boolean>(false);
console.log('videoStore.ts - isPlayingAtom初始化完成');

// 音量状态 - 使用jotai的标准语法
export const volumeAtom = atom(
  // getter：从localStorage读取音量
  get => {
    const savedVolume = localStorage.getItem('douyin_volume');
    const volume = savedVolume ? Number.parseFloat(savedVolume) : 1.0;
    console.log('videoStore.ts - volumeAtom初始化，值:', volume);
    return volume;
  },
  // setter：设置新音量并保存到localStorage
  (_, set, newVolume: number) => {
    console.log('videoStore.ts - volumeAtom更新，新值:', newVolume);
    const validVolume = Math.max(0, Math.min(1, newVolume));
    localStorage.setItem('douyin_volume', validVolume.toString());
    return validVolume;
  },
);

// 增强版的saveVolume函数，确保音量在0-1范围内并保存到本地存储
export const saveVolume = (volume: number) => {
  console.log('videoStore.ts - 保存音量到localStorage:', volume);
  const validVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('douyin_volume', validVolume.toString());
  return validVolume;
};

// 轮播播放状态
export const isAutoPlayingAtom = atom<boolean>(true);
console.log('videoStore.ts - isAutoPlayingAtom初始化完成 - 默认开启自动播放');

// 轮播循环状态
export const isLoopAtom = atom<boolean>(true);
console.log('videoStore.ts - isLoopAtom初始化完成');

console.log('videoStore.ts - 所有状态原子初始化完成');
