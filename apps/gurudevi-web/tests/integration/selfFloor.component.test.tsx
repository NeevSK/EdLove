import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelfFloor } from '@/app/(sanctuary)/self/SelfFloor';
import { resolveSelfFeatureManifest } from '@repo/self/features/featureManifest';
import { BROWSER_SELF_FEATURES } from '@/app/(sanctuary)/self/browserFeatureRegistry';
import { requestAccountSelfProcedure } from '@/lib/sanctuary/selfApiClient';

vi.mock('@repo/self/features/featureManifest', () => ({
  resolveSelfFeatureManifest: vi.fn(() => ({
    all: [
      {
        id: 'fire_journal',
        label: 'Fire Journal',
        emoji: '🔥',
        componentId: 'FireJournal',
        category: 'practice',
        domain: 'reflection',
        requiredCapabilities: ['read:SelfReflection'],
        minCitizenship: 3,
        roleWeights: {},
        defaultZone: 'private',
        defaultOrder: 50,
        energyVibe: ['#FFFBEB', '#FEF3C7'],
        isPinnable: true,
        isHidable: true,
        taskBehavior: { kind: 'single' },
        delivery: 'runnable',
        availability: 'available',
      },
      {
        id: 'mood_lotus',
        label: 'Mood Lotus',
        emoji: '🪷',
        componentId: 'MoodLotus',
        category: 'wellbeing',
        domain: 'pulse',
        requiredCapabilities: ['read:InnerPulse'],
        minCitizenship: 3,
        roleWeights: {},
        defaultZone: 'today',
        defaultOrder: 21,
        energyVibe: ['#F5F3FF', '#EDE9FE'],
        isPinnable: true,
        isHidable: true,
        taskBehavior: { kind: 'modal' },
        delivery: 'runnable',
        availability: 'available',
      },
    ],
    accessible: [],
    runnable: [
      {
        id: 'fire_journal',
        label: 'Fire Journal',
        emoji: '🔥',
        componentId: 'FireJournal',
        category: 'practice',
        domain: 'reflection',
        requiredCapabilities: ['read:SelfReflection'],
        minCitizenship: 3,
        roleWeights: {},
        defaultZone: 'private',
        defaultOrder: 50,
        energyVibe: ['#FFFBEB', '#FEF3C7'],
        isPinnable: true,
        isHidable: true,
        taskBehavior: { kind: 'single' },
        delivery: 'runnable',
        availability: 'available',
      },
    ],
  })),
}));

vi.mock('@/app/(sanctuary)/self/browserFeatureRegistry', () => ({
  BROWSER_SELF_FEATURES: {
    fire_journal: { renderer: 'fire-journal', taskKind: 'task' },
    mood_lotus: { renderer: 'mood-lotus', taskKind: 'modal' },
  },
  getBrowserSelfFeature: vi.fn((id) => ({ fire_journal: { renderer: 'fire-journal', taskKind: 'task' }, mood_lotus: { renderer: 'mood-lotus', taskKind: 'modal' } })[id] ?? null),
  isBrowserSelfFeatureDelivered: vi.fn((id) => ['fire_journal', 'mood_lotus'].includes(id)),
}));

vi.mock('@/lib/workbench', async () => {
  const ReactModule = await import('react');
  return {
    useDomainWorkbench: vi.fn(() => {
      const [tasks, setTasks] = ReactModule.useState<any[]>([]);
      const [focusedTaskKey, setFocusedTaskKey] = ReactModule.useState<string | null>(null);
      const [temporalHorizon, setTemporalHorizon] = ReactModule.useState<any>(null);

      const open = ReactModule.useCallback((task: any) => {
        const taskKey = task.taskKey ?? task.featureId;
        const descriptor = { ...task, taskKey };
        setTasks((prev) => [...prev.filter((t) => t.taskKey !== taskKey), descriptor]);
        setFocusedTaskKey(taskKey);
        return { kind: 'ok', task: descriptor };
      }, []);

      const close = ReactModule.useCallback((taskKey: string) => {
        setTasks((prev) => prev.filter((t) => t.taskKey !== taskKey));
        setFocusedTaskKey(null);
        return { kind: 'overview' };
      }, []);

      const focus = ReactModule.useCallback((taskKey: string) => {
        setFocusedTaskKey(taskKey);
      }, []);

      return {
        state: {
          temporalHorizon,
          tasks,
          focusedTaskKey,
        },
        open,
        close,
        focus,
        setTemporalHorizon,
      };
    }),
  };
});

vi.mock('@/lib/sanctuary/selfApiClient', () => ({
  requestAccountSelfProcedure: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requestAccountSelfProcedure).mockImplementation(async (proc) => {
    if (proc === 'getJournalHistory' || proc === 'getMoodHistory') return [];
    return null;
  });
});

describe('SelfFloor Component Integration (G2 — jsdom)', () => {
  it('renders Self overview when no feature is selected', () => {
    render(<SelfFloor displayName="Test User" />);

    expect(screen.getByText('Self · Overview')).toBeDefined();
    expect(screen.getByText('A place to notice what is asking for your care.')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Fire Journal', level: 2 })).toBeDefined();
    expect(screen.getByRole('button', { name: /open fire journal/i })).toBeDefined();
  });

  it('shows practice catalog with zones', () => {
    render(<SelfFloor displayName="Test User" />);

    expect(screen.getByRole('heading', { name: 'Wellbeing' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Practice & rhythm' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Identity' })).toBeDefined();
  });

  it('opens Fire Journal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));

    expect(screen.getByText('Self · Fire Journal')).toBeDefined();
    expect(screen.getByText('Make room for what needs to be released.')).toBeDefined();
    expect(screen.getByRole('textbox', { name: /a private reflection/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /release to fire journal/i })).toBeDefined();
  });

  it('shows error state when burn fails', async () => {
    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockImplementation(async (proc) => {
      if (proc === 'getJournalHistory') return [];
      if (proc === 'burnJournal') throw new Error('We could not release that reflection.');
      return null;
    });

    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));
    await user.type(screen.getByRole('textbox', { name: /a private reflection/i }), 'This will fail');
    await user.click(screen.getByRole('button', { name: /release to fire journal/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('renders master-detail practice rail when Fire Journal is open and returns to overview', async () => {
    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));

    // Verify master-detail rail is rendered alongside the active practice
    expect(screen.getByText('Self Practices')).toBeDefined();
    expect(screen.getByRole('button', { name: /full overview/i })).toBeDefined();
    expect(screen.getByRole('textbox', { name: /a private reflection/i })).toBeDefined();

    // Verify rail contains Pinned and Practice Catalog sections
    const rail = screen.getByRole('complementary', { name: /self practices/i });
    expect(within(rail).getByText('Pinned')).toBeDefined();
    expect(within(rail).getByText('Practice Catalog')).toBeDefined();

    // Clicking "Full Overview" returns the user to the catalog
    await user.click(screen.getByRole('button', { name: /full overview/i }));
    expect(screen.getByText('Practices, held in one place')).toBeDefined();
  });

  it('allows switching practice and toggling pins directly from the master-detail rail', async () => {
    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    // Open Fire Journal
    await user.click(screen.getByRole('button', { name: /open fire journal/i }));

    const rail = screen.getByRole('complementary', { name: /self practices/i });
    expect(rail).toBeDefined();

    // Toggle pin on Mood Lotus from the rail
    const pinMoodButton = within(rail).getByRole('button', { name: /pin mood lotus/i });
    await user.click(pinMoodButton);

    // Now Mood Lotus should be pinned (appears in Pinned list and in Practice Catalog)
    expect(
      within(rail).getAllByRole('button', { name: /unpin mood lotus/i }).length,
    ).toBeGreaterThanOrEqual(1);

    // Open Mood Lotus directly from the rail
    const openMoodFromRail = within(rail).getAllByRole('button', { name: /mood lotus/i })[0];
    if (!openMoodFromRail) throw new Error('Expected Mood Lotus button in rail');
    await user.click(openMoodFromRail);

    // Mood Lotus modal should open
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('How are you arriving?')).toBeDefined();
  });

  it('opens Mood Lotus modal from catalog', async () => {
    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    if (!moodLotusCard) throw new Error('Expected Mood Lotus card in catalog');
    await user.click(within(moodLotusCard).getByRole('button', { name: /open practice/i }));

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('How are you arriving?')).toBeDefined();
  });
});

describe('Mood Lotus Integration (G2 — jsdom)', () => {
  beforeEach(() => {
    vi.mocked(requestAccountSelfProcedure).mockReset();
    vi.mocked(requestAccountSelfProcedure).mockImplementation(async (proc) => {
      if (proc === 'getJournalHistory' || proc === 'getMoodHistory') return [];
      return null;
    });
  });

  it('logs a mood and shows in history', async () => {
    const mockEntry = {
      id: 'mood-123',
      user_id: 'test-user',
      mood: 'calm',
      mood_score: 4,
      note: 'Feeling centered',
      created_at: '2026-01-01T00:00:00Z',
    };

    vi.mocked(requestAccountSelfProcedure).mockImplementation(async (proc) => {
      if (proc === 'getMoodHistory') return [];
      if (proc === 'logMood') return mockEntry;
      return null;
    });

    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    if (!moodLotusCard) throw new Error('Expected Mood Lotus card in catalog');
    await user.click(within(moodLotusCard).getByRole('button', { name: /open practice/i }));

    await user.click(screen.getByRole('button', { name: /calm/i }));
    await user.type(screen.getByRole('textbox', { name: /a few words/i }), 'Feeling centered');
    await user.click(screen.getByRole('button', { name: /save calm/i }));

    await waitFor(() => {
      expect(screen.getByText(/feeling centered/i)).toBeDefined();
    });
  });

  it('shows error when mood logging fails', async () => {
    vi.mocked(requestAccountSelfProcedure).mockImplementation(async (proc) => {
      if (proc === 'getMoodHistory') return [];
      if (proc === 'logMood') throw new Error('We could not save this check-in.');
      return null;
    });

    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    if (!moodLotusCard) throw new Error('Expected Mood Lotus card in catalog');
    await user.click(within(moodLotusCard).getByRole('button', { name: /open practice/i }));

    await user.click(screen.getByRole('button', { name: /calm/i }));
    await user.click(screen.getByRole('button', { name: /save calm/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });
});

describe('Floor Atmosphere Integration (G2 — jsdom)', () => {
  it('renders atmosphere and toggles atmosphere configuration panel', async () => {
    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    const trigger = screen.getByRole('button', { name: /customize floor atmosphere/i });
    expect(trigger).toBeDefined();

    await user.click(trigger);
    expect(
      screen.getByRole('complementary', { name: /floor atmosphere configuration/i }),
    ).toBeDefined();
    expect(screen.getByText('Atmospheric Shader FX')).toBeDefined();

    await user.click(screen.getByRole('button', { name: /aurora mesh/i }));
    const floorArticle = document.querySelector('article[data-domain="self"]');
    expect(floorArticle?.getAttribute('data-atmosphere')).toBe('aurora-mesh');
  });
});