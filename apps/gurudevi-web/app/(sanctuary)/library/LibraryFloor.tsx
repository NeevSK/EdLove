'use client';

import { getSandboxSamples } from '@repo/core/api/sandboxDataset';
import Link from 'next/link';
import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLibraryCanvas } from '../../../lib/canvas/useLibraryCanvas';
import { createBrowserSupabaseClient } from '../../../lib/supabase/browser';
import { useDomainWorkbench } from '../../../lib/workbench';
import { LivingCard } from '../components/LivingCard';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { TaskStrip } from '../components/workbench';
import styles from './library.module.css';

const LIBRARY_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'arrival', label: 'Library Welcome & Posture', icon: '📖' },
  { id: 'taskstrip', label: 'Reading Tasks Strip', icon: '🧭' },
  { id: 'shelf', label: 'Catalog Shelf & Search', icon: '📚' },
  { id: 'invitations', label: 'Curated Study Invitations', icon: '📜' },
];
import {
  type BrowserLibraryResource,
  classifyLibraryFailure,
  type LibraryLoadState,
  parseBrowserLibraryResources,
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

export const EXPLORE_LIBRARY_RESOURCES: readonly BrowserLibraryResource[] =
  getSandboxSamples<any[]>('library', 'getResources', [], []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    verified: Boolean(r.verified),
    subjects: r.subject ? [r.subject] : ['Sanctuary'],
    url: r.url ?? 'https://gurudevi.app',
  }));

export const EXPLORE_COLLECTIONS = getSandboxSamples<any[]>('library', 'getCollections', [], []).map((c) => ({
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
  const canvas = useLibraryCanvas({
    accountId,
    enableRemoteSync:
      mode === 'account' && Boolean(accountId) && accountId !== 'explore' && accountId !== 'guest',
  });
  const workbench = useDomainWorkbench('library');
  const searchSeqRef = useRef(0);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed'>('recent');
  const [cardLayout, setCardLayout] = useState<'grid' | 'list'>('grid');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('gurudevi_library_bookmarks');
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
    try {
      localStorage.setItem('gurudevi_library_bookmarks', JSON.stringify(Array.from(next)));
    } catch {}

    void orpcClient.library.engage({
      params: { id },
      body: { engagement_type: 'bookmark', toggle: true },
    }).catch(() => {});
  };

  const toggleEndorse = async (id: string) => {
    const next = new Set(endorsedIds);
    const isAdding = !next.has(id);
    if (isAdding) next.add(id);
    else next.delete(id);
    setEndorsedIds(next);

    void orpcClient.library.engage({
      params: { id },
      body: { engagement_type: 'endorse' },
    }).catch(() => {});
  };

  const loadResources = useCallback(
    async (search: string, cat: string = selectedCategory, sort: 'recent' | 'popular' | 'most_endorsed' = selectedSort) => {
      const seq = ++searchSeqRef.current;
      await Promise.resolve();
      setStatus('loading');
      setNotice(null);

      if (cat === 'saved') {
        try {
          const client = orpcClient.library as any;
          if (typeof client.getBookmarkedResources === 'function') {
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

      if (mode === 'explore') {
        const q = search.trim().toLowerCase();
        let list = EXPLORE_LIBRARY_RESOURCES;
        if (cat !== 'All') {
          list = list.filter((r) => r.type?.toLowerCase() === cat.toLowerCase());
        }
        if (q) {
          list = list.filter(
            (r) =>
              (r.title ?? '').toLowerCase().includes(q) ||
              (r.description && r.description.toLowerCase().includes(q)) ||
              (r.subjects ?? []).some((s) => s.toLowerCase().includes(q)),
          );
        }
        if (seq !== searchSeqRef.current) return;
        setResources(list);
        setStatus('ready');
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        if (seq !== searchSeqRef.current) return;
        setStatus('error');
        setNotice('Library sign-in is not configured in this browser.');
        return;
      }

      registerTokenResolver(async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session?.access_token ?? null;
      });

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session?.access_token) {
          if (seq !== searchSeqRef.current) return;
          setStatus('denied');
          setNotice('Your secure session has ended. Sign in again to browse your Library.');
          return;
        }

        const next = await orpcClient.library.getResources({
          query: {
            limit: 40,
            offset: 0,
            search: search.trim() || undefined,
            type: cat === 'All' ? undefined : (cat as any),
            sort_by: sort,
          },
        });
        if (seq !== searchSeqRef.current) return;
        setResources(parseBrowserLibraryResources(next));
        setStatus('ready');
      } catch (error) {
        if (seq !== searchSeqRef.current) return;
        setStatus(classifyLibraryFailure(error));
        setNotice(
          classifyLibraryFailure(error) === 'denied'
            ? 'Your account or selected Sanctuary scope cannot access these resources.'
            : 'We could not reach the Library service. Check your connection and try again.',
        );
      }
    },
    [mode, selectedCategory, selectedSort, bookmarkedIds],
  );

  const { data: queryResult, error: queryError } = useQuery({
    queryKey: ['library', 'resources', mode],
    queryFn: async () => {
      if (mode === 'explore') {
        return {
          resources: EXPLORE_LIBRARY_RESOURCES,
          status: 'ready' as const,
          notice: null as string | null,
        };
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return {
          resources: [] as readonly BrowserLibraryResource[],
          status: 'error' as const,
          notice: 'Library sign-in is not configured in this browser.',
        };
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.access_token) {
        return {
          resources: [] as readonly BrowserLibraryResource[],
          status: 'denied' as const,
          notice: 'Your secure session has ended. Sign in again to browse your Library.',
        };
      }

      const next = await orpcClient.library.getResources({
        query: {
          limit: 30,
          offset: 0,
          sort_by: 'recent',
        },
      });

      return {
        resources: parseBrowserLibraryResources(next),
        status: 'ready' as const,
        notice: null as string | null,
      };
    },
    staleTime: 60_000,
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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    void loadResources(query).finally(() => setIsSearching(false));
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
      groupOrder={canvas.groupOrder.length > 0 ? (canvas.groupOrder as string[]) : ['arrival', 'taskstrip', 'shelf', 'invitations']}
      onReorderFurniture={(order) => canvas.setGroupOrder(order as any)}
      onTogglePinFurniture={(id) => canvas.togglePin(id as any)}
      pinnedIds={canvas.pinnedCategories as string[]}
      setAppearance={canvas.setAppearance}
      titleId="library-title"
    >
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>
          {mode === 'explore' ? 'Library · Local collection' : 'Library · Account collection'}
        </p>
        <h1 id="library-title">A place to find what helps you grow.</h1>
        <p>
          {mode === 'explore'
            ? `Welcome, ${displayName}. Browse sample resources locally while you explore. No cloud account or external connection is required.`
            : `Welcome, ${displayName}. Browse public resources and resources you created. The Library server applies the account's access rules to every request.`}
        </p>
      </header>

      <TaskStrip
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
                            loadResources(category === 'discovery' ? '' : category);
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
                          {isPinned ? '📌' : '📍'}
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
                <p>Search the resources the Library service makes available to your account.</p>
              </div>
              <form className={styles.search} onSubmit={submitSearch} role="search">
                <label htmlFor="library-search">Search titles and descriptions</label>
                <div className={styles.searchRow}>
                  <input
                    id="library-search"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try a subject, topic, or title"
                    type="search"
                    value={query}
                  />
                  <button disabled={isSearching} type="submit">
                    {isSearching ? 'Searching…' : 'Search'}
                  </button>
                </div>

                {/* Modernized Category Filter Row & Sorting Bar */}
                <div className={styles.filterToolbar}>
                  <div className={styles.categoryRow}>
                    {[
                      { id: 'All', label: 'All Items' },
                      { id: 'lesson', label: 'Lessons' },
                      { id: 'video', label: 'Lectures 🎬' },
                      { id: 'pdf', label: 'Documents 📖' },
                      { id: 'worksheet', label: 'Worksheets' },
                      { id: 'past_paper', label: 'Past Papers' },
                      { id: 'saved', label: '★ Saved Desk' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={styles.categoryPill}
                        data-active={selectedCategory === cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          void loadResources(query, cat.id, selectedSort);
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

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

                    <div className={styles.viewModeToggle}>
                      <button
                        type="button"
                        className={styles.viewModeBtn}
                        data-active={cardLayout === 'grid'}
                        onClick={() => setCardLayout('grid')}
                        title="Grid Layout"
                      >
                        ⊞ Grid
                      </button>
                      <button
                        type="button"
                        className={styles.viewModeBtn}
                        data-active={cardLayout === 'list'}
                        onClick={() => setCardLayout('list')}
                        title="List Layout"
                      >
                        ☰ List
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {status === 'loading' ? (
                <p className={styles.state} role="status">
                  Loading Library resources…
                </p>
              ) : null}
              {status === 'denied' || status === 'error' ? (
                <div className={styles.state} role="alert">
                  <p>{notice}</p>
                  <button onClick={retry} type="button">
                    Try again
                  </button>
                </div>
              ) : null}
              {status === 'ready' && resources.length === 0 ? (
                <p className={styles.state} role="status">
                  {query.trim()
                    ? 'No resources matched that search.'
                    : 'No resources are available in this view yet.'}
                </p>
              ) : null}
              {status === 'ready' && resources.length > 0 ? (
                <ul className={styles.resourceGrid} aria-label="Library resources">
                  {resources.map((resource) => {
                    const url = safeResourceUrl(resource.url);
                    return (
                      <li key={resource.id}>
                        <LivingCard
                          className={styles.resourceCard}
                          variant="glass"
                          elevation="floating"
                        >
                          <div className={styles.resourceMeta}>
                            <span>{resource.type || 'Resource'}</span>
                            {resource.verified ? <span>Verified</span> : null}
                          </div>
                          <h3>{resource.title}</h3>
                          <p>{resource.description || 'No description provided.'}</p>
                          <div className={styles.tags}>
                            {resource.subjects.slice(0, 2).map((subject) => (
                              <span key={subject}>{subject}</span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {resource.type === 'Video' ? (
                              <Link
                                href={`/library/video/${resource.id}`}
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 650,
                                  color: 'var(--color-action, #a85022)',
                                  textDecoration: 'none',
                                }}
                              >
                                Watch Lecture 🎬
                              </Link>
                            ) : (
                              <Link
                                href={`/library/reader/${resource.id}`}
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 650,
                                  color: 'var(--color-action, #a85022)',
                                  textDecoration: 'none',
                                }}
                              >
                                Open Reader 📖
                              </Link>
                            )}
                            {url ? (
                              <a href={url} rel="noreferrer" target="_blank" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                External Link <span aria-hidden="true">↗</span>
                              </a>
                            ) : null}
                          </div>

                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${bookmarkedIds.has(resource.id) ? styles.actionBtnActive : ''}`}
                              onClick={() => toggleBookmark(resource.id)}
                            >
                              {bookmarkedIds.has(resource.id) ? '★ Saved' : '☆ Save'}
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${endorsedIds.has(resource.id) ? styles.actionBtnActive : ''}`}
                              onClick={() => toggleEndorse(resource.id)}
                            >
                              {endorsedIds.has(resource.id) ? '♥ Endorsed' : '♡ Endorse'}
                            </button>
                          </div>
                        </LivingCard>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </section>
          </div>
        </div>
      ) : (
        <>
          <section className={styles.overview} aria-labelledby="library-overview-title">
          <div>
            <p className={styles.eyebrow}>Overview</p>
            <h2 id="library-overview-title">Start with the catalog</h2>
            <p>
              Search current resources, open the original material, and return here whenever you
              want to begin somewhere new.
            </p>
          </div>
          <div className={styles.overviewAside}>
            <p className={styles.count}>{status === 'ready' && Array.isArray(resources) ? resources.length : '—'}</p>
            <p>resources currently shown</p>
            <button onClick={openCatalog} type="button">
              Browse resources
            </button>
          </div>
          {status === 'loading' ? <p role="status">Connecting to your Library…</p> : null}
          {status === 'error' || status === 'denied' ? (
            <div className={styles.state} role="alert">
              <p>{notice}</p>
              <button onClick={retry} type="button">
                Try again
              </button>
            </div>
          ) : null}
        </section>

        <div className={styles.shelvesContainer}>
          {/* Curated Collections Shelf */}
          <section className={styles.shelfSection} aria-labelledby="collections-shelf-heading">
            <div className={styles.shelfHeader}>
              <h3 id="collections-shelf-heading">Curated Study Collections</h3>
              <p>Themed curricular paths gathered for deep inquiry</p>
            </div>
            <ul className={styles.shelfGrid} aria-label="Curated collections">
              {(Array.isArray(collections) ? collections : EXPLORE_COLLECTIONS).map((col) => (
                <li key={col.id}>
                  <Link href={`/library/collections/${col.id}`} className={styles.collectionCard}>
                    <div>
                      <div className={styles.collectionMeta}>
                        <span>{col.subjects?.[0] || 'Curriculum'}</span>
                        {col.is_official ? <span>• Official</span> : null}
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--ink)' }}>{col.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                        {col.description || 'Guided study sequence.'}
                      </p>
                    </div>
                    <span style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 650, color: 'var(--lotus)' }}>
                      Explore Collection →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Continue Learning Shelf */}
          <section className={styles.shelfSection} aria-labelledby="continue-shelf-heading">
            <div className={styles.shelfHeader}>
              <h3 id="continue-shelf-heading">Continue Learning & Field Guides</h3>
              <p>Hand-picked pedagogical manuscripts and multimedia lectures</p>
            </div>
            <ul className={styles.shelfGrid} aria-label="Continue learning resources">
              {((Array.isArray(resources) && resources.length > 0) ? resources.slice(0, 4) : EXPLORE_LIBRARY_RESOURCES).map((res) => (
                <li key={res.id}>
                  <LivingCard className={styles.resourceCard} variant="glass" elevation="floating">
                    <div className={styles.resourceMeta}>
                      <span>{res.type || 'Guide'}</span>
                      {res.verified ? <span>Verified</span> : null}
                    </div>
                    <h3>{res.title}</h3>
                    <p>{res.description || 'Verified pedagogical material.'}</p>
                    <div style={{ marginTop: '0.75rem' }}>
                      {res.type === 'Video' ? (
                        <Link
                          href={`/library/video/${res.id}`}
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 650,
                            color: 'var(--color-action, #a85022)',
                            textDecoration: 'none',
                          }}
                        >
                          Watch Lecture 🎬
                        </Link>
                      ) : (
                        <Link
                          href={`/library/reader/${res.id}`}
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 650,
                            color: 'var(--color-action, #a85022)',
                            textDecoration: 'none',
                          }}
                        >
                          Open Reader 📖
                        </Link>
                      )}
                    </div>
                  </LivingCard>
                </li>
              ))}
            </ul>
          </section>

          {/* Knowledge Tools & Spatial Map Gateway */}
          <section
            className={styles.shelfSection}
            style={{
              padding: '1.5rem',
              borderRadius: '1.2rem',
              border: '1px solid var(--line)',
              background: 'color-mix(in srgb, var(--paper-light) 40%, transparent)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <span className={styles.eyebrow}>Document Workbench</span>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'Georgia, serif', fontSize: '1.25rem' }}>
                Knowledge Tools Hub
              </h3>
              <p style={{ margin: '0 0 1rem', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
                Spreadsheet data grid, OCR vision extractor, study packet compiler, and offline export archive.
              </p>
              <Link
                href="/library/tools"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  background: 'var(--ink)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Launch Knowledge Tools →
              </Link>
            </div>

            <div>
              <span className={styles.eyebrow}>Spatial & Topological Map</span>
              <h3 style={{ margin: '0.25rem 0', fontFamily: 'Georgia, serif', fontSize: '1.25rem' }}>
                Learning Centers & Knowledge Cosmos
              </h3>
              <p style={{ margin: '0 0 1rem', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
                Explore Sri Lankan physical resource centers and topological concept cluster relationships.
              </p>
              <Link
                href="/library/map"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  background: 'color-mix(in srgb, var(--ink) 10%, transparent)',
                  color: 'var(--ink)',
                  border: '1px solid var(--line)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                View Library Map →
              </Link>
            </div>
          </section>

          {/* Living Sanctuary Studio Invitation */}
          <section
            className={styles.shelfSection}
            style={{
              padding: '1.5rem',
              borderRadius: '1.2rem',
              border: '1px dashed var(--line)',
              background: 'color-mix(in srgb, var(--paper-light) 40%, transparent)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className={styles.eyebrow}>Curator Studio</span>
                <h3 style={{ margin: '0.25rem 0', fontFamily: 'Georgia, serif', fontSize: '1.35rem' }}>
                  Pedagogical Curation & Content Review
                </h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
                  Review staged community submissions, verify curricular alignment, and resolve broken link reports.
                </p>
              </div>
              <Link
                href="/library/curator"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '9999px',
                  background: 'var(--ink)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Open Curator Studio
              </Link>
            </div>
          </section>
        </div>
        </>
      )}
    </SanctuaryFloorCanvas>
  );
}
