import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useCommunityCanvas } from '../../../lib/canvas/useCommunityCanvas';
import { parseCommunityGroupsResult } from '../../../lib/community/groups-contract';
import { COMMUNITY_GROUP_PAGE_SIZE, type CommunityGroupView, type CommunityGroupsResult } from '@repo/core/types/communityView';
import { getExploreSampleAnnouncements } from '../../../lib/community/announcements-contract';
import {
  getExploreCapacityMeta,
  isExploreCapacity,
  useExploreCapacity,
} from '../../../lib/explore/exploreCapacity';
import { useDomainWorkbench } from '../../../lib/workbench';
import { useQuickAccessPreferences } from '../../../lib/workbench/quickAccessPreferences';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import { timeGreeting } from '../../../lib/timeGreeting';
import { TaskStrip } from '../components/TaskStrip';
import styles from './community.module.css';
import { CirclePostStream } from './components/CirclePostStream';
import { CommunityDirectMessagesStage } from './components/CommunityDirectMessagesStage';

const COMMUNITY_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'search', label: 'Circle Search & Discovery', icon: '🔍' },
  { id: 'circles', label: 'Community Circles & Feed', icon: '👥' },
];

export type CommunityFloorMode = 'account' | 'explore';
export type CommunityPillar = 'feed' | 'groups' | 'messages';

export function CommunityFeedFloor({
  mode = 'account',
  result: initialResult,
  accountId,
  primaryCapacity,
  inviteCode,
  initialPillar,
  initialConversationId,
  initialIncognito,
}: Readonly<{
  mode?: CommunityFloorMode;
  result: CommunityGroupsResult;
  accountId?: string;
  primaryCapacity?: string | null;
  inviteCode?: string;
  initialPillar?: CommunityPillar;
  initialConversationId?: string;
  initialIncognito?: boolean;
}>) {
  const [activePillar, setActivePillar] = useState<CommunityPillar>(initialPillar ?? 'feed');
  const exploreCapacity = useExploreCapacity();
  const roleLabel =
    primaryCapacity && isExploreCapacity(primaryCapacity)
      ? getExploreCapacityMeta(primaryCapacity).label
      : mode === 'explore'
        ? getExploreCapacityMeta(exploreCapacity).label
        : null;
  const canvas = useCommunityCanvas({
    accountId: accountId ?? 'explore',
    enableRemoteSync: mode === 'account' && Boolean(accountId),
  });
  const router = useRouter();
  const workbench = useDomainWorkbench('community', { usageScope: mode });
  const quickAccess = useQuickAccessPreferences(
    'community',
    mode,
    ['circles', 'announcements', 'forest'],
    ['circles'],
  );
  const [isRefreshing, startRefresh] = useTransition();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(initialResult);
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [retrySearch, setRetrySearch] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const announcements = useMemo(() => getExploreSampleAnnouncements(), []);

  const isSearchActive = mode === 'account' && Boolean(query.trim());
  const effectiveResult = isSearchActive ? result : initialResult;

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActivePillar('groups');
    const grp = visibleGroups.find((g) => g.id === groupId);
    workbench.open({
      featureId: 'circle-detail',
      route: `/community?group=${encodeURIComponent(groupId)}`,
      title: grp ? grp.name : 'Circle Detail',
      icon: '👥',
      temporalBinding: { kind: 'follow-domain' },
      localStatePolicy: 'restore-permitted',
    });
  };

  const handleClearSelectedGroup = () => {
    setSelectedGroupId(null);
    const detailTask = workbench.state.tasks.find((t) => t.featureId === 'circle-detail');
    if (detailTask) workbench.close(detailTask.taskKey);
  };

  useEffect(() => {
    if (!isSearchActive) return;
    const search = query.trim();

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const page = await requestPage(search, 0, controller.signal);
        setResult(page);
        setResolvedQuery(search);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchError(
          error instanceof Error ? error.message : 'Circle search is unavailable. Try again.',
        );
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isSearchActive, query, retrySearch]);

  const localGroups = useMemo(() => {
    if (mode !== 'explore' || initialResult.kind !== 'ready') return [];
    const search = query.trim().toLocaleLowerCase();
    if (!search) return initialResult.groups;
    return initialResult.groups.filter((group) =>
      `${group.name} ${group.description ?? ''}`.toLocaleLowerCase().includes(search),
    );
  }, [initialResult, mode, query]);

  const visibleResult = mode === 'explore' ? initialResult : effectiveResult;
  const visibleGroups =
    mode === 'explore'
      ? localGroups
      : effectiveResult.kind === 'ready'
        ? effectiveResult.groups
        : [];
  const selectedGroup = visibleGroups.find((g) => g.id === selectedGroupId) ?? null;
  const searchIsPending =
    mode === 'account' && query.trim() !== resolvedQuery && query.trim() !== '';

  async function loadMore() {
    if (
      mode !== 'account' ||
      effectiveResult.kind !== 'ready' ||
      !effectiveResult.hasMore ||
      isLoadingMore
    )
      return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await requestPage(
        resolvedQuery,
        effectiveResult.groups.length,
        new AbortController().signal,
      );
      if (page.kind !== 'ready') throw new Error('Circle directory is unavailable. Try again.');
      const existingIds = new Set(effectiveResult.groups.map((group) => group.id));
      const nextGroups = page.groups.filter((group) => !existingIds.has(group.id));
      setResult({
        kind: 'ready',
        groups: [...effectiveResult.groups, ...nextGroups],
        hasMore: page.hasMore,
      });
    } catch (error) {
      setLoadMoreError(
        error instanceof Error ? error.message : 'More circles could not load. Try again.',
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  function retry() {
    startRefresh(() => void router.invalidate());
  }

  const breadcrumbText =
    activePillar === 'feed'
      ? 'Community · Feed'
      : activePillar === 'groups'
        ? selectedGroup
          ? `Community · ${selectedGroup.name}`
          : 'Community · Groups'
        : 'Community · Messages';

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      className={styles.floor}
      dataMode={mode}
      domain="community"
      furnitureItems={COMMUNITY_FURNITURE_ITEMS}
      groupOrder={
        canvas.groupOrder.length > 0
          ? (canvas.groupOrder as string[])
          : ['search', 'circles']
      }
      onReorderFurniture={(order) => canvas.setGroupOrder(order as any)}
      onTogglePinFurniture={(id) => canvas.togglePin(id as any)}
      pinnedIds={canvas.pinnedSurfaces as string[]}
      setAppearance={canvas.setAppearance}
      titleId="community-title"
      greeting={timeGreeting(roleLabel ? roleLabel : 'Explorer')}
      breadcrumb={breadcrumbText}
    >
      <TaskStrip
        shellSlot
        tasks={workbench.state.tasks}
        focusedTaskKey={selectedGroupId ? 'circle-detail' : workbench.state.focusedTaskKey}
        overviewActive={!selectedGroupId && !workbench.state.focusedTaskKey}
        onFocusTask={(task) => {
          workbench.focus(task.taskKey);
          if (task.featureId === 'circle-detail') {
            const groupId = new URL(task.route, 'https://local').searchParams.get('group');
            if (groupId) {
              setSelectedGroupId(groupId);
              setActivePillar('groups');
            }
          }
        }}
        onCloseTask={(task) => {
          workbench.close(task.taskKey);
          if (task.featureId === 'circle-detail') {
            setSelectedGroupId(null);
          }
        }}
        onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
        onOpenOverview={handleClearSelectedGroup}
        quickAccessItems={[
          { id: 'circles', label: 'Circles', emoji: '👥' },
          { id: 'announcements', label: 'Broadcaster Updates', emoji: '📢' },
          { id: 'forest', label: 'Community Forest', emoji: '🌳' },
        ]}
        quickAccessPinnedIds={quickAccess.pinnedIds}
        quickAccessUsage={quickAccess.usage}
        quickAccessPinLimit={quickAccess.pinLimit}
        onOpenQuickAccessItem={(item) => {
          quickAccess.trackUse(item.id);
          if (item.id === 'announcements') {
            void router.navigate({ href: '/community/announcements' });
          } else if (item.id === 'circles') {
            setActivePillar('groups');
            handleClearSelectedGroup();
          } else if (item.id === 'forest') {
            void router.navigate({ href: '/community/forest' });
          }
        }}
        onToggleQuickAccessPin={quickAccess.togglePin}
      />

      {/* 3-PILLAR TRIAD SEGMENTED SWITCHER (Conforms to UI Kit Rule 9 Vector Glyphs) */}
      <div className={styles.pillarNavHorizon} role="tablist" aria-label="Community Sections">
        <div className={styles.pillarSegmentedPill}>
          <button
            type="button"
            role="tab"
            aria-selected={activePillar === 'feed'}
            onClick={() => {
              setActivePillar('feed');
              handleClearSelectedGroup();
            }}
            className={activePillar === 'feed' ? styles.pillActive : styles.pill}
          >
            <span aria-hidden="true">💬</span>
            <span>Feed</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePillar === 'groups'}
            onClick={() => setActivePillar('groups')}
            className={activePillar === 'groups' ? styles.pillActive : styles.pill}
          >
            <span aria-hidden="true">👥</span>
            <span>Groups</span>
            {visibleGroups.length > 0 && (
              <span className={styles.pillBadge}>{visibleGroups.length}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activePillar === 'messages'}
            onClick={() => {
              setActivePillar('messages');
              handleClearSelectedGroup();
            }}
            className={activePillar === 'messages' ? styles.pillActive : styles.pill}
          >
            <span aria-hidden="true">✉️</span>
            <span>Messages</span>
          </button>
        </div>
      </div>

      {inviteCode ? (
        <aside
          role="region"
          aria-label="Classroom Invitation"
          style={{
            margin: '0.75rem 0',
            padding: '1rem 1.25rem',
            background: 'var(--w-surface, var(--paper-light))',
            border: '1.5px solid var(--w-lamp, var(--accent))',
            borderRadius: 'var(--w-radius-md, 1rem)',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--w-lamp, var(--accent)) 10%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--w-lamp, var(--accent))',
                fontWeight: 700,
              }}
            >
              Classroom Invitation Pass
            </span>
            <p style={{ margin: '0.25rem 0 0', fontWeight: 600, color: 'var(--w-ink, var(--ink))' }}>
              Invitation Code:{' '}
              <code
                style={{
                  padding: '0.15rem 0.4rem',
                  background: 'color-mix(in srgb, var(--w-lamp, var(--accent)) 12%, transparent)',
                  borderRadius: 'var(--w-radius-sm, 0.25rem)',
                }}
              >
                {inviteCode}
              </code>
            </p>
          </div>
          <Link
            to="/c/$code"
            params={{ code: inviteCode }}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--w-radius-full, 9999px)',
              background: 'var(--w-action, var(--lotus))',
              color: 'var(--w-on-action, var(--w-ground))',
              fontWeight: 600,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: '0 2px 6px color-mix(in srgb, var(--w-action, var(--lotus)) 25%, transparent)',
            }}
          >
            Claim Desk Pass →
          </Link>
        </aside>
      ) : null}

      {mode === 'explore' ? (
        <aside className={styles.exploreNotice} role="note">
          Sample data · local exploration only · nothing is sent to other people.
        </aside>
      ) : null}

      {/* ERROR STATES */}
      {visibleResult.kind === 'denied' ? (
        <section className={styles.state} role="status" aria-live="polite">
          <h2>This community space is not available in your current scope</h2>
          <p>Choose a scope with Community access, or return later when access is granted.</p>
        </section>
      ) : visibleResult.kind === 'unavailable' ? (
        <section className={styles.state} role="alert">
          <h2>Your community space could not load</h2>
          <p>Check your connection and try again. Nothing was changed.</p>
          <button className={styles.action} disabled={isRefreshing} onClick={retry} type="button">
            {isRefreshing ? 'Refreshing…' : 'Try again'}
          </button>
        </section>
      ) : (
        /* PILLAR CONTENT SECTIONS */
        <>
          {/* 1. FEED PILLAR */}
          {activePillar === 'feed' && (
            <CirclePostStream
              selectedGroup={null}
              authorRole={roleLabel}
              mode={mode}
              onExploreGroups={() => setActivePillar('groups')}
            />
          )}

          {/* 2. GROUPS PILLAR */}
          {activePillar === 'groups' && (
            <section className={styles.directory} aria-label="Community circles">
              <label className={styles.searchLabel} htmlFor="community-circle-search">
                Find a circle
              </label>
              <input
                autoComplete="off"
                className={styles.search}
                id="community-circle-search"
                maxLength={120}
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  setLoadMoreError(null);
                }}
                placeholder="Search by name or description"
                type="search"
                value={query}
              />

              {mode === 'account' && (isSearching || searchIsPending) ? (
                <p className={styles.inlineStatus} role="status" aria-live="polite">
                  Searching circles…
                </p>
              ) : null}

              {searchError ? (
                <section className={styles.state} role="alert">
                  <h2>Circle search could not finish</h2>
                  <p>{searchError}</p>
                  <button
                    className={styles.action}
                    onClick={() => setRetrySearch((attempt) => attempt + 1)}
                    type="button"
                  >
                    Try search again
                  </button>
                </section>
              ) : null}

              {mode === 'account' &&
              (isSearching || searchIsPending || searchError) ? null : visibleGroups.length > 0 ? (
                <>
                  <p className={styles.inlineStatus} role="status" aria-live="polite">
                    {visibleGroups.length} {visibleGroups.length === 1 ? 'circle' : 'circles'} shown
                  </p>
                  {selectedGroup ? (
                    <div className={styles.masterDetailLayout} data-layout-mode={canvas.layoutMode}>
                      <aside aria-label="Community Circles" className={styles.catalogRail}>
                        <div className={styles.catalogRailHeader}>
                          <h3 className={styles.catalogRailTitle}>Community Circles</h3>
                          <button
                            className={styles.returnOverviewButton}
                            onClick={handleClearSelectedGroup}
                            type="button"
                          >
                            All Circles
                          </button>
                        </div>

                        <section
                          aria-labelledby="rail-circles-heading"
                          className={styles.catalogRailSection}
                        >
                          <h4 id="rail-circles-heading" className={styles.catalogRailSectionTitle}>
                            Circles
                          </h4>
                          <ul className={styles.catalogRailList}>
                            {visibleGroups.map((group) => {
                              const isCurrent = group.id === selectedGroupId;
                              const isPinned = canvas.pinnedSurfaces.includes(group.id as any);
                              return (
                                <li key={group.id}>
                                  <div className={styles.catalogRailRow}>
                                    <button
                                      className={`${styles.catalogRailItem} ${isCurrent ? styles.catalogRailItemActive : ''}`}
                                      onClick={() => handleSelectGroup(group.id)}
                                      type="button"
                                    >
                                      <span className={styles.catalogRailItemLabel}>
                                        {group.name}
                                      </span>
                                    </button>
                                    <button
                                      aria-label={
                                        isPinned ? `Unpin ${group.name}` : `Pin ${group.name}`
                                      }
                                      className={`${styles.catalogRailPinButton} ${isPinned ? styles.catalogRailPinButtonPinned : ''}`}
                                      onClick={() => canvas.togglePin(group.id as any)}
                                      type="button"
                                    >
                                      {isPinned ? '📌' : '📍'}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </section>
                      </aside>

                      <div className={styles.activeCircleStage}>
                        <div className={styles.backOverviewBar}>
                          <button
                            className={styles.streamBackButton}
                            onClick={handleClearSelectedGroup}
                            type="button"
                          >
                            ← Back to Circles
                          </button>
                        </div>

                        {/* INTEGRATED GROUP ANNOUNCEMENTS */}
                        {announcements.length > 0 && (
                          <div className={styles.groupAnnouncementsSection}>
                            <div className={styles.groupAnnouncementsHeader}>
                              <span aria-hidden="true">📢</span>
                              <h4>Announcements &amp; Bulletins</h4>
                            </div>
                            <div className={styles.groupAnnouncementList}>
                              {announcements.slice(0, 2).map((a) => (
                                <div key={a.id} className={styles.groupAnnouncementCard}>
                                  <p>{a.content}</p>
                                  <div className={styles.groupAnnouncementMeta}>
                                    <span>Issued by {a.authorName}</span>
                                    {a.isPinned && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        📌 Pinned
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <CirclePostStream
                          selectedGroup={selectedGroup}
                          authorRole={roleLabel}
                          mode={mode}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.groupList}>
                      {visibleGroups.map((group) => (
                        <CommunityGroupCard
                          key={group.id}
                          group={group}
                          onSelect={() => handleSelectGroup(group.id)}
                        />
                      ))}
                    </div>
                  )}

                  {mode === 'account' &&
                  result.kind === 'ready' &&
                  result.hasMore &&
                  !selectedGroup ? (
                    <div>
                      {loadMoreError ? <p role="alert">{loadMoreError}</p> : null}
                      <button
                        className={styles.action}
                        disabled={isLoadingMore}
                        onClick={() => void loadMore()}
                        type="button"
                      >
                        {isLoadingMore
                          ? 'Loading more circles…'
                          : loadMoreError
                            ? 'Retry loading more'
                            : 'Show more circles'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <section className={styles.state} aria-live="polite">
                  <h2>
                    {query.trim() ? 'No circles match that search' : 'No circles are available yet'}
                  </h2>
                  <p>
                    {query.trim()
                      ? 'Try another name or description.'
                      : 'When a circle is available to your selected scope, it will appear here.'}
                  </p>
                </section>
              )}
            </section>
          )}

          {/* 3. MESSAGES PILLAR */}
          {activePillar === 'messages' && (
            <CommunityDirectMessagesStage
              displayName={roleLabel ?? 'Seeker'}
              initialActiveId={initialConversationId}
              initialIncognito={initialIncognito}
            />
          )}
        </>
      )}
    </SanctuaryFloorCanvas>
  );
}

async function requestPage(
  search: string,
  offset: number,
  signal: AbortSignal,
): Promise<CommunityGroupsResult> {
  const params = new URLSearchParams({
    limit: String(COMMUNITY_GROUP_PAGE_SIZE),
    offset: String(offset),
  });
  if (search) params.set('search', search);

  const response = await fetch(`/api/community/groups?${params.toString()}`, {
    cache: 'no-store',
    signal,
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 403) return { kind: 'denied' };
    throw new Error('Circle directory is unavailable. Check your connection and try again.');
  }
  const result = parseCommunityGroupsResult(payload);
  if (!result) throw new Error('Circle directory returned an invalid response. Try again.');
  return result;
}

function CommunityGroupCard({
  group,
  onSelect,
}: Readonly<{
  group: CommunityGroupView;
  onSelect?: () => void;
}>) {
  return (
    <article className={styles.group}>
      <div className={styles.groupMark} aria-hidden="true">
        {group.name.trim().charAt(0).toLocaleUpperCase() || '○'}
      </div>
      <div className={styles.groupCopy}>
        <h2>{group.name}</h2>
        <p>{group.description || 'A shared space for conversation and practice.'}</p>
        {onSelect ? (
          <button className={styles.action} onClick={onSelect} type="button">
            Enter circle
          </button>
        ) : null}
      </div>
      <footer className={styles.meta}>
        <span>{group.memberCount} members</span>
      </footer>
    </article>
  );
}
