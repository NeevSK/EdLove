'use client';

import React, { useEffect, useState } from 'react';
import type { CommunityPost } from '../../../../lib/community/posts-contract';
import styles from '../community.module.css';

interface WebPostComposerProps {
  groupId: string;
  groupName: string;
  authorRole?: string | null;
  onPostCreated: (post: CommunityPost) => void;
  disabled?: boolean;
}

export function WebPostComposer({
  groupId,
  groupName,
  authorRole = 'Seeker',
  onPostCreated,
  disabled = false,
}: Readonly<WebPostComposerProps>) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'reflection' | 'question'>('reflection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`gurudevi_draft_${groupId}`);
      if (saved) {
        setContent(saved);
        setIsExpanded(true);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [groupId]);

  // Persist draft to localStorage on change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setContent(next);
    try {
      if (next.trim()) {
        window.localStorage.setItem(`gurudevi_draft_${groupId}`, next);
      } else {
        window.localStorage.removeItem(`gurudevi_draft_${groupId}`);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        groupId,
        authorId: 'current-user',
        authorName: 'You',
        authorRole: authorRole || 'Seeker',
        content: content.trim(),
        postType,
        reactionCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        userHasLiked: false,
      };

      onPostCreated(newPost);
      setContent('');
      setIsExpanded(false);
      try {
        window.localStorage.removeItem(`gurudevi_draft_${groupId}`);
      } catch {
        // Ignore storage errors
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.composerCard}>
      <form onSubmit={handleSubmit} className={styles.composerForm}>
        <div className={styles.composerHeader}>
          <div className={styles.composerAuthorBadge}>
            <span className={styles.composerAvatar}>🪷</span>
            <span className={styles.composerRoleLabel}>{authorRole || 'Seeker'}</span>
          </div>
          <span className={styles.composerGroupTarget}>
            Posting into <strong>{groupName}</strong>
          </span>
        </div>

        <textarea
          aria-label={`Share a reflection with ${groupName}`}
          className={styles.composerTextarea}
          disabled={disabled || isSubmitting}
          maxLength={4000}
          onFocus={() => setIsExpanded(true)}
          onChange={handleChange}
          placeholder={`Share an inquiry, synthesis, or reflection in ${groupName}…`}
          rows={isExpanded ? 4 : 2}
          value={content}
        />

        {isExpanded && (
          <div className={styles.composerFooter}>
            <div className={styles.composerTypeSelector}>
              <button
                type="button"
                className={`${styles.typeChip} ${postType === 'reflection' ? styles.typeChipActive : ''}`}
                onClick={() => setPostType('reflection')}
              >
                Reflection
              </button>
              <button
                type="button"
                className={`${styles.typeChip} ${postType === 'discussion' ? styles.typeChipActive : ''}`}
                onClick={() => setPostType('discussion')}
              >
                Discussion
              </button>
              <button
                type="button"
                className={`${styles.typeChip} ${postType === 'question' ? styles.typeChipActive : ''}`}
                onClick={() => setPostType('question')}
              >
                Question
              </button>
            </div>

            <div className={styles.composerActions}>
              <span className={styles.charCount}>
                {4000 - content.length} chars left
              </span>
              <button
                type="button"
                className={styles.composerCancelButton}
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </button>
              <button
                type="submit"
                className={styles.composerSubmitButton}
                disabled={!content.trim() || isSubmitting || disabled}
              >
                {isSubmitting ? 'Sharing…' : 'Share Reflection'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
