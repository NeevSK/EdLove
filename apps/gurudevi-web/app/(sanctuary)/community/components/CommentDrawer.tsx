'use client';

import React, { useEffect, useState } from 'react';
import type { CommunityComment } from '../../../../lib/community/comments-contract';
import { createCommunityComment, loadCommunityComments } from '../../../../lib/community/comments';
import type { CommunityPost } from '../../../../lib/community/posts-contract';
import styles from '../community.module.css';

interface CommentDrawerProps {
  post: CommunityPost;
  onClose: () => void;
  onCommentAdded?: () => void;
  authorRole?: string | null;
}

export function CommentDrawer({
  post,
  onClose,
  onCommentAdded,
  authorRole = 'Seeker',
}: Readonly<CommentDrawerProps>) {
  const [comments, setComments] = useState<readonly CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchComments() {
      setIsLoading(true);
      try {
        const res = await loadCommunityComments('guest', post.id);
        if (isMounted && res.kind === 'ready') {
          setComments(res.comments);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const created = await createCommunityComment('guest', {
        postId: post.id,
        content: draft.trim(),
        authorName: 'You',
      });

      if (created) {
        setComments((prev) => [...prev, created]);
        setDraft('');
        onCommentAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUpvote = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const willUpvote = !c.userHasUpvoted;
        return {
          ...c,
          userHasUpvoted: willUpvote,
          upvoteCount: willUpvote ? c.upvoteCount + 1 : Math.max(0, c.upvoteCount - 1),
        };
      }),
    );
  };

  return (
    <div className={styles.drawerBackdrop} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <div className={styles.drawerContainer}>
        <header className={styles.drawerHeader}>
          <div>
            <h3 id="drawer-title" className={styles.drawerTitle}>
              Thread Discussion
            </h3>
            <p className={styles.drawerSubtitle}>
              In reply to {post.authorName || 'Seeker'}’s reflection
            </p>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            onClick={onClose}
            aria-label="Close discussion thread"
          >
            ✕
          </button>
        </header>

        {/* Original Post Context */}
        <div className={styles.drawerContextPost}>
          <div className={styles.authorNameRow}>
            <strong>{post.authorName || 'Seeker'}</strong>
            {post.authorRole && <span className={styles.authorRolePill}>{post.authorRole}</span>}
          </div>
          <p className={styles.drawerContextText}>{post.content}</p>
        </div>

        {/* Comments Stream */}
        <div className={styles.drawerCommentsList}>
          {isLoading ? (
            <div className={styles.emptyPostState}>
              <p>Gathering reflections…</p>
            </div>
          ) : comments.length === 0 ? (
            <div className={styles.emptyPostState}>
              <span className={styles.emptyIcon}>💭</span>
              <p>No replies in this thread yet. Open the dialogue!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentItemHeader}>
                  <div className={styles.authorNameRow}>
                    <span className={styles.authorAvatar} style={{ width: '1.8rem', height: '1.8rem', fontSize: '0.75rem' }}>
                      {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'S'}
                    </span>
                    <strong className={styles.authorName} style={{ fontSize: '0.85rem' }}>
                      {comment.authorName || 'Seeker'}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className={`${styles.reactionButton} ${comment.userHasUpvoted ? styles.reactionButtonActive : ''}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleToggleUpvote(comment.id)}
                  >
                    <span>▲</span>
                    <span>{comment.upvoteCount}</span>
                  </button>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Composer */}
        <form onSubmit={handleSubmit} className={styles.drawerReplyForm}>
          <input
            type="text"
            className={styles.drawerReplyInput}
            placeholder={`Reply thoughtfully as ${authorRole}…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <button
            type="submit"
            className={styles.composerSubmitButton}
            disabled={!draft.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting…' : 'Reply'}
          </button>
        </form>
      </div>
    </div>
  );
}
