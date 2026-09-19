import {
  migrateActiveSubTabsStateForV2,
  useActiveSubTabsStore,
} from '@repo/core/store/useActiveSubTabsStore';

const resetStore = () => {
  useActiveSubTabsStore.setState({
    tabsByDomain: {},
    activeTabByDomain: {},
    pinnedFeatureIdsByDomain: {},
    preferences: {
      headerStyle: 'adaptive',
      catalogDefaultAction: 'open_in_subtab',
      showActiveSubTabs: true,
      autoHideChromeOnScroll: true,
      maxTabsPerDomain: 5,
    },
    isChromeVisible: true,
  });
};

const openSelfTask = (id: string, title = id) =>
  useActiveSubTabsStore.getState().openTab({
    id,
    title,
    route: `/self/${id}`,
    domain: 'self',
  });

describe('useActiveSubTabsStore', { tags: ['pure', 'fast'] }, () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('uses the shared identity and focuses an existing task instead of duplicating it', () => {
    vi.setSystemTime(new Date('2026-09-15T08:00:00.000Z'));
    openSelfTask('journal');
    const taskKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;

    vi.setSystemTime(new Date('2026-09-15T09:00:00.000Z'));
    openSelfTask('journal', 'Journal renamed');

    const state = useActiveSubTabsStore.getState();
    expect(state.tabsByDomain.self).toHaveLength(1);
    expect(state.activeTabByDomain.self).toBe(taskKey);
    expect(state.tabsByDomain.self![0]?.lastFocusedAt).toBe('2026-09-15T09:00:00.000Z');
  });

  test('selecting a task updates its recency for a later focused close', () => {
    vi.setSystemTime(new Date('2026-09-15T08:00:00.000Z'));
    openSelfTask('journal');
    const journalKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;
    vi.setSystemTime(new Date('2026-09-15T08:01:00.000Z'));
    openSelfTask('pulse');
    const pulseKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;

    vi.setSystemTime(new Date('2026-09-15T08:02:00.000Z'));
    useActiveSubTabsStore.getState().setActiveTab('self', journalKey);
    const closeResult = useActiveSubTabsStore.getState().closeTab('self', journalKey);

    expect(closeResult).toMatchObject({ kind: 'focused-task', nextTask: { id: pulseKey } });
    expect(useActiveSubTabsStore.getState().activeTabByDomain.self).toBe(pulseKey);
  });

  test('closing a background task retains the focused task', () => {
    openSelfTask('journal');
    const journalKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;
    vi.advanceTimersByTime(1_000);
    openSelfTask('pulse');
    const pulseKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;

    const closeResult = useActiveSubTabsStore.getState().closeTab('self', journalKey);

    expect(closeResult).toMatchObject({ kind: 'focused-task', nextTask: { id: pulseKey } });
    expect(useActiveSubTabsStore.getState().activeTabByDomain.self).toBe(pulseKey);
  });

  test('closing the final task returns the overview state', () => {
    openSelfTask('journal');
    const taskKey = useActiveSubTabsStore.getState().activeTabByDomain.self!;

    expect(useActiveSubTabsStore.getState().closeTab('self', taskKey)).toEqual({
      kind: 'overview',
    });
    expect(useActiveSubTabsStore.getState().tabsByDomain.self).toEqual([]);
    expect(useActiveSubTabsStore.getState().activeTabByDomain.self).toBe('');
  });

  test('does not evict a task when the mobile adapter cannot prove it is safe', () => {
    useActiveSubTabsStore.getState().updatePreferences({ maxTabsPerDomain: 1 });
    openSelfTask('journal');
    openSelfTask('pulse');

    expect(useActiveSubTabsStore.getState().tabsByDomain.self).toHaveLength(1);
    expect(useActiveSubTabsStore.getState().tabsByDomain.self![0]?.featureId).toBe('journal');
  });

  test('migrates a valid legacy task and preserves pins and preferences', () => {
    const migrated = migrateActiveSubTabsStateForV2({
      tabsByDomain: {
        self: [
          {
            id: 'journal',
            title: 'Journal',
            route: '/self/journal',
            openedAt: Date.parse('2026-09-15T08:00:00.000Z'),
            params: { entry: 'morning' },
          },
          { id: 'missing-route', title: 'Broken', openedAt: 0 },
        ],
      },
      activeTabByDomain: { self: 'journal' },
      pinnedFeatureIdsByDomain: { self: ['journal'] },
      preferences: { maxTabsPerDomain: 3, showActiveSubTabs: false },
    });

    expect(migrated.tabsByDomain.self).toHaveLength(1);
    expect(migrated.tabsByDomain.self?.[0]).toMatchObject({ featureId: 'journal' });
    expect(migrated.activeTabByDomain.self).toBe(migrated.tabsByDomain.self?.[0]?.taskKey);
    expect(migrated.pinnedFeatureIdsByDomain).toEqual({ self: ['journal'] });
    expect(migrated.preferences).toMatchObject({ maxTabsPerDomain: 3, showActiveSubTabs: false });
  });
});
