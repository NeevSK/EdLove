import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_AI_CONTEXT_POLICY,
  sanitizeContextEnvelope,
  useAIContextStore,
} from '../contextRegistry';

describe('AIContextRegistry & 4-Tier Sensitivity Gate', () => {
  beforeEach(() => {
    useAIContextStore.setState({
      activeDomain: 'self',
      summaryBadge: 'Sadhana',
      rawSlices: [],
      isDetachedForSession: false,
      policy: { ...DEFAULT_AI_CONTEXT_POLICY },
    });
  });

  it('allows Tier 1 configurable_default_on slots (e.g. Self goals, study rhythm, library book)', () => {
    const envelope = sanitizeContextEnvelope('self', 'Sadhana · Morning', [
      {
        slotId: 'self.goals_and_reminders',
        summary: '2 active goals: Complete ecology lab notes, 15m evening reading',
      },
      {
        slotId: 'self.mindful_pulse',
        summary: '15 mindful minutes today (recovery: serene)',
      },
    ]);

    expect(envelope.domain).toBe('self');
    expect(envelope.slices).toHaveLength(2);
    expect(envelope.slices[0]?.slotId).toBe('self.goals_and_reminders');
    expect(envelope.slices[1]?.slotId).toBe('self.mindful_pulse');
  });

  it('unconditionally blocks Tier 3 sacred_never_ingest slots even if explicitlyAttached or toggled', () => {
    const store = useAIContextStore.getState();
    // Attempt to force-enable Fire Journal
    store.setSlotEnabled('self.fire_journal', true);
    expect(useAIContextStore.getState().policy['self.fire_journal'].enabled).toBe(false);

    const envelope = sanitizeContextEnvelope('self', 'Sadhana', [
      {
        slotId: 'self.fire_journal',
        summary: 'Private emotional release text',
        explicitlyAttached: true,
      },
      {
        slotId: 'self.voice_journal',
        summary: 'Private voice transcript',
        explicitlyAttached: true,
      },
      {
        slotId: 'admin.safeguarding_cases',
        summary: 'Confidential case',
        explicitlyAttached: true,
      },
      {
        slotId: 'self.study_rhythm',
        summary: 'Focus block: 45m deep work',
      },
    ]);

    expect(envelope.slices).toHaveLength(1);
    expect(envelope.slices[0]?.slotId).toBe('self.study_rhythm');
  });

  it('blocks Tier 2 explicit_attach_only slots unless explicitlyAttached is true', () => {
    const withoutAttach = sanitizeContextEnvelope('self', 'Sadhana', [
      {
        slotId: 'self.tomorrow_prep_draft',
        summary: 'Drafting tomorrow intentions',
      },
    ]);
    expect(withoutAttach.slices).toHaveLength(0);

    const withAttach = sanitizeContextEnvelope('self', 'Sadhana', [
      {
        slotId: 'self.tomorrow_prep_draft',
        summary: 'Drafting tomorrow intentions',
        explicitlyAttached: true,
      },
    ]);
    expect(withAttach.slices).toHaveLength(1);
    expect(withAttach.slices[0]?.slotId).toBe('self.tomorrow_prep_draft');
  });

  it('supports runtime toggling of Tier 1 slots and session detachment in useAIContextStore', () => {
    const store = useAIContextStore.getState();
    store.publishDomainContext('library', 'Library · Grade 8 Science', [
      {
        slotId: 'library.active_resource',
        summary: 'Viewing: Sri Lanka Coral Reefs & Coastal Ecosystems',
      },
      {
        slotId: 'library.search_filter',
        summary: 'Shelf: Curriculum · Query: "biomes"',
      },
    ]);

    expect(useAIContextStore.getState().getSanitizedEnvelope()?.slices).toHaveLength(2);

    // Disable library.search_filter at runtime
    useAIContextStore.getState().setSlotEnabled('library.search_filter', false);
    const afterToggle = useAIContextStore.getState().getSanitizedEnvelope();
    expect(afterToggle?.slices).toHaveLength(1);
    expect(afterToggle?.slices[0]?.slotId).toBe('library.active_resource');

    // Detach context for session
    useAIContextStore.getState().setDetachedForSession(true);
    expect(useAIContextStore.getState().getSanitizedEnvelope()).toBeNull();
  });
});
