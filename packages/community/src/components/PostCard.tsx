import React from 'react';
import { usePermissions } from '@repo/core/logic';
import { 
  PostCard as UIPostCard, 
  hapticSuccess, 
  hapticError, 
  useLotusToast,
  openExternalURL,
  confirmAction,
  shareAction
} from '@repo/ui';
import { useSocialShield } from '../hooks/useSocialShield';
import { usePostLogic } from '../hooks/usePostLogic';
import { usePollLogic } from '../hooks/usePollLogic';
import { communityAPI } from '../api/community';
import type { CommunityPost } from '../types';

const EMPTY_HANDLER = () => {};

interface PostCardProps {
  post: CommunityPost;
  onPress?: () => void;
  onLike?: () => void;
  onResonate?: () => void;
  onComment?: () => void;
  onReport?: () => void;
  onAuthorPress?: () => void;
  onShare?: () => void;
  currentUserId?: string;
  isSocialShieldEnabled?: boolean;
}

export const PostCard = React.memo(function PostCard(props: PostCardProps) {
  const { post, currentUserId, onLike, onResonate, onReport, onShare, onAuthorPress } = props;
  const { can, flags } = usePermissions();
  const { blockUser } = useSocialShield();
  const { showToast } = useLotusToast();

  const { state, handleLike, handleResonate, toggleMenu, closeMenu } = usePostLogic(post, currentUserId);
  const { 
    counts, 
    userVotes, 
    totalVotes, 
    isLoading: pollLoading, 
    isVoting, 
    handleVote, 
    refreshVotes 
  } = usePollLogic(post.id, currentUserId, post.poll_data?.allow_multiple);

  // Map CommunityPost to Upstream PostContent interface
  const postContent = {
    id: post.id,
    author: {
      id: post.author_id,
      name: post.author_name,
      avatar: post.author_avatar,
    },
    content: post.content,
    type: post.post_type,
    createdAt: post.created_at,
    mediaUrl: post.media_url,
    mediaType: post.media_type as any,
    isAnonymous: post.is_anonymous,
    pollData: post.poll_data as any,
    urgency: post.urgency as any,
    hasAcceptedAnswer: post.has_accepted_answer,
    feedbackStatus: post.feedback_status as any,
    feedbackResponse: post.feedback_response,
    commentCount: post.comment_count,
  };

  const handleNativeShare = React.useCallback(async () => {
    const shareUrl = `https://app.gurudevi.edlove.org/app?post=${post.id}`;
    await shareAction({
      title: `Post by ${post.is_anonymous ? 'Anonymous' : post.author_name}`,
      url: shareUrl,
    });
  }, [post.id, post.is_anonymous, post.author_name]);

  const handleBlock = React.useCallback(async () => {
    if (!post.is_anonymous && post.author_id) {
      const result = await blockUser(post.author_id);
      if (result && result.success) {
        hapticSuccess();
        showToast({
          message: 'User has been blocked.',
          type: 'success',
        });
      } else {
        hapticError();
        showToast({ message: 'Failed to block user.', type: 'error' });
      }
      closeMenu();
    }
  }, [post.is_anonymous, post.author_id, blockUser, showToast, closeMenu]);

  const handleDelete = React.useCallback(async () => {
    closeMenu();
    const confirmed = await confirmAction('Delete Post', 'Are you sure you want to delete this post?');
    
    if (!confirmed) return;
    try {
      await communityAPI.deletePost(post.id);
    } catch (err) {
      console.error('[PostContainer] delete failed:', err);
    }
  }, [post.id, closeMenu]);

  const onLikeHandler = React.useCallback(() => handleLike(onLike), [handleLike, onLike]);
  const onResonateHandler = React.useCallback(() => handleResonate(onResonate), [handleResonate, onResonate]);
  const onReportHandler = React.useCallback(() => { onReport?.(); closeMenu(); }, [onReport, closeMenu]);
  const onCommentHandler = props.onComment || EMPTY_HANDLER;

  return (
    <UIPostCard
      post={postContent}
      currentUserId={currentUserId}
      isLiked={state.isLiked}
      likeCount={state.likeCount}
      hasResonated={state.hasResonated}
      isResonating={state.isResonating}
      isMenuOpen={state.isMenuOpen}
      canDelete={can('delete', 'Post')}
      isSocialShieldEnabled={flags.isSocialShieldEnabled}
      onPress={props.onPress}
      onLike={onLikeHandler}
      onResonate={onResonateHandler}
      onComment={onCommentHandler}
      onReport={onReportHandler}
      onAuthorPress={onAuthorPress}
      onShare={handleNativeShare}
      onDelete={handleDelete}
      onBlock={handleBlock}
      toggleMenu={toggleMenu}
      closeMenu={closeMenu}
      pollProps={{
        counts,
        userVotes,
        totalVotes,
        isLoading: pollLoading,
        isVoting,
        onVote: handleVote,
        onRefresh: refreshVotes,
      }}
    />
  );
});

export default PostCard;
