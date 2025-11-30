import type React from 'react';
import type { FC } from 'react';
import CommentSection from './CommentSection';

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

interface CommentDrawerProps {
  visible: boolean;
  onClose: () => void;
  comments?: Comment[];
}

const CommentDrawer: FC<CommentDrawerProps> = ({
  visible,
  onClose,
  comments = [],
}) => {
  if (!visible) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full bg-black text-white z-50 transition-transform duration-300 ease-in-out transform translate-x-0"
      style={{
        width: '400px',
        maxWidth: '100vw',
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <CommentSection visible={visible} onClose={onClose} comments={comments} />
    </div>
  );
};

export default CommentDrawer;
