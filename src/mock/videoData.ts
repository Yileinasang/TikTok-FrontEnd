// 模拟视频数据
export const mockVideoData = {
  videos: [
    {
      id: '1',
      title: '精彩视频标题',
      author: '作者名',
      description: '视频描述',
      // 使用更可靠的公共测试视频
      src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      poster: 'https://picsum.photos/400/600?random=poster1',
      likes: 1234,
      comments: 56,
    },
    {
      id: '2',
      title: '美食制作教程',
      author: '美食达人',
      description: '简单易学的家常菜教程',
      // 使用W3C的测试视频
      src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      poster: 'https://picsum.photos/400/600?random=poster2',
      likes: 2345,
      comments: 78,
    },
    {
      id: '3',
      title: '旅行风景分享',
      author: '旅行者',
      description: '带你看遍绝美风景',
      // 使用可靠的视频源
      src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      poster: 'https://picsum.photos/400/600?random=poster3',
      likes: 3456,
      comments: 90,
    },
    {
      id: '4',
      title: '动物世界',
      author: '自然探索者',
      description: '神奇的动物王国',
      // 使用可靠的公共视频
      src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      poster: 'https://picsum.photos/400/600?random=poster4',
      likes: 4567,
      comments: 123,
    },
  ],
};

// 模拟评论数据
export const mockCommentData = [
  {
    id: 'c1',
    nickname: '用户1',
    avatar: 'https://picsum.photos/100/100?random=avatar101',
    content: '这个视频太棒了！',
  },
  {
    id: 'c2',
    nickname: '用户2',
    avatar: 'https://picsum.photos/100/100?random=avatar102',
    content: '学到了很多，谢谢分享',
  },
  {
    id: 'c3',
    nickname: '用户3',
    avatar: 'https://picsum.photos/100/100?random=avatar103',
    content: '期待更多优质内容',
  },
];
