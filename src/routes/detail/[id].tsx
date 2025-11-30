import { IconLikeHeart } from '@douyinfe/semi-icons';
import { Button, Empty, Spin } from '@douyinfe/semi-ui';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentSection from '../../components/CommentSection/index';
import VideoPlayer from '../../components/VideoPlayer/index';
import { mockCommentData, mockVideoData } from '../../mock/videoData';
import { currentVideoAtom, videoListAtom } from '../../store/videoStore';
import { mockRequest } from '../../utils/mockRequest';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [videoList, setVideoList] = useAtom(videoListAtom);
  const [currentVideo, setCurrentVideo] = useAtom(currentVideoAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideoData = async () => {
      try {
        setLoading(true);
        // 加载视频列表
        const videos = await mockRequest(mockVideoData.videos, 800);
        setVideoList(videos);

        // 查找对应ID的视频
        const foundVideo = videos.find(video => video.id === id);
        if (foundVideo) {
          setCurrentVideo(foundVideo);
          setError(null);
        } else {
          setError('视频不存在');
        }
      } catch (err) {
        setError('加载失败，请重试');
        console.error('Failed to load video:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideoData();
  }, [id, setVideoList, setCurrentVideo]);

  // 返回上一页
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* 返回按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          theme="borderless"
          className="text-white hover:bg-white/20 rounded-full p-2"
          onClick={handleBack}
        >
          ←
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" className="text-white" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-screen">
          <Empty description={error} className="text-white" />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
          {/* 视频区域 - 在移动端占满屏幕，在桌面端占据左侧 */}
          <div className="md:w-1/2 h-screen md:h-auto flex flex-col relative">
            <div className="flex-1 flex items-center justify-center p-4">
              {currentVideo && (
                <VideoPlayer
                  src={currentVideo.src}
                  poster={currentVideo.poster}
                />
              )}
            </div>

            {/* 视频信息 - 仅在移动端显示 */}
            <div className="md:hidden p-4 bg-black border-t border-gray-800">
              {currentVideo && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://picsum.photos/100/100?random=author"
                        alt={currentVideo.author}
                        className="w-10 h-10 rounded-full object-cover border border-white"
                      />
                      <div>
                        <h3 className="font-medium">{currentVideo.author}</h3>
                        <p className="text-xs text-gray-400">1000 粉丝</p>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      className="bg-primary rounded-full px-4"
                    >
                      关注
                    </Button>
                  </div>
                  <h2 className="text-base font-bold mb-2 line-clamp-1">
                    {currentVideo.title}
                  </h2>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {currentVideo.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 评论区域 - 在移动端占满屏幕，在桌面端占据右侧 */}
          <div className="md:w-1/2 h-screen overflow-y-auto bg-gray-900">
            {/* 评论标题 */}
            <div className="sticky top-0 bg-gray-900 z-10 p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold">
                评论 ({currentVideo?.comments || 0})
              </h3>
            </div>

            {/* 视频信息 - 仅在桌面端显示 */}
            <div className="hidden md:block p-4 border-b border-gray-800">
              {currentVideo && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://picsum.photos/100/100?random=author"
                        alt={currentVideo.author}
                        className="w-12 h-12 rounded-full object-cover border border-white"
                      />
                      <div>
                        <h3 className="font-medium">{currentVideo.author}</h3>
                        <p className="text-xs text-gray-400">1000 粉丝</p>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      className="bg-primary rounded-full px-6"
                    >
                      关注
                    </Button>
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    {currentVideo.title}
                  </h2>
                  <p className="text-gray-300 mb-3">
                    {currentVideo.description}
                  </p>

                  <div className="flex items-center gap-6 text-gray-300">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <IconLikeHeart className="text-primary" />
                      <span>{currentVideo.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <span className="text-2xl">💬</span>
                      <span>{currentVideo.comments}</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <span className="text-2xl">↪️</span>
                      <span>{currentVideo.shares}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 评论列表 */}
            <div className="p-4">
              <CommentSection
                visible={true}
                onClose={() => handleBack()}
                comments={mockCommentData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
