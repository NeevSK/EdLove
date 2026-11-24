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
  Pebble,
  SegmentedControl,
  Stack,
  SearchField,
} from '@repo/ui/components/web';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  ExternalLink,
  Heart,
  Share2,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listLocalLibraryItems,
  saveLocalLibraryItem,
  type LocalLibraryItem,
} from '../../../lib/library/localLibraryStore';
import { useAssetOutbox } from '../../../lib/media/useAssetOutbox';
import { fileKindOf } from '@repo/core/logic/files/fileKind';
import { useLibraryCanvas } from '../../../lib/canvas/useLibraryCanvas';
import { useNavigator } from '../../../lib/navigation/useNavigator';
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
  icon: '📚',
  temporalBinding: { kind: 'none' },
  localStatePolicy: 'none',
} as const;

export function libraryResourceEmoji(type?: string | null, format?: string | null): string {
  const t = (type ?? '').toLowerCase();
  const f = (format ?? '').toLowerCase();
  if (t === 'video' || f === 'video' || t === 'movie_trailer') return '🎥';
  if (t === 'pdf' || f === 'pdf' || f === 'document' || t === 'manuscript') return '📄';
  if (t === 'worksheet' || f === 'worksheet' || t === 'lab' || t === 'practice') return '📝';
  if (t === 'past_paper' || f === 'past_paper') return '📜';
  if (t === 'lesson' || f === 'lesson') return '📖';
  if (t === 'map' || f === 'map' || t === 'infographic' || t === 'topology') return '🗺️';
  if (t === 'guide' || f === 'guide' || t === 'tech_guide' || t === 'pedagogy') return '👩‍🏫';
  return '📖';
}

/** Canonical Sri Lankan educational commons dataset — every entry points to a real, locally-downloadable file */
export const CANONICAL_COMMONS_RESOURCES: readonly BrowserLibraryResource[] = [
  {
    id: 'mangroves',
    title: 'Field Guide to Sri Lankan Mangrove Ecosystems (PDF)',
    description:
      '3-page illustrated field manual for coastal wetland conservation and flora identification.',
    type: 'pdf',
    format: 'pdf',
    subjects: ['Biology', 'Ecology'],
    verified: true,
    is_official: true,
    url: '/samples/mangroves-field-guide.pdf',
  },
  {
    id: 'lesson-plan-ecology',
    title: 'Mangrove Soil Salinity & Microclimate Lab (Word .docx)',
    description:
      'Editable Word worksheet for testing estuarine salinity gradients and plant adaptations.',
    type: 'worksheet',
    format: 'docx',
    subjects: ['Biology', 'Chemistry'],
    verified: true,
    is_official: true,
    url: '/samples/lesson-plan-ecology.docx',
  },
  {
    id: 'wet-zone-flora',
    title: 'Wet-Zone Flora & Sinharaja Canopy (PowerPoint .pptx)',
    description:
      'Classroom presentation deck covering emergent, canopy, and forest floor habitats.',
    type: 'lesson',
    format: 'pptx',
    subjects: ['Science', 'Botany'],
    verified: true,
    is_official: true,
    url: '/samples/wet-zone-flora.pptx',
  },
  {
    id: 'res-contemplative-pedagogy',
    title: 'Contemplative Pedagogy in Island Schools (Marp Slides)',
    description:
      'Gurudevi Markdown slide deck on stillness, inquiry, and attention in Sri Lankan classrooms.',
    type: 'lesson',
    format: 'slides',
    subjects: ['Pedagogy', 'Mindfulness'],
    verified: true,
    is_official: true,
    url: '/samples/contemplative-pedagogy-slides.md',
  },
  {
    id: 'classical-verse',
    title: 'Classical Sinhala Verse & Inquiry (Markdown Lesson)',
    description:
      'Trilingual Gurudevi Markdown lesson with Sinhala Unicode, callout notes, and meter formulas.',
    type: 'lesson',
    format: 'markdown',
    subjects: ['Literature', 'Humanities'],
    verified: true,
    is_official: true,
    url: '/samples/classical-sinhala-verse.md',
  },
  {
    id: 'garden-path-plate',
    title: 'Sanctuary Garden Path — Field Observation Plate (Image)',
    description:
      'High-resolution botanical observation plate for nature journaling and visual OCR.',
    type: 'map',
    format: 'image',
    subjects: ['Environment', 'Art'],
    verified: true,
    is_official: true,
    url: '/artwork/garden-path.jpg',
  },
  {
    id: 'mindful-bell-audio',
    title: 'Opening Circle Mindful Chime (Audio .wav)',
    description:
      '1-second resonant bell cue for opening circle transitions in quiet classrooms.',
    type: 'guide',
    format: 'audio',
    subjects: ['Mindfulness', 'Classroom'],
    verified: true,
    is_official: true,
    url: '/samples/mindful-bell.wav',
  },
  {
    id: 'nie-external-portal',
    title: 'National Institute of Education (NIE) Syllabus Portal (Link)',
    description:
      'Official external reference link to Sri Lankan national school syllabi.',
    type: 'guide',
    format: 'link',
    subjects: ['Curriculum', 'Reference'],
    verified: true,
    is_official: true,
    url: 'https://nie.lk',
  },
];

export const EXPLORE_LIBRARY_RESOURCES: readonly BrowserLibraryResource[] = CANONICAL_COMMONS_RESOURCES;

export const CANONICAL_COLLECTIONS = [
  {
    id: 'col-curriculum-core',
    name: 'National Curriculum & Sri Lankan Pedagogy',
    description:
      'Foundational syllabi, educational circulars, and teacher reference materials for island schools.',
    subjects: ['Curriculum', 'Pedagogy'],
    resource_ids: ['res-contemplative-pedagogy', 'res-quiet-classrooms'],
    is_official: true,
  },
  {
    id: 'col-island-botany',
    name: 'Wet-Zone Ecology & Endemic Flora',
    description:
      'Biological taxonomy and herbarium field guides across Sinharaja and Sri Lankan rainforest preserves.',
    subjects: ['Biology', 'Environment'],
    resource_ids: ['mangroves', 'intro-botany', 'v-r1'],
    is_official: true,
  },
  {
    id: 'col-classical-humanities',
    name: 'Classical Sinhala, Tamil & Pali Epics',
    description:
      'Annotated translations of ancient chronicles, rock inscriptions, and ethical philosophical treatises.',
    subjects: ['Literature', 'Philosophy'],
    resource_ids: ['res-dialogues-truth', 'classical-verse', 'v-r2'],
    is_official: true,
  },
  {
    id: 'v-c1',
    name: 'The Ecology of Care',
    description: 'Foundational resources for the Sanctuary model.',
    subjects: ['Values', 'Social-Emotional'],
    resource_ids: ['v-r1', 'v-r2'],
    is_official: true,
  },
];

export const EXPLORE_COLLECTIONS = (() => {
  const samples = getSandboxSamples<any[]>('library', 'getCollections', [], []);
  if (Array.isArray(samples) && samples.length > 0) {
    return samples.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      subjects: ['Curriculum', 'Pedagogy'],
      resource_ids: c.resource_ids,
      is_official: true,
    }));
  }
  return CANONICAL_COLLECTIONS;
})();

function collectionMeta(category: string): { label: string; emoji: string } {
  const map: Record<string, { label: string; emoji: string }> = {
    discovery: { label: 'Discovery & Search', emoji: '🧭' },
    collections: { label: 'Curated Collections', emoji: '🗂️' },
    tools: { label: 'Practice Tools', emoji: '🛠️' },
    archives: { label: 'Ancient Archives', emoji: '📜' },
  };
  return map[category] ?? { label: category, emoji: '📚' };
}

function collectionLabel(category: string): string {
  return collectionMeta(category).label;
}

export interface WebShelfDef {
  id: string;
  label: string;
  emoji: string;
  types: readonly string[];
}

export const WEB_SHELF_DEFS: readonly WebShelfDef[] = [
  { id: 'All', label: 'All Resources', emoji: '✨', types: [] },
  { id: 'lesson', label: 'Lessons & Units', emoji: '📖', types: ['lesson'] },
  { id: 'video', label: 'Films & Lectures', emoji: '🎥', types: ['video', 'movie_trailer'] },
  { id: 'pdf', label: 'Documents & Syllabi', emoji: '📄', types: ['pdf', 'doc', 'reading', 'pedagogy'] },
  { id: 'worksheet', label: 'Worksheets & Labs', emoji: '📝', types: ['worksheet'] },
  { id: 'past_paper', label: 'Past Papers', emoji: '📜', types: ['past_paper'] },
  { id: 'map', label: 'Maps & Visuals', emoji: '🗺️', types: ['map', 'infographic'] },
  { id: 'guide', label: 'Teacher Guides', emoji: '👩‍🏫', types: ['guide', 'tech_guide'] },
] as const;

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
  const navigator = useNavigator();
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
  const [localItems, setLocalItems] = useState<readonly LocalLibraryItem[]>(() =>
    listLocalLibraryItems(),
  );
  const { enqueueAsset, pendingAssetCount, busy: uploadBusy } = useAssetOutbox();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddMode, setQuickAddMode] = useState<'file' | 'link'>('file');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickLinkUrl, setQuickLinkUrl] = useState('');
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const quickAddRef = useRef<HTMLElement | null>(null);
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
      className={styles.floor}
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

      <div className={styles.libraryDesktopCanvas}>
        {/* Left Explorer Rail (Unified Frosted Glass Column) */}
        <aside aria-label="Library Explorer Rail" className={styles.explorerRail}>
          {/* Ambient Pulse Micro-Counters */}
          <div className={styles.railPulseHeader} role="region" aria-label="Sanctuary Pulse Metrics">
            <div className={styles.railPulseItem}>
              <span className={styles.railPulseValue}>
                {status === 'ready' && Array.isArray(resources) ? resources.length : EXPLORE_LIBRARY_RESOURCES.length}
              </span>
              <span className={styles.railPulseLabel}>📚 Resources</span>
            </div>
            <div className={styles.railPulseItem}>
              <span className={styles.railPulseValue}>
                {Array.isArray(collections) ? collections.length : EXPLORE_COLLECTIONS.length}
              </span>
              <span className={styles.railPulseLabel}>🗂️ Tracks</span>
            </div>
            <div className={styles.railPulseItem}>
              <span className={styles.railPulseValue}>{bookmarkedIds.size}</span>
              <span className={styles.railPulseLabel}>🔖 Saved</span>
            </div>
          </div>

          {/* Knowledge Appliances (Recessed Dock Tray) */}
          <div>
            <div className={styles.railSectionHeader}>
              <span>Knowledge Appliances</span>
              <span>⚙️</span>
            </div>
            <div className={styles.appliancesTray}>
              <Pebble
                title="Tools Hub"
                emoji="🛠️"
                rhythm="OCR & Data"
                ariaLabel="Open Knowledge Tools Hub"
                onPress={() => navigator.follow('/library/tools', 'library-appliances')}
              />
              <Pebble
                title="Atlas Map"
                emoji="🗺️"
                rhythm="Centers"
                ariaLabel="Open Learning Centers Atlas Map"
                onPress={() => navigator.follow('/library/map', 'library-appliances')}
              />
              <Pebble
                title="Curator"
                emoji="✨"
                rhythm="Studio"
                ariaLabel="Open Living Curator Studio"
                onPress={() => navigator.follow('/library/curator', 'library-appliances')}
              />
              <Pebble
                title="Upload / Add"
                emoji="📤"
                rhythm={pendingAssetCount > 0 ? `${pendingAssetCount} queued` : 'Files & Links'}
                ariaLabel="Upload a document, media file, or save a link"
                onPress={() => {
                  setQuickAddOpen((v) => !v);
                  setTimeout(() => {
                    quickAddRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
              />
            </div>
          </div>

          {/* Canonical Curated Shelf Channels */}
          <div>
            <div className={styles.railSectionHeader}>
              <span>Curated Channels</span>
              <span>🗂️</span>
            </div>
            <ul className={styles.shelfNavList}>
              {WEB_SHELF_DEFS.map((shelf) => {
                const isActive = selectedCategory === shelf.id;
                const pool = Array.isArray(resources) && resources.length > 0 ? resources : EXPLORE_LIBRARY_RESOURCES;
                const count =
                  shelf.id === 'All'
                    ? pool.length
                    : pool.filter((r) =>
                        shelf.types.includes(r.type?.toLowerCase() || '') ||
                        shelf.types.includes(r.format?.toLowerCase() || ''),
                      ).length;

                return (
                  <li key={shelf.id}>
                    <button
                      type="button"
                      className={`${styles.shelfNavItem} ${isActive ? styles.shelfNavItemActive : ''}`}
                      onClick={() => {
                        setSelectedCategory(shelf.id);
                        openCatalog();
                        void loadResources(query, shelf.id, selectedSort);
                      }}
                    >
                      <span className={styles.shelfNavLabel}>
                        <span aria-hidden="true">{shelf.emoji}</span>
                        <span>{shelf.label}</span>
                      </span>
                      <span className={styles.shelfCountBadge}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Pinned Desks */}
          {canvas.groupOrder.length > 0 && (
            <div>
              <div className={styles.railSectionHeader}>
                <span>Pinned Desks</span>
                <span>📌</span>
              </div>
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
                            openCatalog();
                            void loadResources(category === 'discovery' ? '' : category);
                          }}
                          type="button"
                        >
                          <span className={styles.catalogRailItemLabel}>
                            <span aria-hidden="true" style={{ marginRight: '0.45rem' }}>
                              {collectionMeta(category).emoji}
                            </span>
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
                          <span aria-hidden="true">{isPinned ? '📌' : '＋'}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Saved Desk Quick Access */}
          {bookmarkedIds.size > 0 && (
            <div>
              <div className={styles.railDivider} />
              <button
                type="button"
                className={`${styles.shelfNavItem} ${selectedCategory === 'saved' ? styles.shelfNavItemActive : ''}`}
                onClick={() => {
                  setSelectedCategory('saved');
                  openCatalog();
                  void loadResources(query, 'saved', selectedSort);
                }}
              >
                <span className={styles.shelfNavLabel}>
                  <span>🔖</span>
                  <span>Saved Desk</span>
                </span>
                <span className={styles.shelfCountBadge}>{bookmarkedIds.size}</span>
              </button>
            </div>
          )}
        </aside>

        {/* Right Curricular Stage */}
        <main className={styles.curricularStage}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <Button
              size="sm"
              variant="primary"
              label={quickAddOpen ? 'Close Upload Panel' : '📤 Upload File / Save Link'}
              onClick={() => setQuickAddOpen((v) => !v)}
            />
            <Button
              size="sm"
              variant="secondary"
              label="Full Contribute Studio →"
              onClick={() => navigator.follow('/library/contribute', 'library-header-contribute')}
            />
          </div>
          {quickAddOpen && (
            <section
              ref={quickAddRef}
              aria-label="Add Document, Media, or Saved Link"
              className={styles.catalog}
              style={{ marginBottom: '1.5rem' }}
            >
              <div className={styles.sectionHeading}>
                <h3>Add Document, Media, or Saved Link</h3>
                <p>
                  Files route to kind-specific storage via IndexedDB + Outbox; links save as
                  metadata only.
                </p>
              </div>
              <Stack gap="between">
                <Inline gap="between">
                  <SegmentedControl<'file' | 'link'>
                    label="Resource source"
                    value={quickAddMode}
                    onChange={setQuickAddMode}
                    options={[
                      { value: 'file', label: 'Upload File (PDF, Word, PPT, Image, Video, H5P)' },
                      { value: 'link', label: 'Save External Link' },
                    ]}
                  />
                  <Button
                    size="sm"
                    variant="quiet"
                    label="Full Contribute Studio →"
                    onClick={() => navigator.follow('/library/contribute', 'library-quick-add')}
                  />
                </Inline>

                <input
                  type="text"
                  placeholder="Title (optional for files, required for links)"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.45rem',
                    border: '1px solid rgba(104, 94, 85, 0.25)',
                  }}
                />

                {quickAddMode === 'file' ? (
                  <Inline gap="between">
                    <input
                      ref={quickFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.pptx,.md,.markdown,.h5p,image/*,audio/*,video/*"
                      disabled={uploadBusy}
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const kind = fileKindOf({ name: file.name, mime: file.type || undefined });
                      const lane =
                        kind === 'image'
                          ? 'images'
                          : kind === 'video' || kind === 'audio'
                            ? 'media'
                            : 'documents';
                      const queued = await enqueueAsset(file, {
                        purpose: file.name.toLowerCase().endsWith('.h5p')
                          ? 'h5p_package'
                          : 'library_resource',
                        visibility: 'public',
                        targetKind: 'library_work',
                        title: quickTitle.trim() || file.name,
                      });
                      if (!queued.ok) {
                        setNotice(queued.reason);
                        return;
                      }
                      const created = saveLocalLibraryItem({
                        id: `local-${Date.now()}`,
                        title: quickTitle.trim() || file.name.replace(/\.[^.]+$/, ''),
                        description: `${kind.toUpperCase()} • Routed to ${lane} storage • SHA-256 ${queued.sha256.slice(0, 8)}…`,
                        type: kind === 'video' ? 'video' : kind === 'pdf' ? 'pdf' : 'lesson',
                        format: file.name.toLowerCase().endsWith('.h5p') ? 'h5p' : kind,
                        url: queued.localUri,
                        subjects: ['Library'],
                        verified: false,
                        assetId: queued.assetId,
                        sha256: queued.sha256,
                        mime: file.type || 'application/octet-stream',
                        fileName: file.name,
                        storageLane: lane,
                        syncStatus: 'queued',
                        createdAt: Date.now(),
                      });
                      setLocalItems(created);
                      setQuickTitle('');
                      setQuickAddOpen(false);
                      setNotice(
                        `Added "${file.name}" (${lane} lane) to Library & queued in Outbox.`,
                      );
                    }}
                  />
                    <Button
                      size="sm"
                      variant="primary"
                      label={uploadBusy ? 'Hashing & Queuing…' : 'Choose File to Upload…'}
                      disabled={uploadBusy}
                      onClick={() => quickFileInputRef.current?.click()}
                    />
                  </Inline>
                ) : (
                  <Inline gap="between">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={quickLinkUrl}
                      onChange={(e) => setQuickLinkUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.45rem',
                        border: '1px solid rgba(104, 94, 85, 0.25)',
                      }}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      label="Save Link"
                      onClick={() => {
                        const safe = safeResourceUrl(quickLinkUrl.trim());
                        if (!safe || !quickTitle.trim()) {
                          setNotice('Provide both a title and a valid https:// or http:// URL.');
                          return;
                        }
                        const created = saveLocalLibraryItem({
                          id: `link-${Date.now()}`,
                          title: quickTitle.trim(),
                          description: `Saved external link • ${safe}`,
                          type: 'guide',
                          format: 'link',
                          url: safe,
                          subjects: ['Saved Links'],
                          verified: false,
                          storageLane: 'link_only',
                          syncStatus: 'link_saved',
                          createdAt: Date.now(),
                        });
                        setLocalItems(created);
                        setQuickTitle('');
                        setQuickLinkUrl('');
                        setQuickAddOpen(false);
                        setNotice(`Saved link "${quickTitle.trim()}" to Library.`);
                      }}
                    />
                  </Inline>
                )}
              </Stack>
            </section>
          )}
          {catalogIsOpen ? (
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
                    { id: 'All', label: '✨ All Items' },
                    { id: 'lesson', label: '📖 Lessons' },
                    { id: 'video', label: '🎥 Lectures' },
                    { id: 'pdf', label: '📄 Documents' },
                    { id: 'worksheet', label: '📝 Worksheets' },
                    { id: 'past_paper', label: '📜 Past Papers' },
                    { id: 'saved', label: '🔖 Saved Desk' },
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
                            emoji={libraryResourceEmoji(resource.type, resource.format)}
                            href={targetHref}
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.follow(targetHref, 'library-resource');
                            }}
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
                            emoji={libraryResourceEmoji(resource.type, resource.format)}
                            href={targetHref}
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.follow(targetHref, 'library-resource');
                            }}
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
        ) : (
          <>
            {/* Modern Editorial Hero Showcase */}
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
                <div className={styles.heroShowcase}>
                  <div className={styles.heroShowcaseBadge}>
                    <span>✧</span>
                    <span>FEATURED STUDY GUIDE</span>
                  </div>
                  <div>
                    <h2 className={styles.heroShowcaseTitle}>{hero.title}</h2>
                    <p className={styles.heroShowcaseDescription}>
                      {hero.description || 'Verified pedagogical field guide and curricular specification across the Sanctuary Commons.'}
                    </p>
                  </div>
                  <div className={styles.heroShowcaseActions}>
                    <button
                      type="button"
                      className={styles.heroPrimaryAction}
                      onClick={() => navigator.follow(targetHref, 'library-hero')}
                    >
                      <span>{isVideo ? 'Watch Lecture 🎥' : 'Start Reading 📖'}</span>
                    </button>
                    <Button
                      size="sm"
                      variant={isBookmarked ? 'primary' : 'secondary'}
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
                        if (typeof window !== 'undefined' && window.navigator?.clipboard) {
                          void window.navigator.clipboard.writeText(
                            `${window.location.origin}/library/${isVideo ? 'video' : 'reader'}/${hero.id}`,
                          );
                          setNotice('Resource link copied to clipboard!');
                          setTimeout(() => setNotice(null), 3000);
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Ambient Instant Search & Format Filter Bar */}
            <div className={styles.ambientSearchContainer}>
              <SearchField
                label="Search titles, topics, and descriptions"
                placeholder="Search manuscripts, topics, or syllabi (e.g. Mangroves, Physics, Grade 10)..."
                value={query}
                onChange={(val) => {
                  setQuery(val);
                  void loadResources(val, selectedCategory, selectedSort);
                }}
                onSubmit={handleSearchSubmit}
                onClear={() => {
                  setQuery('');
                  void loadResources('', selectedCategory, selectedSort);
                }}
                resultCount={status === 'ready' ? resources.length : undefined}
              />

              <div className={styles.filterToolbar}>
                <Chips label="Category filter" single className={styles.categoryRow}>
                  {[
                    { id: 'All', label: '✨ All Items' },
                    { id: 'lesson', label: '📖 Lessons' },
                    { id: 'video', label: '🎥 Lectures' },
                    { id: 'pdf', label: '📄 Documents' },
                    { id: 'worksheet', label: '📝 Worksheets' },
                    { id: 'past_paper', label: '📜 Past Papers' },
                    { id: 'saved', label: '🔖 Saved Desk' },
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
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Sort:</span>
                    <select
                      className={styles.sortSelect}
                      value={selectedSort}
                      onChange={(e) => {
                        const val = e.target.value as 'recent' | 'popular' | 'most_endorsed';
                        setSelectedSort(val);
                        void loadResources(query, selectedCategory, val);
                      }}
                    >
                      <option value="recent">Recent</option>
                      <option value="popular">Popular</option>
                      <option value="most_endorsed">Endorsed</option>
                    </select>
                  </div>

                  <SegmentedControl<'grid' | 'list'>
                    label="Layout"
                    value={cardLayout}
                    onChange={setCardLayout}
                    options={[
                      { value: 'grid', label: 'Grid' },
                      { value: 'list', label: 'List' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {notice ? (
              <div className={styles.state} role="status">
                <p>{notice}</p>
              </div>
            ) : null}

            <div className={styles.shelvesContainer}>
              {/* Live Filtered Results (when search query or category filter is active) */}
              {(query.trim() || selectedCategory !== 'All') ? (
                <section className={styles.shelfSection} aria-labelledby="filtered-results-heading">
                  <div className={styles.shelfHeader}>
                    <h3 id="filtered-results-heading">Filtered Manuscripts ({resources.length})</h3>
                    <p>
                      {query.trim() ? `Search for "${query}"` : 'Filtered by format'}
                      {selectedCategory !== 'All' ? ` • ${selectedCategory}` : ''}
                    </p>
                  </div>
                  {resources.length === 0 ? (
                    <p className={styles.state} role="status">
                      No educational resources match this filter. Try a broader search.
                    </p>
                  ) : cardLayout === 'grid' ? (
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
                              emoji={libraryResourceEmoji(resource.type, resource.format)}
                              href={targetHref}
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.follow(targetHref, 'library-resource');
                              }}
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
                              emoji={libraryResourceEmoji(resource.type, resource.format)}
                              href={targetHref}
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.follow(targetHref, 'library-resource');
                              }}
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
                  )}
                </section>
              ) : null}

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
                            emoji={libraryResourceEmoji(res.type, res.format)}
                            href={targetHref}
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.follow(targetHref, 'library-resource');
                            }}
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
                      emoji="🗂️"
                      href={`/library/collections/${col.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.follow(`/library/collections/${col.id}`, 'library-collection');
                      }}
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
                {[
                  ...localItems,
                  ...(Array.isArray(resources) && resources.length > 0
                    ? resources.slice(0, 4)
                    : EXPLORE_LIBRARY_RESOURCES),
                ].map((res) => {
                  const isVideo = res.type?.toLowerCase() === 'video';
                  return (
                    <div key={res.id}>
                      <Card
                        title={res.title}
                        meta={`${res.type || 'Guide'}${res.verified ? ' • Verified' : ''}`}
                        shape="tile"
                        emoji={libraryResourceEmoji(res.type, res.format)}
                        href={
                          isVideo
                            ? `/library/video/${res.id}`
                            : `/library/reader/${res.id}`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          navigator.follow(
                            isVideo ? `/library/video/${res.id}` : `/library/reader/${res.id}`,
                            'library-resource',
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </Grid>
            </section>
          </div>
        </>
      )}
        </main>
      </div>
    </SanctuaryFloorCanvas>
  );
}
