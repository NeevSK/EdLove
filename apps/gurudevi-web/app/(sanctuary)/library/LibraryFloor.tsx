'use client';

import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
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

export const EXPLORE_LIBRARY_RESOURCES: readonly BrowserLibraryResource[] = [
  {
    id: 'res-contemplative-pedagogy',
    title: 'Mindfulness & Contemplative Pedagogy',
    description:
      'A foundational guide on stillness, deep inquiry, and intentional study in modern learning environments.',
    type: 'Guide',
    verified: true,
    subjects: ['Pedagogy', 'Mindfulness'],
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-dialogues-truth',
    title: 'Dialogues on Living and Truth',
    description:
      'Selections and commentaries exploring ethical living, personal reflection, and the quiet mind.',
    type: 'Manuscript',
    verified: true,
    subjects: ['Philosophy', 'Ethics'],
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-reflective-journaling',
    title: 'Principles of Reflective Journaling',
    description:
      'Techniques for capturing daily observations, self-discovery, and cultivating honest self-awareness.',
    type: 'Practice',
    verified: true,
    subjects: ['Self', 'Reflection'],
    url: 'https://gurudevi.app',
  },
  {
    id: 'res-quiet-classrooms',
    title: 'The Quiet Classroom: Space for Inquiry',
    description:
      'Designing classroom rhythms that balance shared collaboration with restorative personal quiet.',
    type: 'Guide',
    verified: true,
    subjects: ['Classroom', 'Restoration'],
    url: 'https://gurudevi.app',
  },
];

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
  const [query, setQuery] = useState('');
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

  const loadResources = useCallback(
    async (search: string) => {
      await Promise.resolve();
      setStatus('loading');
      setNotice(null);

      if (mode === 'explore') {
        const q = search.trim().toLowerCase();
        if (!q) {
          setResources(EXPLORE_LIBRARY_RESOURCES);
        } else {
          setResources(
            EXPLORE_LIBRARY_RESOURCES.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                (r.description && r.description.toLowerCase().includes(q)) ||
                r.subjects.some((s) => s.toLowerCase().includes(q)),
            ),
          );
        }
        setStatus('ready');
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
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
          setStatus('denied');
          setNotice('Your secure session has ended. Sign in again to browse your Library.');
          return;
        }

        const next = await orpcClient.library.getResources({
          query: {
            limit: 30,
            offset: 0,
            search: search.trim() || undefined,
            sort_by: 'recent',
          },
        });
        setResources(parseBrowserLibraryResources(next));
        setStatus('ready');
      } catch (error) {
        setStatus(classifyLibraryFailure(error));
        setNotice(
          classifyLibraryFailure(error) === 'denied'
            ? 'Your account or selected Sanctuary scope cannot access these resources.'
            : 'We could not reach the Library service. Check your connection and try again.',
        );
      }
    },
    [mode],
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

  useEffect(() => {
    if (queryResult) {
      setResources(queryResult.resources);
      setStatus(queryResult.status);
      setNotice(queryResult.notice);
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
                          {url ? (
                            <a href={url} rel="noreferrer" target="_blank">
                              Open resource <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <span className={styles.unavailableLink}>
                              Resource link unavailable
                            </span>
                          )}
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
            <p className={styles.count}>{status === 'ready' ? resources.length : '—'}</p>
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
      )}
    </SanctuaryFloorCanvas>
  );
}
