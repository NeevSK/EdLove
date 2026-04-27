import React from 'react';
import { usePermissions } from '@repo/core/logic';
import { ConversationSheet, hapticSuccess, hapticError, confirmAction } from '@repo/ui';
import { useComments } from '../hooks/useComments';
import { Alert } from 'react-native';

interface CommentSheetProps {
  postId: string | null;
  postAuthorId?: string;
  currentUserId?: string;
  postType?: string;
  onClose: () => void;
}

export function CommentSheet({
  postId,
  postAuthorId,
  currentUserId,
  postType,
  onClose,
}: CommentSheetProps) {
  const { can, flags } = usePermissions();
  const {
    comments,
    isLoading,
    createComment,
    isCreatingComment,
    deleteComment,
    toggleUpvote,
    markOfficialAnswer,
  } = useComments(postId);

  const isPostAuthor = !!currentUserId && currentUserId === postAuthorId;

  // Map Community Comment to UI CommentItem
  const uiComments = comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.created_at,
    isAnonymous: c.is_anonymous,
    isOfficial: c.is_official_answer,
    upvotes: c.upvotes,
    hasUpvoted: c.has_upvoted,
    author: {
      id: c.author_id,
      name: c.author_name,
      avatar: c.author_avatar,
    },
  }));

  const handleDelete = React.useCallback(async (id: string) => {
    const confirmed = await confirmAction(
      'Delete comment',
      'Are you sure you want to delete this comment?'
    );
    
    if (confirmed) {
      try {
        await deleteComment(id);
        hapticSuccess();
      } catch {
        hapticError();
      }
    }
  }, [deleteComment]);

  const handlePost = React.useCallback(async (content: string, isAnonymous: boolean) => {
    try {
      await createComment({ content, isAnonymous });
      hapticSuccess();
    } catch {
      hapticError();
    }
  }, [createComment]);

  const handleMarkOfficial = React.useCallback((id: string, flag: boolean) => {
    markOfficialAnswer({ commentId: id, isOfficial: flag });
  }, [markOfficialAnswer]);

  return (
    <ConversationSheet
      isOpen={!!postId}
      onClose={onClose}
      title="Reflection"
      currentUserId={currentUserId}
      comments={uiComments}
      isLoading={isLoading}
      isPosting={isCreatingComment}
      
      // Feature Flags
      showOfficialBadge={true}
      canMarkOfficial={isPostAuthor && postType === 'question'}
      canDeleteAll={can('delete', 'Comment')}
      allowAnonymous={flags.isCommunityEnabled} // Based on community-wide setting
      
      // Handlers
      onPost={handlePost}
      onDelete={handleDelete}
      onUpvote={toggleUpvote}
      onMarkOfficial={handleMarkOfficial}
      
      // Localization
      emptyTitle="The Heart is Quiet"
      emptySubtitle="Be the first to seed a reflection into this conversation circle."
      placeholder="Add a reflection..."
      anonPlaceholder="Reflect anonymously..."
    />
  );
}

export default CommentSheet;
