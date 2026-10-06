import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelfJournalFloor } from '@/app/(sanctuary)/self/SelfJournalFloor';
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

vi.mock('@/lib/workbench', () => ({
  useDomainWorkbench: vi.fn(() => ({
    state: {
      temporalHorizon: null,
      tasks: [],
      focusedTaskKey: null,
    },
    open: vi.fn(() => ({ kind: 'ok' })),
    close: vi.fn(() => ({ kind: 'overview' })),
    focus: vi.fn(),
    setTemporalHorizon: vi.fn(),
  })),
}));

vi.mock('@/lib/sanctuary/selfApiClient', () => ({
  requestAccountSelfProcedure: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SelfJournalFloor Component Integration (G2 — jsdom)', () => {
  it('renders Self overview when no feature is selected', () => {
    render(<SelfJournalFloor displayName="Test User" />);

    expect(screen.getByText('Self · Overview')).toBeInTheDocument();
    expect(screen.getByText('A place to notice what is asking for your care.')).toBeInTheDocument();
    expect(screen.getByText('Fire Journal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open fire journal/i })).toBeInTheDocument();
  });

  it('shows practice catalog with zones', () => {
    render(<SelfJournalFloor displayName="Test User" />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Private practice')).toBeInTheDocument();
    expect(screen.getByText('Shared context')).toBeInTheDocument();
  });

  it('opens Fire Journal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<SelfJournalFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));

    expect(screen.getByText('Self · Fire Journal')).toBeInTheDocument();
    expect(screen.getByText('Make room for what needs to be released.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /a private reflection/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /release to fire journal/i })).toBeInTheDocument();
  });

  it('shows error state when burn fails', async () => {
    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockRejectedValueOnce(new Error('We could not release that reflection.'));

    const user = userEvent.setup();
    render(<SelfJournalFloor displayName="Test User" />);

    await user.click(screen.getByRole('button', { name: /open fire journal/i }));
    await user.type(screen.getByRole('textbox', { name: /a private reflection/i }), 'This will fail');
    await user.click(screen.getByRole('button', { name: /release to fire journal/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('opens Mood Lotus modal from catalog', async () => {
    const user = userEvent.setup();
    render(<SelfJournalFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    await user.click(moodLotusCard);

    expect(screen.getByRole('dialog', { name: /mood lotus/i })).toBeInTheDocument();
    expect(screen.getByText('How are you arriving?')).toBeInTheDocument();
  });
});

describe('Mood Lotus Integration (G2 — jsdom)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs a mood and shows in history', async () => {
    const mockEntry = {
      id: 'mood-123',
      user_id: 'test-user',
      mood: 'calm',
      mood_score: 7,
      note: 'Feeling centered',
      created_at: '2026-01-01T00:00:00Z',
    };

    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockResolvedValue(mockEntry);

    const user = userEvent.setup();
    render(<SelfJournalFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    await user.click(moodLotusCard);

    await user.click(screen.getByRole('button', { name: /calm/i }));
    await user.type(screen.getByRole('textbox', { name: /a few words/i }), 'Feeling centered');
    await user.click(screen.getByRole('button', { name: /save calm/i }));

    await waitFor(() => {
      expect(screen.getByText(/feeling centered/i)).toBeInTheDocument();
    });
  });

  it('shows error when mood logging fails', async () => {
    const { requestAccountSelfProcedure } = await import('@/lib/sanctuary/selfApiClient');
    vi.mocked(requestAccountSelfProcedure).mockRejectedValueOnce(new Error('We could not save this check-in.'));

    const user = userEvent.setup();
    render(<SelfJournalFloor displayName="Test User" />);

    const moodLotusCard = screen.getByText('Mood Lotus').closest('article');
    await user.click(moodLotusCard);

    await user.click(screen.getByRole('button', { name: /calm/i }));
    await user.click(screen.getByRole('button', { name: /save calm/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});