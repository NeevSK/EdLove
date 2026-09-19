'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  COMMUNITY_GROUP_PAGE_SIZE,
  parseCommunityGroupsResult,
  type CommunityGroup,
  type CommunityGroupsResult,
} from '../../../lib/community/groups-contract';
import styles from './community.module.css';

type CommunityFloorMode = 'account' | 'explore';

export function CommunityFeedFloor({
  mode = 'account',
  result: initialResult,
}: Readonly<{ mode?: CommunityFloorMode; result: CommunityGroupsResult }>) {
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
  const visibleGroups = mode === 'explore' ? localGroups : (result.kind === 'ready' ? result.groups : []);
  const searchIsPending = mode === 'account' && query.trim() !== resolvedQuery && query.trim() !== '';

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
          {mode === 'account' && (isSearching || searchIsPending || searchError) ? null : visibleGroups.length > 0 ? (
            <>
              <p className={styles.inlineStatus} role="status" aria-live="polite">
                {visibleGroups.length} {visibleGroups.length === 1 ? 'circle' : 'circles'} shown
              </p>
              <div className={styles.groupList}>
                {visibleGroups.map((group) => (
                  <CommunityGroupCard key={group.id} group={group} />
                ))}
              </div>
              {mode === 'account' && result.kind === 'ready' && result.hasMore ? (
                <div>
                  {loadMoreError ? <p role="alert">{loadMoreError}</p> : null}
                  <button
                    className={styles.action}
                    disabled={isLoadingMore}
                    onClick={() => void loadMore()}
                    type="button"
                  >
                    {isLoadingMore ? 'Loading more circles…' : loadMoreError ? 'Retry loading more' : 'Show more circles'}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <section className={styles.state} aria-live="polite">
              <h2>{query.trim() ? 'No circles match that search' : 'No circles are available yet'}</h2>
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
  const params = new URLSearchParams({ limit: String(COMMUNITY_GROUP_PAGE_SIZE), offset: String(offset) });
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

function CommunityGroupCard({ group }: Readonly<{ group: CommunityGroup }>) {
  return (
    <article className={styles.group}>
      <div className={styles.groupMark} aria-hidden="true">
        {group.name.trim().charAt(0).toLocaleUpperCase() || '○'}
      </div>
      <div className={styles.groupCopy}>
        <h2>{group.name}</h2>
        <p>{group.description || 'A shared space for conversation and practice.'}</p>
      </div>
      <footer className={styles.meta}>
        <span>{group.memberCount} members</span>
      </footer>
    </article>
  );
}
