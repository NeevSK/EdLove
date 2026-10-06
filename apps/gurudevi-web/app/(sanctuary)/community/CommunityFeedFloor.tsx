'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useCommunityCanvas } from '../../../lib/canvas/useCommunityCanvas';
import {
  COMMUNITY_GROUP_PAGE_SIZE,
  type CommunityGroup,
  type CommunityGroupsResult,
  parseCommunityGroupsResult,
} from '../../../lib/community/groups-contract';
import styles from './community.module.css';

type CommunityFloorMode = 'account' | 'explore';

export function CommunityFeedFloor({
  mode = 'account',
  result: initialResult,
  accountId,
}: Readonly<{
  mode?: CommunityFloorMode;
  result: CommunityGroupsResult;
  accountId?: string;
}>) {
  const canvas = useCommunityCanvas({
    accountId: accountId ?? 'explore',
    enableRemoteSync: mode === 'account' && Boolean(accountId),
  });
  const router = useRouter();
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

  useEffect(() => {
    setResult(initialResult);
    setResolvedQuery('');
  }, [initialResult]);

  useEffect(() => {
    if (mode !== 'account') return;
    const search = query.trim();
    if (!search) {
      setResult(initialResult);
      setResolvedQuery('');
      setSearchError(null);
      setIsSearching(false);
      return;
    }

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
  }, [initialResult, mode, query, retrySearch]);

  const localGroups = useMemo(() => {
    if (mode !== 'explore' || initialResult.kind !== 'ready') return [];
    const search = query.trim().toLocaleLowerCase();
    if (!search) return initialResult.groups;
    return initialResult.groups.filter((group) =>
      `${group.name} ${group.description ?? ''}`.toLocaleLowerCase().includes(search),
    );
  }, [initialResult, mode, query]);

  const visibleResult = mode === 'explore' ? initialResult : result;
  const visibleGroups =
    mode === 'explore' ? localGroups : result.kind === 'ready' ? result.groups : [];
  const selectedGroup = useMemo(
    () => visibleGroups.find((g) => g.id === selectedGroupId) ?? null,
    [selectedGroupId, visibleGroups],
  );
  const searchIsPending =
    mode === 'account' && query.trim() !== resolvedQuery && query.trim() !== '';

  async function loadMore() {
    if (mode !== 'account' || result.kind !== 'ready' || !result.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await requestPage(
        resolvedQuery,
        result.groups.length,
        new AbortController().signal,
      );
      if (page.kind !== 'ready') throw new Error('Circle directory is unavailable. Try again.');
      const existingIds = new Set(result.groups.map((group) => group.id));
      const nextGroups = page.groups.filter((group) => !existingIds.has(group.id));
      setResult({
        kind: 'ready',
        groups: [...result.groups, ...nextGroups],
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
    startRefresh(() => router.refresh());
  }

  return (
    <article
      className={styles.floor}
      data-domain="community"
      data-mode={mode}
      aria-labelledby="community-title"
      data-appearance={canvas.appearance.preset}
      data-motion={canvas.appearance.motion}
    >
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>
          {mode === 'explore' ? 'Community · Sample space' : 'Community · Shared space'}
        </p>
        <h1 id="community-title">Your circles</h1>
        <p>
          {mode === 'explore'
            ? 'Explore sample circles on this device. Searching is local; no account, group membership, or cloud request is created.'
            : 'Browse circles available to your selected sanctuary scope. The server filters every result against that scope.'}
        </p>
      </header>
      {mode === 'explore' ? (
        <aside className={styles.exploreNotice} role="note">
          Sample data · local exploration only · nothing is sent to other people.
        </aside>
      ) : null}
      {visibleResult.kind === 'denied' ? (
        <section className={styles.state} role="status" aria-live="polite">
          <h2>This community space is not available in your current scope</h2>
          <p>Choose a scope with Community access, or return later when access is granted.</p>
        </section>
      ) : visibleResult.kind === 'unavailable' ? (
        <section className={styles.state} role="alert">
          <h2>Your circles could not load</h2>
          <p>Check your connection and try again. Nothing was changed.</p>
          <button className={styles.action} disabled={isRefreshing} onClick={retry} type="button">
            {isRefreshing ? 'Refreshing…' : 'Try again'}
          </button>
        </section>
      ) : (
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
                    onClick={() => setSelectedGroupId(null)}
                    type="button"
                  >
                    All Circles
                  </button>
                </div>

                <section aria-labelledby="rail-circles-heading" className={styles.catalogRailSection}>
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
                              onClick={() => setSelectedGroupId(group.id)}
                              type="button"
                            >
                              <span className={styles.catalogRailItemLabel}>{group.name}</span>
                            </button>
                            <button
                              aria-label={isPinned ? `Unpin ${group.name}` : `Pin ${group.name}`}
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
                    onClick={() => setSelectedGroupId(null)}
                    type="button"
                  >
                    ← Back to Circles
                  </button>
                </div>
                <article className={styles.focusedCircleBody}>
                  <div className={styles.focusedCircleHeader}>
                    <h2>{selectedGroup.name}</h2>
                    <p className={styles.focusedCircleMeta}>
                      {selectedGroup.memberCount} members · Shared circle
                    </p>
                    <p>{selectedGroup.description || 'A shared sanctuary space for conversation and mutual care.'}</p>
                  </div>
                  <div className={styles.focusedCircleFeedMock}>
                    <p>Welcome to <strong>{selectedGroup.name}</strong>. Here seekers and educators share reflections, notices, and collaborative questions.</p>
                  </div>
                </article>
              </div>
            </div>
          ) : (
            <div className={styles.groupList}>
              {visibleGroups.map((group) => (
                <CommunityGroupCard
                  key={group.id}
                  group={group}
                  onSelect={() => setSelectedGroupId(group.id)}
                />
              ))}
            </div>
          )}
          {mode === 'account' && result.kind === 'ready' && result.hasMore && !selectedGroup ? (
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
</article>
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
const response = await fetch(`/api/community/groups?${params}`, {
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
group: CommunityGroup;
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
