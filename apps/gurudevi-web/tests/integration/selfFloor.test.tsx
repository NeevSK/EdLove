import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the selfApiClient module
vi.mock('@/lib/sanctuary/selfApiClient', () => ({
  requestAccountSelfProcedure: vi.fn(),
}));

import { resolveSelfFeatureManifest } from '@repo/self/features/featureManifest';
import { BROWSER_SELF_FEATURES } from '@/app/(sanctuary)/self/browserFeatureRegistry';
import { SelfFloor } from '@/app/(sanctuary)/self/SelfFloor';
import { requestAccountSelfProcedure } from '@/lib/sanctuary/selfApiClient';
import { burnJournal, loadBurnedJournalHistory } from '@/lib/sanctuary/selfJournal';
import { loadMoodHistory, logMood } from '@/lib/sanctuary/selfWellbeing';

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
  getBrowserSelfFeature: vi.fn(
    (id: string) => {
      if (id === 'fire_journal') return { renderer: 'fire-journal', taskKind: 'task' };
      if (id === 'mood_lotus') return { renderer: 'mood-lotus', taskKind: 'modal' };
      return null;
    },
  ),
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requestAccountSelfProcedure).mockReset();
});

describe('Self Journal G1 Boundary Tests — API Functions', () => {
  describe('loadBurnedJournalHistory', () => {
    it('loads journal history successfully', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          content_preview: 'Test entry 1',
          created_at: '2026-01-01T00:00:00Z',
          is_burned: true,
        },
        {
          id: 'entry-2',
          content_preview: 'Test entry 2',
          created_at: '2026-01-02T00:00:00Z',
          is_burned: true,
        },
      ];

      vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockEntries);

      const entries = await loadBurnedJournalHistory(5);

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'getJournalHistory',
        { query: { limit: 5 } },
        expect.any(Function),
        expect.any(String),
      );
      expect(entries).toEqual(mockEntries);
    });

    it('respects limit parameter', async () => {
      vi.mocked(requestAccountSelfProcedure).mockResolvedValue([]);

      await loadBurnedJournalHistory(2);

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'getJournalHistory',
        { query: { limit: 2 } },
        expect.any(Function),
        expect.any(String),
      );
    });
  });

  describe('burnJournal', () => {
    it('burns a journal entry successfully', async () => {
      const mockEntry = {
        id: 'entry-new-123',
        content_preview: 'Test reflection',
        created_at: '2026-01-01T00:00:00Z',
        is_burned: true,
      };

      vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockEntry);

      const entry = await burnJournal('Test reflection to burn');

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'burnJournal',
        { body: { content: 'Test reflection to burn' } },
        expect.any(Function),
        expect.any(String),
      );
      expect(entry).toEqual(mockEntry);
    });

    it('passes content correctly', async () => {
      vi.mocked(requestAccountSelfProcedure).mockResolvedValue({
        id: 'entry-1',
        content_preview: 'test',
        created_at: '2026-01-01T00:00:00Z',
        is_burned: true,
      });

      await burnJournal('Custom reflection content');

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'burnJournal',
        { body: { content: 'Custom reflection content' } },
        expect.any(Function),
        expect.any(String),
      );
    });
  });

  describe('loadMoodHistory', () => {
    it('loads mood history successfully', async () => {
      const mockEntries = [
        {
          id: 'mood-1',
          user_id: 'test-user',
          mood: 'calm',
          mood_score: 7,
          note: 'Feeling centered',
          created_at: '2026-01-01T00:00:00Z',
        },
      ];

      vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockEntries);

      const entries = await loadMoodHistory(5);

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'getMoodHistory',
        { query: { limit: 5 } },
        expect.any(Function),
        expect.any(String),
      );
      expect(entries).toEqual(mockEntries);
    });
  });

  describe('logMood', () => {
    it('logs a mood successfully', async () => {
      const mockEntry = {
        id: 'mood-123',
        user_id: 'test-user',
        mood: 'calm',
        mood_score: 9,
        note: 'Deep meditation',
        created_at: '2026-01-01T00:00:00Z',
      };

      vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockEntry);

      const entry = await logMood({ mood: 'calm', note: 'Deep meditation' });

      expect(requestAccountSelfProcedure).toHaveBeenCalledWith(
        'logMood',
        expect.any(Function),
        expect.any(Function),
        expect.any(String),
      );
      const request = vi.mocked(requestAccountSelfProcedure).mock.calls[0]?.[1];
      expect(request).toBeTypeOf('function');
      if (typeof request !== 'function')
        throw new Error('Expected logMood to supply an authenticated request factory.');
      expect(request('test-user')).toEqual({
        body: expect.objectContaining({
          user_id: 'test-user',
          mood: 'calm',
          mood_score: 4,
          note: 'Deep meditation',
        }),
      });
      expect(entry).toEqual(mockEntry);
    });
  });
});

describe('Self Journal Error Handling (G1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles journal history load failure gracefully', async () => {
    vi.mocked(requestAccountSelfProcedure).mockRejectedValue(new Error('Service unavailable'));

    await expect(loadBurnedJournalHistory()).rejects.toThrow('Service unavailable');
  });

  it('handles burn journal failure gracefully', async () => {
    vi.mocked(requestAccountSelfProcedure).mockRejectedValue(new Error('Failed to burn journal'));

    await expect(burnJournal('test')).rejects.toThrow('Failed to burn journal');
  });

  it('handles mood history load failure gracefully', async () => {
    vi.mocked(requestAccountSelfProcedure).mockRejectedValue(
      new Error('Failed to load mood history'),
    );

    await expect(loadMoodHistory()).rejects.toThrow('Failed to load mood history');
  });

  it('handles log mood failure gracefully', async () => {
    vi.mocked(requestAccountSelfProcedure).mockRejectedValue(new Error('Failed to log mood'));

    await expect(logMood({ mood: 'calm' })).rejects.toThrow('Failed to log mood');
  });
});

describe('Self Journal Empty States (G1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no journal history exists', async () => {
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue([]);

    const entries = await loadBurnedJournalHistory();
    expect(entries).toEqual([]);
  });

  it('returns empty array when no mood history exists', async () => {
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue([]);

    const entries = await loadMoodHistory();
    expect(entries).toEqual([]);
  });
});

describe('SelfFloor Component Boundary Tests (G1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    vi.mocked(requestAccountSelfProcedure).mockRejectedValueOnce(
      new Error('We could not release that reflection.'),
    );

    const user = userEvent.setup();
    render(<SelfFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));
    await user.type(
      screen.getByRole('textbox', { name: /a private reflection/i }),
      'This will fail',
    );
    await user.click(screen.getByRole('button', { name: /release to fire journal/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
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

describe('Mood Lotus Boundary Tests (G1)', () => {
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
      expect(screen.getByRole('alert')).toBeDefined();
    });
  });
});
