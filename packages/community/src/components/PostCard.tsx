import { usePollLogic, usePostLogic, useSocialShieldHooks } from '@repo/core/api/hooks';
import { usePermissions } from '@repo/core/logic';
import type { CommunityPost } from '@repo/core/types';
import { PostCard as UIPostCard } from '@repo/ui/components/PostCard';
import { useLotusToast } from '@repo/ui/hooks';
import { hapticError, hapticSuccess } from '@repo/ui/primitives';
import { confirmAction, shareAction } from '@repo/ui/utils';

import React from 'react';
import { communityAPI } from '@community/api/community';

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
  const { post, currentUserId, onLike, onResonate, onReport, onAuthorPress } = props;
  const { can, flags } = usePermissions();
  const { blockMutation } = useSocialShieldHooks();
  const { showToast } = useLotusToast();

  const { state, handleLike, handleResonate, toggleMenu, closeMenu } = usePostLogic(
    post,
    currentUserId,
  );
  const {
    counts,
    userVotes,
    totalVotes,
    isLoading: pollLoading,
    isVoting,
    handleVote,
    refreshVotes,
  } = usePollLogic(post.id, currentUserId);

  // Map CommunityPost to Upstream PostContent interface
  const postContent = {
    id: post.id,
    author: {
      id: post.author_id,
      name: post.author_name ?? 'Unknown User',
      avatar: post.author_avatar,
    },
    content: post.content,
    type: post.post_type,
    createdAt: post.created_at,
    mediaUrl: post.media_url,
    mediaType: post.media_type,
    isAnonymous: post.is_anonymous,
    pollData: post.poll_data,
    urgency: post.urgency,
    hasAcceptedAnswer: post.has_accepted_answer,
    feedbackStatus: post.feedback_status,
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
      try {
        await blockMutation.mutateAsync(post.author_id);
        hapticSuccess();
        showToast({
          message: 'User has been blocked.',
          type: 'success',
        });
      } catch (_err) {
        hapticError();
        showToast({ message: 'Failed to block user.', type: 'error' });
      }
      closeMenu();
    }
  }, [post.is_anonymous, post.author_id, blockMutation, showToast, closeMenu]);

  const handleDelete = React.useCallback(async () => {
    closeMenu();
    const confirmed = await confirmAction(
      'Delete Post',
      'Are you sure you want to delete this post?',
    );

    if (!confirmed) return;
    try {
      await communityAPI.deletePost(post.id);
    } catch (err) {
      console.error('[PostContainer] delete failed:', err);
    }
  }, [post.id, closeMenu]);

  const onLikeHandler = React.useCallback(() => handleLike(onLike), [handleLike, onLike]);
  const onResonateHandler = React.useCallback(() => {
    handleResonate();
    onResonate?.();
  }, [handleResonate, onResonate]);
  const onReportHandler = React.useCallback(() => {
    onReport?.();
    closeMenu();
  }, [onReport, closeMenu]);
  const onCommentHandler = props.onComment || EMPTY_HANDLER;

  return (
    <UIPostCard
      post={postContent}
      currentUserId={currentUserId}
      isLiked={state.isLiked ?? false}
      likeCount={state.likeCount ?? 0}
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
      pollProps={{
        counts,
        userVotes: new Set(userVotes),
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
