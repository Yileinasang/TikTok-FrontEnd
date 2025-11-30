import { Card, Skeleton } from '@douyinfe/semi-ui';
// src/components/video/VideoSection.tsx
import type React from 'react';

const VideoSection: React.FC = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {[1, 2, 3].map(item => (
        <Card key={item} className="overflow-hidden">
          {/* 视频封面骨架屏 */}
          <Skeleton className="w-full h-[400px] rounded-t-lg" />
          {/* 视频信息骨架屏 */}
          <div className="p-4">
            <Skeleton className="w-1/3 h-6 mb-2" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VideoSection;
