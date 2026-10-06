'use client';

import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';
import { createBrowserSupabaseClient } from '../../../lib/supabase/browser';
import { useDomainWorkbench } from '../../../lib/workbench';
import { TaskStrip } from '../components/workbench';
import styles from './library.module.css';
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

export function LibraryFloor({
  accountId,
  displayName,
}: Readonly<{ accountId: string; displayName: string }>) {
  const floorAppearance = useBrowserWorkspaceAppearance({
    accountId,
    defaultGroupOrder: ['discovery', 'collections', 'tools'],
    workspaceId: 'library',
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

  const loadResources = useCallback(async (search: string) => {
    setStatus('loading');
    setNotice(null);
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
  }, []);

  useEffect(() => {
    void loadResources('');
  }, [loadResources]);

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
    <article
      className={styles.floor}
      data-appearance={floorAppearance.appearance.preset}
      data-domain="library"
      data-motion={floorAppearance.appearance.motion}
      aria-labelledby="library-title"
    >
      <header className={styles.arrival}>
        <p className={styles.eyebrow}>Library · account collection</p>
        <h1 id="library-title">A place to find what helps you grow.</h1>
        <p>
          Welcome, {displayName}. Browse public resources and resources you created. The Library
          server applies the account's access rules to every request.
        </p>
      </header>

      <TaskStrip
        tasks={workbench.state.tasks}
        focusedTaskKey={workbench.state.focusedTaskKey}
        overviewActive={!catalogIsOpen}
        onFocusTask={(task) => workbench.focus(task.taskKey)}
        onCloseTask={(task) => workbench.close(task.taskKey)}
        onOpenOverview={returnToOverview}
        onOpenCatalog={openCatalog}
      />

      {catalogIsOpen ? (
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
                  <li className={styles.resourceCard} key={resource.id}>
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
                      <span className={styles.unavailableLink}>Resource link unavailable</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
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
    </article>
  );
}
