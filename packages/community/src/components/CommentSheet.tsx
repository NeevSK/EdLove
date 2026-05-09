import { useCommentHooks } from "@repo/core/api/hooks";
import { usePermissions } from "@repo/core/logic";
import { ConversationSheet } from "@repo/ui/components/ConversationSheet";
import { hapticError, hapticSuccess } from "@repo/ui/primitives";
import { confirmAction } from "@repo/ui/utils";
import React from "react";

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
	} = useCommentHooks(postId);

	const isPostAuthor = !!currentUserId && currentUserId === postAuthorId;

	// Map Community Comment to UI CommentItem
	const uiComments = comments.map((c) => ({
		id: c.id,
		content: c.content,
		createdAt:
			typeof c.created_at === "string"
				? c.created_at
				: c.created_at.toISOString(),
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

	const handleDelete = React.useCallback(
		async (id: string) => {
			const confirmed = await confirmAction(
				"Delete comment",
				"Are you sure you want to delete this comment?",
			);

			if (confirmed) {
				try {
					await deleteComment(id);
					hapticSuccess();
				} catch {
					hapticError();
				}
			}
		},
		[deleteComment],
	);

	const handlePost = React.useCallback(
		async (content: string, isAnonymous: boolean) => {
			try {
				await createComment({ content, isAnonymous });
				hapticSuccess();
			} catch {
				hapticError();
			}
		},
		[createComment],
	);

	const handleMarkOfficial = React.useCallback(
		(id: string, flag: boolean) => {
			markOfficialAnswer({ commentId: id, isOfficial: flag });
		},
		[markOfficialAnswer],
	);

	const handleUpvote = React.useCallback(
		(id: string) => {
			toggleUpvote(id);
		},
		[toggleUpvote],
	);

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
			canMarkOfficial={isPostAuthor && postType === "question"}
			canDeleteAll={can("delete", "Comment")}
			allowAnonymous={flags.isCommunityEnabled} // Based on community-wide setting
			// Handlers
			onPost={handlePost}
			onDelete={handleDelete}
			onUpvote={handleUpvote}
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
