'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import type { CommunityGroup } from '../../../../lib/community/groups-contract';
import { type CommunityPost, getExploreSamplePosts } from '../../../../lib/community/posts-contract';
import styles from '../community.module.css';
import { CommentDrawer } from './CommentDrawer';
import { WebPostComposer } from './WebPostComposer';

interface CirclePostStreamProps {
  selectedGroup: CommunityGroup;
  initialPosts?: readonly CommunityPost[];
  authorRole?: string | null;
  mode?: 'account' | 'explore';
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export function CirclePostStream({
  selectedGroup,
  initialPosts,
  authorRole = 'Seeker',
  mode = 'account',
}: Readonly<CirclePostStreamProps>) {
  const defaultPosts = useMemo(() => {
    if (initialPosts && initialPosts.length > 0) return initialPosts;
    return getExploreSamplePosts(selectedGroup.id);
  }, [initialPosts, selectedGroup.id]);

  const [posts, setPosts] = useState<readonly CommunityPost[]>(defaultPosts);
  const [activeDiscussionPost, setActiveDiscussionPost] = useState<CommunityPost | null>(null);

  const handlePostCreated = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const willLike = !post.userHasLiked;
        return {
          ...post,
          userHasLiked: willLike,
          reactionCount: willLike ? post.reactionCount + 1 : Math.max(0, post.reactionCount - 1),
        };
      }),
    );
  };

  return (
    <div className={styles.postStreamContainer}>
      {/* Circle Meta Banner & Realtime Chat Deeplink */}
      <div className={styles.circleStreamBanner}>
        <div className={styles.circleStreamMeta}>
          <h2 className={styles.circleStreamTitle}>{selectedGroup.name}</h2>
          <p className={styles.circleStreamDescription}>
            {selectedGroup.description || 'A collaborative sanctuary circle for shared learning and mutual presence.'}
          </p>
          <div className={styles.circleStreamStats}>
            <span className={styles.statPill}>👥 {selectedGroup.memberCount} members · Shared circle</span>
            <span className={styles.statPill}>📜 {posts.length} reflections</span>
          </div>
        </div>

        <div className={styles.circleStreamActions}>
          <Link
            href={`/community/chat/${selectedGroup.id}`}
            className={styles.openChatButton}
          >
            💬 Open Circle Chat ↗
          </Link>
        </div>
      </div>

      {/* Composer */}
      <WebPostComposer
        groupId={selectedGroup.id}
        groupName={selectedGroup.name}
        authorRole={authorRole}
        onPostCreated={handlePostCreated}
      />

      {/* Feed List */}
      <div className={styles.postList}>
        {posts.length === 0 ? (
          <div className={styles.emptyPostState}>
            <span className={styles.emptyIcon}>🪷</span>
            <h3>Silence in this circle</h3>
            <p>Be the first seeker to share an inquiry or reflection in {selectedGroup.name}.</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <header className={styles.postCardHeader}>
                <div className={styles.postAuthorGroup}>
                  <div className={styles.authorAvatar}>
                    {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <div className={styles.authorNameRow}>
                      <span className={styles.authorName}>{post.authorName || 'Anonymous Seeker'}</span>
                      {post.authorRole && (
                        <span className={styles.authorRolePill}>{post.authorRole}</span>
                      )}
                    </div>
                    <time className={styles.postTimestamp} dateTime={post.createdAt}>
                      {formatTimeAgo(post.createdAt)}
                    </time>
                  </div>
                </div>

                {post.postType && (
                  <span className={styles.postTypeBadge}>{post.postType}</span>
                )}
              </header>

              <div className={styles.postContent}>
                <p>{post.content}</p>
              </div>

              <footer className={styles.postCardFooter}>
                <button
                  type="button"
                  className={`${styles.reactionButton} ${post.userHasLiked ? styles.reactionButtonActive : ''}`}
                  onClick={() => handleToggleLike(post.id)}
                  aria-label={post.userHasLiked ? 'Unlike reflection' : 'Heart reflection'}
                >
                  <span>{post.userHasLiked ? '❤️' : '🤍'}</span>
                  <span className={styles.reactionCount}>{post.reactionCount}</span>
                </button>

                <button
                  type="button"
                  className={styles.commentMetaCount}
                  onClick={() => setActiveDiscussionPost(post)}
                  aria-label={`Open discussion thread with ${post.commentCount} replies`}
                >
                  <span>💬</span>
                  <span>{post.commentCount} replies</span>
                </button>
              </footer>
            </article>
          ))
        )}
      </div>

      {/* Thread Discussion Drawer */}
      {activeDiscussionPost && (
        <CommentDrawer
          post={activeDiscussionPost}
          authorRole={authorRole}
          onClose={() => setActiveDiscussionPost(null)}
          onCommentAdded={() => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === activeDiscussionPost.id
                  ? { ...p, commentCount: p.commentCount + 1 }
                  : p,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
