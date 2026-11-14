import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import {
  Button,
  Card,
  Chip,
  Chips,
  Grid,
  Inline,
  Notice,
  SegmentedControl,
  Stack,
  SearchField,
} from '@repo/ui/components/web';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  BookOpen,
  Compass,
  ExternalLink,
  FileSpreadsheet,
  FolderHeart,
  Heart,
  Pin,
  PinOff,
  Share2,
  Sparkles,
  Video,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryCanvas } from '../../../lib/canvas/useLibraryCanvas';
import { createBrowserSupabaseClient } from '../../../lib/supabase/browser';
import { useDomainWorkbench } from '../../../lib/workbench';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import { timeGreeting } from '../../../lib/timeGreeting';
import { TaskStrip } from '../components/TaskStrip';
import styles from './library.module.css';

const LIBRARY_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'taskstrip', label: 'Reading Tasks Strip', icon: '🧭' },
  { id: 'shelf', label: 'Catalog Shelf & Search', icon: '📚' },
  { id: 'invitations', label: 'Curated Study Invitations', icon: '📜' },
];

import {
  type BrowserLibraryResource,
  classifyLibraryFailure,
  filterBrowserResources,
  getGuestBookmarks,
  type LibraryLoadState,
  parseBrowserLibraryResources,
  persistGuestBookmarks,
  safeResourceUrl,
} from './libraryState';

const CATALOG_TASK = {
  featureId: 'library.resource_catalog',
  route: '/library',
  title: 'Resource catalog',
  icon: '▤',
  temporalBinding: { kind: 'none' },
  localStatePolicy: 'none',
} as const;

export const EXPLORE_LIBRARY_RESOURCES: readonly BrowserLibraryResource[] = getSandboxSamples<
  any[]
>('library', 'getResources', [], []).map((r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  type: r.type,
  verified: Boolean(r.verified),
  subjects:
    Array.isArray(r.subjects) && r.subjects.length > 0
      ? r.subjects
      : r.subject
        ? [r.subject]
        : ['Sanctuary'],
  url: r.url ?? 'https://gurudevi.app',
  format: r.format ?? null,
  is_official: Boolean(r.is_official),
}));

export const EXPLORE_COLLECTIONS = getSandboxSamples<any[]>(
  'library',
  'getCollections',
  [],
  [],
).map((c) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  subjects: ['Curriculum', 'Pedagogy'],
  resource_ids: c.resource_ids,
  is_official: true,
}));

function collectionLabel(category: string): string {
  const map: Record<string, string> = {
    discovery: 'Discovery & Search',
    collections: 'Curated Collections',
    tools: 'Practice Tools',
    archives: 'Ancient Archives',
  };
  return map[category] ?? category;
}

export type LibraryFloorMode = 'account' | 'explore';

export function LibraryFloor({
  accountId,
  displayName,
  mode = 'account',
}: Readonly<{
  accountId: string;
  displayName: string;
  mode?: LibraryFloorMode;
}>) {
  const isGuestMode =
    mode === 'explore' || accountId === 'explore-guest' || accountId === 'guest';
  const canvas = useLibraryCanvas({
    accountId,
    enableRemoteSync: mode === 'account' && Boolean(accountId) && !isGuestMode,
  });
  const workbench = useDomainWorkbench('library');
  const searchSeqRef = useRef(0);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed'>(
    'recent',
  );
  const [cardLayout, setCardLayout] = useState<'grid' | 'list'>('grid');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    if (isGuestMode) {
      return getGuestBookmarks();
    }
    try {
      const stored = localStorage.getItem(`gurudevi_library_bookmarks_${accountId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set(['mangroves']);
    } catch {
      return new Set(['mangroves']);
    }
  });
  const [endorsedIds, setEndorsedIds] = useState<Set<string>>(new Set());
  const [resources, setResources] = useState<readonly BrowserLibraryResource[]>([]);
  const [status, setStatus] = useState<LibraryLoadState>('loading');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const catalogTask = workbench.state.tasks.find(
    (task) => task.featureId === CATALOG_TASK.featureId,
  );
  const catalogIsOpen = Boolean(
    catalogTask && catalogTask.taskKey === workbench.state.focusedTaskKey,
  );

  const toggleBookmark = async (id: string) => {
    const next = new Set(bookmarkedIds);
    const isAdding = !next.has(id);
    if (isAdding) next.add(id);
    else next.delete(id);
    setBookmarkedIds(next);

    // Guest bookmarks are strictly isolated locally — zero synchronization to real accounts
    if (isGuestMode) {
      persistGuestBookmarks(next);
      return;
    }

    try {
      localStorage.setItem(
        `gurudevi_library_bookmarks_${accountId}`,
        JSON.stringify(Array.from(next)),
      );
    } catch {}

    void orpcClient.library
      .engage({
        params: { id },
        body: { engagement_type: 'bookmark', toggle: true },
      })
      .catch(() => {});
  };

  const toggleEndorse = async (id: string) => {
    const next = new Set(endorsedIds);
    const isAdding = !next.has(id);
    if (isAdding) next.add(id);
    else next.delete(id);
    setEndorsedIds(next);

    if (isGuestMode) return;

    void orpcClient.library
      .engage({
        params: { id },
        body: { engagement_type: 'endorse' },
      })
      .catch(() => {});
  };

  const loadResources = useCallback(
    async (
      search: string,
      cat: string = selectedCategory,
      sort: 'recent' | 'popular' | 'most_endorsed' = selectedSort,
    ) => {
      const seq = ++searchSeqRef.current;
      await Promise.resolve();
      setStatus('loading');
      setNotice(null);

      if (cat === 'saved') {
        try {
          const client = orpcClient.library as any;
          if (typeof client.getBookmarkedResources === 'function' && !isGuestMode) {
            const saved = await client.getBookmarkedResources({ query: {} });
            if (seq !== searchSeqRef.current) return;
            setResources(parseBrowserLibraryResources(saved));
            setStatus('ready');
            return;
          }
        } catch {}
        if (seq !== searchSeqRef.current) return;
        setResources(EXPLORE_LIBRARY_RESOURCES.filter((r) => bookmarkedIds.has(r.id)));
        setStatus('ready');
        return;
      }

      if (isGuestMode) {
        const list = filterBrowserResources(EXPLORE_LIBRARY_RESOURCES, search, cat, sort);
        if (seq !== searchSeqRef.current) return;
        setResources(list);
        setStatus('ready');
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        // Fallback to public commons rather than failing with an error screen
        const list = filterBrowserResources(EXPLORE_LIBRARY_RESOURCES, search, cat, sort);
        if (seq !== searchSeqRef.current) return;
        setResources(list);
        setStatus('ready');
        setNotice('Viewing Public Educational Commons.');
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          registerTokenResolver(async () => data.session?.access_token ?? null);
        }

        const next = await orpcClient.library.getResources({
          query: {
            limit: 40,
            offset: 0,
            search: search.trim() || undefined,
            type: cat === 'All' ? undefined : (cat as any),
            sort_by: sort,
            visibility: data.session?.access_token ? undefined : 'public',
          },
        });
        if (seq !== searchSeqRef.current) return;
        setResources(parseBrowserLibraryResources(next));
        setStatus('ready');
        if (!data.session?.access_token) {
          setNotice('Viewing Public Educational Commons • Sign in to access your school\'s private archive');
        }
      } catch {
        if (seq !== searchSeqRef.current) return;
        // Resilient fallback: fallback to registered ghost dataset if network/service drops
        const list = filterBrowserResources(EXPLORE_LIBRARY_RESOURCES, search, cat, sort);
        setResources(list);
        setStatus('ready');
        setNotice('Showing cached educational commons.');
      }
    },
    [isGuestMode, selectedCategory, selectedSort, bookmarkedIds],
  );

  const { data: queryResult, error: queryError } = useQuery({
    queryKey: ['library', 'resources', mode, isGuestMode],
    queryFn: async () => {
      if (isGuestMode) {
        return {
          resources: EXPLORE_LIBRARY_RESOURCES,
          status: 'ready' as const,
          notice: null as string | null,
        };
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return {
          resources: EXPLORE_LIBRARY_RESOURCES,
          status: 'ready' as const,
          notice: 'Viewing Public Educational Commons.',
        };
      }

      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
          registerTokenResolver(async () => data.session?.access_token ?? null);
        }

        const next = await orpcClient.library.getResources({
          query: {
            limit: 30,
            offset: 0,
            sort_by: 'recent',
            visibility: data.session?.access_token ? undefined : 'public',
          },
        });

        return {
          resources: parseBrowserLibraryResources(next),
          status: 'ready' as const,
          notice: data.session?.access_token
            ? null
            : 'Viewing Public Educational Commons • Sign in to access your school\'s private archive',
        };
      } catch {
        return {
          resources: EXPLORE_LIBRARY_RESOURCES,
          status: 'ready' as const,
          notice: 'Showing cached educational commons.',
        };
      }
    },
    staleTime: 300_000,
  });

  const { data: collections = EXPLORE_COLLECTIONS } = useQuery({
    queryKey: ['library', 'overview-collections', mode],
    queryFn: async () => {
      if (mode === 'explore') return EXPLORE_COLLECTIONS;
      try {
        const next = await orpcClient.library.getCollections({
          query: { limit: 6 },
        });
        return Array.isArray(next) && next.length > 0 ? next : EXPLORE_COLLECTIONS;
      } catch {
        return EXPLORE_COLLECTIONS;
      }
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (queryResult) {
      if (Array.isArray(queryResult.resources)) {
        setResources(queryResult.resources);
      }
      if (queryResult.status) {
        setStatus(queryResult.status);
      }
      if (queryResult.notice !== undefined) {
        setNotice(queryResult.notice);
      }
    } else if (queryError) {
      setStatus(classifyLibraryFailure(queryError));
      setNotice(
        classifyLibraryFailure(queryError) === 'denied'
          ? 'Your account or selected Sanctuary scope cannot access these resources.'
          : 'We could not reach the Library service. Check your connection and try again.',
      );
    }
  }, [queryResult, queryError]);

  function openCatalog() {
    const existing = workbench.state.tasks.find(
      (task) => task.featureId === CATALOG_TASK.featureId,
    );
    if (existing) workbench.focus(existing.taskKey);
    else workbench.open(CATALOG_TASK);
  }

  function handleSearchSubmit(searchVal: string) {
    setIsSearching(true);
    void loadResources(searchVal).finally(() => setIsSearching(false));
  }

  function retry() {
    setIsSearching(true);
    void loadResources(query).finally(() => setIsSearching(false));
  }

  function returnToOverview() {
    if (catalogTask) workbench.close(catalogTask.taskKey);
  }

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      domain="library"
      furnitureItems={LIBRARY_FURNITURE_ITEMS}
      groupOrder={
        canvas.groupOrder.length > 0
          ? (canvas.groupOrder as string[])
          : ['taskstrip', 'shelf', 'invitations']
      }
      onReorderFurniture={(order) => canvas.setGroupOrder(order as any)}
      onTogglePinFurniture={(id) => canvas.togglePin(id as any)}
      pinnedIds={canvas.pinnedCategories as string[]}
      setAppearance={canvas.setAppearance}
      titleId="library-title"
      greeting={timeGreeting(displayName)}
      breadcrumb={mode === 'explore' ? 'Library · Sample collection' : 'Library · Collections'}
    >
      <TaskStrip
        shellSlot
        tasks={workbench.state.tasks}
        focusedTaskKey={workbench.state.focusedTaskKey}
        overviewActive={!catalogIsOpen}
        onFocusTask={(task) => workbench.focus(task.taskKey)}
        onCloseTask={(task) => workbench.close(task.taskKey)}
        onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
        onOpenOverview={returnToOverview}
      />

      {catalogIsOpen ? (
        <div className={styles.masterDetailLayout} data-layout-mode={canvas.layoutMode}>
          <aside aria-label="Library Collections" className={styles.catalogRail}>
            <div className={styles.catalogRailHeader}>
              <h3 className={styles.catalogRailTitle}>Library Shelf</h3>
              <button
                className={styles.returnOverviewButton}
                onClick={returnToOverview}
                type="button"
              >
                Overview
              </button>
            </div>

            <section
              aria-labelledby="rail-collections-heading"
              className={styles.catalogRailSection}
            >
              <h4 id="rail-collections-heading" className={styles.catalogRailSectionTitle}>
                Collections
              </h4>
              <ul className={styles.catalogRailList}>
                {canvas.groupOrder.map((category) => {
                  const isPinned = canvas.pinnedCategories.includes(category);
                  return (
                    <li key={category}>
                      <div className={styles.catalogRailRow}>
                        <button
                          className={styles.catalogRailItem}
                          onClick={() => {
                            setQuery(category === 'discovery' ? '' : category);
                            void loadResources(category === 'discovery' ? '' : category);
                          }}
                          type="button"
                        >
                          <span className={styles.catalogRailItemLabel}>
                            {collectionLabel(category)}
                          </span>
                        </button>
                        <button
                          aria-label={
                            isPinned
                              ? `Unpin ${collectionLabel(category)}`
                              : `Pin ${collectionLabel(category)}`
                          }
                          className={`${styles.catalogRailPinButton} ${isPinned ? styles.catalogRailPinButtonPinned : ''}`}
                          onClick={() => canvas.togglePin(category)}
                          type="button"
                        >
                          {isPinned ? <Pin size={16} aria-hidden /> : <PinOff size={16} aria-hidden />}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>

          <div className={styles.activeResourceStage}>
            <div className={styles.backOverviewBar}>
              <button className={styles.streamBackButton} onClick={returnToOverview} type="button">
                ← Back to Overview
              </button>
            </div>

            <section className={styles.catalog} aria-labelledby="resource-catalog-title">
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>Browse</p>
                <h2 id="resource-catalog-title">Resource catalog</h2>
                <p>Search verified educational materials made available across the Sanctuary Commons.</p>
              </div>

              {/* Canonical SearchField */}
              <SearchField
                label="Search titles, topics, and descriptions"
                placeholder="Try a subject, topic, or title (e.g. Mangroves, Physics)"
                value={query}
                onChange={(val) => setQuery(val)}
                onSubmit={handleSearchSubmit}
                onClear={() => {
                  setQuery('');
                  void loadResources('');
                }}
                resultCount={status === 'ready' ? resources.length : undefined}
              />

              {/* Canonical Filter Toolbar & Controls */}
              <div className={styles.filterToolbar}>
                <Chips label="Category filter" single className={styles.categoryRow}>
                  {[
                    { id: 'All', label: 'All Items' },
                    { id: 'lesson', label: 'Lessons' },
                    { id: 'video', label: 'Lectures' },
                    { id: 'pdf', label: 'Documents' },
                    { id: 'worksheet', label: 'Worksheets' },
                    { id: 'past_paper', label: 'Past Papers' },
                    { id: 'saved', label: 'Saved Desk' },
                  ].map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      selected={selectedCategory === cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        void loadResources(query, cat.id, selectedSort);
                      }}
                    />
                  ))}
                </Chips>

                <div className={styles.controlsRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Sort by:</span>
                    <select
                      className={styles.sortSelect}
                      value={selectedSort}
                      onChange={(e) => {
                        const val = e.target.value as 'recent' | 'popular' | 'most_endorsed';
                        setSelectedSort(val);
                        void loadResources(query, selectedCategory, val);
                      }}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="most_endorsed">Most Endorsed</option>
                    </select>
                  </div>

                  <SegmentedControl<'grid' | 'list'>
                    label="Card layout"
                    value={cardLayout}
                    onChange={setCardLayout}
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'list', label: 'List' },
                    ]}
                  />
                </div>
              </div>

              {/* Status and Notices */}
              {notice ? (
                <Notice tone="neutral" message={notice} />
              ) : null}

              {status === 'loading' ? (
                <p className={styles.state} role="status">
                  Loading Library resources…
                </p>
              ) : null}

              {status === 'denied' || status === 'error' ? (
                <Notice
                  tone="danger"
                  title="Failed to Load"
                  message={notice ?? 'Could not reach the Library service.'}
                  action={{ label: 'Try again', onPress: retry }}
                />
              ) : null}

              {status === 'ready' && resources.length === 0 ? (
                <p className={styles.state} role="status">
                  {query.trim()
                    ? 'No resources matched that search.'
                    : 'No resources are available in this view yet.'}
                </p>
              ) : null}

              {/* Canonical Catalog Grid / Stack */}
              {status === 'ready' && resources.length > 0 ? (
                cardLayout === 'grid' ? (
                  <Grid min="md" gap="between" className={styles.resourceGrid}>
                    {resources.map((resource) => {
                      const url = safeResourceUrl(resource.url);
                      const isVideo = resource.type?.toLowerCase() === 'video';
                      const targetHref = isVideo
                        ? `/library/video/${resource.id}`
                        : `/library/reader/${resource.id}`;
                      const isBookmarked = bookmarkedIds.has(resource.id);
                      const isEndorsed = endorsedIds.has(resource.id);

                      return (
                        <div key={resource.id} className={styles.resourceItem}>
                          <Card
                            title={resource.title}
                            meta={`${resource.type || 'Resource'}${resource.verified ? ' • Verified' : ''}${
                              resource.subjects?.length > 0
                                ? ` • ${resource.subjects.slice(0, 2).join(', ')}`
                                : ''
                            }`}
                            shape="tile"
                            icon={isVideo ? Video : BookOpen}
                            href={targetHref}
                          />
                          <Inline gap="inside" className={styles.cardActionsInline}>
                            <Button
                              size="sm"
                              variant="quiet"
                              label={isBookmarked ? 'Saved' : 'Save'}
                              icon={Bookmark}
                              onClick={() => toggleBookmark(resource.id)}
                            />
                            <Button
                              size="sm"
                              variant="quiet"
                              label={isEndorsed ? 'Endorsed' : 'Endorse'}
                              icon={Heart}
                              onClick={() => toggleEndorse(resource.id)}
                            />
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.externalLinkAnchor}
                                title="Open external source"
                              >
                                <ExternalLink size={14} aria-hidden />
                                <span>Source</span>
                              </a>
                            ) : null}
                          </Inline>
                        </div>
                      );
                    })}
                  </Grid>
                ) : (
                  <Stack gap="between">
                    {resources.map((resource) => {
                      const url = safeResourceUrl(resource.url);
                      const isVideo = resource.type?.toLowerCase() === 'video';
                      const targetHref = isVideo
                        ? `/library/video/${resource.id}`
                        : `/library/reader/${resource.id}`;
                      const isBookmarked = bookmarkedIds.has(resource.id);
                      const isEndorsed = endorsedIds.has(resource.id);

                      return (
                        <div key={resource.id} className={styles.resourceItem}>
                          <Card
                            title={resource.title}
                            meta={`${resource.type || 'Resource'}${resource.verified ? ' • Verified' : ''}${
                              resource.subjects?.length > 0
                                ? ` • ${resource.subjects.slice(0, 2).join(', ')}`
                                : ''
                            }`}
                            shape="wide"
                            icon={isVideo ? Video : BookOpen}
                            href={targetHref}
                          />
                          <Inline gap="inside" className={styles.cardActionsInline}>
                            <Button
                              size="sm"
                              variant="quiet"
                              label={isBookmarked ? 'Saved' : 'Save'}
                              icon={Bookmark}
                              onClick={() => toggleBookmark(resource.id)}
                            />
                            <Button
                              size="sm"
                              variant="quiet"
                              label={isEndorsed ? 'Endorsed' : 'Endorse'}
                              icon={Heart}
                              onClick={() => toggleEndorse(resource.id)}
                            />
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.externalLinkAnchor}
                                title="Open external source"
                              >
                                <ExternalLink size={14} aria-hidden />
                                <span>Source</span>
                              </a>
                            ) : null}
                          </Inline>
                        </div>
                      );
                    })}
                  </Stack>
                )
              ) : null}
            </section>
          </div>
        </div>
      ) : (
        <>
          <section className={styles.overview} aria-labelledby="library-overview-title">
            <div>
              <p className={styles.eyebrow}>
                {isGuestMode ? 'Explore Commons · Open Sanctuary' : 'Overview · Epistemic Universe'}
              </p>
              <h2 id="library-overview-title">
                {isGuestMode ? 'Public Educational Commons' : 'Curricular Library & Commons'}
              </h2>
              <p>
                {isGuestMode
                  ? 'Freely browse verified Sri Lankan syllabi, textbooks, and lectures without requiring an account.'
                  : 'Search verified curriculum materials, open original manuscripts, and explore island knowledge centers.'}
              </p>
            </div>
            <div className={styles.overviewAside}>
              <p className={styles.count}>
                {status === 'ready' && Array.isArray(resources) ? resources.length : '—'}
              </p>
              <p>resources currently available</p>
              <button onClick={openCatalog} type="button">
                Search Catalog
              </button>
            </div>
            {status === 'loading' ? <p role="status">Connecting to your Library…</p> : null}
            {notice ? (
              <div className={styles.state} role="status">
                <p>{notice}</p>
              </div>
            ) : null}
          </section>

          <div className={styles.shelvesContainer}>
            {/* Featured Manuscript Hero Banner with Canonical Card */}
            {(() => {
              const hero =
                resources.find((r) => r.id === 'mangroves') ??
                resources.find((r) => r.verified) ??
                resources[0] ??
                EXPLORE_LIBRARY_RESOURCES[0];
              if (!hero) return null;
              const isVideo = hero.type?.toLowerCase() === 'video';
              const targetHref = isVideo
                ? `/library/video/${hero.id}`
                : `/library/reader/${hero.id}`;
              const isBookmarked = bookmarkedIds.has(hero.id);

              return (
                <div className={styles.heroSection}>
                  <Card
                    title={hero.title}
                    meta={`Featured Artifact • ${hero.subjects?.[0] || 'Curriculum'}${
                      hero.verified ? ' • Verified' : ''
                    } — ${hero.description || 'Verified pedagogical field guide and curricular specification.'}`}
                    shape="wide"
                    size="lg"
                    icon={isVideo ? Video : BookOpen}
                    href={targetHref}
                  />
                  <Inline gap="inside" className={styles.cardActionsInline} style={{ marginTop: '0.75rem' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      label={isBookmarked ? 'Saved to Desk' : 'Save to Desk'}
                      icon={Bookmark}
                      onClick={() => toggleBookmark(hero.id)}
                    />
                    <Button
                      size="sm"
                      variant="quiet"
                      label="Share"
                      icon={Share2}
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          void navigator.clipboard.writeText(
                            `${window.location.origin}/library/${isVideo ? 'video' : 'reader'}/${hero.id}`,
                          );
                          setNotice('Resource link copied to clipboard!');
                          setTimeout(() => setNotice(null), 3000);
                        }
                      }}
                    />
                  </Inline>
                </div>
              );
            })()}

            {/* Saved Desk Shelf (if items exist) */}
            {(() => {
              const saved = (resources.length > 0 ? resources : EXPLORE_LIBRARY_RESOURCES).filter(
                (r) => bookmarkedIds.has(r.id),
              );
              if (saved.length === 0) return null;
              return (
                <section className={styles.shelfSection} aria-labelledby="saved-shelf-heading">
                  <div className={styles.shelfHeader}>
                    <h3 id="saved-shelf-heading">Saved Desk & Pinned Reflections</h3>
                    <p>
                      {isGuestMode
                        ? 'Your locally saved study guides (saved in this browser)'
                        : 'Your account bookmarks and synchronized study resources'}
                    </p>
                  </div>
                  <Grid min="md" gap="between">
                    {saved.slice(0, 4).map((res) => {
                      const isVideo = res.type?.toLowerCase() === 'video';
                      const targetHref = isVideo
                        ? `/library/video/${res.id}`
                        : `/library/reader/${res.id}`;
                      return (
                        <div key={res.id} className={styles.resourceItem}>
                          <Card
                            title={res.title}
                            meta={`${res.type || 'Guide'}${res.verified ? ' • Verified' : ''}`}
                            shape="tile"
                            icon={isVideo ? Video : BookOpen}
                            href={targetHref}
                          />
                          <Inline gap="inside" className={styles.cardActionsInline}>
                            <Button
                              size="sm"
                              variant="quiet"
                              label="Remove"
                              onClick={() => toggleBookmark(res.id)}
                            />
                          </Inline>
                        </div>
                      );
                    })}
                  </Grid>
                </section>
              );
            })()}

            {/* Curated Collections Shelf */}
            <section className={styles.shelfSection} aria-labelledby="collections-shelf-heading">
              <div className={styles.shelfHeader}>
                <h3 id="collections-shelf-heading">Curated Study Collections</h3>
                <p>Themed curricular paths gathered for deep inquiry</p>
              </div>
              <Grid min="md" gap="between">
                {(Array.isArray(collections) ? collections : EXPLORE_COLLECTIONS).map((col) => (
                  <div key={col.id}>
                    <Card
                      title={col.name}
                      meta={`${col.subjects?.[0] || 'Curriculum'}${col.is_official ? ' • Official' : ''} — ${col.description || 'Guided study sequence.'}`}
                      shape="tile"
                      icon={FolderHeart}
                      href={`/library/collections/${col.id}`}
                    />
                  </div>
                ))}
              </Grid>
            </section>

            {/* Continue Learning Shelf */}
            <section className={styles.shelfSection} aria-labelledby="continue-shelf-heading">
              <div className={styles.shelfHeader}>
                <h3 id="continue-shelf-heading">Continue Learning & Field Guides</h3>
                <p>Hand-picked pedagogical manuscripts and multimedia lectures</p>
              </div>
              <Grid min="md" gap="between">
                {(Array.isArray(resources) && resources.length > 0
                  ? resources.slice(0, 4)
                  : EXPLORE_LIBRARY_RESOURCES
                ).map((res) => {
                  const isVideo = res.type?.toLowerCase() === 'video';
                  return (
                    <div key={res.id}>
                      <Card
                        title={res.title}
                        meta={`${res.type || 'Guide'}${res.verified ? ' • Verified' : ''}`}
                        shape="tile"
                        icon={isVideo ? Video : BookOpen}
                        href={
                          isVideo
                            ? `/library/video/${res.id}`
                            : `/library/reader/${res.id}`
                        }
                      />
                    </div>
                  );
                })}
              </Grid>
            </section>

            {/* Knowledge Tools & Spatial Map Gateway */}
            <section className={styles.shelfSection} aria-labelledby="gateways-shelf-heading">
              <div className={styles.shelfHeader}>
                <h3 id="gateways-shelf-heading">Tools & Spatial Cartography</h3>
                <p>Interactive study appliances and national learning topography</p>
              </div>
              <Grid min="md" gap="between">
                <Card
                  title="Knowledge Tools Hub"
                  meta="Spreadsheet data grid, OCR vision extractor, study packet compiler, and offline export archive."
                  shape="wide"
                  size="lg"
                  icon={FileSpreadsheet}
                  href="/library/tools"
                />
                <Card
                  title="Learning Centers & Knowledge Cosmos"
                  meta="Explore Sri Lankan physical resource centers and topological concept cluster relationships."
                  shape="wide"
                  size="lg"
                  icon={Compass}
                  href="/library/map"
                />
              </Grid>
            </section>

            {/* Living Sanctuary Curator Studio Invitation */}
            <section className={styles.shelfSection} aria-labelledby="curator-shelf-heading">
              <div className={styles.shelfHeader}>
                <h3 id="curator-shelf-heading">Curator Studio</h3>
                <p>Pedagogical curation & content review</p>
              </div>
              <Card
                title="Pedagogical Curation & Content Review"
                meta="Review staged community submissions, verify curricular alignment, and resolve broken link reports."
                shape="wide"
                size="lg"
                icon={Sparkles}
                href="/library/curator"
              />
            </section>
          </div>
        </>
      )}
    </SanctuaryFloorCanvas>
  );
}
