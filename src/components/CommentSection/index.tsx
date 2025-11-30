import { IconCopy, IconLikeHeart, IconMore } from '@douyinfe/semi-icons';
import { Avatar, Button, Dropdown, Input, Toast } from '@douyinfe/semi-ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

// 扩展评论接口定义
interface Comment {
  id: string;
  nickname: string;
  avatar: string;
  content: string;
  time?: string;
  likes?: number;
  isLiked?: boolean;
  isHidden?: boolean;
  replies?: Comment[];
  showReplies?: boolean;
}

interface CommentSectionProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
}

// 模拟数据生成函数
const generateMockComments = (count = 20): Comment[] => {
  const mockComments: Comment[] = [];
  const authors = [
    { nickname: '抖音用户12345', avatar: 'https://via.placeholder.com/40' },
    { nickname: '创意达人', avatar: 'https://via.placeholder.com/40' },
    { nickname: '生活记录者', avatar: 'https://via.placeholder.com/40' },
    { nickname: '音乐发烧友', avatar: 'https://via.placeholder.com/40' },
    { nickname: '美食探险家', avatar: 'https://via.placeholder.com/40' },
  ];
  const contents = [
    '太精彩了，期待更多作品！',
    '这个创意真不错，学到了',
    '哈哈哈笑死我了，转发给朋友了',
    '音乐好好听，有人知道歌名吗？',
    '这个视频拍得真好，剪辑也很流畅',
    '支持一下，加油创作者！',
    '这个技巧太实用了，感谢分享',
    '看到这里忍不住想试试，期待效果',
    '内容很有价值，已收藏',
    '主播声音好好听啊',
  ];

  for (let i = 0; i < count; i++) {
    const author = authors[Math.floor(Math.random() * authors.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    const hasReplies = Math.random() > 0.7;
    const replies: Comment[] = [];

    if (hasReplies) {
      const replyCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < replyCount; j++) {
        replies.push({
          id: `reply-${i}-${j}`,
          nickname:
            authors[Math.floor(Math.random() * authors.length)].nickname,
          avatar: authors[Math.floor(Math.random() * authors.length)].avatar,
          content: `回复: ${contents[Math.floor(Math.random() * contents.length)]}`,
          time: `${Math.floor(Math.random() * 24)}小时前`,
          likes: Math.floor(Math.random() * 100),
          isLiked: Math.random() > 0.8,
          isHidden: false,
          showReplies: false,
        });
      }
    }

    mockComments.push({
      id: `comment-${i}`,
      nickname: author.nickname,
      avatar: author.avatar,
      content: content,
      time: `${Math.floor(Math.random() * 24)}小时前`,
      likes: Math.floor(Math.random() * 500),
      isLiked: Math.random() > 0.8,
      isHidden: false,
      replies,
      showReplies: false,
    });
  }

  return mockComments;
};

// 点赞动画配置
const likeAnimationConfig: MotionProps = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.2, 1.4, 1.2, 1] },
  transition: {
    duration: 0.5,
    ease: 'easeInOut',
  },
};

const CommentSection: FC<CommentSectionProps> = ({
  visible,
  onClose,
  comments: propComments,
}) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // 使用模拟数据或传入的数据
  useEffect(() => {
    if (propComments && propComments.length > 0) {
      // 确保所有评论都有必要的字段
      const formattedComments = propComments.map(comment => ({
        ...comment,
        time: comment.time || '刚刚',
        likes: comment.likes || 0,
        isLiked: comment.isLiked || false,
        isHidden: comment.isHidden || false,
        replies: comment.replies || [],
        showReplies: comment.showReplies || false,
      }));
      setComments(formattedComments);
    } else {
      setComments(generateMockComments());
    }
  }, [propComments]);

  // 自动滚动到最新评论
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePostComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: `comment-new-${Date.now()}`,
        nickname: '我',
        avatar: 'https://via.placeholder.com/40',
        content: newComment.trim(),
        time: '刚刚',
        likes: 0,
        isLiked: false,
        isHidden: false,
      };

      // 乐观更新 - 新评论添加到列表顶部
      setComments([newCommentObj, ...comments]);
      setNewComment('');

      // 滚动到最新评论
      setTimeout(scrollToBottom, 100);
    }
  };

  // 处理评论点赞
  const handleLikeComment = (commentId: string, isReply = false) => {
    setComments(prevComments => {
      const updateComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          return {
            ...comment,
            isLiked: newIsLiked,
            likes: newIsLiked
              ? (comment.likes || 0) + 1
              : Math.max(0, (comment.likes || 0) - 1),
          };
        }

        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(updateComment),
          };
        }

        return comment;
      };

      return prevComments.map(updateComment);
    });

    // 更新点赞记录
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // 处理复制评论
  const handleCopyComment = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        Toast.success('复制成功');
      })
      .catch(() => {
        Toast.error('复制失败');
      });
  };

  // 处理隐藏评论
  const handleHideComment = (commentId: string) => {
    setComments(prevComments => {
      const updateComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isHidden: true,
          };
        }

        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(updateComment),
          };
        }

        return comment;
      };

      return prevComments.map(updateComment);
    });
  };

  // 切换显示回复
  const toggleReplies = (commentId: string) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            showReplies: !comment.showReplies,
          };
        }
        return comment;
      });
    });
  };

  if (!visible) return null;

  // 计算实际显示的评论数量（排除隐藏的）
  const visibleCommentsCount = comments.filter(c => !c.isHidden).length;

  return (
    <div className="w-full h-full bg-black text-white flex flex-col">
      {/* 评论标题栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 z-10 bg-black">
        <h2 className="text-lg font-bold text-white">
          评论 ({visibleCommentsCount})
        </h2>
        <Button
          onClick={onClose}
          style={{
            color: 'white',
            backgroundColor: 'transparent',
            fontSize: '20px',
            width: '32px',
            height: '32px',
            padding: 0,
          }}
          className="rounded-full hover:bg-white/10"
        >
          ×
        </Button>
      </div>

      {/* 评论列表 */}
      <div className="overflow-y-auto flex-1 p-4">
        {comments.map(comment => (
          <div key={comment.id} className="comment-item mb-6">
            {comment.isHidden ? (
              <div className="text-gray-500 italic text-sm py-4">
                该评论已被隐藏
              </div>
            ) : (
              <>
                <div className="flex">
                  <Avatar
                    src={comment.avatar}
                    size="small"
                    className="rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-sm mr-2">
                        {comment.nickname}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      {/* 点赞按钮 */}
                      <button
                        type="button"
                        className="flex items-center mr-6 group"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <AnimatePresence mode="wait">
                          {comment.isLiked ? (
                            <motion.div key="liked" {...likeAnimationConfig}>
                              <IconLikeHeart
                                className="mr-1 text-red-500"
                                size="large"
                              />
                            </motion.div>
                          ) : (
                            <motion.div key="unliked">
                              <IconLikeHeart
                                className="mr-1 group-hover:text-red-500 transition-colors"
                                size="large"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span className={comment.isLiked ? 'text-red-500' : ''}>
                          {comment.likes}
                        </span>
                      </button>

                      {/* 回复按钮 */}
                      <button
                        type="button"
                        className="mr-6 hover:text-gray-300 transition-colors"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        回复
                      </button>

                      {/* 更多按钮 */}
                      <Dropdown
                        items={[
                          {
                            label: '复制评论',
                            icon: <IconCopy size="large" />,
                            onClick: () => handleCopyComment(comment.content),
                          },
                          {
                            label: '隐藏评论',
                            onClick: () => handleHideComment(comment.id),
                            className: 'text-red-500',
                          },
                        ]}
                        trigger="click"
                      >
                        <button
                          type="button"
                          className="hover:text-gray-300 transition-colors"
                        >
                          <IconMore size="large" />
                        </button>
                      </Dropdown>
                    </div>
                  </div>
                </div>

                {/* 子评论 */}
                {comment.replies && comment.replies.length > 0 && (
                  <>
                    {/* 查看更多回复按钮 */}
                    <button
                      type="button"
                      onClick={() => toggleReplies(comment.id)}
                      className="ml-10 mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center"
                    >
                      {comment.showReplies ? (
                        <>收起回复</>
                      ) : (
                        <>查看{comment.replies.length}条回复</>
                      )}
                    </button>

                    {/* 回复列表 */}
                    {comment.showReplies && (
                      <div className="ml-10 mt-2 pl-2 border-l-2 border-gray-800 space-y-4">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="reply-item">
                            {reply.isHidden ? (
                              <div className="text-gray-500 italic text-sm py-4">
                                该评论已被隐藏
                              </div>
                            ) : (
                              <div className="flex">
                                <Avatar
                                  src={reply.avatar}
                                  size="xs"
                                  className="rounded-full"
                                />
                                <div className="ml-2 flex-1">
                                  <div className="flex items-center mb-1">
                                    <span className="font-medium text-xs mr-2">
                                      {reply.nickname}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {reply.time}
                                    </span>
                                  </div>
                                  <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                    {reply.content}
                                  </p>
                                  <div className="flex items-center mt-2 text-xs text-gray-500">
                                    {/* 回复点赞按钮 */}
                                    <button
                                      type="button"
                                      className="flex items-center mr-6 group"
                                      onClick={() =>
                                        handleLikeComment(reply.id, true)
                                      }
                                    >
                                      <AnimatePresence mode="wait">
                                        {reply.isLiked ? (
                                          <motion.div
                                            key="liked"
                                            {...likeAnimationConfig}
                                          >
                                            <IconLikeHeart
                                              className="mr-1 text-red-500"
                                              size="large"
                                            />
                                          </motion.div>
                                        ) : (
                                          <motion.div key="unliked">
                                            <IconLikeHeart
                                              className="mr-1 group-hover:text-red-500 transition-colors"
                                              size="large"
                                            />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                      <span
                                        className={
                                          reply.isLiked ? 'text-red-500' : ''
                                        }
                                      >
                                        {reply.likes}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      className="hover:text-gray-300 transition-colors"
                                    >
                                      回复
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>

      {/* 评论输入框 */}
      <div className="p-4 border-t border-gray-800 sticky bottom-0 bg-black">
        <div className="flex">
          <Input
            value={newComment}
            onChange={(value: string) => setNewComment(value)}
            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
            placeholder="说点什么..."
            className="flex-1 rounded-full"
            style={{
              backgroundColor: '#1a1a1a',
              borderColor: '#333',
              color: 'white',
              borderRadius: '20px',
              paddingLeft: '16px',
              paddingRight: '16px',
            }}
          />
          <Button
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            className="ml-2 rounded-full"
            style={{
              backgroundColor: newComment.trim() ? '#ff2442' : '#333',
              color: 'white',
              border: 'none',
              paddingLeft: '16px',
              paddingRight: '16px',
              borderRadius: '20px',
            }}
          >
            发布
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
