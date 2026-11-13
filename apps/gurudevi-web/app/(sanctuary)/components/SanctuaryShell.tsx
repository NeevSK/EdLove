'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  type DragEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isLocalPreviewHost } from '../../../lib/host-routing';
import {
  type BrowserCapability,
  loadAccountCapabilities,
} from '../../../lib/sanctuary/capabilityBootstrap';
import { setDevPreviewCapacity } from '../../../lib/sanctuary/devPreviewCapacity';
import { useInactivitySentinel } from '../../../lib/sanctuary/useInactivitySentinel';
import { resolveSurfaceUrl } from '../../../lib/surface-urls';
import { useDomainWorkbench } from '../../../lib/workbench';
import { WorkbenchScopeProvider } from '../../../lib/workbench/WorkbenchScope';
import {
  accountNavigation,
  advancedTools,
  isSanctuaryNavActive,
  primaryNavigation,
  type QuickAccessId,
  quickAccessDestinations,
  type SanctuaryNavItem,
  withSanctuaryRoutePrefix,
} from '../sanctuary-nav';
import styles from '../sanctuary-shell.module.css';
import {
  isOfferedTo,
  WEB_WORKSPACE_FEATURES,
  workspaceFeatureAt,
} from '../workspace/workspaceFeatureRegistry';
import {
  ActionFab,
  FabMenu,
  LivingGround,
  ScrollArea,
} from '@repo/ui/components/web';
import type { FabAction } from '@repo/ui/theme';
import { Sparkles } from '@repo/ui/icons/web';
import { CapacityPerspectiveSwitcher } from './CapacityPerspectiveSwitcher';
import { CommandPalette } from './CommandPalette';
import { TutiiSidePanel } from './TutiiSidePanel';
import { DiurnalThemeToggle } from './DiurnalThemeToggle';
import { ExamLockdownBanner } from './ExamLockdownBanner';
import { LayeredDeckHeader } from './LayeredDeckHeader';
import { SanctuaryNavIcon } from './SanctuaryNavIcon';
import { SyncStatusPill } from './SyncStatusPill';
import { WorkspaceScopeSwitcher } from './WorkspaceScopeSwitcher';
import { WorkspaceRouteTabs } from './WorkspaceRouteTabs';

type SanctuaryShellProps = Readonly<{
  children: ReactNode;
  displayName: string;
  navigationPrefix: string;
  /** Server-authorized capacity; it is display context, never an authorization decision. */
  activeCapacity?: string | null;
  unreadNotifications?: number;
  showAccountNavigation?: boolean;
  isExploreMode?: boolean;
  isDevPreview?: boolean;
  previewCapacity?: string;
}>;

const showAdvancedTools = process.env.NODE_ENV !== 'production';
const sidebarPreferenceKey = 'gurudevi_sidebar_collapsed_v2';
const navigationLayoutKey = 'gurudevi_navigation_layout_v1';

export function SanctuaryShell({
  children,
  displayName,
  navigationPrefix,
  unreadNotifications = 0,
  showAccountNavigation = true,
  isExploreMode = false,
  isDevPreview = false,
  previewCapacity,
  activeCapacity,
}: SanctuaryShellProps) {
  useInactivitySentinel(!isExploreMode);
  const pathname = usePathname();
  const router = useRouter();
  const workspaceUsageScope = isExploreMode ? 'explore' : 'sanctuary';
  const workspaceWorkbench = useDomainWorkbench('workspace', { usageScope: workspaceUsageScope });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  const [contextRailVisible, setContextRailVisible] = useState(false);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const [navigationLayout, setNavigationLayout] = useState<'horizontal' | 'side'>('horizontal');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [tutiiSidePanelOpen, setTutiiSidePanelOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setTutiiSidePanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const TutiiFabIcon = useCallback(
    ({ size, color, ...rest }: { size?: number; color?: string; 'aria-hidden'?: boolean }) => (
      <Sparkles size={size ?? 24} color={color ?? 'currentColor'} {...rest} />
    ),
    [],
  );

  const fabActions = useMemo<readonly FabAction[]>(() => {
    const prefix = navigationPrefix ? navigationPrefix.replace(/\/+$/, '') : '';
    const makeHref = (path: string) => (prefix ? `${prefix}${path}` : path);

    return [
      {
        key: 'tutii-companion',
        label: 'Tutii AI Companion',
        hint: 'Direct mentor conversation & learning support',
        tone: 'lamp',
        group: 'Tutii & Intelligence',
        onPress: () => router.push(makeHref('/community?pillar=messages&dm=tutii')),
      },
      {
        key: 'ai-workspace',
        label: 'AI Workspace Floor',
        hint: 'Agent reasoning, artifacts & interactive proposals',
        tone: 'plain',
        group: 'Tutii & Intelligence',
        onPress: () => router.push(makeHref('/community?pillar=messages')),
      },
      {
        key: 'ai-incognito',
        label: 'Incognito AI Session',
        hint: 'Zero-trace, non-persisted inquiry',
        tone: 'plain',
        group: 'Tutii & Intelligence',
        onPress: () => router.push(makeHref('/community?pillar=messages&mode=incognito')),
      },
      {
        key: 'command-palette',
        label: 'Open Command Palette',
        hint: 'Search floors, tools, and actions (Ctrl+K)',
        tone: 'plain',
        group: 'Quick Navigation',
        onPress: () => setCommandPaletteOpen(true),
      },
      {
        key: 'somatic-breathing',
        label: 'Mindful Breathing',
        hint: 'Grounding somatic pause and focus',
        tone: 'plain',
        group: 'Wellbeing',
        onPress: () => router.push(makeHref('/self?practice=breath')),
      },
    ];
  }, [navigationPrefix, router]);
  const quickAccessOptions = useMemo(
    () =>
      quickAccessDestinations.filter(
        (destination) =>
          (!isExploreMode || destination.explore) && isOfferedTo(activeCapacity, destination.href),
      ),
    [activeCapacity, isExploreMode],
  );
  const [quickAccessIds, setQuickAccessIds] = useState<QuickAccessId[]>(() =>
    isExploreMode
      ? ['my-attendance', 'breathing']
      : ['my-attendance', 'breathing', 'submissions', 'community-forest'],
  );
  const [quickAccessEditorOpen, setQuickAccessEditorOpen] = useState(false);
  const [quickAccessNotice, setQuickAccessNotice] = useState('');
  const [capabilities, setCapabilities] = useState<readonly BrowserCapability[]>([]);

  // Asynchronously bootstrap server capabilities for current domain
  useEffect(() => {
    if (isExploreMode) return;
    let mounted = true;
    const domain = pathname.startsWith('/self')
      ? 'self'
      : pathname.startsWith('/workspace')
        ? 'workspace'
        : pathname.startsWith('/community')
          ? 'community'
          : pathname.startsWith('/library')
            ? 'library'
            : null;

    if (domain) {
      loadAccountCapabilities(domain).then((loaded) => {
        if (mounted && loaded.length > 0) {
          setCapabilities(loaded);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [isExploreMode, pathname]);

  const advancedTriggerRef = useRef<HTMLButtonElement>(null);
  const advancedMenuId = useId();

  const primaryItems = withSanctuaryRoutePrefix(primaryNavigation, navigationPrefix);
  const accountItems = withSanctuaryRoutePrefix(accountNavigation, navigationPrefix);
  const profile = accountItems.find((item) => item.id === 'profile');
  const notifications = accountItems.find((item) => item.id === 'notifications');
  const settings = accountItems.find((item) => item.id === 'settings');

  // Read sidebar preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(sidebarPreferenceKey);
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    } catch {
      // LocalStorage access may fail in restricted contexts
    }
  }, []);

  useEffect(() => {
    const readLayout = () => {
      try {
        const saved = localStorage.getItem(navigationLayoutKey);
        setNavigationLayout(saved === 'side' ? 'side' : 'horizontal');
      } catch {
        setNavigationLayout('horizontal');
      }
    };
    readLayout();
    window.addEventListener('gurudevi:navigation-layout', readLayout);
    return () => window.removeEventListener('gurudevi:navigation-layout', readLayout);
  }, []);

  useEffect(() => {
    const storageKey = `gurudevi_quick_access_${isExploreMode ? 'explore' : 'sanctuary'}`;
    const defaults: QuickAccessId[] = isExploreMode
      ? ['my-attendance', 'breathing']
      : ['my-attendance', 'breathing', 'submissions', 'community-forest'];

    const loadQuickAccess = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const savedIds = parsed.filter((id): id is QuickAccessId =>
              quickAccessOptions.some((destination) => destination.id === id),
            );
            setQuickAccessIds([...new Set([...savedIds, ...defaults])].slice(0, 4));
            return;
          }
        }
        setQuickAccessIds(defaults);
      } catch {
        setQuickAccessIds(defaults);
      }
    };

    loadQuickAccess();
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        loadQuickAccess();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isExploreMode, quickAccessOptions]);

  useEffect(() => {
    const compactLandscape = window.matchMedia('(orientation: landscape) and (max-height: 34rem)');
    const update = () => setAutoCollapsed(compactLandscape.matches);
    compactLandscape.addEventListener('change', update);
    update();
    return () => {
      compactLandscape.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const domain =
      pathname === '/self' || pathname.startsWith('/self/')
        ? 'self'
        : pathname === '/workspace' || pathname.startsWith('/workspace/')
          ? 'workspace'
          : null;
    setSidebarOverride(null);
    if (!domain) {
      setContextRailVisible(false);
      return;
    }

    const readVisibility = () => {
      const rail = document.getElementById('workbench-quick-access');
      setContextRailVisible(window.innerWidth > 767 && rail?.dataset.domain === domain);
    };
    const onVisibilityChange = (event: Event) => {
      const detail = (event as CustomEvent<{ domain: string; visible: boolean }>).detail;
      if (detail?.domain === domain)
        setContextRailVisible(window.innerWidth > 767 && detail.visible);
    };

    readVisibility();
    window.addEventListener('gurudevi:quick-access-visibility', onVisibilityChange);
    window.addEventListener('resize', readVisibility);
    return () => {
      window.removeEventListener('gurudevi:quick-access-visibility', onVisibilityChange);
      window.removeEventListener('resize', readVisibility);
    };
  }, [pathname]);

  const menuIsCollapsed =
    sidebarOverride ?? (sidebarCollapsed || autoCollapsed || contextRailVisible);

  const saveQuickAccess = useCallback(
    (next: QuickAccessId[]) => {
      setQuickAccessIds(next);
      try {
        localStorage.setItem(
          `gurudevi_quick_access_${isExploreMode ? 'explore' : 'sanctuary'}`,
          JSON.stringify(next),
        );
      } catch {
        // Keep the in-session selection if browser storage is unavailable.
      }
    },
    [isExploreMode],
  );

  const toggleQuickAccess = useCallback(
    (id: QuickAccessId) => {
      const selected = quickAccessIds.includes(id);
      if (selected && quickAccessIds.length === 1) return;
      if (!selected && quickAccessIds.length >= 4) return;
      saveQuickAccess(
        selected ? quickAccessIds.filter((item) => item !== id) : [...quickAccessIds, id],
      );
    },
    [quickAccessIds, saveQuickAccess],
  );

  const handleQuickAccessDrop = useCallback(
    (event: DragEvent<HTMLElement>, targetId?: QuickAccessId) => {
      event.preventDefault();
      const dragged = quickAccessOptions.find(
        (destination) => destination.id === event.dataTransfer.getData('text/plain'),
      );
      if (!dragged) return;

      const current = quickAccessIds.filter((id) => id !== dragged.id);
      if (!quickAccessIds.includes(dragged.id) && current.length >= 4) return;
      const targetIndex = targetId ? current.indexOf(targetId) : current.length;
      current.splice(targetIndex < 0 ? current.length : targetIndex, 0, dragged.id);
      saveQuickAccess(current);
    },
    [quickAccessOptions, quickAccessIds, saveQuickAccess],
  );

  const handleQuickAccessDragStart = useCallback(
    (event: DragEvent<HTMLElement>, id: QuickAccessId) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    },
    [],
  );

  const openQuickAccessDestination = useCallback(
    (href: string) => {
      const feature = workspaceFeatureAt(href);
      const route = feature?.id === 'attendance' ? '/workspace?task=attendance' : href;
      if (feature) {
        const result = workspaceWorkbench.open({
          featureId: feature.id,
          route,
          title: feature.label,
          icon: feature.symbol,
          temporalBinding: { kind: 'follow-domain' },
          localStatePolicy: 'restore-permitted',
        });
        if (result.kind === 'at-capacity') {
          setQuickAccessNotice('Close a Workspace task before opening another.');
          return;
        }
      }
      setQuickAccessNotice('');
      if (pathname !== route) router.push(route);
    },
    [pathname, router, workspaceWorkbench],
  );

  const toggleSidebar = useCallback(() => {
    const next = !menuIsCollapsed;
    if (contextRailVisible || autoCollapsed) {
      setSidebarOverride(next);
      return;
    }
    setSidebarOverride(null);
    setSidebarCollapsed((prev) => {
      const nextValue = !prev;
      try {
        localStorage.setItem(sidebarPreferenceKey, String(nextValue));
      } catch {
        // Safe fallback
      }
      return nextValue;
    });
  }, [autoCollapsed, contextRailVisible, menuIsCollapsed]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (advancedOpen) {
          setAdvancedOpen(false);
          advancedTriggerRef.current?.focus();
        }
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        }
      }

      // Shortcut: Ctrl+B or Cmd+B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
      }

      // Shortcut: Ctrl+K or Cmd+K to open Command Palette
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [advancedOpen, commandPaletteOpen, toggleSidebar]);

  return (
    <LivingGround
      atmosphere="canopy"
      dither
      className={styles.shell}
      data-sidebar={menuIsCollapsed ? 'collapsed' : 'expanded'}
      data-navigation-layout={navigationLayout}
    >
      <a className={styles.skipLink} href="#sanctuary-main">
        Skip to content
      </a>
      <LayeredDeckHeader
        scrollTargetId="sanctuary-main"
        headerSlot={
          <header className={styles.header}>
            <div className={styles.wordmarkArea}>
              <button
                aria-expanded={!menuIsCollapsed}
                aria-label={menuIsCollapsed ? 'Open menu' : 'Close menu'}
                className={styles.menuBrandButton}
                onClick={toggleSidebar}
                title={menuIsCollapsed ? 'Open menu' : 'Close menu'}
                type="button"
              >
                <span aria-hidden="true" className={styles.brandLotus}>
                  🪷
                </span>
              </button>
              {/* Explore has no account and nothing to sync, and must never contact the backend. */}
              {isExploreMode ? null : <SyncStatusPill />}
            </div>

            <div className={styles.headerControls}>
              {isExploreMode ? (
                isDevPreview ? (
                  <CapacityPerspectiveSwitcher mode="explore" />
                ) : null
              ) : isDevPreview ? (
                <CapacityPerspectiveSwitcher
                  mode="preview"
                  activeCapacity={previewCapacity}
                  onChange={setDevPreviewCapacity}
                />
              ) : (
                <WorkspaceScopeSwitcher />
              )}
              <button
                aria-label="Search Gurudevi (Ctrl+K)"
                className={styles.commandPaletteTrigger}
                onClick={() => setCommandPaletteOpen(true)}
                title="Search Gurudevi (Ctrl+K)"
                type="button"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={styles.searchGlyph}
                >
                  <circle cx="10.8" cy="10.8" r="6.1" />
                  <path d="m15.3 15.3 4.2 4.2" />
                </svg>
                <span className={styles.commandPaletteKbd}>Ctrl+K</span>
              </button>
              <div className={styles.diurnalToggleWrapper}>
                <DiurnalThemeToggle headerIcon={false} />
              </div>
              <Link
                aria-label="Help, report a problem, or send feedback"
                className={styles.headerAction}
                href="/support"
                title="Help & feedback"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={styles.headerActionGlyph}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1.15 1.05-1.8 1.45-1.8 3" />
                  <path d="M12 17.2h.01" />
                </svg>
              </Link>
              {showAccountNavigation && notifications && profile && settings ? (
                <nav aria-label="Account navigation" className={styles.accountActions}>
                  <Link
                    aria-label={
                      unreadNotifications > 0
                        ? `Notifications, ${unreadNotifications} unread`
                        : 'Notifications'
                    }
                    aria-current={
                      isSanctuaryNavActive(pathname, notifications.href) ? 'page' : undefined
                    }
                    className={styles.headerAction}
                    href={notifications.href}
                    title="Notifications"
                  >
                    <HeaderActionGlyph id="notifications" />
                    {unreadNotifications > 0 ? (
                      <span aria-hidden="true" className={styles.headerBadge}>
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    ) : null}
                  </Link>
                  <Link
                    aria-label="Profile"
                    aria-current={isSanctuaryNavActive(pathname, profile.href) ? 'page' : undefined}
                    className={`${styles.headerAction} ${styles.profileAction}`}
                    href={profile.href}
                    title={displayName ? `Profile: ${displayName}` : 'Profile'}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles.profileGlyph}
                    >
                      <circle cx="12" cy="8" r="3.25" />
                      <path d="M5.5 20c.55-3.5 2.9-5.25 6.5-5.25s5.95 1.75 6.5 5.25" />
                    </svg>
                  </Link>
                  <Link
                    aria-label="Settings"
                    aria-current={
                      isSanctuaryNavActive(pathname, settings.href) ? 'page' : undefined
                    }
                    className={styles.headerAction}
                    href={settings.href}
                    title="Settings"
                  >
                    <HeaderActionGlyph id="settings" />
                  </Link>
                </nav>
              ) : null}
            </div>
          </header>
        }
        bannerSlot={
          isExploreMode ? (
            <aside className={styles.exploreBanner} aria-label="Explore sample space">
              <span>
                <strong>Explore</strong> · Sample space; changes stay in this demo.
              </span>
              <div className={styles.exploreBannerActions}>
                <a href={resolveSurfaceUrl('public', '/')} className={styles.exploreReturnLink}>
                  <span aria-hidden="true">←</span> Gurudevi.app
                </a>
                <span className={styles.exploreBannerDivider} aria-hidden="true">
                  ·
                </span>
                <a href={resolveSurfaceUrl('sanctuary', '/welcome')}>
                  Go to Sanctuary <span aria-hidden="true">→</span>
                </a>
              </div>
            </aside>
          ) : null
        }
        navSlot={
          <nav aria-label="Main navigation" className={styles.horizontalNavigation} data-placement="deck">
            {primaryItems.map((item) => (
              <NavLink emoji item={item} key={item.id} pathname={pathname} />
            ))}
          </nav>
        }
        taskStripSlot={
          <div className={styles.taskStripSlot} id="sanctuary-task-strip-slot">
            {pathname.startsWith('/workspace/') ? (
              <WorkspaceRouteTabs
                pathname={pathname}
                capacity={activeCapacity}
                isExploreMode={isExploreMode}
                onOpenQuickAccessItem={(item) => {
                  const feature = WEB_WORKSPACE_FEATURES.find((candidate) => candidate.id === item.id);
                  if (feature) openQuickAccessDestination(feature.href);
                }}
              />
            ) : null}
          </div>
        }
      />

      <div className={styles.body}>
        <aside className={styles.rail} aria-label="Menu">
          <nav>
            <ul className={styles.navList}>
              {primaryItems.map((item) => (
                <li key={item.id}>
                  <NavLink item={item} pathname={pathname} collapsed={menuIsCollapsed} />
                </li>
              ))}
            </ul>
          </nav>

          <section
            aria-labelledby="quick-access-title"
            className={styles.quickAccess}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleQuickAccessDrop(event)}
          >
            <div className={styles.quickAccessHeader}>
              <span className={styles.railTitle} id="quick-access-title">
                Quick access
              </span>
              <button
                aria-expanded={quickAccessEditorOpen}
                aria-label={
                  quickAccessEditorOpen ? 'Close quick access editor' : 'Edit quick access'
                }
                className={styles.quickAccessEdit}
                onClick={() => setQuickAccessEditorOpen((open) => !open)}
                type="button"
              >
                {quickAccessEditorOpen ? 'Done' : 'Edit'}
              </button>
            </div>
            {quickAccessEditorOpen ? (
              <div className={styles.quickAccessOptions}>
                <p>Choose up to four shortcuts</p>
                {quickAccessOptions.map((destination) => {
                  const selected = quickAccessIds.includes(destination.id);
                  return (
                    <button
                      aria-pressed={selected}
                      className={styles.quickAccessOption}
                      draggable={!selected && quickAccessIds.length < 4}
                      disabled={
                        (!selected && quickAccessIds.length >= 4) ||
                        (selected && quickAccessIds.length === 1)
                      }
                      key={destination.id}
                      onClick={() => toggleQuickAccess(destination.id)}
                      onDragStart={(event) => handleQuickAccessDragStart(event, destination.id)}
                      type="button"
                    >
                      <span aria-hidden="true">{destination.symbol}</span>
                      <span>{destination.label}</span>
                      <span aria-hidden="true" className={styles.quickAccessCheck}>
                        {selected ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <ul className={styles.quickAccessList}>
                {quickAccessIds.map((id) => {
                  const destination = quickAccessDestinations.find((item) => item.id === id);
                  if (!destination) return null;
                  return (
                    <li
                      draggable
                      key={destination.id}
                      onDragStart={(event) => handleQuickAccessDragStart(event, destination.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        handleQuickAccessDrop(event, destination.id);
                      }}
                    >
                      <Link
                        className={styles.quickAccessLink}
                        href={`${navigationPrefix}${destination.href}`}
                        onClick={(event) => {
                          event.preventDefault();
                          openQuickAccessDestination(destination.href);
                        }}
                        title={destination.label}
                      >
                        <span aria-hidden="true">{destination.symbol}</span>
                        <span className={styles.quickAccessLabel}>{destination.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {showAdvancedTools ? (
            <div className={styles.advanced}>
              <button
                ref={advancedTriggerRef}
                aria-controls={advancedMenuId}
                aria-expanded={advancedOpen}
                className={styles.advancedTrigger}
                onClick={() => setAdvancedOpen((open) => !open)}
                type="button"
              >
                Advanced <span aria-hidden="true">{advancedOpen ? '−' : '+'}</span>
              </button>
              {advancedOpen ? (
                <div className={styles.advancedPanel} id={advancedMenuId}>
                  <p>Development tools</p>
                  <ul>
                    {advancedTools.map((tool) => (
                      <li key={tool}>{tool}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>

        <main className={styles.main} tabIndex={-1}>
          <ScrollArea
            viewportId="sanctuary-main"
            variant="auto"
            orientation="vertical"
            showEdgeGradients={false}
            dragToScroll={false}
            scrollbarVisibility="always"
            label="Sanctuary Canvas"
            style={{ height: '100%', width: '100%' }}
          >
            <div className={styles.canvasFrame}>
              {typeof window !== 'undefined' &&
              (window.location.search.includes('exam=true') ||
                window.location.search.includes('exam=1') ||
                window.location.search.includes('lockdown=true')) ? (
                <ExamLockdownBanner />
              ) : null}
              {quickAccessNotice ? (
                <p className={styles.quickAccessNotice} role="status">
                  {quickAccessNotice}
                </p>
              ) : null}
              <WorkbenchScopeProvider scope={workspaceUsageScope}>{children}</WorkbenchScopeProvider>
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* The same places as a bottom bar on phones. The header copy sits inside transformed layers,
          so it cannot reach the bottom of the screen; CSS shows exactly one of the two, and the
          hidden one (display: none) is out of the accessibility tree. */}
      <nav aria-label="Main navigation" className={styles.horizontalNavigation} data-placement="bottom">
        {primaryItems.map((item) => (
          <NavLink emoji item={item} key={item.id} pathname={pathname} />
        ))}
      </nav>

      <div className={styles.fabDock}>
        <ActionFab
          label="Tutii Companion & Subtasks"
          icon={TutiiFabIcon}
          onPress={() => setTutiiSidePanelOpen(true)}
          hidden={
            typeof window !== 'undefined' &&
            (window.location.search.includes('exam=true') ||
              window.location.search.includes('exam=1') ||
              window.location.search.includes('lockdown=true'))
          }
        />
      </div>

      <TutiiSidePanel
        isOpen={tutiiSidePanelOpen}
        onClose={() => setTutiiSidePanelOpen(false)}
        pathname={pathname}
        displayName={displayName}
        activeCapacity={activeCapacity}
        navigationPrefix={navigationPrefix}
      />

      <CommandPalette
        capacity={activeCapacity}
        isOpen={commandPaletteOpen}
        navigationPrefix={navigationPrefix}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </LivingGround>
  );
}
function HeaderActionGlyph({ id }: Readonly<{ id: 'notifications' | 'settings' }>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.headerActionGlyph}>
      {id === 'notifications' ? (
        <>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </>
      ) : (
        <>
          <path d="M19.14 12.94a7.5 7.5 0 0 0 0-1.88l2.03-1.58-2-3.46-2.42.98a7.4 7.4 0 0 0-1.63-.94L14.75 3h-4.5l-.37 3.06a7.4 7.4 0 0 0-1.63.94l-2.42-.98-2 3.46 2.03 1.58a7.5 7.5 0 0 0 0 1.88l-2.03 1.58 2 3.46 2.42-.98c.5.4 1.05.72 1.63.94L10.25 21h4.5l.37-3.06c.58-.22 1.13-.54 1.63-.94l2.42.98 2-3.46-2.03-1.58Z" />
          <circle cx="12.5" cy="12" r="2.5" />
        </>
      )}
    </svg>
  );
}

function NavLink({
  item,
  pathname,
  emoji = false,
  collapsed = false,
  unreadCount,
}: Readonly<{
  item: SanctuaryNavItem;
  pathname: string;
  emoji?: boolean;
  collapsed?: boolean;
  unreadCount?: number;
}>) {
  const active = isSanctuaryNavActive(pathname, item.href);
  const safeUnread = unreadCount ?? 0;
  const hasUnread = item.id === 'notifications' && safeUnread > 0;

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={styles.navLink}
      href={item.href}
      title={collapsed ? item.label : undefined}
    >
      <span aria-hidden="true" className={styles.navSymbol}>
        {emoji ? (
          item.symbol
        ) : (
          <SanctuaryNavIcon
            id={item.id}
            size={18}
            strokeWidth={active ? 2.3 : 1.9}
            fallback={item.symbol}
          />
        )}
      </span>
      <span className={styles.navLabel}>{item.label}</span>
      {hasUnread && (
        <span aria-hidden="true" className={styles.navBadge}>
          {safeUnread > 99 ? '99+' : safeUnread}
        </span>
      )}
    </Link>
  );
}
